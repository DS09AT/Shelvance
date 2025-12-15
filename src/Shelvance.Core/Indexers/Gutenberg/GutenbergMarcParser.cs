using System;
using System.Collections.Generic;
using System.IO;
using System.Xml;
using NLog;

namespace NzbDrone.Core.Indexers.Gutenberg
{
    public interface IGutenbergMarcParser
    {
        IEnumerable<GutenbergBook> ParseMarcXml(Stream xmlStream);
    }

    public class GutenbergMarcParser : IGutenbergMarcParser
    {
        // MARC21 field tags
        private const string TAG_CONTROL_NUMBER = "001";  // Gutenberg ID
        private const string TAG_LANGUAGE = "041";
        private const string TAG_AUTHOR = "100";
        private const string TAG_TITLE = "245";
        private const string TAG_PUBLICATION = "264";
        private const string TAG_SUBJECT = "653";

        private readonly Logger _logger;

        public GutenbergMarcParser(Logger logger)
        {
            _logger = logger;
        }

        public IEnumerable<GutenbergBook> ParseMarcXml(Stream xmlStream)
        {
            var settings = new XmlReaderSettings
            {
                DtdProcessing = DtdProcessing.Ignore,
                IgnoreWhitespace = true
            };

            using var reader = XmlReader.Create(xmlStream, settings);

            while (reader.Read())
            {
                if (reader.NodeType == XmlNodeType.Element &&
                    (reader.LocalName == "record" || reader.Name == "record"))
                {
                    using (var subtree = reader.ReadSubtree())
                    {
                        var book = ParseRecord(subtree);
                        if (book != null && book.GutenbergId > 0)
                        {
                            yield return book;
                        }
                    }
                }
            }
        }

        private GutenbergBook ParseRecord(XmlReader reader)
        {
            var book = new GutenbergBook
            {
                LastUpdated = DateTime.UtcNow
            };

            var subjects = new List<string>();
            var depth = reader.Depth;

            while (reader.Read())
            {
                if (reader.NodeType == XmlNodeType.EndElement && reader.LocalName == "record" && reader.Depth == depth)
                {
                    break;
                }

                if (reader.NodeType != XmlNodeType.Element)
                {
                    continue;
                }

                switch (reader.LocalName)
                {
                    case "controlfield":
                        var controlTag = reader.GetAttribute("tag");
                        if (controlTag == TAG_CONTROL_NUMBER)
                        {
                            var content = reader.ReadElementContentAsString();
                            if (int.TryParse(content, out var id))
                            {
                                book.GutenbergId = id;
                            }
                        }

                        break;

                    case "datafield":
                        var dataTag = reader.GetAttribute("tag");
                        ParseDataField(reader, dataTag, book, subjects);
                        break;
                }
            }

            book.Subjects = string.Join("; ", subjects);

            if (string.IsNullOrWhiteSpace(book.Title))
            {
                book.Title = $"Unknown Title (ID: {book.GutenbergId})";
            }

            if (string.IsNullOrWhiteSpace(book.Author))
            {
                book.Author = "Unknown Author";
            }

            if (string.IsNullOrWhiteSpace(book.Language))
            {
                book.Language = "en";
            }

            return book;
        }

        private void ParseDataField(XmlReader reader, string tag, GutenbergBook book, List<string> subjects)
        {
            var depth = reader.Depth;
            var subfields = new Dictionary<string, string>();

            while (reader.Read())
            {
                if (reader.NodeType == XmlNodeType.EndElement && reader.LocalName == "datafield" && reader.Depth == depth)
                {
                    break;
                }

                if (reader.NodeType == XmlNodeType.Element && reader.LocalName == "subfield")
                {
                    var code = reader.GetAttribute("code");
                    var value = reader.ReadElementContentAsString();
                    if (!string.IsNullOrWhiteSpace(code) && !string.IsNullOrWhiteSpace(value))
                    {
                        subfields[code] = value;
                    }
                }
            }

            switch (tag)
            {
                case TAG_LANGUAGE:
                    if (subfields.TryGetValue("a", out var lang))
                    {
                        book.Language = lang.Trim();
                    }

                    break;

                case TAG_AUTHOR:
                    if (subfields.TryGetValue("a", out var author))
                    {
                        book.Author = CleanAuthorName(author);
                    }

                    break;

                case TAG_TITLE:
                    if (subfields.TryGetValue("a", out var title))
                    {
                        book.Title = CleanTitle(title);
                    }

                    break;

                case TAG_PUBLICATION:
                    if (subfields.TryGetValue("c", out var year))
                    {
                        book.Downloads = 0; // We don't have download counts in MARC
                    }

                    break;

                case TAG_SUBJECT:
                    if (subfields.TryGetValue("a", out var subject))
                    {
                        subjects.Add(subject.Trim());
                    }

                    break;
            }
        }

        private string CleanAuthorName(string author)
        {
            if (string.IsNullOrWhiteSpace(author))
            {
                return "Unknown Author";
            }

            author = author.TrimEnd(',', ' ');

            return author;
        }

        private string CleanTitle(string title)
        {
            if (string.IsNullOrWhiteSpace(title))
            {
                return "Unknown Title";
            }

            title = title.TrimEnd('/', ':', ';', ' ');

            return title;
        }
    }
}
