using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace NzbDrone.Core.MetadataSource.Providers.OpenLibrary.Resources
{
    public class OpenLibraryAuthorResource
    {
        [JsonPropertyName("key")]
        public string Key { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("personal_name")]
        public string PersonalName { get; set; }

        [JsonPropertyName("alternate_names")]
        public List<string> AlternateNames { get; set; }

        [JsonPropertyName("bio")]
        public object Bio { get; set; }

        [JsonPropertyName("birth_date")]
        public string BirthDate { get; set; }

        [JsonPropertyName("death_date")]
        public string DeathDate { get; set; }

        [JsonPropertyName("photos")]
        public List<int> Photos { get; set; }

        [JsonPropertyName("links")]
        public List<OpenLibraryLinkResource> Links { get; set; }

        [JsonPropertyName("wikipedia")]
        public string Wikipedia { get; set; }

        [JsonPropertyName("remote_ids")]
        public OpenLibraryRemoteIdsResource RemoteIds { get; set; }

        public string GetAuthorId()
        {
            if (string.IsNullOrEmpty(Key))
            {
                return null;
            }

            return Key.Replace("/authors/", "");
        }

        public string GetBioText()
        {
            if (Bio == null)
            {
                return null;
            }

            if (Bio is string bioStr)
            {
                return bioStr;
            }

            if (Bio is System.Text.Json.JsonElement bioJson)
            {
                if (bioJson.ValueKind == System.Text.Json.JsonValueKind.String)
                {
                    return bioJson.GetString();
                }
                else if (bioJson.ValueKind == System.Text.Json.JsonValueKind.Object)
                {
                    if (bioJson.TryGetProperty("value", out var valueProp))
                    {
                        return valueProp.GetString();
                    }
                }
            }

            return null;
        }
    }
}
