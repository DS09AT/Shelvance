using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.ThingiProvider;

namespace NzbDrone.Core.MetadataSource
{
    public interface IMetadataProviderRepository : IProviderRepository<MetadataProviderDefinition>
    {
    }

    public class MetadataProviderRepository : ProviderRepository<MetadataProviderDefinition>, IMetadataProviderRepository
    {
        public MetadataProviderRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }
    }
}
