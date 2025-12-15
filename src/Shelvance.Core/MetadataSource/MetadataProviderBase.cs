using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentValidation.Results;
using NLog;
using NzbDrone.Common.Cache;
using NzbDrone.Core.Books;
using NzbDrone.Core.ThingiProvider;

namespace NzbDrone.Core.MetadataSource
{
    /// <summary>
    /// Abstract base class for all metadata providers
    /// Provides common functionality like error handling, logging, validation, and caching
    ///
    /// Caching Strategy (aligned with Goodreads for consistency):
    /// - Author/Book Info: 90 days with rolling expiry (refreshes on access)
    /// - Search Results: 7 days fixed expiry
    /// - ISBN/ASIN Lookups: 90 days fixed expiry (these rarely change)
    /// - Caches are per-provider to avoid conflicts between different implementations
    /// </summary>
    /// <typeparam name="TSettings">Provider-specific settings class</typeparam>
    public abstract class MetadataProviderBase<TSettings> : IMetadataProvider
        where TSettings : IProviderConfig, new()
    {
        protected readonly IMetadataProviderStatusService _statusService;
        protected readonly Logger _logger;
        private readonly ICached<Author> _authorCache;
        private readonly ICached<Tuple<string, Book, List<AuthorMetadata>>> _bookCache;
        private readonly ICached<List<Author>> _authorSearchCache;
        private readonly ICached<List<Book>> _bookSearchCache;

        protected MetadataProviderBase(IMetadataProviderStatusService statusService, Logger logger, ICacheManager cacheManager)
        {
            _statusService = statusService;
            _logger = logger;

            // Cache with rolling expiry - aligned with Goodreads strategy (90 days for book/author info)
            _authorCache = cacheManager.GetRollingCache<Author>(GetType(), "author", TimeSpan.FromDays(90));
            _bookCache = cacheManager.GetRollingCache<Tuple<string, Book, List<AuthorMetadata>>>(GetType(), "book", TimeSpan.FromDays(90));

            // Search results cache - 7 days to align with Goodreads series/list cache
            _authorSearchCache = cacheManager.GetCache<List<Author>>(GetType(), "authorSearch");
            _bookSearchCache = cacheManager.GetCache<List<Book>>(GetType(), "bookSearch");
        }

        protected MetadataProviderBase(IMetadataProviderStatusService statusService, Logger logger)
            : this(statusService, logger, new CacheManager())
        {
        }

        public abstract string Name { get; }
        public virtual int Priority { get; set; }
        public virtual string InfoLink => string.Empty;
        public abstract MetadataProviderCapabilities Capabilities { get; }

        public Type ConfigContract => typeof(TSettings);

        public virtual ProviderMessage Message => null;

        public virtual IEnumerable<ProviderDefinition> DefaultDefinitions
        {
            get
            {
                var config = (IProviderConfig)new TSettings();

                yield return new MetadataProviderDefinition
                {
                    EnableAuthorSearch = config.Validate().IsValid && Capabilities.SupportsAuthorSearch,
                    EnableBookSearch = config.Validate().IsValid && Capabilities.SupportsBookSearch,
                    EnableAutomaticRefresh = config.Validate().IsValid && Capabilities.SupportsChangeFeed,
                    Implementation = GetType().Name,
                    Settings = config
                };
            }
        }

        public virtual ProviderDefinition Definition { get; set; }

        public virtual object RequestAction(string action, IDictionary<string, string> query)
        {
            return null;
        }

        protected TSettings Settings => (TSettings)Definition.Settings;

        protected MetadataProviderDefinition ProviderDefinition => (MetadataProviderDefinition)Definition;

        public async Task<Author> GetAuthorInfoAsync(string foreignAuthorId, bool useCache = true)
        {
            try
            {
                if (!Capabilities.SupportsAuthorSearch)
                {
                    throw new NotSupportedException($"{Name} does not support author search");
                }

                if (useCache)
                {
                    var cacheKey = $"author_{foreignAuthorId}";
                    var cached = _authorCache.Find(cacheKey);
                    if (cached != null)
                    {
                        _logger.Debug("Using cached author info for {0}", foreignAuthorId);
                        return cached;
                    }

                    var result = await GetAuthorInfoInternalAsync(foreignAuthorId, useCache);
                    _authorCache.Set(cacheKey, result, TimeSpan.FromDays(90));
                    _statusService.RecordSuccess(Definition.Id);
                    return result;
                }
                else
                {
                    var result = await GetAuthorInfoInternalAsync(foreignAuthorId, useCache);
                    _statusService.RecordSuccess(Definition.Id);
                    return result;
                }
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, $"{Name}: Failed to get author info for {foreignAuthorId}");
                _statusService.RecordFailure(Definition.Id);
                throw;
            }
        }

        public async Task<Tuple<string, Book, List<AuthorMetadata>>> GetBookInfoAsync(string foreignBookId)
        {
            try
            {
                if (!Capabilities.SupportsBookSearch)
                {
                    throw new NotSupportedException($"{Name} does not support book search");
                }

                var cacheKey = $"book_{foreignBookId}";
                var cached = _bookCache.Find(cacheKey);
                if (cached != null)
                {
                    _logger.Debug("Using cached book info for {0}", foreignBookId);
                    return cached;
                }

                var result = await GetBookInfoInternalAsync(foreignBookId);
                _bookCache.Set(cacheKey, result, TimeSpan.FromDays(90));
                _statusService.RecordSuccess(Definition.Id);
                return result;
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, $"{Name}: Failed to get book info for {foreignBookId}");
                _statusService.RecordFailure(Definition.Id);
                throw;
            }
        }

        public async Task<List<Author>> SearchForNewAuthorAsync(string query)
        {
            try
            {
                if (!Capabilities.SupportsAuthorSearch)
                {
                    throw new NotSupportedException($"{Name} does not support author search");
                }

                var cacheKey = $"authorsearch_{query.ToLowerInvariant()}";
                var cached = _authorSearchCache.Find(cacheKey);
                if (cached != null)
                {
                    _logger.Debug("Using cached author search results for '{0}'", query);
                    return cached;
                }

                var result = await SearchForNewAuthorInternalAsync(query);
                _authorSearchCache.Set(cacheKey, result, TimeSpan.FromDays(7));
                _statusService.RecordSuccess(Definition.Id);
                return result;
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, $"{Name}: Failed to search for author '{query}'");
                _statusService.RecordFailure(Definition.Id);
                throw;
            }
        }

        public async Task<List<Book>> SearchForNewBookAsync(string title, string author = null, bool getAllEditions = true)
        {
            try
            {
                if (!Capabilities.SupportsBookSearch)
                {
                    throw new NotSupportedException($"{Name} does not support book search");
                }

                var cacheKey = $"booksearch_{title.ToLowerInvariant()}_{author?.ToLowerInvariant() ?? "any"}";
                var cached = _bookSearchCache.Find(cacheKey);
                if (cached != null)
                {
                    _logger.Debug("Using cached book search results for '{0}' by '{1}'", title, author ?? "any");
                    return cached;
                }

                var result = await SearchForNewBookInternalAsync(title, author, getAllEditions);
                _bookSearchCache.Set(cacheKey, result, TimeSpan.FromDays(7));
                _statusService.RecordSuccess(Definition.Id);
                return result;
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, $"{Name}: Failed to search for book '{title}' by '{author}'");
                _statusService.RecordFailure(Definition.Id);
                throw;
            }
        }

        public async Task<List<Book>> SearchByIsbnAsync(string isbn)
        {
            try
            {
                if (!Capabilities.SupportsIsbnLookup)
                {
                    throw new NotSupportedException($"{Name} does not support ISBN lookup");
                }

                var cleanIsbn = isbn.Replace("-", "").Replace(" ", "");
                var cacheKey = $"isbn_{cleanIsbn}";
                var cached = _bookSearchCache.Find(cacheKey);
                if (cached != null)
                {
                    _logger.Debug("Using cached ISBN search results for '{0}'", isbn);
                    return cached;
                }

                var result = await SearchByIsbnInternalAsync(isbn);
                _bookSearchCache.Set(cacheKey, result, TimeSpan.FromDays(90));
                _statusService.RecordSuccess(Definition.Id);
                return result;
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, $"{Name}: Failed to search by ISBN '{isbn}'");
                _statusService.RecordFailure(Definition.Id);
                throw;
            }
        }

        public async Task<List<Book>> SearchByAsinAsync(string asin)
        {
            try
            {
                if (!Capabilities.SupportsAsinLookup)
                {
                    throw new NotSupportedException($"{Name} does not support ASIN lookup");
                }

                var cacheKey = $"asin_{asin.ToUpperInvariant()}";
                var cached = _bookSearchCache.Find(cacheKey);
                if (cached != null)
                {
                    _logger.Debug("Using cached ASIN search results for '{0}'", asin);
                    return cached;
                }

                var result = await SearchByAsinInternalAsync(asin);
                _bookSearchCache.Set(cacheKey, result, TimeSpan.FromDays(90));
                _statusService.RecordSuccess(Definition.Id);
                return result;
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, $"{Name}: Failed to search by ASIN '{asin}'");
                _statusService.RecordFailure(Definition.Id);
                throw;
            }
        }

        public async Task<HashSet<string>> GetChangedAuthorsAsync(DateTime startTime)
        {
            try
            {
                if (!Capabilities.SupportsChangeFeed)
                {
                    throw new NotSupportedException($"{Name} does not support change feed");
                }

                var result = await GetChangedAuthorsInternalAsync(startTime);
                _statusService.RecordSuccess(Definition.Id);
                return result;
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, $"{Name}: Failed to get changed authors since {startTime}");
                _statusService.RecordFailure(Definition.Id);
                throw;
            }
        }

        protected abstract Task<Author> GetAuthorInfoInternalAsync(string foreignAuthorId, bool useCache = true);
        protected abstract Task<Tuple<string, Book, List<AuthorMetadata>>> GetBookInfoInternalAsync(string foreignBookId);
        protected abstract Task<List<Author>> SearchForNewAuthorInternalAsync(string query);
        protected abstract Task<List<Book>> SearchForNewBookInternalAsync(string title, string author, bool getAllEditions);
        protected abstract Task<List<Book>> SearchByIsbnInternalAsync(string isbn);
        protected abstract Task<List<Book>> SearchByAsinInternalAsync(string asin);
        protected abstract Task<HashSet<string>> GetChangedAuthorsInternalAsync(DateTime startTime);
        protected abstract Task TestInternal(List<ValidationFailure> failures);

        public ValidationResult Test()
        {
            var failures = new List<ValidationFailure>();

            try
            {
                TestInternal(failures).GetAwaiter().GetResult();
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Test aborted due to exception");
                failures.Add(new ValidationFailure(string.Empty, "Test was aborted due to an error: " + ex.Message));
            }

            return new ValidationResult(failures);
        }

        public override string ToString()
        {
            return Definition?.Name ?? Name;
        }
    }
}
