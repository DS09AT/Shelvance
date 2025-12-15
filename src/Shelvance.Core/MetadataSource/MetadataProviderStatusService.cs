using System;
using NLog;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.ThingiProvider.Status;

namespace NzbDrone.Core.MetadataSource
{
    public interface IMetadataProviderStatusService : IProviderStatusServiceBase<MetadataProviderStatus>
    {
        /// <summary>
        /// Get total successful query count for a provider
        /// </summary>
        long GetSuccessfulQueryCount(int providerId);

        /// <summary>
        /// Get total failed query count for a provider
        /// </summary>
        long GetFailedQueryCount(int providerId);

        /// <summary>
        /// Get last successful query timestamp for a provider
        /// </summary>
        DateTime? GetLastSuccessfulQuery(int providerId);
    }

    public class MetadataProviderStatusService : ProviderStatusServiceBase<IMetadataProvider, MetadataProviderStatus>, IMetadataProviderStatusService
    {
        public MetadataProviderStatusService(IMetadataProviderStatusRepository providerStatusRepository,
                                             IEventAggregator eventAggregator,
                                             IRuntimeInfo runtimeInfo,
                                             Logger logger)
            : base(providerStatusRepository, eventAggregator, runtimeInfo, logger)
        {
        }

        public long GetSuccessfulQueryCount(int providerId)
        {
            return GetProviderStatus(providerId).SuccessfulQueryCount;
        }

        public long GetFailedQueryCount(int providerId)
        {
            return GetProviderStatus(providerId).FailedQueryCount;
        }

        public DateTime? GetLastSuccessfulQuery(int providerId)
        {
            return GetProviderStatus(providerId).LastSuccessfulQuery;
        }

        public override void RecordSuccess(int providerId)
        {
            lock (_syncRoot)
            {
                var status = GetProviderStatus(providerId);

                status.LastSuccessfulQuery = DateTime.UtcNow;
                status.SuccessfulQueryCount++;

                base.RecordSuccess(providerId);
            }
        }

        public override void RecordFailure(int providerId, TimeSpan minimumBackOff = default(TimeSpan))
        {
            lock (_syncRoot)
            {
                var status = GetProviderStatus(providerId);
                status.FailedQueryCount++;

                base.RecordFailure(providerId, minimumBackOff);
            }
        }
    }
}
