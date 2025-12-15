using System;
using NzbDrone.Core.ThingiProvider.Status;

namespace NzbDrone.Core.MetadataSource
{
    /// <summary>
    /// Tracks metadata provider health status and failures
    /// Used for automatic backoff when providers fail repeatedly
    /// </summary>
    public class MetadataProviderStatus : ProviderStatusBase
    {
        /// <summary>
        /// Last successful query timestamp
        /// </summary>
        public DateTime? LastSuccessfulQuery { get; set; }

        /// <summary>
        /// Total number of successful queries
        /// </summary>
        public long SuccessfulQueryCount { get; set; }

        /// <summary>
        /// Total number of failed queries
        /// </summary>
        public long FailedQueryCount { get; set; }
    }
}
