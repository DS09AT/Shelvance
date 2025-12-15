using NzbDrone.Core.ThingiProvider;
using NzbDrone.Core.Validation;

namespace NzbDrone.Core.MetadataSource.Providers.OpenLibrary
{
    public class OpenLibrarySettings : IProviderConfig
    {
        public string BaseUrl { get; set; } = "https://openlibrary.org";

        public int RateLimitPerMinute { get; set; } = 100;

        public int RequestTimeoutSeconds { get; set; } = 30;

        public bool UseCoversFallback { get; set; } = true;

        public NzbDroneValidationResult Validate()
        {
            return new NzbDroneValidationResult();
        }
    }
}
