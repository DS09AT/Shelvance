using System;
using NzbDrone.Common.Exceptions;

namespace NzbDrone.Core.MetadataSource
{
    /// <summary>
    /// Base exception for metadata provider errors
    /// </summary>
    public class MetadataProviderException : NzbDroneException
    {
        public string ProviderName { get; set; }

        public MetadataProviderException(string message)
            : base(message)
        {
        }

        public MetadataProviderException(string message, params object[] args)
            : base(message, args)
        {
        }

        public MetadataProviderException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }

    /// <summary>
    /// Thrown when no metadata providers are available or enabled
    /// </summary>
    public class NoMetadataProvidersAvailableException : MetadataProviderException
    {
        public NoMetadataProvidersAvailableException()
            : base("No metadata providers are available or enabled")
        {
        }

        public NoMetadataProvidersAvailableException(string message)
            : base(message)
        {
        }
    }

    /// <summary>
    /// Thrown when all providers failed to find the requested metadata
    /// </summary>
    public class MetadataNotFoundException : MetadataProviderException
    {
        public MetadataNotFoundException(string message)
            : base(message)
        {
        }

        public MetadataNotFoundException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}
