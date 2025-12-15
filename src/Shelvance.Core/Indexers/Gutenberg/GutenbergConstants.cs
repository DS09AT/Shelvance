namespace NzbDrone.Core.Indexers.Gutenberg
{
    public static class GutenbergConstants
    {
        public const string DEFAULT_BASE_URL = "https://www.gutenberg.org";
        public const string CATALOG_PATH = "/cache/epub/feeds/pgmarc.xml.zip";
        public const string CATALOG_FILENAME = "pgmarc.xml";

        public static string BuildUrl(string baseUrl, string path)
        {
            return (baseUrl ?? DEFAULT_BASE_URL).TrimEnd('/') + path;
        }

        public static string GetCatalogUrl(string baseUrl = null)
        {
            return BuildUrl(baseUrl, CATALOG_PATH);
        }
    }
}
