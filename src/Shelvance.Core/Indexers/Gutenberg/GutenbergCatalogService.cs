using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Http;
using NzbDrone.Core.Indexers.Gutenberg.Commands;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.Indexers.Gutenberg
{
    public interface IGutenbergCatalogService
    {
        Task UpdateCatalog(string baseUrl = null);
        List<GutenbergBook> Search(string query);
        List<GutenbergBook> GetRecent(int count);
        int GetBookCount();
        DateTime? GetLastUpdateTime();
        bool IsCatalogAvailable();
    }

    public class GutenbergCatalogService : IGutenbergCatalogService,
                                           IExecute<GutenbergCatalogUpdateCommand>
    {
        private const int BATCH_SIZE = 1000;

        private readonly IGutenbergCatalogRepository _repository;
        private readonly IGutenbergMarcParser _marcParser;
        private readonly IHttpClient _httpClient;
        private readonly IDiskProvider _diskProvider;
        private readonly IAppFolderInfo _appFolderInfo;
        private readonly IEventAggregator _eventAggregator;
        private readonly Logger _logger;

        private DateTime? _lastUpdateTime;

        public GutenbergCatalogService(
            IGutenbergCatalogRepository repository,
            IGutenbergMarcParser marcParser,
            IHttpClient httpClient,
            IDiskProvider diskProvider,
            IAppFolderInfo appFolderInfo,
            IEventAggregator eventAggregator,
            Logger logger)
        {
            _repository = repository;
            _marcParser = marcParser;
            _httpClient = httpClient;
            _diskProvider = diskProvider;
            _appFolderInfo = appFolderInfo;
            _eventAggregator = eventAggregator;
            _logger = logger;
        }

        public async Task UpdateCatalog(string baseUrl = null)
        {
            _logger.Info("Starting Project Gutenberg catalog update...");

            var catalogUrl = GutenbergConstants.GetCatalogUrl(baseUrl);

            var tempPath = Path.Combine(_appFolderInfo.TempFolder, "gutenberg");
            var zipPath = Path.Combine(tempPath, "pgmarc.xml.zip");
            var xmlPath = Path.Combine(tempPath, GutenbergConstants.CATALOG_FILENAME);

            try
            {
                // Ensure temp directory exists
                _diskProvider.CreateFolder(tempPath);

                // Download the catalog
                _logger.Info("Downloading Project Gutenberg catalog from {0}...", catalogUrl);
                var request = new HttpRequest(catalogUrl);
                var response = await _httpClient.GetAsync(request);

                if (!response.HasHttpError)
                {
                    await File.WriteAllBytesAsync(zipPath, response.ResponseData);
                    _logger.Info("Downloaded catalog ({0} MB)", response.ResponseData.Length / 1024.0 / 1024.0);

                    // Extract the XML file
                    _logger.Info("Extracting catalog...");
                    if (File.Exists(xmlPath))
                    {
                        File.Delete(xmlPath);
                    }

                    ZipFile.ExtractToDirectory(zipPath, tempPath);

                    // Parse and import
                    await ImportCatalog(xmlPath);

                    _lastUpdateTime = DateTime.UtcNow;
                    _logger.Info("Project Gutenberg catalog update completed successfully. Total books: {0}", _repository.GetBookCount());
                }
                else
                {
                    _logger.Error("Failed to download catalog: HTTP {0}", response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to update Project Gutenberg catalog");
                throw;
            }
            finally
            {
                // Cleanup temp files
                try
                {
                    if (File.Exists(zipPath))
                    {
                        File.Delete(zipPath);
                    }

                    if (File.Exists(xmlPath))
                    {
                        File.Delete(xmlPath);
                    }
                }
                catch (Exception ex)
                {
                    _logger.Warn(ex, "Failed to cleanup temp files");
                }
            }
        }

        private async Task ImportCatalog(string xmlPath)
        {
            _logger.Info("Parsing MARC21 XML catalog...");

            var books = new List<GutenbergBook>();
            var totalImported = 0;

            await using var fileStream = File.OpenRead(xmlPath);

            // Delete existing data before import
            _logger.Info("Clearing existing catalog data...");
            _repository.DeleteAll();

            foreach (var book in _marcParser.ParseMarcXml(fileStream))
            {
                books.Add(book);

                if (books.Count >= BATCH_SIZE)
                {
                    _repository.InsertMany(books);
                    totalImported += books.Count;
                    _logger.Debug("Imported {0} books...", totalImported);
                    books.Clear();
                }
            }

            // Import remaining books
            if (books.Any())
            {
                _repository.InsertMany(books);
                totalImported += books.Count;
            }

            _logger.Info("Imported {0} books from Project Gutenberg catalog", totalImported);
        }

        public List<GutenbergBook> Search(string query)
        {
            return _repository.Search(query);
        }

        public List<GutenbergBook> GetRecent(int count)
        {
            return _repository.GetRecent(count);
        }

        public int GetBookCount()
        {
            return _repository.GetBookCount();
        }

        public DateTime? GetLastUpdateTime()
        {
            return _lastUpdateTime;
        }

        public bool IsCatalogAvailable()
        {
            try
            {
                return _repository.GetBookCount() > 0;
            }
            catch
            {
                return false;
            }
        }

        public void Execute(GutenbergCatalogUpdateCommand message)
        {
            UpdateCatalog().GetAwaiter().GetResult();
        }
    }
}
