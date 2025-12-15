using System;
using System.Collections.Generic;
using System.Linq;
using FluentValidation.Results;
using NLog;
using NzbDrone.Common.Cache;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
using NzbDrone.Core.Blocklisting;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.MediaFiles.TorrentInfo;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.RemotePathMappings;
using NzbDrone.Core.Validation;

namespace NzbDrone.Core.Download.Clients.Qnap
{
    public class TorrentQnap : TorrentClientBase<QnapSettings>
    {
        private readonly IQnapProxy _proxy;
        private readonly ICached<AuthToken> _authTokenCache;

        public TorrentQnap(IQnapProxy proxy,
                          ITorrentFileInfoReader torrentFileInfoReader,
                          IHttpClient httpClient,
                          IConfigService configService,
                          IDiskProvider diskProvider,
                          IRemotePathMappingService remotePathMappingService,
                          IBlocklistService blocklistService,
                          ICacheManager cacheManager,
                          Logger logger)
            : base(torrentFileInfoReader, httpClient, configService, diskProvider, remotePathMappingService, blocklistService, logger)
        {
            _proxy = proxy;
            _authTokenCache = cacheManager.GetCache<AuthToken>(GetType(), "authTokens");
        }

        public override string Name => "QNAP Download Station";

        protected AuthToken GetAuthToken()
        {
            var cacheKey = $"{Settings.Host}:{Settings.Port}:{Settings.Username}";

            return _authTokenCache.Get(
                cacheKey,
                () =>
                {
                    var loginData = _proxy.LoginWithToken(Settings);
                    var auth = new AuthToken { Sid = loginData.Sid, Token = loginData.Token };
                    _logger.Debug("QNAP authenticated: SID={0}, Token={1}", loginData.Sid, loginData.Token);
                    return auth;
                },
                TimeSpan.FromHours(1));
        }

        protected override string AddFromMagnetLink(RemoteBook remoteBook, string hash, string magnetLink)
        {
            _logger.Info("Adding magnet link [{0}] to QNAP queue.", remoteBook.Release.Title);

            var auth = GetAuthToken();
            var tempFolder = Settings.TempFolder ?? string.Empty;
            var destinationFolder = Settings.DestinationFolder ?? string.Empty;

            var downloadId = _proxy.AddUrl(Settings, auth.Sid, auth.Token, magnetLink, tempFolder, destinationFolder);

            _logger.Debug("QNAP Download Station added magnet download: {0} with hash {1}", remoteBook.Release.Title, downloadId);

            return downloadId;
        }

        protected override string AddFromTorrentFile(RemoteBook remoteBook, string hash, string filename, byte[] fileContent)
        {
            _logger.Info("Adding torrent file [{0}] to QNAP queue.", remoteBook.Release.Title);

            var auth = GetAuthToken();
            var tempFolder = Settings.TempFolder ?? string.Empty;
            var destinationFolder = Settings.DestinationFolder ?? string.Empty;

            var downloadId = _proxy.AddTorrent(Settings, auth.Sid, auth.Token, fileContent, filename, tempFolder, destinationFolder);

            _logger.Debug("QNAP Download Station added torrent download: {0} with hash {1}", remoteBook.Release.Title, downloadId);

            return downloadId;
        }

        public override IEnumerable<DownloadClientItem> GetItems()
        {
            var auth = GetAuthToken();
            var response = _proxy.QueryTasks(Settings, auth.Sid, auth.Token);

            if (response.Data == null)
            {
                return Enumerable.Empty<DownloadClientItem>();
            }

            var items = new List<DownloadClientItem>();

            foreach (var task in response.Data)
            {
                // Filter: Only Torrent tasks (State >= 100)
                if (task.State < 100)
                {
                    continue;
                }

                var status = MapStatus(task.State);
                var outputPath = _remotePathMappingService.RemapRemoteToLocal(Settings.Host, new OsPath(task.Move));

                var item = new DownloadClientItem
                {
                    CanMoveFiles = false,
                    CanBeRemoved = status == DownloadItemStatus.Completed || status == DownloadItemStatus.Failed,
                    Category = Settings.Category,
                    DownloadClientInfo = DownloadClientItemClientInfo.FromDownloadClient(this, false),
                    DownloadId = task.Hash,
                    IsEncrypted = false,
                    Message = task.Error,
                    OutputPath = outputPath,
                    RemainingSize = task.Size - task.DownSize,
                    RemainingTime = task.DownRate > 0 ? TimeSpan.FromSeconds(task.Eta) : (TimeSpan?)null,
                    Status = status,
                    Title = task.SourceName.IsNullOrWhiteSpace() ? System.IO.Path.GetFileName(task.Source) : task.SourceName,
                    TotalSize = task.Size,
                };

                if (status == DownloadItemStatus.Completed)
                {
                    item.SeedRatio = task.Share;
                }

                items.Add(item);
            }

            return items;
        }

        public override void RemoveItem(DownloadClientItem item, bool deleteData)
        {
            var auth = GetAuthToken();
            _proxy.RemoveTask(Settings, auth.Sid, auth.Token, item.DownloadId);

            if (deleteData)
            {
                DeleteItemData(item);
            }
        }

        public override DownloadClientInfo GetStatus()
        {
            var auth = GetAuthToken();
            var dirs = _proxy.GetDirs(Settings, auth.Sid, auth.Token);

            var validDirs = dirs.Where(d => !string.IsNullOrWhiteSpace(d.Path)).ToList();
            var firstDir = validDirs.FirstOrDefault()?.Path;

            string rootFolder;
            if (!string.IsNullOrWhiteSpace(firstDir))
            {
                rootFolder = firstDir.StartsWith("/") ? firstDir : "/" + firstDir;
            }
            else
            {
                rootFolder = "/";
                _logger.Warn("QNAP: No download directories found. Using fallback.");
            }

            return new DownloadClientInfo
            {
                IsLocalhost = Settings.Host.Contains("127.0.0.1") || Settings.Host.Contains("localhost"),
                OutputRootFolders = new List<OsPath> { _remotePathMappingService.RemapRemoteToLocal(Settings.Host, new OsPath(rootFolder)) }
            };
        }

        protected override void Test(List<ValidationFailure> failures)
        {
            failures.AddIfNotNull(TestConnection());
            failures.AddIfNotNull(TestDownloadFolder());
        }

        private DownloadItemStatus MapStatus(int stateCode)
        {
            return stateCode switch
            {
                100 => DownloadItemStatus.Queued,
                101 => DownloadItemStatus.Queued,
                102 => DownloadItemStatus.Downloading,
                103 => DownloadItemStatus.Completed,
                104 => DownloadItemStatus.Downloading,
                105 => DownloadItemStatus.Downloading,
                106 => DownloadItemStatus.Paused,
                107 => DownloadItemStatus.Failed,
                _ => DownloadItemStatus.Queued
            };
        }

        private ValidationFailure TestConnection()
        {
            try
            {
                GetAuthToken();
            }
            catch (DownloadClientAuthenticationException ex)
            {
                _logger.Error(ex, "Failed to authenticate with QNAP Download Station");
                return new NzbDroneValidationFailure("Username", "Authentication failed")
                {
                    DetailedDescription = ex.Message
                };
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to test QNAP Download Station");
                return new NzbDroneValidationFailure("Host", "Unable to connect to QNAP Download Station")
                {
                    DetailedDescription = ex.Message
                };
            }

            return null;
        }

        private ValidationFailure TestDownloadFolder()
        {
            try
            {
                var auth = GetAuthToken();
                var dirs = _proxy.GetDirs(Settings, auth.Sid, auth.Token);
                var validDirs = dirs.Where(d => !string.IsNullOrWhiteSpace(d.Path)).ToList();

                if (Settings.TempFolder.IsNotNullOrWhiteSpace())
                {
                    var tempFolder = Settings.TempFolder.TrimStart('/');
                    var isValidPath = validDirs.Any(d =>
                        tempFolder.StartsWith(d.Path.TrimStart('/'), StringComparison.OrdinalIgnoreCase));

                    if (!isValidPath)
                    {
                        return new NzbDroneValidationFailure("TempFolder", "Temp folder must start with a valid QNAP root folder")
                        {
                            DetailedDescription = $"The folder '{Settings.TempFolder}' must start with one of the available root folders: {string.Join(", ", validDirs.Select(d => d.Path))}"
                        };
                    }
                }

                if (Settings.DestinationFolder.IsNotNullOrWhiteSpace())
                {
                    var destFolder = Settings.DestinationFolder.TrimStart('/');
                    var isValidPath = validDirs.Any(d =>
                        destFolder.StartsWith(d.Path.TrimStart('/'), StringComparison.OrdinalIgnoreCase));

                    if (!isValidPath)
                    {
                        return new NzbDroneValidationFailure("DestinationFolder", "Destination folder must start with a valid QNAP root folder")
                        {
                            DetailedDescription = $"The folder '{Settings.DestinationFolder}' must start with one of the available root folders: {string.Join(", ", validDirs.Select(d => d.Path))}"
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Failed to validate download folders");
                return new NzbDroneValidationFailure("DestinationFolder", "Unable to validate download folders")
                {
                    DetailedDescription = ex.Message
                };
            }

            return null;
        }

        protected class AuthToken
        {
            public string Sid { get; set; }
            public string Token { get; set; }
        }
    }
}
