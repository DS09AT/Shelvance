using System.Text.Json.Serialization;

namespace NzbDrone.Core.MetadataSource.Providers.OpenLibrary.Resources
{
    public class OpenLibraryRemoteIdsResource
    {
        [JsonPropertyName("viaf")]
        public string Viaf { get; set; }

        [JsonPropertyName("wikidata")]
        public string Wikidata { get; set; }

        [JsonPropertyName("isni")]
        public string Isni { get; set; }

        [JsonPropertyName("goodreads")]
        public string Goodreads { get; set; }
    }
}
