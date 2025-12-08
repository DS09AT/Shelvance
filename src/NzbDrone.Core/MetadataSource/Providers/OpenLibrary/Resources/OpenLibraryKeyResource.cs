using System.Text.Json.Serialization;

namespace NzbDrone.Core.MetadataSource.Providers.OpenLibrary.Resources
{
    public class OpenLibraryKeyResource
    {
        [JsonPropertyName("key")]
        public string Key { get; set; }
    }
}
