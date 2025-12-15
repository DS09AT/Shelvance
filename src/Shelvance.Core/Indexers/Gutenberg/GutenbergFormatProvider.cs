using System;
using System.Collections.Generic;

namespace NzbDrone.Core.Indexers.Gutenberg
{
    public interface IGutenbergFormatProvider
    {
        IEnumerable<GutenbergRelease> GetReleases(GutenbergBook book, string baseUrl);
        GutenbergRelease GetRelease(GutenbergBook book, string formatName, string baseUrl);
    }

    public class GutenbergFormatProvider : IGutenbergFormatProvider
    {
        private static readonly GutenbergFormatInfo[] Formats =
        {
            new GutenbergFormatInfo(
                "EPUB3",
                "application/epub+zip",
                ".epub",
                id => $"/ebooks/{id}.epub3.images",
                estimatedSize: 500 * 1024), // ~500KB average

            new GutenbergFormatInfo(
                "Kindle",
                "application/x-mobipocket-ebook",
                ".mobi",
                id => $"/ebooks/{id}.kf8.images",
                estimatedSize: 600 * 1024),

            new GutenbergFormatInfo(
                "PlainText",
                "text/plain",
                ".txt",
                id => $"/files/{id}/{id}-0.txt",
                estimatedSize: 300 * 1024),

            new GutenbergFormatInfo(
                "HTML",
                "text/html",
                ".html",
                id => $"/files/{id}/{id}-h/{id}-h.htm",
                estimatedSize: 400 * 1024),

            new GutenbergFormatInfo(
                "EPUB",
                "application/epub+zip",
                ".epub",
                id => $"/ebooks/{id}.epub.images",
                estimatedSize: 450 * 1024),

            new GutenbergFormatInfo(
                "EPUBNoImages",
                "application/epub+zip",
                ".epub",
                id => $"/ebooks/{id}.epub.noimages",
                estimatedSize: 200 * 1024),

            new GutenbergFormatInfo(
                "KindleNoImages",
                "application/x-mobipocket-ebook",
                ".mobi",
                id => $"/ebooks/{id}.kindle.noimages",
                estimatedSize: 250 * 1024)
        };

        private static readonly Dictionary<string, GutenbergFormatInfo> FormatLookup;

        static GutenbergFormatProvider()
        {
            FormatLookup = new Dictionary<string, GutenbergFormatInfo>(StringComparer.OrdinalIgnoreCase);
            foreach (var format in Formats)
            {
                FormatLookup[format.Name] = format;
            }
        }

        public IEnumerable<GutenbergRelease> GetReleases(GutenbergBook book, string baseUrl)
        {
            foreach (var format in Formats)
            {
                yield return CreateRelease(book, format, baseUrl);
            }
        }

        public GutenbergRelease GetRelease(GutenbergBook book, string formatName, string baseUrl)
        {
            if (FormatLookup.TryGetValue(formatName, out var format))
            {
                return CreateRelease(book, format, baseUrl);
            }

            return null;
        }

        private static GutenbergRelease CreateRelease(GutenbergBook book, GutenbergFormatInfo format, string baseUrl)
        {
            var downloadUrl = GutenbergConstants.BuildUrl(baseUrl, format.UrlBuilder(book.GutenbergId));
            var infoUrl = GutenbergConstants.BuildUrl(baseUrl, $"/ebooks/{book.GutenbergId}");
            var coverUrl = GutenbergConstants.BuildUrl(baseUrl, $"/cache/epub/{book.GutenbergId}/pg{book.GutenbergId}.cover.medium.jpg");

            return new GutenbergRelease
            {
                GutenbergId = book.GutenbergId,
                Title = book.Title,
                Author = book.Author,
                Language = book.Language,
                FormatName = format.Name,
                MimeType = format.MimeType,
                FileExtension = format.FileExtension,
                DownloadUrl = downloadUrl,
                InfoUrl = infoUrl,
                CoverUrl = coverUrl,
                EstimatedSize = format.EstimatedSize,
                Subjects = book.Subjects
            };
        }

        private class GutenbergFormatInfo
        {
            public string Name { get; }
            public string MimeType { get; }
            public string FileExtension { get; }
            public Func<int, string> UrlBuilder { get; }
            public long EstimatedSize { get; }

            public GutenbergFormatInfo(string name, string mimeType, string fileExtension, Func<int, string> urlBuilder, long estimatedSize)
            {
                Name = name;
                MimeType = mimeType;
                FileExtension = fileExtension;
                UrlBuilder = urlBuilder;
                EstimatedSize = estimatedSize;
            }
        }
    }

    public class GutenbergRelease
    {
        public int GutenbergId { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string Language { get; set; }
        public string FormatName { get; set; }
        public string MimeType { get; set; }
        public string FileExtension { get; set; }
        public string DownloadUrl { get; set; }
        public string InfoUrl { get; set; }
        public string CoverUrl { get; set; }
        public long EstimatedSize { get; set; }
        public string Subjects { get; set; }
    }
}
