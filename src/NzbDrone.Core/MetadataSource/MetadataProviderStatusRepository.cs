using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.ThingiProvider.Status;

namespace NzbDrone.Core.MetadataSource
{
    public interface IMetadataProviderStatusRepository : IProviderStatusRepository<MetadataProviderStatus>
    {
    }

    public class MetadataProviderStatusRepository : ProviderStatusRepository<MetadataProviderStatus>, IMetadataProviderStatusRepository
    {
        public MetadataProviderStatusRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }
    }
}
