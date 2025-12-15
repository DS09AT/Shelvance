using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace NzbDrone.Core.MetadataSource.Providers.OpenLibrary.Resources
{
    public class OpenLibraryEditionResource
    {
        [JsonPropertyName("key")]
        public string Key { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("subtitle")]
        public string Subtitle { get; set; }

        [JsonPropertyName("publishers")]
        public List<string> Publishers { get; set; }

        [JsonPropertyName("publish_date")]
        public string PublishDate { get; set; }

        [JsonPropertyName("publish_country")]
        public string PublishCountry { get; set; }

        [JsonPropertyName("publish_places")]
        public List<string> PublishPlaces { get; set; }

        [JsonPropertyName("isbn_10")]
        public List<string> Isbn10 { get; set; }

        [JsonPropertyName("isbn_13")]
        public List<string> Isbn13 { get; set; }

        [JsonPropertyName("oclc_numbers")]
        public List<string> OclcNumbers { get; set; }

        [JsonPropertyName("lccn")]
        public List<string> Lccn { get; set; }

        [JsonPropertyName("covers")]
        public List<long> Covers { get; set; }

        [JsonPropertyName("works")]
        public List<OpenLibraryWorkRefResource> Works { get; set; }

        [JsonPropertyName("authors")]
        public List<OpenLibraryAuthorRefResource> Authors { get; set; }

        [JsonPropertyName("number_of_pages")]
        public int? NumberOfPages { get; set; }

        [JsonPropertyName("pagination")]
        public string Pagination { get; set; }

        [JsonPropertyName("physical_format")]
        public string PhysicalFormat { get; set; }

        [JsonPropertyName("languages")]
        public List<OpenLibraryLanguageRefResource> Languages { get; set; }

        [JsonPropertyName("description")]
        public object Description { get; set; }

        public string GetEditionId()
        {
            if (string.IsNullOrEmpty(Key))
            {
                return null;
            }

            return Key.Replace("/books/", "");
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
