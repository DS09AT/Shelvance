using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace NzbDrone.Core.MetadataSource.Providers.OpenLibrary.Resources
{
    public class OpenLibraryWorkResource
    {
        [JsonPropertyName("key")]
        public string Key { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("subtitle")]
        public string Subtitle { get; set; }

        [JsonPropertyName("description")]
        public object Description { get; set; }

        [JsonPropertyName("authors")]
        public List<OpenLibraryAuthorRefResource> Authors { get; set; }

        [JsonPropertyName("covers")]
        public List<long> Covers { get; set; }

        [JsonPropertyName("subject_places")]
        public List<string> SubjectPlaces { get; set; }

        [JsonPropertyName("subjects")]
        public List<string> Subjects { get; set; }

        [JsonPropertyName("subject_people")]
        public List<string> SubjectPeople { get; set; }

        [JsonPropertyName("subject_times")]
        public List<string> SubjectTimes { get; set; }

        [JsonPropertyName("first_publish_date")]
        public string FirstPublishDate { get; set; }

        [JsonPropertyName("links")]
        public List<OpenLibraryLinkResource> Links { get; set; }

        public string GetWorkId()
        {
            if (string.IsNullOrEmpty(Key))
            {
                return null;
            }

            return Key.Replace("/works/", "");
        }

        public string GetDescriptionText()
        {
            if (Description == null)
            {
                return null;
            }

            if (Description is string descStr)
            {
                return descStr;
            }

            if (Description is System.Text.Json.JsonElement descJson)
            {
                if (descJson.ValueKind == System.Text.Json.JsonValueKind.String)
                {
                    return descJson.GetString();
                }
                else if (descJson.ValueKind == System.Text.Json.JsonValueKind.Object)
                {
                    if (descJson.TryGetProperty("value", out var valueProp))
                    {
                        return valueProp.GetString();
                    }
                }
            }

            return null;
        }
    }
}
