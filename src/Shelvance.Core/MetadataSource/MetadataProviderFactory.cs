using System;
using System.Collections.Generic;
using System.Linq;
using FluentValidation.Results;
using NLog;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.ThingiProvider;

namespace NzbDrone.Core.MetadataSource
{
    public interface IMetadataProviderFactory : IProviderFactory<IMetadataProvider, MetadataProviderDefinition>
    {
        /// <summary>
        /// Get providers enabled for author searches, ordered by priority
        /// </summary>
        List<IMetadataProvider> AuthorSearchEnabled(bool filterBlocked = true);

        /// <summary>
        /// Get providers enabled for book searches, ordered by priority
        /// </summary>
        List<IMetadataProvider> BookSearchEnabled(bool filterBlocked = true);

        /// <summary>
        /// Get providers enabled for automatic refresh operations, ordered by priority
        /// </summary>
        List<IMetadataProvider> AutomaticRefreshEnabled(bool filterBlocked = true);

        /// <summary>
        /// Get providers enabled for interactive/manual searches, ordered by priority
        /// </summary>
        List<IMetadataProvider> InteractiveSearchEnabled(bool filterBlocked = true);

        /// <summary>
        /// Get all enabled providers ordered by priority (highest first)
        /// </summary>
        List<IMetadataProvider> GetByPriority(bool filterBlocked = true);
    }

    public class MetadataProviderFactory : ProviderFactory<IMetadataProvider, MetadataProviderDefinition>, IMetadataProviderFactory
    {
        private readonly IMetadataProviderStatusService _statusService;
        private readonly Logger _logger;

        public MetadataProviderFactory(IMetadataProviderStatusService statusService,
                                       IMetadataProviderRepository providerRepository,
                                       IEnumerable<IMetadataProvider> providers,
                                       IServiceProvider container,
                                       IEventAggregator eventAggregator,
                                       Logger logger)
            : base(providerRepository, providers, container, eventAggregator, logger)
        {
            _statusService = statusService;
            _logger = logger;
        }

        protected override List<MetadataProviderDefinition> Active()
        {
            return base.Active().Where(c => c.Enable).ToList();
        }

        public override void SetProviderCharacteristics(IMetadataProvider provider, MetadataProviderDefinition definition)
        {
            base.SetProviderCharacteristics(provider, definition);

            // Set default name from provider if not already set
            if (string.IsNullOrWhiteSpace(definition.Name))
            {
                definition.Name = provider.Name;
            }

            // Set priority for new definitions (not yet saved)
            // Provider can override the central default by setting a custom priority
            // Don't override user-configured priority for existing definitions
            if (definition.Id == 0 && provider.Priority != 0)
            {
                definition.Priority = provider.Priority;
            }

            // If provider.Priority == 0 or definition.Id != 0, keep existing priority
            // (either DefaultPriority from constructor or user-configured value)
        }

        public List<IMetadataProvider> AuthorSearchEnabled(bool filterBlocked = true)
        {
            var enabledProviders = GetAvailableProviders()
                .Where(p => ((MetadataProviderDefinition)p.Definition).EnableAuthorSearch)
                .OrderByDescending(p => ((MetadataProviderDefinition)p.Definition).Priority);

            if (filterBlocked)
            {
                return FilterBlockedProviders(enabledProviders).ToList();
            }

            return enabledProviders.ToList();
        }

        public List<IMetadataProvider> BookSearchEnabled(bool filterBlocked = true)
        {
            var enabledProviders = GetAvailableProviders()
                .Where(p => ((MetadataProviderDefinition)p.Definition).EnableBookSearch)
                .OrderByDescending(p => ((MetadataProviderDefinition)p.Definition).Priority);

            if (filterBlocked)
            {
                return FilterBlockedProviders(enabledProviders).ToList();
            }

            return enabledProviders.ToList();
        }

        public List<IMetadataProvider> AutomaticRefreshEnabled(bool filterBlocked = true)
        {
            var enabledProviders = GetAvailableProviders()
                .Where(p => ((MetadataProviderDefinition)p.Definition).EnableAutomaticRefresh)
                .OrderByDescending(p => ((MetadataProviderDefinition)p.Definition).Priority);

            if (filterBlocked)
            {
                return FilterBlockedProviders(enabledProviders).ToList();
            }

            return enabledProviders.ToList();
        }

        public List<IMetadataProvider> InteractiveSearchEnabled(bool filterBlocked = true)
        {
            // Interactive search uses providers that support either author or book search
            var enabledProviders = GetAvailableProviders()
                .Where(p => ((MetadataProviderDefinition)p.Definition).EnableAuthorSearch ||
                           ((MetadataProviderDefinition)p.Definition).EnableBookSearch)
                .OrderByDescending(p => ((MetadataProviderDefinition)p.Definition).Priority);

            if (filterBlocked)
            {
                return FilterBlockedProviders(enabledProviders).ToList();
            }

            return enabledProviders.ToList();
        }

        public List<IMetadataProvider> GetByPriority(bool filterBlocked = true)
        {
            var providers = GetAvailableProviders()
                .OrderByDescending(p => ((MetadataProviderDefinition)p.Definition).Priority);

            if (filterBlocked)
            {
                return FilterBlockedProviders(providers).ToList();
            }

            return providers.ToList();
        }

        private IEnumerable<IMetadataProvider> FilterBlockedProviders(IEnumerable<IMetadataProvider> providers)
        {
            var blockedProviders = _statusService.GetBlockedProviders().ToDictionary(v => v.ProviderId, v => v);

            foreach (var provider in providers)
            {
                if (blockedProviders.TryGetValue(provider.Definition.Id, out var blockedStatus))
                {
                    _logger.Debug("Temporarily ignoring metadata provider {0} till {1} due to recent failures.",
                        provider.Definition.Name,
                        blockedStatus.DisabledTill.Value.ToLocalTime());
                    continue;
                }

                yield return provider;
            }
        }

        public override ValidationResult Test(MetadataProviderDefinition definition)
        {
            var result = base.Test(definition);

            if (definition.Id == 0)
            {
                return result;
            }

            if (result == null || result.IsValid)
            {
                _statusService.RecordSuccess(definition.Id);
            }
            else
            {
                _statusService.RecordFailure(definition.Id);
            }

            return result;
        }
    }
}
