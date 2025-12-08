using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace NzbDrone.Core.MetadataSource.Providers.OpenLibrary.Resources
{
    public class OpenLibrarySearchResource
    {
        [JsonPropertyName("numFound")]
        public int NumFound { get; set; }

        [JsonPropertyName("start")]
        public int Start { get; set; }

        [JsonPropertyName("numFoundExact")]
        public bool NumFoundExact { get; set; }

        [JsonPropertyName("docs")]
        public List<OpenLibrarySearchDocResource> Docs { get; set; }
    }

    public class OpenLibrarySearchDocResource
    {
        [JsonPropertyName("key")]
        public string Key { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("subtitle")]
        public string Subtitle { get; set; }

        [JsonPropertyName("author_name")]
        public List<string> AuthorName { get; set; }

        [JsonPropertyName("author_key")]
        public List<string> AuthorKey { get; set; }

        [JsonPropertyName("first_publish_year")]
        public int? FirstPublishYear { get; set; }

        [JsonPropertyName("publish_year")]
        public List<int> PublishYear { get; set; }

        [JsonPropertyName("cover_i")]
        public long? CoverId { get; set; }

        [JsonPropertyName("cover_edition_key")]
        public string CoverEditionKey { get; set; }

        [JsonPropertyName("isbn")]
        public List<string> Isbn { get; set; }

        [JsonPropertyName("edition_key")]
        public List<string> EditionKey { get; set; }

        [JsonPropertyName("edition_count")]
        public int EditionCount { get; set; }

        [JsonPropertyName("publisher")]
        public List<string> Publisher { get; set; }

        [JsonPropertyName("language")]
        public List<string> Language { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; }

        [JsonPropertyName("number_of_pages_median")]
        public int? NumberOfPagesMedian { get; set; }

        [JsonPropertyName("ratings_average")]
        public double? RatingsAverage { get; set; }

        [JsonPropertyName("ratings_count")]
        public int? RatingsCount { get; set; }

        public string GetWorkId()
        {
            if (string.IsNullOrEmpty(Key))
            {
                return null;
            }

            return Key.Replace("/works/", "");
        }
    }

    public class OpenLibraryAuthorSearchResource
    {
        [JsonPropertyName("numFound")]
        public int NumFound { get; set; }

        [JsonPropertyName("start")]
        public int Start { get; set; }

        [JsonPropertyName("docs")]
        public List<OpenLibraryAuthorSearchDocResource> Docs { get; set; }
    }

    public class OpenLibraryAuthorSearchDocResource
    {
        [JsonPropertyName("key")]
        public string Key { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("alternate_names")]
        public List<string> AlternateNames { get; set; }

        [JsonPropertyName("birth_date")]
        public string BirthDate { get; set; }

        [JsonPropertyName("top_work")]
        public string TopWork { get; set; }

        [JsonPropertyName("work_count")]
        public int? WorkCount { get; set; }

        [JsonPropertyName("top_subjects")]
        public List<string> TopSubjects { get; set; }

        public string GetAuthorId()
        {
            if (string.IsNullOrEmpty(Key))
            {
                return null;
            }

            return Key.Replace("/authors/", "");
        }
    }
}
