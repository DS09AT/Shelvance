using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using FluentValidation.Results;
using NLog;
using NzbDrone.Common.Http;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Indexers.Exceptions;
using NzbDrone.Core.Parser;
using NzbDrone.Core.ThingiProvider;

namespace NzbDrone.Core.Indexers.Gutenberg
{
    public class Gutenberg : HttpIndexerBase<GutenbergSettings>
    {
        public override string Name => "Project Gutenberg";
        public override DownloadProtocol Protocol => DownloadProtocol.Http;
        public override bool SupportsRss => true;
        public override bool SupportsSearch => true;
        public override int PageSize => 0;

        private readonly IGutenbergCatalogService _catalogService;
        private readonly IGutenbergFormatProvider _formatProvider;
        private GutenbergRequestGenerator _requestGenerator;

        public Gutenberg(
            IHttpClient httpClient,
            IIndexerStatusService indexerStatusService,
            IConfigService configService,
            IParsingService parsingService,
            IGutenbergCatalogService catalogService,
            IGutenbergFormatProvider formatProvider,
            Logger logger)
            : base(httpClient, indexerStatusService, configService, parsingService, logger)
        {
            _catalogService = catalogService;
            _formatProvider = formatProvider;
        }

        public override IEnumerable<ProviderDefinition> DefaultDefinitions
        {
            get
            {
                yield return new IndexerDefinition
                {
                    EnableRss = true,
                    EnableAutomaticSearch = true,
                    EnableInteractiveSearch = true,
                    Name = Name,
                    Implementation = GetType().Name,
                    Settings = new GutenbergSettings(),
                    Protocol = Protocol,
                    SupportsRss = SupportsRss,
                    SupportsSearch = SupportsSearch
                };
            }
        }

        public override IIndexerRequestGenerator GetRequestGenerator()
        {
            _requestGenerator = new GutenbergRequestGenerator
            {
                Settings = Settings,
                CatalogService = _catalogService,
                FormatProvider = _formatProvider,
                Logger = _logger
            };

            return _requestGenerator;
        }

        public override IParseIndexerResponse GetParser()
        {
            return new GutenbergParser(Settings, _formatProvider, _requestGenerator);
        }

        protected override async Task<IndexerResponse> FetchIndexerResponse(IndexerRequest request)
        {
            // Gutenberg uses local database, no HTTP requests needed
            if (!_catalogService.IsCatalogAvailable())
            {
                _logger.Warn("Project Gutenberg catalog is not available.");
                var emptyResponse = new HttpResponse(request.HttpRequest, new HttpHeader(), string.Empty);
                throw new IndexerException(new IndexerResponse(request, emptyResponse), "Catalog not available. Please wait for catalog update to complete.");
            }

            // Create a fake response with empty content. Actual data comes from local DB via Parser
            var httpResponse = new HttpResponse(request.HttpRequest, new HttpHeader(), string.Empty);
            return await Task.FromResult(new IndexerResponse(request, httpResponse));
        }

        protected override async Task Test(List<ValidationFailure> failures)
        {
            try
            {
                var catalogUrl = GutenbergConstants.GetCatalogUrl(Settings.BaseUrl);
                var request = new HttpRequest(catalogUrl);
                request.AllowAutoRedirect = true;
                request.Method = HttpMethod.Head;

                var response = await _httpClient.HeadAsync(request);

                if (response.HasHttpError)
                {
                    failures.Add(new ValidationFailure(string.Empty,
                        $"Unable to reach Project Gutenberg catalog. HTTP Status: {response.StatusCode}"));
                }
                else
                {
                    _logger.Debug("Project Gutenberg catalog is reachable");
                }
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Failed to connect to Project Gutenberg");
                failures.Add(new ValidationFailure(string.Empty,
                    "Unable to connect to Project Gutenberg. Please check your internet connection."));
            }
        }

        public override HttpRequest GetDownloadRequest(string link)
        {
            return new HttpRequest(link);
        }
    }
}
