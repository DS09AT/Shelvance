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
    public class MetadataAggregationService : IProvideAuthorInfo, IProvideBookInfo, ISearchForNewAuthor, ISearchForNewBook
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

                        // Deduplicate by ForeignAuthorId
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

            _logger.Info("Found {0} unique author(s) for query '{1}' across all providers", allResults.Count, query);
            return allResults;
        }

        public List<Book> SearchForNewBook(string title, string author, bool getAllEditions = true)
        {
            var providers = _providerFactory.InteractiveSearchEnabled(filterBlocked: true);

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
            var providers = _providerFactory.InteractiveSearchEnabled(filterBlocked: true)
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
            var providers = _providerFactory.InteractiveSearchEnabled(filterBlocked: true)
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
            // This method is for legacy Goodreads support
            // For now, we'll convert the Goodreads ID to a string and try book search
            _logger.Debug("Legacy Goodreads book ID search: {0}", goodreadsId);

            var providers = _providerFactory.InteractiveSearchEnabled(filterBlocked: true);

            if (!providers.Any())
            {
                _logger.Warn("No metadata providers available for Goodreads ID lookup");
                return new List<Book>();
            }

            // Try to get book info directly using the Goodreads ID
            // Providers that support Goodreads IDs can implement special handling
            var foreignId = $"goodreads:{goodreadsId}";

            try
            {
                var bookInfo = GetBookInfo(foreignId);
                if (bookInfo?.Item2 != null)
                {
                    return new List<Book> { bookInfo.Item2 };
                }
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Could not find book by Goodreads ID {0}", goodreadsId);
            }

            return new List<Book>();
        }
    }
}
