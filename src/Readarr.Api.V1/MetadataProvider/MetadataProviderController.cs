using System.Linq;
using FluentValidation;
using NzbDrone.Core.MetadataSource;
using Readarr.Http;

namespace Readarr.Api.V1.MetadataProvider
{
    [V1ApiController]
    public class MetadataProviderController : ProviderControllerBase<MetadataProviderResource, MetadataProviderBulkResource, IMetadataProvider, MetadataProviderDefinition>
    {
        public static readonly MetadataProviderResourceMapper ResourceMapper = new ();
        public static readonly MetadataProviderBulkResourceMapper BulkResourceMapper = new ();

        private readonly IMetadataProviderFactory _metadataProviderFactory;

        public MetadataProviderController(IMetadataProviderFactory metadataProviderFactory)
            : base(metadataProviderFactory, "metadataprovider", ResourceMapper, BulkResourceMapper)
        {
            _metadataProviderFactory = metadataProviderFactory;

            // Priority validation: 1-100
            SharedValidator.RuleFor(c => c.Priority).InclusiveBetween(1, 100);

            // At least one feature must be enabled
            SharedValidator.RuleFor(c => c)
                .Must(provider => provider.EnableAuthorSearch ||
                                 provider.EnableBookSearch ||
                                 provider.EnableAutomaticRefresh ||
                                 provider.EnableInteractiveSearch)
                .WithMessage("At least one feature must be enabled");
        }

        protected override MetadataProviderResource GetResourceById(int id)
        {
            var resource = base.GetResourceById(id);

            // Populate capabilities from provider instance
            var provider = _metadataProviderFactory.GetAvailableProviders()
                .FirstOrDefault(p => p.Definition.Id == id);

            if (provider != null)
            {
                resource.SupportsAuthorSearch = provider.Capabilities.SupportsAuthorSearch;
                resource.SupportsBookSearch = provider.Capabilities.SupportsBookSearch;
                resource.SupportsIsbnLookup = provider.Capabilities.SupportsIsbnLookup;
                resource.SupportsAsinLookup = provider.Capabilities.SupportsAsinLookup;
                resource.SupportsSeriesInfo = provider.Capabilities.SupportsSeriesInfo;
                resource.SupportsChangeFeed = provider.Capabilities.SupportsChangeFeed;
                resource.SupportsCovers = provider.Capabilities.SupportsCovers;
                resource.SupportsRatings = provider.Capabilities.SupportsRatings;
                resource.SupportsDescriptions = provider.Capabilities.SupportsDescriptions;
            }

            return resource;
        }
    }
}
