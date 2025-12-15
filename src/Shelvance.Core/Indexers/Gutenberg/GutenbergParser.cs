using System;
using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Languages;
using NzbDrone.Core.Parser.Model;

namespace NzbDrone.Core.Indexers.Gutenberg
{
    public class GutenbergParser : IParseIndexerResponse
    {
        private readonly GutenbergSettings _settings;
        private readonly IGutenbergFormatProvider _formatProvider;
        private readonly GutenbergRequestGenerator _requestGenerator;

        public GutenbergParser(GutenbergSettings settings, IGutenbergFormatProvider formatProvider, GutenbergRequestGenerator requestGenerator)
        {
            _settings = settings;
            _formatProvider = formatProvider;
            _requestGenerator = requestGenerator;
        }

        public IList<ReleaseInfo> ParseResponse(IndexerResponse indexerResponse)
        {
            var releases = new List<ReleaseInfo>();

            var books = _requestGenerator.LastSearchResults;

            if (books == null || !books.Any())
            {
                return releases;
            }

            foreach (var book in books)
            {
                foreach (var gutenbergRelease in _formatProvider.GetReleases(book, _settings.BaseUrl))
                {
                    releases.Add(CreateReleaseInfo(gutenbergRelease));
                }
            }

            return releases.OrderBy(r => r.Title).ToList();
        }

        private ReleaseInfo CreateReleaseInfo(GutenbergRelease release)
        {
            var language = MapLanguage(release.Language);

            return new ReleaseInfo
            {
                Guid = $"gutenberg-{release.GutenbergId}-{release.FormatName}",
                Title = FormatTitle(release),
                Author = release.Author,
                Book = release.Title,
                Size = release.EstimatedSize,
                DownloadUrl = release.DownloadUrl,
                InfoUrl = release.InfoUrl,
                Container = MapContainer(release.FormatName),
                Codec = string.Empty,
                PublishDate = DateTime.UtcNow, // Gutenberg doesn't provide original publish dates in a parseable format
                Languages = new List<Language> { language },
                DownloadProtocol = DownloadProtocol.Http,
                Source = "Project Gutenberg",
                Origin = "Public Domain"
            };
        }

        private string FormatTitle(GutenbergRelease release)
        {
            return $"{release.Title} [{release.FormatName}]";
        }

        private Language MapLanguage(string languageCode)
        {
            if (string.IsNullOrWhiteSpace(languageCode))
            {
                return Language.English;
            }

            return languageCode.ToLowerInvariant() switch
            {
                "en" => Language.English,
                "de" => Language.German,
                "fr" => Language.French,
                "es" => Language.Spanish,
                "it" => Language.Italian,
                "pt" => Language.Portuguese,
                "nl" => Language.Dutch,
                "pl" => Language.Polish,
                "ru" => Language.Russian,
                "zh" => Language.Chinese,
                "ja" => Language.Japanese,
                "fi" => Language.Finnish,
                "sv" => Language.Swedish,
                "da" => Language.Danish,
                "no" => Language.Norwegian,
                "hu" => Language.Hungarian,
                "cs" => Language.Czech,
                "el" => Language.Greek,
                "la" => Language.Unknown,
                _ => Language.English
            };
        }

        private string MapContainer(string formatName)
        {
            return formatName switch
            {
                "EPUB3" => "EPUB",
                "EPUB" => "EPUB",
                "EPUBNoImages" => "EPUB",
                "Kindle" => "MOBI",
                "KindleNoImages" => "MOBI",
                "PlainText" => "TXT",
                "HTML" => "HTML",
                _ => formatName
            };
        }
    }
}
