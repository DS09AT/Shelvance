using System.Text.Json.Serialization;

namespace NzbDrone.Core.MetadataSource.Providers.OpenLibrary.Resources
{
    public class OpenLibraryAuthorRefResource
    {
        [JsonPropertyName("author")]
        public OpenLibraryKeyResource Author { get; set; }

        public string GetAuthorId()
        {
            if (Author?.Key == null)
            {
                return null;
            }

            return Author.Key.Replace("/authors/", "");
        }
    }
}
