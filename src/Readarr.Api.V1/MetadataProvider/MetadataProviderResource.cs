using NzbDrone.Core.MetadataSource;

namespace Readarr.Api.V1.MetadataProvider
{
    public class MetadataProviderResource : ProviderResource<MetadataProviderResource>
    {
        public bool EnableAuthorSearch { get; set; }
        public bool EnableBookSearch { get; set; }
        public bool EnableAutomaticRefresh { get; set; }
        public bool EnableInteractiveSearch { get; set; }
        public int Priority { get; set; }

        // Capabilities (read-only)
        public bool SupportsAuthorSearch { get; set; }
        public bool SupportsBookSearch { get; set; }
        public bool SupportsIsbnLookup { get; set; }
        public bool SupportsAsinLookup { get; set; }
        public bool SupportsSeriesInfo { get; set; }
        public bool SupportsChangeFeed { get; set; }
        public bool SupportsCovers { get; set; }
        public bool SupportsRatings { get; set; }
        public bool SupportsDescriptions { get; set; }
    }

    public class MetadataProviderResourceMapper : ProviderResourceMapper<MetadataProviderResource, MetadataProviderDefinition>
    {
        public override MetadataProviderResource ToResource(MetadataProviderDefinition definition)
        {
            if (definition == null)
            {
                return null;
            }

            var resource = base.ToResource(definition);

            resource.EnableAuthorSearch = definition.EnableAuthorSearch;
            resource.EnableBookSearch = definition.EnableBookSearch;
            resource.EnableAutomaticRefresh = definition.EnableAutomaticRefresh;
            resource.EnableInteractiveSearch = definition.EnableInteractiveSearch;
            resource.Priority = definition.Priority;

            // Note: Capabilities will be set by the controller using the provider instance
            // as they are not stored in the definition
            return resource;
        }

        public override MetadataProviderDefinition ToModel(MetadataProviderResource resource)
        {
            if (resource == null)
            {
                return null;
            }

            var definition = base.ToModel(resource);

            definition.EnableAuthorSearch = resource.EnableAuthorSearch;
            definition.EnableBookSearch = resource.EnableBookSearch;
            definition.EnableAutomaticRefresh = resource.EnableAutomaticRefresh;
            definition.EnableInteractiveSearch = resource.EnableInteractiveSearch;
            definition.Priority = resource.Priority;

            return definition;
        }
    }
}
