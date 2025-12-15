using System.Linq;
using NLog;
using NzbDrone.Common.Cache;
using NzbDrone.Core.Indexers.Gutenberg.Commands;
using NzbDrone.Core.Jobs;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.ThingiProvider.Events;

namespace NzbDrone.Core.Indexers.Gutenberg
{
    public class GutenbergTaskManager : IHandle<ProviderAddedEvent<IIndexer>>,
                                        IHandle<ProviderUpdatedEvent<IIndexer>>,
                                        IHandle<ProviderDeletedEvent<IIndexer>>
    {
        private readonly IScheduledTaskRepository _scheduledTaskRepository;
        private readonly IIndexerFactory _indexerFactory;
        private readonly IManageCommandQueue _commandQueueManager;
        private readonly IGutenbergCatalogService _catalogService;
        private readonly ICacheManager _cacheManager;
        private readonly Logger _logger;

        public GutenbergTaskManager(
            IScheduledTaskRepository scheduledTaskRepository,
            IIndexerFactory indexerFactory,
            IManageCommandQueue commandQueueManager,
            IGutenbergCatalogService catalogService,
            ICacheManager cacheManager,
            Logger logger)
        {
            _scheduledTaskRepository = scheduledTaskRepository;
            _indexerFactory = indexerFactory;
            _commandQueueManager = commandQueueManager;
            _catalogService = catalogService;
            _cacheManager = cacheManager;
            _logger = logger;
        }

        public void Handle(ProviderAddedEvent<IIndexer> message)
        {
            if (message.Definition.Implementation == typeof(Gutenberg).Name && message.Definition.Enable)
            {
                UpdateTask(true);

                // Trigger initial catalog download if needed
                if (!_catalogService.IsCatalogAvailable())
                {
                    _logger.Info("Project Gutenberg indexer added. Scheduling catalog download...");
                    _commandQueueManager.Push(new GutenbergCatalogUpdateCommand(), CommandPriority.High);
                }
            }
        }

        public void Handle(ProviderUpdatedEvent<IIndexer> message)
        {
            if (message.Definition.Implementation == typeof(Gutenberg).Name)
            {
                UpdateTask(message.Definition.Enable);
            }
        }

        public void Handle(ProviderDeletedEvent<IIndexer> message)
        {
            // Check if any Gutenberg indexer still exists
            var hasGutenberg = _indexerFactory.All().Any(i => i.Implementation == typeof(Gutenberg).Name);
            UpdateTask(hasGutenberg);
        }

        private void UpdateTask(bool shouldExist)
        {
            var taskTypeName = typeof(GutenbergCatalogUpdateCommand).FullName;
            var existingTask = _scheduledTaskRepository.All().FirstOrDefault(t => t.TypeName == taskTypeName);
            var taskManagerCache = _cacheManager.GetCache<ScheduledTask>(typeof(TaskManager));

            if (shouldExist && existingTask == null)
            {
                _logger.Info("Adding Gutenberg Catalog Update scheduled task");
                var task = new ScheduledTask
                {
                    TypeName = taskTypeName,
                    Interval = 7 * 24 * 60, // Weekly (7 days)
                    LastExecution = System.DateTime.MinValue
                };

                // Insert into DB and update cache
                var insertedTask = _scheduledTaskRepository.Insert(task);
                taskManagerCache.Set(taskTypeName, insertedTask);

                _logger.Debug("Gutenberg task added with ID {0}", insertedTask.Id);
            }
            else if (!shouldExist && existingTask != null)
            {
                _logger.Info("Removing Gutenberg Catalog Update scheduled task");
                _scheduledTaskRepository.Delete(existingTask.Id);
                taskManagerCache.Remove(taskTypeName);
            }
        }
    }
}
