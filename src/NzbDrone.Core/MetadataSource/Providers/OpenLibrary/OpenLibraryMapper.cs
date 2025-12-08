using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Books;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.MetadataSource.Providers.OpenLibrary.Resources;

namespace NzbDrone.Core.MetadataSource.Providers.OpenLibrary
{
    public static class OpenLibraryMapper
    {
        public static AuthorMetadata MapAuthorMetadata(OpenLibraryAuthorResource resource)
        {
            if (resource == null)
            {
                return null;
            }

            var metadata = new AuthorMetadata
            {
                ForeignAuthorId = resource.GetAuthorId(),
                TitleSlug = resource.GetAuthorId(),
                Name = (resource.Name ?? resource.PersonalName ?? "Unknown").CleanSpaces(),
                Overview = resource.GetBioText(),
                Status = AuthorStatusType.Continuing
            };

            if (resource.AlternateNames?.Any() == true)
            {
                metadata.Aliases = resource.AlternateNames.ToList();
            }

            if (!string.IsNullOrWhiteSpace(resource.BirthDate))
            {
                metadata.Born = ParseOpenLibraryDate(resource.BirthDate);
            }

            if (!string.IsNullOrWhiteSpace(resource.DeathDate))
            {
                metadata.Died = ParseOpenLibraryDate(resource.DeathDate);
                metadata.Status = AuthorStatusType.Ended;
            }

            if (resource.Photos?.Any() == true)
            {
                foreach (var photoId in resource.Photos.Take(3))
                {
                    metadata.Images.Add(new MediaCover.MediaCover
                    {
                        Url = $"https://covers.openlibrary.org/a/id/{photoId}-L.jpg",
                        CoverType = MediaCoverTypes.Poster
                    });
                }
            }

            if (resource.Links?.Any() == true)
            {
                foreach (var link in resource.Links)
                {
                    if (!string.IsNullOrWhiteSpace(link.Url))
                    {
                        metadata.Links.Add(new Links
                        {
                            Url = link.Url,
                            Name = link.Title ?? "Link"
                        });
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(resource.Wikipedia))
            {
                metadata.Links.Add(new Links
                {
                    Url = resource.Wikipedia,
                    Name = "Wikipedia"
                });
            }

            metadata.SortName = metadata.Name.ToLower();
            metadata.NameLastFirst = metadata.Name.ToLastFirst();
            metadata.SortNameLastFirst = metadata.NameLastFirst.ToLower();

            return metadata;
        }

        public static Author MapAuthor(OpenLibraryAuthorResource resource, List<Book> books = null)
        {
            var metadata = MapAuthorMetadata(resource);

            return new Author
            {
                Metadata = metadata,
                CleanName = Parser.Parser.CleanAuthorName(metadata.Name),
                Books = books ?? new List<Book>()
            };
        }

        public static Book MapBook(OpenLibraryWorkResource work, List<OpenLibraryEditionResource> editions = null)
        {
            if (work == null)
            {
                return null;
            }

            var book = new Book
            {
                ForeignBookId = work.GetWorkId(),
                TitleSlug = work.GetWorkId(),
                Title = work.Title?.CleanSpaces() ?? "Unknown",
                CleanTitle = Parser.Parser.CleanAuthorName(work.Title ?? "Unknown"),
                Genres = work.Subjects?.Take(5).ToList() ?? new List<string>(),
                Links = new List<Links>()
            };

            if (!string.IsNullOrWhiteSpace(work.Subtitle))
            {
                book.Title = $"{book.Title}: {work.Subtitle.CleanSpaces()}";
            }

            if (!string.IsNullOrWhiteSpace(work.FirstPublishDate))
            {
                book.ReleaseDate = ParseOpenLibraryDate(work.FirstPublishDate);
            }

            if (work.Links?.Any() == true)
            {
                foreach (var link in work.Links)
                {
                    if (!string.IsNullOrWhiteSpace(link.Url))
                    {
                        book.Links.Add(new Links
                        {
                            Url = link.Url,
                            Name = link.Title ?? "Link"
                        });
                    }
                }
            }

            var editionsList = editions?.Select(e => MapEdition(e, work)).Where(e => e != null).ToList() ?? new List<Edition>();
            book.Editions = editionsList;

            if (editionsList.Any())
            {
                var mostPopular = editionsList.OrderByDescending(e => e.PageCount).ThenBy(e => e.ReleaseDate).FirstOrDefault();
                if (mostPopular != null)
                {
                    mostPopular.Monitored = true;
                    if (string.IsNullOrWhiteSpace(book.ForeignEditionId))
                    {
                        book.ForeignEditionId = mostPopular.ForeignEditionId;
                    }
                }
            }

            return book;
        }

        public static Edition MapEdition(OpenLibraryEditionResource resource, OpenLibraryWorkResource work = null)
        {
            if (resource == null)
            {
                return null;
            }

            var edition = new Edition
            {
                ForeignEditionId = resource.GetEditionId(),
                TitleSlug = resource.GetEditionId(),
                Title = resource.Title?.CleanSpaces() ?? work?.Title?.CleanSpaces() ?? "Unknown",
                Overview = resource.GetDescriptionText() ?? work?.GetDescriptionText() ?? string.Empty,
                Format = resource.PhysicalFormat ?? "Unknown",
                Publisher = resource.Publishers?.FirstOrDefault() ?? string.Empty,
                PageCount = resource.NumberOfPages ?? 0,
                Images = new List<MediaCover.MediaCover>(),
                Links = new List<Links>()
            };

            if (resource.Isbn13?.Any() == true)
            {
                edition.Isbn13 = resource.Isbn13.First();
            }
            else if (resource.Isbn10?.Any() == true)
            {
                var isbn10 = resource.Isbn10.First();
                edition.Isbn13 = ConvertIsbn10ToIsbn13(isbn10);
            }

            if (!string.IsNullOrWhiteSpace(resource.PublishDate))
            {
                edition.ReleaseDate = ParseOpenLibraryDate(resource.PublishDate);
            }

            if (resource.Languages?.Any() == true)
            {
                edition.Language = resource.Languages.First().GetLanguageCode() ?? "eng";
            }

            if (resource.Covers?.Any() == true)
            {
                foreach (var coverId in resource.Covers.Take(3))
                {
                    if (coverId > 0)
                    {
                        edition.Images.Add(new MediaCover.MediaCover
                        {
                            Url = $"https://covers.openlibrary.org/b/id/{coverId}-L.jpg",
                            CoverType = MediaCoverTypes.Cover
                        });
                    }
                }
            }
            else if (work?.Covers?.Any() == true)
            {
                foreach (var coverId in work.Covers.Take(1))
                {
                    if (coverId > 0)
                    {
                        edition.Images.Add(new MediaCover.MediaCover
                        {
                            Url = $"https://covers.openlibrary.org/b/id/{coverId}-L.jpg",
                            CoverType = MediaCoverTypes.Cover
                        });
                    }
                }
            }

            edition.IsEbook = edition.Format?.ToLower().Contains("ebook") == true ||
                             edition.Format?.ToLower().Contains("digital") == true;

            return edition;
        }

        public static Book MapSearchResult(OpenLibrarySearchDocResource doc)
        {
            if (doc == null)
            {
                return null;
            }

            var book = new Book
            {
                ForeignBookId = doc.GetWorkId(),
                TitleSlug = doc.GetWorkId(),
                Title = doc.Title?.CleanSpaces() ?? "Unknown",
                CleanTitle = Parser.Parser.CleanAuthorName(doc.Title ?? "Unknown"),
                Links = new List<Links>(),
                Genres = new List<string>()
            };

            if (!string.IsNullOrWhiteSpace(doc.Subtitle))
            {
                book.Title = $"{book.Title}: {doc.Subtitle.CleanSpaces()}";
            }

            if (doc.FirstPublishYear.HasValue)
            {
                book.ReleaseDate = new DateTime(doc.FirstPublishYear.Value, 1, 1);
            }

            if (doc.RatingsAverage.HasValue && doc.RatingsCount.HasValue)
            {
                book.Ratings = new Ratings
                {
                    Value = (decimal)doc.RatingsAverage.Value,
                    Votes = doc.RatingsCount.Value
                };
            }

            if (doc.CoverId.HasValue && doc.CoverId.Value > 0)
            {
                var coverUrl = $"https://covers.openlibrary.org/b/id/{doc.CoverId.Value}-L.jpg";
                book.Editions = new List<Edition>
                {
                    new Edition
                    {
                        ForeignEditionId = doc.CoverEditionKey ?? doc.EditionKey?.FirstOrDefault() ?? "unknown",
                        Title = book.Title,
                        Images = new List<MediaCover.MediaCover>
                        {
                            new MediaCover.MediaCover
                            {
                                Url = coverUrl,
                                CoverType = MediaCoverTypes.Cover
                            }
                        },
                        Monitored = true
                    }
                };
            }

            return book;
        }

        public static Author MapAuthorSearchResult(OpenLibraryAuthorSearchDocResource doc)
        {
            if (doc == null)
            {
                return null;
            }

            var metadata = new AuthorMetadata
            {
                ForeignAuthorId = doc.GetAuthorId(),
                TitleSlug = doc.GetAuthorId(),
                Name = doc.Name?.CleanSpaces() ?? "Unknown",
                Status = AuthorStatusType.Continuing
            };

            if (doc.AlternateNames?.Any() == true)
            {
                metadata.Aliases = doc.AlternateNames.ToList();
            }

            if (!string.IsNullOrWhiteSpace(doc.BirthDate))
            {
                metadata.Born = ParseOpenLibraryDate(doc.BirthDate);
            }

            metadata.SortName = metadata.Name.ToLower();
            metadata.NameLastFirst = metadata.Name.ToLastFirst();
            metadata.SortNameLastFirst = metadata.NameLastFirst.ToLower();

            return new Author
            {
                Metadata = metadata,
                CleanName = Parser.Parser.CleanAuthorName(metadata.Name),
                Books = new List<Book>()
            };
        }

        private static DateTime? ParseOpenLibraryDate(string dateStr)
        {
            if (string.IsNullOrWhiteSpace(dateStr))
            {
                return null;
            }

            dateStr = dateStr.Trim();

            if (DateTime.TryParse(dateStr, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
            {
                return date;
            }

            if (int.TryParse(dateStr, out var year))
            {
                return new DateTime(year, 1, 1);
            }

            var monthYear = System.Text.RegularExpressions.Regex.Match(dateStr, @"(\w+)\s+(\d{4})");
            if (monthYear.Success)
            {
                var monthStr = monthYear.Groups[1].Value;
                var yearStr = monthYear.Groups[2].Value;

                if (int.TryParse(yearStr, out year))
                {
                    var month = GetMonthNumber(monthStr);
                    if (month > 0)
                    {
                        return new DateTime(year, month, 1);
                    }

                    return new DateTime(year, 1, 1);
                }
            }

            var justYear = System.Text.RegularExpressions.Regex.Match(dateStr, @"\d{4}");
            if (justYear.Success && int.TryParse(justYear.Value, out year))
            {
                return new DateTime(year, 1, 1);
            }

            return null;
        }

        private static int GetMonthNumber(string monthName)
        {
            var months = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
            {
                { "january", 1 }, { "jan", 1 },
                { "february", 2 }, { "feb", 2 },
                { "march", 3 }, { "mar", 3 },
                { "april", 4 }, { "apr", 4 },
                { "may", 5 },
                { "june", 6 }, { "jun", 6 },
                { "july", 7 }, { "jul", 7 },
                { "august", 8 }, { "aug", 8 },
                { "september", 9 }, { "sep", 9 }, { "sept", 9 },
                { "october", 10 }, { "oct", 10 },
                { "november", 11 }, { "nov", 11 },
                { "december", 12 }, { "dec", 12 }
            };

            return months.TryGetValue(monthName, out var month) ? month : 0;
        }

        private static string ConvertIsbn10ToIsbn13(string isbn10)
        {
            if (string.IsNullOrWhiteSpace(isbn10))
            {
                return null;
            }

            isbn10 = isbn10.Replace("-", "").Replace(" ", "");

            if (isbn10.Length != 10)
            {
                return null;
            }

            var isbn13 = "978" + isbn10.Substring(0, 9);

            var sum = 0;
            for (var i = 0; i < 12; i++)
            {
                var digit = int.Parse(isbn13[i].ToString());
                sum += i % 2 == 0 ? digit : digit * 3;
            }

            var checkDigit = (10 - (sum % 10)) % 10;
            return isbn13 + checkDigit;
        }
    }
}
