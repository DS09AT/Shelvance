using NzbDrone.Core.Messaging.Commands;

namespace NzbDrone.Core.Indexers.Gutenberg.Commands
{
    public class GutenbergCatalogUpdateCommand : Command
    {
        public override bool SendUpdatesToClient => true;
        public override bool IsLongRunning => true;

        public override string CompletionMessage => "Project Gutenberg catalog update completed";
    }
}
