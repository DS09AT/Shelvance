using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace NzbDrone.Core.MetadataSource.Providers.OpenLibrary.Resources
{
    public class OpenLibraryRatingsResource
    {
        [JsonPropertyName("summary")]
        public OpenLibraryRatingsSummary Summary { get; set; }

        [JsonPropertyName("counts")]
        public Dictionary<string, int> Counts { get; set; }
    }

    public class OpenLibraryRatingsSummary
    {
        [JsonPropertyName("average")]
        public double Average { get; set; }

        [JsonPropertyName("count")]
        public int Count { get; set; }

        [JsonPropertyName("sortable")]
        public double Sortable { get; set; }
    }
}
