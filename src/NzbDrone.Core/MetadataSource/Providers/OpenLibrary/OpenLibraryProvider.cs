using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation.Results;
using NLog;
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
        public override int Priority => 90;

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

        public OpenLibraryProvider(IMetadataProviderStatusService statusService, IHttpClient httpClient, Logger logger)
            : base(statusService, logger)
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

            var worksUrl = $"{Settings.BaseUrl}/authors/{authorId}/works.json?limit=50";
            var worksResponse = await Task.Run(() => ExecuteRequest<OpenLibraryWorksListResource>(worksUrl));

            if (worksResponse?.Entries?.Any() == true)
            {
                var books = new List<Book>();
                foreach (var workEntry in worksResponse.Entries.Take(50))
                {
                    try
                    {
                        var workId = workEntry.GetWorkId();
                        if (!string.IsNullOrEmpty(workId))
                        {
                            var book = await GetBookByWorkId(workId);
                            if (book != null)
                            {
                                book.AuthorMetadata = author.Metadata.Value;
                                books.Add(book);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.Warn(ex, "Failed to get work details");
                    }
                }

                author.Books = books;
            }

            return author;
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

            var searchUrl = $"{Settings.BaseUrl}/search/authors.json?q={Uri.EscapeDataString(query)}&limit=10";
            var searchResult = await Task.Run(() => ExecuteRequest<OpenLibraryAuthorSearchResource>(searchUrl));

            if (searchResult?.Docs == null || !searchResult.Docs.Any())
            {
                return new List<Author>();
            }

            return searchResult.Docs
                .Select(OpenLibraryMapper.MapAuthorSearchResult)
                .Where(a => a != null)
                .ToList();
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
            foreach (var doc in searchResult.Docs.Where(d => d.Type == "work").Take(20))
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
                            CleanName = Parser.Parser.CleanAuthorName(authorMetadata.Name)
                        };
                    }

                    books.Add(book);
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
                return new List<Book>();
            }

            var books = new List<Book>();
            foreach (var doc in searchResult.Docs.Take(5))
            {
                var book = OpenLibraryMapper.MapSearchResult(doc);
                if (book != null)
                {
                    books.Add(book);
                }
            }

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
            request.Headers.Add("User-Agent", "Readarr/1.0 (https://readarr.com)");
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
        public List<OpenLibraryWorkRefResource> Entries { get; set; }
    }

    internal class OpenLibraryEditionsListResource
    {
        public List<OpenLibraryEditionResource> Entries { get; set; }
    }
}
