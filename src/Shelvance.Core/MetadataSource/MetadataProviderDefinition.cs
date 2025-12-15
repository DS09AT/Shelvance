using NzbDrone.Core.ThingiProvider;

namespace NzbDrone.Core.MetadataSource
{
    /// <summary>
    /// Database model for metadata provider configuration
    /// Follows the pattern used by IndexerDefinition
    /// </summary>
    public class MetadataProviderDefinition : ProviderDefinition
    {
        public const int DefaultPriority = 50;

        public MetadataProviderDefinition()
        {
            Priority = DefaultPriority;
        }

        /// <summary>
        /// Provider priority (1-100). Higher priority = queried first
        /// </summary>
        public int Priority { get; set; }

        /// <summary>
        /// Enable for author searches
        /// </summary>
        public bool EnableAuthorSearch { get; set; }

        /// <summary>
        /// Enable for book searches
        /// </summary>
        public bool EnableBookSearch { get; set; }

        /// <summary>
        /// Enable for automatic metadata refresh operations
        /// </summary>
        public bool EnableAutomaticRefresh { get; set; }

        /// <summary>
        /// Provider status (failures, backoff, etc.)
        /// </summary>
        public MetadataProviderStatus Status { get; set; }

        /// <summary>
        /// Provider is enabled if any feature is enabled
        /// Computed property following the same pattern as IndexerDefinition
        /// </summary>
        public override bool Enable => EnableAuthorSearch || EnableBookSearch || EnableAutomaticRefresh;
    }
}
