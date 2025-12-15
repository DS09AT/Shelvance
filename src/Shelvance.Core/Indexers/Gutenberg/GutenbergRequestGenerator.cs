using System.Collections.Generic;
using System.Linq;
using NLog;
using NzbDrone.Common.Http;
using NzbDrone.Core.IndexerSearch.Definitions;

namespace NzbDrone.Core.Indexers.Gutenberg
{
    public class GutenbergRequestGenerator : IIndexerRequestGenerator
    {
        public GutenbergSettings Settings { get; set; }
        public IGutenbergCatalogService CatalogService { get; set; }
        public IGutenbergFormatProvider FormatProvider { get; set; }
        public Logger Logger { get; set; }

        // Store search results for the parser to use
        public List<GutenbergBook> LastSearchResults { get; private set; } = new List<GutenbergBook>();

        public IndexerPageableRequestChain GetRecentRequests()
        {
            var pageableRequests = new IndexerPageableRequestChain();

            LastSearchResults = CatalogService.GetRecent(200);

            if (LastSearchResults.Any())
            {
                // Create a dummy request, the actual data comes from the local database
                pageableRequests.Add(GetRequest("recent"));
            }

            return pageableRequests;
        }

        public IndexerPageableRequestChain GetSearchRequests(BookSearchCriteria searchCriteria)
        {
            var query = BuildSearchQuery(searchCriteria.AuthorQuery, searchCriteria.BookQuery);
            return CreateSearchRequest(query);
        }

        public IndexerPageableRequestChain GetSearchRequests(AuthorSearchCriteria searchCriteria)
        {
            return CreateSearchRequest(searchCriteria.AuthorQuery);
        }

        private IndexerPageableRequestChain CreateSearchRequest(string query)
        {
            var pageableRequests = new IndexerPageableRequestChain();

            if (!string.IsNullOrWhiteSpace(query))
            {
                LastSearchResults = CatalogService.Search(query);

                if (LastSearchResults.Any())
                {
                    pageableRequests.Add(GetRequest(query));
                }
            }

            return pageableRequests;
        }

        private string BuildSearchQuery(string authorQuery, string bookQuery)
        {
            var parts = new List<string>();

            if (!string.IsNullOrWhiteSpace(authorQuery))
            {
                parts.Add(authorQuery);
            }

            if (!string.IsNullOrWhiteSpace(bookQuery))
            {
                parts.Add(bookQuery);
            }

            return string.Join(" ", parts);
        }

        private IEnumerable<IndexerRequest> GetRequest(string searchQuery)
        {
            var url = GutenbergConstants.BuildUrl(Settings.BaseUrl, $"/search?q={System.Uri.EscapeDataString(searchQuery)}");

            Logger?.Debug("Gutenberg search: {0} (found {1} books in local catalog)", searchQuery, LastSearchResults.Count);

            yield return new IndexerRequest(url, HttpAccept.Html);
        }
    }
}
