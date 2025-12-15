using System.Threading.Tasks;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Http;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.RemotePathMappings;
using NzbDrone.Core.ThingiProvider;

namespace NzbDrone.Core.Download
{
    public abstract class HttpClientBase<TSettings> : DownloadClientBase<TSettings>
        where TSettings : IProviderConfig, new()
    {
        protected readonly IHttpClient _httpClient;

        protected HttpClientBase(IHttpClient httpClient,
                                IConfigService configService,
                                IDiskProvider diskProvider,
                                IRemotePathMappingService remotePathMappingService,
                                Logger logger)
            : base(configService, diskProvider, remotePathMappingService, logger)
        {
            _httpClient = httpClient;
        }

        public override DownloadProtocol Protocol => DownloadProtocol.Http;

        protected abstract string AddFromHttpUrl(RemoteBook remoteBook, string url);

        public override Task<string> Download(RemoteBook remoteBook, IIndexer indexer)
        {
            var url = remoteBook.Release.DownloadUrl;

            _logger.Info("Adding HTTP download [{0}] to the queue.", remoteBook.Release.Title);
            var downloadId = AddFromHttpUrl(remoteBook, url);

            return Task.FromResult(downloadId);
        }
    }
}
