namespace NzbDrone.Core.MetadataSource
{
    /// <summary>
    /// Describes what features a metadata provider supports
    /// Used for provider selection and fallback logic
    /// </summary>
    public class MetadataProviderCapabilities
    {
        public bool SupportsAuthorSearch { get; set; }
        public bool SupportsBookSearch { get; set; }
        public bool SupportsIsbnLookup { get; set; }
        public bool SupportsAsinLookup { get; set; }
        public bool SupportsSeriesInfo { get; set; }
        public bool SupportsChangeFeed { get; set; }
        public bool SupportsCovers { get; set; }
        public bool SupportsRatings { get; set; }
        public bool SupportsDescriptions { get; set; }

        /// <summary>
        /// Maximum requests per minute (for rate limiting)
        /// 0 = unlimited
        /// </summary>
        public int MaxRequestsPerMinute { get; set; }

        public static MetadataProviderCapabilities All()
        {
            return new MetadataProviderCapabilities
            {
                SupportsAuthorSearch = true,
                SupportsBookSearch = true,
                SupportsIsbnLookup = true,
                SupportsAsinLookup = true,
                SupportsSeriesInfo = true,
                SupportsChangeFeed = true,
                SupportsCovers = true,
                SupportsRatings = true,
                SupportsDescriptions = true,
                MaxRequestsPerMinute = 0
            };
        }

        public static MetadataProviderCapabilities None()
        {
            return new MetadataProviderCapabilities();
        }
    }
}
