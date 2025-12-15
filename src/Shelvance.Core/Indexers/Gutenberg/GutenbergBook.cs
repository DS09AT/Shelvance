using System;
using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.Indexers.Gutenberg
{
    public class GutenbergBook : ModelBase
    {
        public int GutenbergId { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string Language { get; set; }
        public string Subjects { get; set; }
        public bool? Copyright { get; set; }
        public int Downloads { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
