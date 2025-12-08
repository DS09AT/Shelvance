using System.Text.Json.Serialization;

namespace NzbDrone.Core.MetadataSource.Providers.OpenLibrary.Resources
{
    public class OpenLibraryWorkRefResource
    {
        [JsonPropertyName("key")]
        public string Key { get; set; }

        public string GetWorkId()
        {
            if (string.IsNullOrEmpty(Key))
            {
                return null;
            }

            return Key.Replace("/works/", "");
        }
    }
}
