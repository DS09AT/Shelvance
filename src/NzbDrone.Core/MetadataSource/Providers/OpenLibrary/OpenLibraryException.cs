using System;

namespace NzbDrone.Core.MetadataSource.Providers.OpenLibrary
{
    public class OpenLibraryException : MetadataProviderException
    {
        public OpenLibraryException(string message)
            : base(message)
        {
        }

        public OpenLibraryException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }

    public class OpenLibraryRateLimitException : OpenLibraryException
    {
        public OpenLibraryRateLimitException(string message)
            : base(message)
        {
        }

        public OpenLibraryRateLimitException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }

    public class OpenLibraryNotFoundException : OpenLibraryException
    {
        public OpenLibraryNotFoundException(string message)
            : base(message)
        {
        }
    }
}
