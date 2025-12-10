using System;
using System.Collections.Generic;
using System.Linq;
using NLog;
using NzbDrone.Core.Books;

namespace NzbDrone.Core.MetadataSource
{
    /// <summary>
    /// Central aggregation service that implements the legacy metadata interfaces
    /// and delegates to pluggable metadata providers with failover support
    /// </summary>
    public class MetadataAggregationService : IProvideAuthorInfo, IProvideBookInfo, ISearchForNewAuthor, ISearchForNewBook, ISearchForNewEntity
    {
        private readonly IMetadataProviderFactory _providerFactory;
        private readonly Logger _logger;

        public MetadataAggregationService(IMetadataProviderFactory providerFactory, Logger logger)
        {
            _providerFactory = providerFactory;
            _logger = logger;
        }

        public Author GetAuthorInfo(string foreignAuthorId, bool useCache = true)
        {
            var providers = _providerFactory.AuthorSearchEnabled(filterBlocked: true);

            if (!providers.Any())
            {
                _logger.Error("No metadata providers are available or enabled for author search");
                throw new NoMetadataProvidersAvailableException("No metadata providers enabled for author search");
            }

            _logger.Debug("Attempting to get author info for {0} using {1} provider(s)", foreignAuthorId, providers.Count);

            Exception lastException = null;

            foreach (var provider in providers)
            {
                try
                {
                    _logger.Debug("Trying provider: {0} (Priority: {1})", provider.Name, provider.Priority);
                    var result = provider.GetAuthorInfoAsync(foreignAuthorId, useCache).GetAwaiter().GetResult();

                    if (result != null)
                    {
                        _logger.Info("Successfully retrieved author info for {0} from {1}", foreignAuthorId, provider.Name);
                        return result;
                    }

                    _logger.Warn("{0} returned null for author {1}", provider.Name, foreignAuthorId);
                }
                catch (Exception ex)
                {
                    _logger.Warn(ex, "Provider {0} failed to get author info for {1}, trying next provider", provider.Name, foreignAuthorId);
                    lastException = ex;
                }
            }

            _logger.Error("All {0} provider(s) failed to retrieve author info for {1}", providers.Count, foreignAuthorId);
            throw new MetadataNotFoundException(
                $"Could not find author {foreignAuthorId} using any available metadata provider",
                lastException);
        }

        public HashSet<string> GetChangedAuthors(DateTime startTime)
        {
            var providers = _providerFactory.AutomaticRefreshEnabled(filterBlocked: true);

            if (!providers.Any())
            {
                _logger.Debug("No metadata providers available for change feed");
                return new HashSet<string>();
            }

            _logger.Debug("Getting changed authors since {0} using {1} provider(s)", startTime, providers.Count);

            var allChangedAuthors = new HashSet<string>();

            foreach (var provider in providers)
            {
                try
                {
                    _logger.Debug("Trying provider: {0}", provider.Name);
                    var changed = provider.GetChangedAuthorsAsync(startTime).GetAwaiter().GetResult();

                    if (changed != null && changed.Any())
                    {
                        _logger.Debug("{0} reported {1} changed author(s)", provider.Name, changed.Count);
                        allChangedAuthors.UnionWith(changed);
                    }
                }
                catch (Exception ex)
                {
                    _logger.Warn(ex, "Provider {0} failed to get changed authors, continuing with other providers", provider.Name);
                }
            }

            _logger.Info("Found {0} total changed author(s) across all providers", allChangedAuthors.Count);
            return allChangedAuthors;
        }

        public Tuple<string, Book, List<AuthorMetadata>> GetBookInfo(string foreignBookId)
        {
            var providers = _providerFactory.BookSearchEnabled(filterBlocked: true);

            if (!providers.Any())
            {
                _logger.Error("No metadata providers are available or enabled for book search");
                throw new NoMetadataProvidersAvailableException("No metadata providers enabled for book search");
            }

            _logger.Debug("Attempting to get book info for {0} using {1} provider(s)", foreignBookId, providers.Count);

            Exception lastException = null;

            foreach (var provider in providers)
            {
                try
                {
                    _logger.Debug("Trying provider: {0} (Priority: {1})", provider.Name, provider.Priority);
                    var result = provider.GetBookInfoAsync(foreignBookId).GetAwaiter().GetResult();

                    if (result != null && result.Item2 != null)
                    {
                        _logger.Info("Successfully retrieved book info for {0} from {1}", foreignBookId, provider.Name);
                        return result;
                    }

                    _logger.Warn("{0} returned null for book {1}", provider.Name, foreignBookId);
                }
                catch (Exception ex)
                {
                    _logger.Warn(ex, "Provider {0} failed to get book info for {1}, trying next provider", provider.Name, foreignBookId);
                    lastException = ex;
                }
            }

            _logger.Error("All {0} provider(s) failed to retrieve book info for {1}", providers.Count, foreignBookId);
            throw new MetadataNotFoundException(
                $"Could not find book {foreignBookId} using any available metadata provider",
                lastException);
        }

        public List<Author> SearchForNewAuthor(string query)
        {
            var providers = _providerFactory.InteractiveSearchEnabled(filterBlocked: true);

            if (!providers.Any())
            {
                _logger.Error("No metadata providers are available or enabled for author search");
                throw new NoMetadataProvidersAvailableException("No metadata providers enabled for author search");
            }

            _logger.Debug("Searching for author '{0}' using {1} provider(s)", query, providers.Count);

            var allResults = new List<Author>();
            var seenIds = new HashSet<string>();

            foreach (var provider in providers)
            {
                try
                {
                    _logger.Debug("Trying provider: {0} (Priority: {1})", provider.Name, provider.Priority);
                    var results = provider.SearchForNewAuthorAsync(query).GetAwaiter().GetResult();

                    if (results != null && results.Any())
                    {
                        _logger.Debug("{0} returned {1} result(s)", provider.Name, results.Count);

                        foreach (var result in results)
                        {
                            if (!string.IsNullOrEmpty(result.ForeignAuthorId) && seenIds.Add(result.ForeignAuthorId))
                            {
                                allResults.Add(result);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.Warn(ex, "Provider {0} failed to search for author '{1}', continuing with other providers", provider.Name, query);
                }
            }

            var sortedResults = SortAuthorsByRelevance(allResults, query);

            _logger.Info("Found {0} unique author(s) for query '{1}' across all providers", sortedResults.Count, query);
            return sortedResults;
        }

        private List<Author> SortAuthorsByRelevance(List<Author> authors, string query)
        {
            if (authors == null || !authors.Any())
            {
                return authors;
            }

            var queryLower = query?.ToLower() ?? string.Empty;

            return authors
                .Select(author =>
                {
                    var metadata = author.Metadata?.Value;
                    if (metadata == null)
                    {
                        return new { Author = author, Score = 0.0 };
                    }

                    double score = 0;

                    var nameLower = metadata.Name?.ToLower() ?? string.Empty;

                    if (nameLower == queryLower)
                    {
                        score += 1000;
                    }
                    else if (nameLower.Contains(queryLower))
                    {
                        score += 500;
                    }

                    if (metadata.Aliases?.Any(alt => alt.Equals(query, StringComparison.OrdinalIgnoreCase)) == true)
                    {
                        score += 800;
                    }
                    else if (metadata.Aliases?.Any(alt => alt.IndexOf(query, StringComparison.OrdinalIgnoreCase) >= 0) == true)
                    {
                        score += 300;
                    }

                    var bookCount = 0;
                    if (author.Books?.Value != null)
                    {
                        bookCount = author.Books.Value.Count;
                        score += Math.Min(bookCount, 500);
                    }

                    if (metadata.Born.HasValue)
                    {
                        score += 100;
                    }

                    if (metadata.Died.HasValue)
                    {
                        score += 50;
                    }

                    if (!string.IsNullOrWhiteSpace(metadata.Overview))
                    {
                        score += 75;
                    }

                    if (metadata.Images?.Any() == true)
                    {
                        score += Math.Min(metadata.Images.Count * 25, 75);
                    }

                    if (bookCount > 0 && bookCount < 5)
                    {
                        score -= 200;
                    }

                    return new { Author = author, Score = score };
                })
                .OrderByDescending(x => x.Score)
                .Select(x => x.Author)
                .ToList();
        }

        public List<Book> SearchForNewBook(string title, string author, bool getAllEditions = true)
        {
            var providers = _providerFactory.BookSearchEnabled(filterBlocked: true);

            if (!providers.Any())
            {
                _logger.Error("No metadata providers are available or enabled for book search");
                throw new NoMetadataProvidersAvailableException("No metadata providers enabled for book search");
            }

            _logger.Debug("Searching for book '{0}' by '{1}' using {2} provider(s)", title, author, providers.Count);

            var allResults = new List<Book>();
            var seenIds = new HashSet<string>();

            foreach (var provider in providers)
            {
                try
                {
                    _logger.Debug("Trying provider: {0} (Priority: {1})", provider.Name, provider.Priority);
                    var results = provider.SearchForNewBookAsync(title, author, getAllEditions).GetAwaiter().GetResult();

                    if (results != null && results.Any())
                    {
                        _logger.Debug("{0} returned {1} result(s)", provider.Name, results.Count);

                        // Deduplicate by ForeignBookId
                        foreach (var result in results)
                        {
                            if (!string.IsNullOrEmpty(result.ForeignBookId) && seenIds.Add(result.ForeignBookId))
                            {
                                allResults.Add(result);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.Warn(ex, "Provider {0} failed to search for book '{1}', continuing with other providers", provider.Name, title);
                }
            }

            _logger.Info("Found {0} unique book(s) for query '{1}' by '{2}' across all providers", allResults.Count, title, author);
            return allResults;
        }

        public List<Book> SearchByIsbn(string isbn)
        {
            var providers = _providerFactory.BookSearchEnabled(filterBlocked: true)
                .Where(p => p.Capabilities.SupportsIsbnLookup)
                .ToList();

            if (!providers.Any())
            {
                _logger.Warn("No metadata providers support ISBN lookup");
                return new List<Book>();
            }

            _logger.Debug("Searching for ISBN '{0}' using {1} provider(s)", isbn, providers.Count);

            var allResults = new List<Book>();
            var seenIds = new HashSet<string>();

            foreach (var provider in providers)
            {
                try
                {
                    _logger.Debug("Trying provider: {0} (Priority: {1})", provider.Name, provider.Priority);
                    var results = provider.SearchByIsbnAsync(isbn).GetAwaiter().GetResult();

                    if (results != null && results.Any())
                    {
                        _logger.Debug("{0} returned {1} result(s)", provider.Name, results.Count);

                        foreach (var result in results)
                        {
                            if (!string.IsNullOrEmpty(result.ForeignBookId) && seenIds.Add(result.ForeignBookId))
                            {
                                allResults.Add(result);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.Warn(ex, "Provider {0} failed to search by ISBN '{1}', continuing with other providers", provider.Name, isbn);
                }
            }

            _logger.Info("Found {0} unique book(s) for ISBN '{1}' across all providers", allResults.Count, isbn);
            return allResults;
        }

        public List<Book> SearchByAsin(string asin)
        {
            var providers = _providerFactory.BookSearchEnabled(filterBlocked: true)
                .Where(p => p.Capabilities.SupportsAsinLookup)
                .ToList();

            if (!providers.Any())
            {
                _logger.Warn("No metadata providers support ASIN lookup");
                return new List<Book>();
            }

            _logger.Debug("Searching for ASIN '{0}' using {1} provider(s)", asin, providers.Count);

            var allResults = new List<Book>();
            var seenIds = new HashSet<string>();

            foreach (var provider in providers)
            {
                try
                {
                    _logger.Debug("Trying provider: {0} (Priority: {1})", provider.Name, provider.Priority);
                    var results = provider.SearchByAsinAsync(asin).GetAwaiter().GetResult();

                    if (results != null && results.Any())
                    {
                        _logger.Debug("{0} returned {1} result(s)", provider.Name, results.Count);

                        foreach (var result in results)
                        {
                            if (!string.IsNullOrEmpty(result.ForeignBookId) && seenIds.Add(result.ForeignBookId))
                            {
                                allResults.Add(result);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.Warn(ex, "Provider {0} failed to search by ASIN '{1}', continuing with other providers", provider.Name, asin);
                }
            }

            _logger.Info("Found {0} unique book(s) for ASIN '{1}' across all providers", allResults.Count, asin);
            return allResults;
        }

        public List<Book> SearchByGoodreadsBookId(int goodreadsId, bool getAllEditions)
        {
            _logger.Warn("SearchByGoodreadsBookId is deprecated. Goodreads API is no longer available. Returning empty results.");
            return new List<Book>();
        }

        public List<object> SearchForNewEntity(string title)
        {
            var interactiveProviders = _providerFactory.InteractiveSearchEnabled(filterBlocked: true);

            if (!interactiveProviders.Any())
            {
                _logger.Error("No metadata providers are available or enabled for interactive search");
                throw new NoMetadataProvidersAvailableException("No metadata providers enabled for author or book search");
            }

            var authorProviders = _providerFactory.AuthorSearchEnabled(filterBlocked: true);
            var bookProviders = _providerFactory.BookSearchEnabled(filterBlocked: true);

            var result = new List<object>();
            var seenAuthorIds = new HashSet<string>();
            var seenBookIds = new HashSet<string>();

            // Search for authors if author search is enabled
            if (authorProviders.Any())
            {
                _logger.Debug("Searching for authors matching '{0}' using {1} provider(s)", title, authorProviders.Count);

                foreach (var provider in authorProviders)
                {
                    try
                    {
                        _logger.Debug("Trying provider: {0} (Priority: {1})", provider.Name, provider.Priority);
                        var authors = provider.SearchForNewAuthorAsync(title).GetAwaiter().GetResult();

                        if (authors != null && authors.Any())
                        {
                            _logger.Debug("{0} returned {1} author result(s)", provider.Name, authors.Count);

                            foreach (var author in authors)
                            {
                                if (!string.IsNullOrEmpty(author.ForeignAuthorId) && seenAuthorIds.Add(author.ForeignAuthorId))
                                {
                                    result.Add(author);
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.Warn(ex, "Provider {0} failed to search for author '{1}', continuing with other providers", provider.Name, title);
                    }
                }
            }

            // Search for books if book search is enabled
            if (bookProviders.Any())
            {
                _logger.Debug("Searching for books matching '{0}' using {1} provider(s)", title, bookProviders.Count);

                foreach (var provider in bookProviders)
                {
                    try
                    {
                        _logger.Debug("Trying provider: {0} (Priority: {1})", provider.Name, provider.Priority);
                        var books = provider.SearchForNewBookAsync(title, null, false).GetAwaiter().GetResult();

                        if (books != null && books.Any())
                        {
                            _logger.Debug("{0} returned {1} book result(s)", provider.Name, books.Count);

                            foreach (var book in books)
                            {
                                if (!string.IsNullOrEmpty(book.ForeignBookId) && seenBookIds.Add(book.ForeignBookId))
                                {
                                    result.Add(book);
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.Warn(ex, "Provider {0} failed to search for book '{1}', continuing with other providers", provider.Name, title);
                    }
                }
            }

            _logger.Info(
                "Found {0} total result(s) for query '{1}' ({2} author(s), {3} book(s))",
                result.Count,
                title,
                seenAuthorIds.Count,
                seenBookIds.Count);

            var authorResults = result.Where(r => r is Author).Cast<Author>().ToList();
            var bookResults = result.Where(r => r is Book).Cast<Book>().ToList();

            var sortedAuthors = SortAuthorsByRelevance(authorResults, title);
            var sortedBooks = bookResults.OrderBy(b => b.Title).ToList();

            var sortedResults = new List<object>();
            sortedResults.AddRange(sortedAuthors);
            sortedResults.AddRange(sortedBooks);

            return sortedResults;
        }
    }
}
