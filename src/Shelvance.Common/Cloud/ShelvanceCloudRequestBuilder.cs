using NzbDrone.Common.Http;

namespace NzbDrone.Common.Cloud
{
    public interface IShelvanceCloudRequestBuilder
    {
        IHttpRequestBuilderFactory Services { get; }
        IHttpRequestBuilderFactory Metadata { get; }
    }

    public class ShelvanceCloudRequestBuilder : IShelvanceCloudRequestBuilder
    {
        public ShelvanceCloudRequestBuilder()
        {
            //TODO: Create Update Endpoint
            Services = new HttpRequestBuilder("https://shelvance.org/v1/")
                .CreateFactory();

            Metadata = new HttpRequestBuilder("https://api.bookinfo.club/v1/{route}")
                .CreateFactory();
        }

        public IHttpRequestBuilderFactory Services { get; }

        public IHttpRequestBuilderFactory Metadata { get; }
    }
}
