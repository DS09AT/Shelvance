using System.Collections.Generic;
using System.IO;
using System.Linq;
using NLog;
using NzbDrone.Core.Books;
using NzbDrone.Core.MediaFiles.BookImport.Identification;

namespace NzbDrone.Core.Parser.Model
{
    public class LocalEdition
    {
        private static readonly Logger Logger = LogManager.GetCurrentClassLogger();
        public LocalEdition()
        {
            LocalBooks = new List<LocalBook>();

            // A dummy distance, will be replaced
            Distance = new Distance();
            Distance.Add("book_id", 1.0);
        }

        public LocalEdition(List<LocalBook> tracks)
        {
            LocalBooks = tracks;

            // A dummy distance, will be replaced
            Distance = new Distance();
            Distance.Add("book_id", 1.0);
        }

        public List<LocalBook> LocalBooks { get; set; }
        public int TrackCount => LocalBooks.Count;

        public Distance Distance { get; set; }
        public Edition Edition { get; set; }
        public List<LocalBook> ExistingTracks { get; set; }
        public bool NewDownload { get; set; }

        public void PopulateMatch(bool keepAllEditions)
        {
            if (Edition == null)
            {
                Logger.Warn("PopulateMatch called but Edition is null for {0}. Files will not be matched.", this);
                return;
            }

            var existingTracks = ExistingTracks ?? new List<LocalBook>();
            LocalBooks = LocalBooks.Concat(existingTracks).DistinctBy(x => x.Path).ToList();

            var fullBook = Edition.Book?.Value;
            if (fullBook == null)
            {
                Logger.Warn("PopulateMatch: Edition.Book.Value is null for edition '{0}'. Files will not be matched.", Edition.Title);
                return;
            }

            if (!keepAllEditions)
            {
                // Manually clone the edition / book to avoid holding references to *every* edition we have
                // seen during the matching process
                var edition = new Edition();
                edition.UseMetadataFrom(Edition);
                edition.UseDbFieldsFrom(Edition);
                edition.BookFiles = Edition.BookFiles;

                var book = new Book();
                book.UseMetadataFrom(fullBook);
                book.UseDbFieldsFrom(fullBook);

                if (fullBook.Author?.Value != null)
                {
                    book.Author.Value.UseMetadataFrom(fullBook.Author.Value);
                    book.Author.Value.UseDbFieldsFrom(fullBook.Author.Value);
                }

                if (fullBook.AuthorMetadata?.Value != null)
                {
                    book.Author.Value.Metadata = fullBook.AuthorMetadata.Value;
                    book.AuthorMetadata = fullBook.AuthorMetadata.Value;
                }

                book.BookFiles = fullBook.BookFiles;
                book.Editions = new List<Edition> { edition };

                if (fullBook.SeriesLinks != null && fullBook.SeriesLinks.IsLoaded && fullBook.SeriesLinks.Value != null)
                {
                    book.SeriesLinks = fullBook.SeriesLinks.Value
                        .Where(l => l.Series?.Value != null)
                        .Select(l => new SeriesBookLink
                        {
                            Book = book,
                            Series = new Series
                            {
                                ForeignSeriesId = l.Series.Value.ForeignSeriesId,
                                Title = l.Series.Value.Title,
                                Description = l.Series.Value.Description,
                                Numbered = l.Series.Value.Numbered,
                                WorkCount = l.Series.Value.WorkCount,
                                PrimaryWorkCount = l.Series.Value.PrimaryWorkCount
                            },
                            IsPrimary = l.IsPrimary,
                            Position = l.Position,
                            SeriesPosition = l.SeriesPosition
                        }).ToList();
                }
                else
                {
                    book.SeriesLinks = fullBook.SeriesLinks;
                }

                edition.Book = book;

                Edition = edition;

                foreach (var localTrack in LocalBooks)
                {
                    localTrack.Edition = edition;
                    localTrack.Book = book;
                    localTrack.Author = book.Author?.Value;
                    localTrack.PartCount = LocalBooks.Count;
                }
            }
            else
            {
                foreach (var localTrack in LocalBooks)
                {
                    localTrack.Edition = Edition;
                    localTrack.Book = fullBook;
                    localTrack.Author = fullBook.Author?.Value;
                    localTrack.PartCount = LocalBooks.Count;
                }
            }
        }

        public override string ToString()
        {
            return "[" + string.Join(", ", LocalBooks.Select(x => Path.GetDirectoryName(x.Path)).Distinct()) + "]";
        }
    }
}
