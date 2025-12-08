using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentValidation.Results;
using NLog;
using NzbDrone.Core.Books;
using NzbDrone.Core.ThingiProvider;

namespace NzbDrone.Core.MetadataSource
{
    /// <summary>
    /// Abstract base class for all metadata providers
    /// Provides common functionality like error handling, logging, and validation
    /// </summary>
    /// <typeparam name="TSettings">Provider-specific settings class</typeparam>
    public abstract class MetadataProviderBase<TSettings> : IMetadataProvider
        where TSettings : IProviderConfig, new()
    {
        protected readonly IMetadataProviderStatusService _statusService;
        protected readonly Logger _logger;

        protected MetadataProviderBase(IMetadataProviderStatusService statusService, Logger logger)
        {
            _statusService = statusService;
            _logger = logger;
        }

        public abstract string Name { get; }
        public abstract int Priority { get; }
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
                    Name = GetType().Name,
                    EnableAuthorSearch = config.Validate().IsValid && Capabilities.SupportsAuthorSearch,
                    EnableBookSearch = config.Validate().IsValid && Capabilities.SupportsBookSearch,
                    EnableAutomaticRefresh = config.Validate().IsValid && Capabilities.SupportsChangeFeed,
                    EnableInteractiveSearch = config.Validate().IsValid,
                    Implementation = GetType().Name,
                    Settings = config,
                    Priority = Priority
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

                var result = await GetAuthorInfoInternalAsync(foreignAuthorId, useCache);
                _statusService.RecordSuccess(Definition.Id);
                return result;
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

                var result = await GetBookInfoInternalAsync(foreignBookId);
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

                var result = await SearchForNewAuthorInternalAsync(query);
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

                var result = await SearchForNewBookInternalAsync(title, author, getAllEditions);
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

                var result = await SearchByIsbnInternalAsync(isbn);
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

                var result = await SearchByAsinInternalAsync(asin);
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
