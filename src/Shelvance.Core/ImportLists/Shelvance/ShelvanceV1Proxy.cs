using System;
using System.Collections.Generic;
using System.Net;
using FluentValidation.Results;
using Newtonsoft.Json;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;

namespace NzbDrone.Core.ImportLists.Shelvance
{
    public interface IShelvanceV1Proxy
    {
        List<ShelvanceAuthor> GetAuthors(ShelvanceSettings settings);
        List<ShelvanceBook> GetBooks(ShelvanceSettings settings);
        List<ShelvanceProfile> GetProfiles(ShelvanceSettings settings);
        List<ShelvanceRootFolder> GetRootFolders(ShelvanceSettings settings);
        List<ShelvanceTag> GetTags(ShelvanceSettings settings);
        ValidationFailure Test(ShelvanceSettings settings);
    }

    public class ShelvanceV1Proxy : IShelvanceV1Proxy
    {
        private readonly IHttpClient _httpClient;
        private readonly Logger _logger;

        public ShelvanceV1Proxy(IHttpClient httpClient, Logger logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public List<ShelvanceAuthor> GetAuthors(ShelvanceSettings settings)
        {
            return Execute<ShelvanceAuthor>("/api/v1/author", settings);
        }

        public List<ShelvanceBook> GetBooks(ShelvanceSettings settings)
        {
            return Execute<ShelvanceBook>("/api/v1/book", settings);
        }

        public List<ShelvanceProfile> GetProfiles(ShelvanceSettings settings)
        {
            return Execute<ShelvanceProfile>("/api/v1/qualityprofile", settings);
        }

        public List<ShelvanceRootFolder> GetRootFolders(ShelvanceSettings settings)
        {
            return Execute<ShelvanceRootFolder>("api/v1/rootfolder", settings);
        }

        public List<ShelvanceTag> GetTags(ShelvanceSettings settings)
        {
            return Execute<ShelvanceTag>("/api/v1/tag", settings);
        }

        public ValidationFailure Test(ShelvanceSettings settings)
        {
            try
            {
                GetAuthors(settings);
            }
            catch (HttpException ex)
            {
                if (ex.Response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    _logger.Error(ex, "API Key is invalid");
                    return new ValidationFailure("ApiKey", "API Key is invalid");
                }

                if (ex.Response.HasHttpRedirect)
                {
                    _logger.Error(ex, "Shelvance returned redirect and is invalid");
                    return new ValidationFailure("BaseUrl", "Shelvance URL is invalid, are you missing a URL base?");
                }

                _logger.Error(ex, "Unable to connect to import list.");
                return new ValidationFailure(string.Empty, $"Unable to connect to import list: {ex.Message}. Check the log surrounding this error for details.");
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Unable to connect to import list.");
                return new ValidationFailure(string.Empty, $"Unable to connect to import list: {ex.Message}. Check the log surrounding this error for details.");
            }

            return null;
        }

        private List<TResource> Execute<TResource>(string resource, ShelvanceSettings settings)
        {
            if (settings.BaseUrl.IsNullOrWhiteSpace() || settings.ApiKey.IsNullOrWhiteSpace())
            {
                return new List<TResource>();
            }

            var baseUrl = settings.BaseUrl.TrimEnd('/');

            var request = new HttpRequestBuilder(baseUrl).Resource(resource)
                .Accept(HttpAccept.Json)
                .SetHeader("X-Api-Key", settings.ApiKey)
                .Build();

            var response = _httpClient.Get(request);

            if ((int)response.StatusCode >= 300)
            {
                throw new HttpException(response);
            }

            var results = JsonConvert.DeserializeObject<List<TResource>>(response.Content);

            return results;
        }
    }
}
