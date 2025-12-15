using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using NzbDrone.Core.Books;
using NzbDrone.Core.ThingiProvider;

namespace NzbDrone.Core.MetadataSource
{
    /// <summary>
    /// Interface for pluggable metadata providers (Open Library, Google Books, ISBNdb, etc.)
    /// Extends ThingiProvider pattern used by Indexers, Download Clients, etc.
    /// </summary>
    public interface IMetadataProvider : IProvider
    {
        /// <summary>
        /// Provider priority (1-100). Higher priority providers are queried first.
        /// </summary>
        int Priority { get; }

        /// <summary>
        /// Link to wiki/documentation for this provider
        /// </summary>
        string InfoLink { get; }

        /// <summary>
        /// Capabilities of this provider
        /// </summary>
        MetadataProviderCapabilities Capabilities { get; }

        /// <summary>
        /// Get author information by provider-specific ID
        /// </summary>
        Task<Author> GetAuthorInfoAsync(string foreignAuthorId, bool useCache = true);

        /// <summary>
        /// Get book information by provider-specific ID
        /// Returns tuple of (authorId, book, author metadata list)
        /// </summary>
        Task<Tuple<string, Book, List<AuthorMetadata>>> GetBookInfoAsync(string foreignBookId);

        /// <summary>
        /// Search for authors by query string
        /// </summary>
        Task<List<Author>> SearchForNewAuthorAsync(string query);

        /// <summary>
        /// Search for books by title and optional author
        /// </summary>
        Task<List<Book>> SearchForNewBookAsync(string title, string author = null, bool getAllEditions = true);

        /// <summary>
        /// Search for books by ISBN
        /// </summary>
        Task<List<Book>> SearchByIsbnAsync(string isbn);

        /// <summary>
        /// Search for books by ASIN
        /// </summary>
        Task<List<Book>> SearchByAsinAsync(string asin);

        /// <summary>
        /// Get list of changed authors since given timestamp (for refresh operations)
        /// </summary>
        Task<HashSet<string>> GetChangedAuthorsAsync(DateTime startTime);
    }
}
