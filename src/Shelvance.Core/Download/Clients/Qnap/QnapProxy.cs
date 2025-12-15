using System;
using System.Collections.Generic;
using System.Net.Http;
using NLog;
using NzbDrone.Common.Http;

namespace NzbDrone.Core.Download.Clients.Qnap
{
    public interface IQnapProxy
    {
        QnapLoginResponse LoginWithToken(QnapSettings settings);
        string Login(QnapSettings settings);
        void Logout(QnapSettings settings, string sid);
        string AddUrl(QnapSettings settings, string sid, string token, string url, string tempFolder, string destinationFolder);
        string AddTorrent(QnapSettings settings, string sid, string token, byte[] torrentData, string filename, string tempFolder, string destinationFolder);
        QnapTaskResponse QueryTasks(QnapSettings settings, string sid, string token, int limit = 0, string status = "all");
        QnapTaskItem GetTaskDetail(QnapSettings settings, string sid, string token, string hash);
        void PauseTask(QnapSettings settings, string sid, string token, string hash);
        void StartTask(QnapSettings settings, string sid, string token, string hash);
        void StopTask(QnapSettings settings, string sid, string token, string hash);
        void RemoveTask(QnapSettings settings, string sid, string token, string hash);
        List<QnapDir> GetDirs(QnapSettings settings, string sid, string token);
    }

    public class QnapProxy : IQnapProxy
    {
        private readonly IHttpClient _httpClient;
        private readonly Logger _logger;

        public QnapProxy(IHttpClient httpClient, Logger logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public QnapLoginResponse LoginWithToken(QnapSettings settings)
        {
            var url = BuildUrl(settings, "Misc/Login");
            var encodedPassword = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(settings.Password));

            var requestBuilder = new HttpRequestBuilder(url)
                .AddQueryParam("user", settings.Username)
                .AddQueryParam("pass", encodedPassword)
                .Accept(HttpAccept.Json);

            var request = requestBuilder.Build();
            request.SuppressHttpError = true;
            request.AllowAutoRedirect = false;

            var response = _httpClient.Post<QnapLoginResponse>(request);

            if (response.Resource.Error != 0)
            {
                throw new DownloadClientAuthenticationException($"QNAP login failed: {response.Resource.Reason}");
            }

            return response.Resource;
        }

        public string Login(QnapSettings settings)
        {
            return LoginWithToken(settings).Sid;
        }

        public void Logout(QnapSettings settings, string sid)
        {
            try
            {
                var url = BuildUrl(settings, "Misc/Logout");
                var requestBuilder = new HttpRequestBuilder(url)
                    .AddQueryParam("sid", sid)
                    .Accept(HttpAccept.Json);

                var request = requestBuilder.Build();
                _httpClient.Get(request);

                var cacheKey = $"{settings.Host}:{settings.Port}:{settings.Username}";
            }
            catch (Exception ex)
            {
                _logger.Debug(ex, "Failed to logout from QNAP");
            }
        }

        public string AddUrl(QnapSettings settings, string sid, string token, string url, string tempFolder, string destinationFolder)
        {
            var apiUrl = BuildUrl(settings, "Task/AddUrl");
            var requestBuilder = new HttpRequestBuilder(apiUrl)
                .AddQueryParam("sid", sid)
                .AddQueryParam("token", token)
                .AddQueryParam("url", url)
                .Accept(HttpAccept.Json);

            // Only add temp/move params if folders are configured
            if (!string.IsNullOrWhiteSpace(tempFolder))
            {
                requestBuilder.AddQueryParam("temp", tempFolder);
            }

            if (!string.IsNullOrWhiteSpace(destinationFolder))
            {
                requestBuilder.AddQueryParam("move", destinationFolder);
            }

            var request = requestBuilder.Build();
            request.SuppressHttpError = true;

            var response = _httpClient.Get<QnapAddUrlResponse>(request);

            if (response.Resource.Error != 0)
            {
                throw new DownloadClientException($"QNAP AddUrl failed: {response.Resource.Reason}");
            }

            return response.Resource.Hash;
        }

        public string AddTorrent(QnapSettings settings, string sid, string token, byte[] torrentData, string filename, string tempFolder, string destinationFolder)
        {
            var apiUrl = BuildUrl(settings, "Task/AddTorrent");

            var requestBuilder = new HttpRequestBuilder(apiUrl)
                .Accept(HttpAccept.Json);

            var request = requestBuilder.Build();
            request.Method = HttpMethod.Post;
            request.SuppressHttpError = true;

            var boundary = "----WebKitFormBoundary" + DateTime.Now.Ticks.ToString("x");
            request.Headers.ContentType = $"multipart/form-data; boundary={boundary}";

            var formData = new System.IO.MemoryStream();
            var writer = new System.IO.StreamWriter(formData);

            // File field (as array notation: file[])
            writer.Write($"--{boundary}\r\n");
            writer.Write($"Content-Disposition: form-data; name=\"file[]\"; filename=\"{filename}\"\r\n");
            writer.Write("Content-Type: application/x-bittorrent\r\n\r\n");
            writer.Flush();
            formData.Write(torrentData, 0, torrentData.Length);
            writer.Write("\r\n");

            // Temp folder field
            if (!string.IsNullOrWhiteSpace(tempFolder))
            {
                writer.Write($"--{boundary}\r\n");
                writer.Write("Content-Disposition: form-data; name=\"temp\"\r\n\r\n");
                writer.Write(tempFolder);
                writer.Write("\r\n");
            }

            // Move/destination folder field
            if (!string.IsNullOrWhiteSpace(destinationFolder))
            {
                writer.Write($"--{boundary}\r\n");
                writer.Write("Content-Disposition: form-data; name=\"move\"\r\n\r\n");
                writer.Write(destinationFolder);
                writer.Write("\r\n");
            }

            // SID field
            writer.Write($"--{boundary}\r\n");
            writer.Write("Content-Disposition: form-data; name=\"sid\"\r\n\r\n");
            writer.Write(sid);
            writer.Write("\r\n");

            // Token field (optional, add if present)
            if (!string.IsNullOrWhiteSpace(token))
            {
                writer.Write($"--{boundary}\r\n");
                writer.Write("Content-Disposition: form-data; name=\"token\"\r\n\r\n");
                writer.Write(token);
                writer.Write("\r\n");
            }

            // End boundary
            writer.Write($"--{boundary}--\r\n");
            writer.Flush();

            request.SetContent(formData.ToArray());

            var response = _httpClient.Post<QnapAddUrlResponse>(request);

            if (response.Resource.Error != 0)
            {
                throw new DownloadClientException($"QNAP AddTorrent failed: {response.Resource.Reason}");
            }

            return response.Resource.Hash;
        }

        public QnapTaskResponse QueryTasks(QnapSettings settings, string sid, string token, int limit = 0, string status = "all")
        {
            var url = BuildUrl(settings, "Task/Query");
            var requestBuilder = new HttpRequestBuilder(url)
                .AddQueryParam("sid", sid)
                .AddQueryParam("token", token)
                .AddQueryParam("limit", limit.ToString())
                .AddQueryParam("status", status)
                .AddQueryParam("type", "all")
                .Accept(HttpAccept.Json)
                .SetHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");

            var request = requestBuilder.Build();
            request.Method = HttpMethod.Post;
            request.SuppressHttpError = true;

            var response = _httpClient.Post<QnapTaskResponse>(request);

            if (response.Resource.Error != 0 && response.Resource.Error != -1)
            {
                throw new DownloadClientException($"QNAP QueryTasks failed: {response.Resource.Reason}");
            }

            return response.Resource;
        }

        public QnapTaskItem GetTaskDetail(QnapSettings settings, string sid, string token, string hash)
        {
            var url = BuildUrl(settings, "Task/Detail");
            var requestBuilder = new HttpRequestBuilder(url)
                .AddQueryParam("sid", sid)
                .AddQueryParam("token", token)
                .AddQueryParam("hash", hash)
                .Accept(HttpAccept.Json)
                .SetHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");

            var request = requestBuilder.Build();
            request.Method = HttpMethod.Post;
            request.SuppressHttpError = true;

            var response = _httpClient.Post<QnapTaskResponse>(request);

            if (response.Resource.Error != 0)
            {
                throw new DownloadClientException($"QNAP GetTaskDetail failed: {response.Resource.Reason}");
            }

            return response.Resource.Data?[0];
        }

        public void PauseTask(QnapSettings settings, string sid, string token, string hash)
        {
            ExecuteTaskCommand(settings, sid, token, hash, "Task/Pause");
        }

        public void StartTask(QnapSettings settings, string sid, string token, string hash)
        {
            ExecuteTaskCommand(settings, sid, token, hash, "Task/Start");
        }

        public void StopTask(QnapSettings settings, string sid, string token, string hash)
        {
            ExecuteTaskCommand(settings, sid, token, hash, "Task/Stop");
        }

        public void RemoveTask(QnapSettings settings, string sid, string token, string hash)
        {
            ExecuteTaskCommand(settings, sid, token, hash, "Task/Remove");
        }

        public List<QnapDir> GetDirs(QnapSettings settings, string sid, string token)
        {
            var url = BuildUrl(settings, "Misc/Dir");
            var requestBuilder = new HttpRequestBuilder(url)
                .AddQueryParam("sid", sid)
                .AddQueryParam("token", token)
                .Accept(HttpAccept.Json);

            var request = requestBuilder.Build();
            request.SuppressHttpError = true;

            var response = _httpClient.Get<QnapDirResponse>(request);

            if (response.Resource.Error != 0)
            {
                throw new DownloadClientException($"QNAP GetDirs failed: {response.Resource.Reason}");
            }

            return new List<QnapDir>(response.Resource.Data ?? Array.Empty<QnapDir>());
        }

        private void ExecuteTaskCommand(QnapSettings settings, string sid, string token, string hash, string command)
        {
            var url = BuildUrl(settings, command);
            var requestBuilder = new HttpRequestBuilder(url)
                .AddQueryParam("sid", sid)
                .AddQueryParam("token", token)
                .AddQueryParam("hash", hash)
                .Accept(HttpAccept.Json)
                .SetHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");

            var request = requestBuilder.Build();
            request.Method = HttpMethod.Post;
            request.SuppressHttpError = true;

            var response = _httpClient.Post<QnapBasicResponse>(request);

            if (response.Resource.Error != 0)
            {
                throw new DownloadClientException($"QNAP {command} failed: {response.Resource.Reason}");
            }
        }

        private string BuildUrl(QnapSettings settings, string endpoint)
        {
            var protocol = settings.UseSsl ? "https" : "http";
            var port = settings.Port;

            // Auto-correct common misconfigurations
            if (!settings.UseSsl && port == 443)
            {
                _logger.Warn("QNAP: Port 443 detected with SSL disabled. SSL will be auto-enabled.");
                protocol = "https";
            }
            else if (settings.UseSsl && port == 80)
            {
                _logger.Warn("QNAP: Port 80 detected with SSL enabled. SSL will be auto-disabled.");
                protocol = "http";
            }

            return $"{protocol}://{settings.Host}:{port}/downloadstation/V4/{endpoint}";
        }
    }
}
