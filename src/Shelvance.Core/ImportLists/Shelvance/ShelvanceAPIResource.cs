using System.Collections.Generic;

namespace NzbDrone.Core.ImportLists.Shelvance
{
    public class ShelvanceAuthor
    {
        public string AuthorName { get; set; }
        public int Id { get; set; }
        public string ForeignAuthorId { get; set; }
        public string Overview { get; set; }
        public List<MediaCover.MediaCover> Images { get; set; }
        public bool Monitored { get; set; }
        public int QualityProfileId { get; set; }
        public string RootFolderPath { get; set; }
        public HashSet<int> Tags { get; set; }
    }

    public class ShelvanceEdition
    {
        public string Title { get; set; }
        public string ForeignEditionId { get; set; }
        public string Overview { get; set; }
        public List<MediaCover.MediaCover> Images { get; set; }
        public bool Monitored { get; set; }
    }

    public class ShelvanceBook
    {
        public string Title { get; set; }
        public string ForeignBookId { get; set; }
        public string ForeignEditionId { get; set; }
        public string Overview { get; set; }
        public List<MediaCover.MediaCover> Images { get; set; }
        public bool Monitored { get; set; }
        public ShelvanceAuthor Author { get; set; }
        public int AuthorId { get; set; }
        public List<ShelvanceEdition> Editions { get; set; }
    }

    public class ShelvanceProfile
    {
        public string Name { get; set; }
        public int Id { get; set; }
    }

    public class ShelvanceTag
    {
        public string Label { get; set; }
        public int Id { get; set; }
    }

    public class ShelvanceRootFolder
    {
        public string Path { get; set; }
        public int Id { get; set; }
    }
}
