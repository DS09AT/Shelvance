using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation.Results;
using NLog;
using NzbDrone.Common.Cache;
using NzbDrone.Common.Http;
using NzbDrone.Core.Books;
using NzbDrone.Core.MetadataSource.Providers.OpenLibrary.Resources;

namespace NzbDrone.Core.MetadataSource.Providers.OpenLibrary
{
    public class OpenLibraryProvider : MetadataProviderBase<OpenLibrarySettings>
    {
        private readonly IHttpClient _httpClient;
        private readonly SemaphoreSlim _rateLimiter;
        private readonly Queue<DateTime> _requestTimes;
        private readonly object _rateLimitLock = new object();

        private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = false
        };

        public override string Name => "Open Library";
        public override string InfoLink => "";

        public override MetadataProviderCapabilities Capabilities => new MetadataProviderCapabilities
        {
            SupportsAuthorSearch = true,
            SupportsBookSearch = true,
            SupportsIsbnLookup = true,
            SupportsAsinLookup = true,
            SupportsSeriesInfo = false,
            SupportsChangeFeed = false,
            SupportsCovers = true,
            SupportsRatings = true,
            SupportsDescriptions = true,
            MaxRequestsPerMinute = 100
        };

        public OpenLibraryProvider(IMetadataProviderStatusService statusService, IHttpClient httpClient, Logger logger, ICacheManager cacheManager)
            : base(statusService, logger, cacheManager)
        {
            _httpClient = httpClient;
            _rateLimiter = new SemaphoreSlim(1, 1);
            _requestTimes = new Queue<DateTime>();
        }

        protected override async Task<Author> GetAuthorInfoInternalAsync(string foreignAuthorId, bool useCache = true)
        {
            _logger.Debug("Getting Author details for OpenLibrary ID: {0}", foreignAuthorId);

            var authorId = foreignAuthorId.Replace("/authors/", "");
            var url = $"{Settings.BaseUrl}/authors/{authorId}.json";

            var authorResource = await Task.Run(() => ExecuteRequest<OpenLibraryAuthorResource>(url));
            if (authorResource == null)
            {
                throw new OpenLibraryNotFoundException($"Author {foreignAuthorId} not found");
            }

            var author = OpenLibraryMapper.MapAuthor(authorResource);

            var works = await GetAuthorWorksAsync(authorId);
            if (works?.Any() == true)
            {
                foreach (var book in works)
                {
                    book.AuthorMetadata = author.Metadata.Value;
                }

                author.Books = works;
            }

            return author;
        }

        public async Task<List<Book>> GetAuthorWorksAsync(string authorId)
        {
            _logger.Debug("Getting works list for author: {0}", authorId);

            var books = new List<Book>();
            var offset = 0;
            const int limit = 100;
            var hasMore = true;

            while (hasMore)
            {
                var worksUrl = $"{Settings.BaseUrl}/authors/{authorId}/works.json?limit={limit}&offset={offset}";
                var worksResponse = await Task.Run(() => ExecuteRequest<OpenLibraryWorksListResource>(worksUrl));

                if (worksResponse?.Entries == null || !worksResponse.Entries.Any())
                {
                    break;
                }

                foreach (var workRef in worksResponse.Entries)
                {
                    var book = OpenLibraryMapper.MapWorkRefToBook(workRef);
                    if (book != null)
                    {
                        books.Add(book);
                    }
                }

                offset += limit;
                hasMore = worksResponse.Entries.Count == limit && offset < 500;

                _logger.Debug("Loaded {0} works for author {1}, offset: {2}", books.Count, authorId, offset);
            }

            _logger.Info("Loaded {0} total works for author {1}", books.Count, authorId);
            return books;
        }

        public async Task<Ratings> GetWorkRatingsAsync(string workId)
        {
            _logger.Debug("Getting ratings for work: {0}", workId);

            workId = workId.Replace("/works/", "");
            var ratingsUrl = $"{Settings.BaseUrl}/works/{workId}/ratings.json";

            try
            {
                var ratingsResource = await Task.Run(() => ExecuteRequest<OpenLibraryRatingsResource>(ratingsUrl));

                if (ratingsResource?.Summary != null && ratingsResource.Summary.Count > 0)
                {
                    return new Ratings
                    {
                        Votes = ratingsResource.Summary.Count,
                        Value = (decimal)ratingsResource.Summary.Average
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Failed to get ratings for work {0}", workId);
            }

            return new Ratings { Votes = 100, Value = 5.0m };
        }

        protected override async Task<Tuple<string, Book, List<AuthorMetadata>>> GetBookInfoInternalAsync(string foreignBookId)
        {
            _logger.Debug("Getting Book details for OpenLibrary ID: {0}", foreignBookId);

            var book = await GetBookByWorkId(foreignBookId);
            var authorMetadata = book?.AuthorMetadata?.Value != null ? new List<AuthorMetadata> { book.AuthorMetadata.Value } : new List<AuthorMetadata>();
            var authorId = book?.AuthorMetadata?.Value?.ForeignAuthorId;

            return new Tuple<string, Book, List<AuthorMetadata>>(authorId, book, authorMetadata);
        }

        protected override async Task<List<Author>> SearchForNewAuthorInternalAsync(string query)
        {
            _logger.Debug("Searching for Author: {0}", query);

            var searchUrl = $"{Settings.BaseUrl}/search/authors.json?q={Uri.EscapeDataString(query)}&limit=20";
            var searchResult = await Task.Run(() => ExecuteRequest<OpenLibraryAuthorSearchResource>(searchUrl));

            if (searchResult?.Docs == null || !searchResult.Docs.Any())
            {
                return new List<Author>();
            }

            var authors = searchResult.Docs
                .Select(OpenLibraryMapper.MapAuthorSearchResult)
                .Where(a => a != null)
                .ToList();

            // Calculate scores and filter out irrelevant results
            var scoredAuthors = authors
                .Select(a =>
                {
                    var doc = searchResult.Docs.FirstOrDefault(d => d.GetAuthorId() == a.Metadata.Value.ForeignAuthorId);
                    var score = CalculateAuthorRelevanceScore(doc, query);
                    var isRelevant = IsAuthorRelevantForQuery(doc, query);
                    _logger.Debug("Author: {0} (ID: {1}), Score: {2}, Relevant: {3}", doc?.Name, a.Metadata.Value.ForeignAuthorId, score, isRelevant);
                    return new { Author = a, Doc = doc, Score = score, IsRelevant = isRelevant };
                })
                .Where(x => x.IsRelevant)
                .OrderByDescending(x => x.Score)
                .Select(x => x.Author)
                .Take(3)
                .ToList();

            _logger.Debug("Filtered {0} authors from {1} total for query: '{2}'", scoredAuthors.Count, authors.Count, query);
            return scoredAuthors;
        }

        private double CalculateAuthorRelevanceScore(OpenLibraryAuthorSearchDocResource doc, string query)
        {
            if (doc == null)
            {
                return 0;
            }

            double score = 0;

            var queryLower = query?.Trim().ToLower() ?? string.Empty;
            var nameLower = doc.Name?.ToLower() ?? string.Empty;

            var queryNormalized = NormalizeAuthorName(queryLower);
            var nameNormalized = NormalizeAuthorName(nameLower);

            // Split query into words for word matching
            var queryWords = queryNormalized.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries)
                .Where(w => w.Length > 1)
                .ToList();
            var nameWords = nameNormalized.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

            // Exact match (normalized)
            if (nameNormalized == queryNormalized)
            {
                score += 1000;
            }

            // Close match (original, case-insensitive)
            else if (nameLower == queryLower)
            {
                score += 950;
            }

            // Contains match
            else if (nameNormalized.Contains(queryNormalized))
            {
                score += 500;
            }
            else if (nameLower.Contains(queryLower))
            {
                score += 450;
            }

            // Word matching: penalize if important query words are missing
            else if (queryWords.Count > 0)
            {
                var matchedWords = queryWords.Count(qw => nameWords.Any(nw => nw.Contains(qw) || qw.Contains(nw)));
                var matchRatio = (double)matchedWords / queryWords.Count;

                // If less than half the important words match, heavily penalize
                if (matchRatio < 0.5)
                {
                    score -= 500;
                }

                // If only some words match (but more than half), apply moderate penalty
                else if (matchRatio < 1.0)
                {
                    score -= 200;
                }
            }

            // Check alternate names
            if (doc.AlternateNames?.Any() == true)
            {
                double bestAltScore = 0;
                foreach (var altName in doc.AlternateNames)
                {
                    var altLower = altName?.ToLower() ?? string.Empty;
                    var altNormalized = NormalizeAuthorName(altLower);
                    var altWords = altNormalized.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

                    double altScore = 0;

                    if (altNormalized == queryNormalized)
                    {
                        altScore = 900;
                    }
                    else if (altLower == queryLower)
                    {
                        altScore = 850;
                    }
                    else if (altNormalized.Contains(queryNormalized))
                    {
                        altScore = 400;
                    }
                    else if (altLower.Contains(queryLower))
                    {
                        altScore = 350;
                    }

                    // Word matching for alternate names
                    else if (queryWords.Count > 0)
                    {
                        var matchedWords = queryWords.Count(qw => altWords.Any(aw => aw.Contains(qw) || qw.Contains(aw)));
                        var matchRatio = (double)matchedWords / queryWords.Count;

                        if (matchRatio < 0.5)
                        {
                            altScore = -300;
                        }
                        else if (matchRatio < 1.0)
                        {
                            altScore = -100;
                        }
                    }

                    if (altScore > bestAltScore)
                    {
                        bestAltScore = altScore;
                    }
                }

                score += bestAltScore;
            }

            if (doc.WorkCount.HasValue)
            {
                score += Math.Min(doc.WorkCount.Value, 500);
            }

            if (doc.RatingsAverage.HasValue && doc.RatingsCount.HasValue)
            {
                score += Math.Min(doc.RatingsCount.Value / 10.0, 200);

                if (doc.RatingsAverage.Value >= 4.0)
                {
                    score += 100;
                }
                else if (doc.RatingsAverage.Value >= 3.5)
                {
                    score += 50;
                }
            }

            if (!string.IsNullOrWhiteSpace(doc.BirthDate))
            {
                score += 100;
            }

            if (!string.IsNullOrWhiteSpace(doc.DeathDate))
            {
                score += 50;
            }

            if (!string.IsNullOrWhiteSpace(doc.TopWork))
            {
                score += 75;
            }

            if (doc.TopSubjects?.Any() == true)
            {
                score += Math.Min(doc.TopSubjects.Count * 10, 50);
            }

            if (doc.WorkCount.HasValue && doc.WorkCount.Value < 5)
            {
                score -= 200;
            }

            return score;
        }

        private static string NormalizeAuthorName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return string.Empty;
            }

            // Remove dots, commas, and normalize spaces
            return System.Text.RegularExpressions.Regex.Replace(
                name.Replace(".", "").Replace(",", ""),
                @"\s+",
                " ").Trim();
        }

        private static bool IsAuthorRelevantForQuery(OpenLibraryAuthorSearchDocResource doc, string query)
        {
            if (doc == null || string.IsNullOrWhiteSpace(query))
            {
                return false;
            }

            var queryNormalized = NormalizeAuthorName(query.Trim().ToLower());
            var nameNormalized = NormalizeAuthorName(doc.Name?.ToLower() ?? string.Empty);

            // Split into individual words
            var queryWords = queryNormalized.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var nameWords = nameNormalized.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            if (queryWords.Length == 0)
            {
                return false;
            }

            // Count how many query words exist as standalone words in the author name
            var matchedWords = queryWords.Count(qWord => nameWords.Contains(qWord));

            // For single word queries: must be in name
            if (queryWords.Length == 1)
            {
                return matchedWords >= 1;
            }

            // For 2-word queries: both words must match (100%)
            if (queryWords.Length == 2)
            {
                return matchedWords == 2;
            }

            // For 3+ word queries: at least 75% of words must match
            var matchPercentage = (double)matchedWords / queryWords.Length;
            if (matchPercentage >= 0.75)
            {
                return true;
            }

            if (doc.AlternateNames?.Any() == true)
            {
                foreach (var altName in doc.AlternateNames)
                {
                    var altNormalized = NormalizeAuthorName(altName?.ToLower() ?? string.Empty);
                    var altWords = altNormalized.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    matchedWords = queryWords.Count(qWord => altWords.Contains(qWord));

                    if (queryWords.Length == 2 && matchedWords == 2)
                    {
                        return true;
                    }

                    if (queryWords.Length >= 3)
                    {
                        matchPercentage = (double)matchedWords / queryWords.Length;
                        if (matchPercentage >= 0.75)
                        {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        protected override async Task<List<Book>> SearchForNewBookInternalAsync(string title, string author, bool getAllEditions)
        {
            _logger.Debug("Searching for Book: {0}", title);

            var searchUrl = $"{Settings.BaseUrl}/search.json?q={Uri.EscapeDataString(title)}&limit=20";
            var searchResult = await Task.Run(() => ExecuteRequest<OpenLibrarySearchResource>(searchUrl));

            if (searchResult?.Docs == null || !searchResult.Docs.Any())
            {
                return new List<Book>();
            }

            var books = new List<Book>();
            foreach (var doc in searchResult.Docs.Where(d => d.Key?.StartsWith("/works/") == true).Take(20))
            {
                var book = OpenLibraryMapper.MapSearchResult(doc);
                if (book != null)
                {
                    if (doc.AuthorKey?.Any() == true && doc.AuthorName?.Any() == true)
                    {
                        var authorId = doc.AuthorKey.First().Replace("/authors/", "");
                        var authorMetadata = new AuthorMetadata
                        {
                            ForeignAuthorId = authorId,
                            TitleSlug = authorId,
                            Name = doc.AuthorName.First(),
                            Status = AuthorStatusType.Continuing
                        };

                        book.AuthorMetadata = authorMetadata;
                        book.Author = new Author
                        {
                            Metadata = authorMetadata,
                            CleanName = Parser.Parser.CleanAuthorName(authorMetadata.Name),
                            Series = new List<Series>()
                        };

                        books.Add(book);
                    }
                    else
                    {
                        _logger.Debug("Skipping book {0} - no author information", book.Title);
                    }
                }
            }

            return books;
        }

        protected override async Task<List<Book>> SearchByIsbnInternalAsync(string isbn)
        {
            _logger.Debug("Searching by ISBN: {0}", isbn);

            var cleanIsbn = isbn.Replace("-", "").Replace(" ", "");
            var searchUrl = $"{Settings.BaseUrl}/search.json?isbn={Uri.EscapeDataString(cleanIsbn)}&limit=5";

            var searchResult = await Task.Run(() => ExecuteRequest<OpenLibrarySearchResource>(searchUrl));

            if (searchResult?.Docs == null || !searchResult.Docs.Any())
            {
                _logger.Debug("No results found for ISBN: {0}", isbn);
                return new List<Book>();
            }

            var books = new List<Book>();
            foreach (var doc in searchResult.Docs.Take(5))
            {
                var book = OpenLibraryMapper.MapSearchResult(doc);
                if (book != null)
                {
                    // Ensure Author is set from the search result
                    if (doc.AuthorKey?.Any() == true && doc.AuthorName?.Any() == true)
                    {
                        var authorId = doc.AuthorKey.First().Replace("/authors/", "");
                        var authorMetadata = new AuthorMetadata
                        {
                            ForeignAuthorId = authorId,
                            TitleSlug = authorId,
                            Name = doc.AuthorName.First(),
                            Status = AuthorStatusType.Continuing
                        };

                        book.AuthorMetadata = authorMetadata;
                        book.Author = new Author
                        {
                            Metadata = authorMetadata,
                            CleanName = Parser.Parser.CleanAuthorName(authorMetadata.Name),
                            Series = new List<Series>()
                        };
                    }

                    books.Add(book);
                }
            }

            _logger.Debug("Found {0} books for ISBN: {1}", books.Count, isbn);
            return books;
        }

        protected override async Task<List<Book>> SearchByAsinInternalAsync(string asin)
        {
            _logger.Debug("Searching by ASIN: {0}", asin);
            return await SearchForNewBookInternalAsync(asin, null, true);
        }

        protected override Task<HashSet<string>> GetChangedAuthorsInternalAsync(DateTime startTime)
        {
            throw new NotSupportedException("Open Library does not support change feed");
        }

        protected override async Task TestInternal(List<ValidationFailure> failures)
        {
            try
            {
                var testUrl = $"{Settings.BaseUrl}/search.json?q=test&limit=1";
                await Task.Run(() => ExecuteRequest<OpenLibrarySearchResource>(testUrl));
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Test failed");
                failures.Add(new ValidationFailure("BaseUrl", $"Unable to connect to Open Library: {ex.Message}"));
            }
        }

        private async Task<Book> GetBookByWorkId(string workId)
        {
            workId = workId.Replace("/works/", "");
            var workUrl = $"{Settings.BaseUrl}/works/{workId}.json";

            var workResource = await Task.Run(() => ExecuteRequest<OpenLibraryWorkResource>(workUrl));
            if (workResource == null)
            {
                return null;
            }

            var editionsUrl = $"{Settings.BaseUrl}/works/{workId}/editions.json?limit=10";
            var editionsResponse = await Task.Run(() => ExecuteRequest<OpenLibraryEditionsListResource>(editionsUrl));

            var editions = editionsResponse?.Entries?.Take(10).ToList() ?? new List<OpenLibraryEditionResource>();

            var book = OpenLibraryMapper.MapBook(workResource, editions);

            if (workResource.Authors?.Any() == true)
            {
                var authorRef = workResource.Authors.First();
                var authorId = authorRef.GetAuthorId();

                if (!string.IsNullOrEmpty(authorId))
                {
                    try
                    {
                        var authorUrl = $"{Settings.BaseUrl}/authors/{authorId}.json";
                        var authorResource = await Task.Run(() => ExecuteRequest<OpenLibraryAuthorResource>(authorUrl));

                        if (authorResource != null)
                        {
                            var author = OpenLibraryMapper.MapAuthor(authorResource);
                            book.AuthorMetadata = author.Metadata.Value;
                            book.Author = author;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.Warn(ex, "Failed to get author details for book");
                    }
                }
            }

            return book;
        }

        private T ExecuteRequest<T>(string url)
            where T : class
        {
            ApplyRateLimit();

            var request = new HttpRequest(url);
            request.Headers.Add("User-Agent", "Shelvance/1.0 (https://shelvance.org)");
            request.AllowAutoRedirect = true;
            request.SuppressHttpError = false;

            try
            {
                var response = _httpClient.Get(request);

                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    return null;
                }

                if (response.StatusCode == HttpStatusCode.TooManyRequests)
                {
                    throw new OpenLibraryRateLimitException("Rate limit exceeded");
                }

                if (response.Content == null || response.Content.Length == 0)
                {
                    return null;
                }

                return JsonSerializer.Deserialize<T>(response.Content, JsonOptions);
            }
            catch (HttpException ex)
            {
                if (ex.Response?.StatusCode == HttpStatusCode.NotFound)
                {
                    return null;
                }

                if (ex.Response?.StatusCode == HttpStatusCode.TooManyRequests)
                {
                    throw new OpenLibraryRateLimitException("Rate limit exceeded", ex);
                }

                _logger.Warn(ex, "HTTP request to {0} failed", url);
                throw new OpenLibraryException($"Request to {url} failed", ex);
            }
            catch (JsonException ex)
            {
                _logger.Error(ex, "Failed to deserialize response from {0}", url);
                throw new OpenLibraryException($"Failed to parse response from {url}", ex);
            }
        }

        private void ApplyRateLimit()
        {
            lock (_rateLimitLock)
            {
                var now = DateTime.UtcNow;
                var oneMinuteAgo = now.AddMinutes(-1);

                while (_requestTimes.Count > 0 && _requestTimes.Peek() < oneMinuteAgo)
                {
                    _requestTimes.Dequeue();
                }

                if (_requestTimes.Count >= Settings.RateLimitPerMinute)
                {
                    var oldestRequest = _requestTimes.Peek();
                    var waitTime = oldestRequest.AddMinutes(1) - now;

                    if (waitTime.TotalMilliseconds > 0)
                    {
                        _logger.Debug("Rate limit reached, waiting {0}ms", waitTime.TotalMilliseconds);
                        Thread.Sleep(waitTime);
                    }

                    _requestTimes.Dequeue();
                }

                _requestTimes.Enqueue(DateTime.UtcNow);
            }
        }
    }

    internal class OpenLibraryWorksListResource
    {
        [JsonPropertyName("size")]
        public int Size { get; set; }

        [JsonPropertyName("entries")]
        public List<OpenLibraryWorkRefResource> Entries { get; set; }
    }

    internal class OpenLibraryEditionsListResource
    {
        [JsonPropertyName("entries")]
        public List<OpenLibraryEditionResource> Entries { get; set; }
    }
}
