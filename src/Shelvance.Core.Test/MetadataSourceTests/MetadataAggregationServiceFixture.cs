using System;
using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Books;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.MetadataSourceTests
{
    [TestFixture]
    public class MetadataAggregationServiceFixture : CoreTest<MetadataAggregationService>
    {
        private Mock<IMetadataProviderFactory> _factory;
        private Mock<IMetadataProvider> _provider1;
        private Mock<IMetadataProvider> _provider2;
        private Mock<IMetadataProvider> _provider3;
        private List<IMetadataProvider> _providers;

        [SetUp]
        public void Setup()
        {
            _factory = Mocker.GetMock<IMetadataProviderFactory>();

            _provider1 = new Mock<IMetadataProvider>();
            _provider2 = new Mock<IMetadataProvider>();
            _provider3 = new Mock<IMetadataProvider>();

            SetupProvider(_provider1, "Provider1", 90);
            SetupProvider(_provider2, "Provider2", 70);
            SetupProvider(_provider3, "Provider3", 50);

            _providers = new List<IMetadataProvider> { _provider1.Object, _provider2.Object, _provider3.Object };
        }

        private void SetupProvider(Mock<IMetadataProvider> provider, string name, int priority)
        {
            provider.SetupGet(p => p.Name).Returns(name);
            provider.SetupGet(p => p.Priority).Returns(priority);
            provider.SetupGet(p => p.Capabilities).Returns(MetadataProviderCapabilities.All());
            provider.SetupGet(p => p.Definition).Returns(new MetadataProviderDefinition
            {
                Id = _providers?.Count ?? 0 + 1,
                Name = name,
                Priority = priority
            });
        }

        [Test]
        public void should_get_author_info_from_first_successful_provider()
        {
            // Given
            var authorId = "author123";
            var expectedAuthor = new Author { ForeignAuthorId = authorId, Name = "Test Author" };

            _factory.Setup(f => f.AuthorSearchEnabled(true))
                .Returns(_providers);

            _provider1.Setup(p => p.GetAuthorInfoAsync(authorId, true))
                .ReturnsAsync(expectedAuthor);

            // When
            var result = Subject.GetAuthorInfo(authorId);

            // Then
            result.Should().NotBeNull();
            result.ForeignAuthorId.Should().Be(authorId);
            _provider1.Verify(p => p.GetAuthorInfoAsync(authorId, true), Times.Once);
            _provider2.Verify(p => p.GetAuthorInfoAsync(It.IsAny<string>(), It.IsAny<bool>()), Times.Never);
        }

        [Test]
        public void should_fallback_to_second_provider_on_first_failure()
        {
            // Given
            var authorId = "author123";
            var expectedAuthor = new Author { ForeignAuthorId = authorId, Name = "Test Author" };

            _factory.Setup(f => f.AuthorSearchEnabled(true))
                .Returns(_providers);

            _provider1.Setup(p => p.GetAuthorInfoAsync(authorId, true))
                .ThrowsAsync(new Exception("Provider 1 failed"));

            _provider2.Setup(p => p.GetAuthorInfoAsync(authorId, true))
                .ReturnsAsync(expectedAuthor);

            // When
            ExceptionVerification.ExpectedWarns(1);
            var result = Subject.GetAuthorInfo(authorId);

            // Then
            result.Should().NotBeNull();
            result.ForeignAuthorId.Should().Be(authorId);
            _provider1.Verify(p => p.GetAuthorInfoAsync(authorId, true), Times.Once);
            _provider2.Verify(p => p.GetAuthorInfoAsync(authorId, true), Times.Once);
            _provider3.Verify(p => p.GetAuthorInfoAsync(It.IsAny<string>(), It.IsAny<bool>()), Times.Never);
        }

        [Test]
        public void should_throw_when_all_providers_fail_for_author()
        {
            // Given
            var authorId = "author123";

            _factory.Setup(f => f.AuthorSearchEnabled(true))
                .Returns(_providers);

            _provider1.Setup(p => p.GetAuthorInfoAsync(authorId, true))
                .ThrowsAsync(new Exception("Provider 1 failed"));

            _provider2.Setup(p => p.GetAuthorInfoAsync(authorId, true))
                .ThrowsAsync(new Exception("Provider 2 failed"));

            _provider3.Setup(p => p.GetAuthorInfoAsync(authorId, true))
                .ThrowsAsync(new Exception("Provider 3 failed"));

            // When
            ExceptionVerification.ExpectedWarns(3);
            ExceptionVerification.ExpectedErrors(1);
            Action act = () => Subject.GetAuthorInfo(authorId);

            // Then
            act.Should().Throw<MetadataNotFoundException>()
                .WithMessage("*Could not find author*");
        }

        [Test]
        public void should_throw_when_no_providers_available_for_author()
        {
            // Given
            var authorId = "author123";

            _factory.Setup(f => f.AuthorSearchEnabled(true))
                .Returns(new List<IMetadataProvider>());

            // When
            ExceptionVerification.ExpectedErrors(1);
            Action act = () => Subject.GetAuthorInfo(authorId);

            // Then
            act.Should().Throw<NoMetadataProvidersAvailableException>()
                .WithMessage("*No metadata providers enabled for author search*");
        }

        [Test]
        public void should_skip_provider_that_returns_null_author()
        {
            // Given
            var authorId = "author123";
            var expectedAuthor = new Author { ForeignAuthorId = authorId, Name = "Test Author" };

            _factory.Setup(f => f.AuthorSearchEnabled(true))
                .Returns(_providers);

            _provider1.Setup(p => p.GetAuthorInfoAsync(authorId, true))
                .ReturnsAsync((Author)null);

            _provider2.Setup(p => p.GetAuthorInfoAsync(authorId, true))
                .ReturnsAsync(expectedAuthor);

            // When
            var result = Subject.GetAuthorInfo(authorId);

            // Then
            result.Should().NotBeNull();
            result.ForeignAuthorId.Should().Be(authorId);
            _provider2.Verify(p => p.GetAuthorInfoAsync(authorId, true), Times.Once);
        }

        [Test]
        public void should_get_book_info_from_first_successful_provider()
        {
            // Given
            var bookId = "book123";
            var expectedBook = new Book { ForeignBookId = bookId, Title = "Test Book" };
            var expectedResult = new Tuple<string, Book, List<AuthorMetadata>>("author123", expectedBook, new List<AuthorMetadata>());

            _factory.Setup(f => f.BookSearchEnabled(true))
                .Returns(_providers);

            _provider1.Setup(p => p.GetBookInfoAsync(bookId))
                .ReturnsAsync(expectedResult);

            // When
            var result = Subject.GetBookInfo(bookId);

            // Then
            result.Should().NotBeNull();
            result.Item2.ForeignBookId.Should().Be(bookId);
            _provider1.Verify(p => p.GetBookInfoAsync(bookId), Times.Once);
            _provider2.Verify(p => p.GetBookInfoAsync(It.IsAny<string>()), Times.Never);
        }

        [Test]
        public void should_fallback_to_second_provider_on_first_failure_for_book()
        {
            // Given
            var bookId = "book123";
            var expectedBook = new Book { ForeignBookId = bookId, Title = "Test Book" };
            var expectedResult = new Tuple<string, Book, List<AuthorMetadata>>("author123", expectedBook, new List<AuthorMetadata>());

            _factory.Setup(f => f.BookSearchEnabled(true))
                .Returns(_providers);

            _provider1.Setup(p => p.GetBookInfoAsync(bookId))
                .ThrowsAsync(new Exception("Provider 1 failed"));

            _provider2.Setup(p => p.GetBookInfoAsync(bookId))
                .ReturnsAsync(expectedResult);

            // When
            ExceptionVerification.ExpectedWarns(1);
            var result = Subject.GetBookInfo(bookId);

            // Then
            result.Should().NotBeNull();
            result.Item2.ForeignBookId.Should().Be(bookId);
            _provider2.Verify(p => p.GetBookInfoAsync(bookId), Times.Once);
        }

        [Test]
        public void should_throw_when_all_providers_fail_for_book()
        {
            // Given
            var bookId = "book123";

            _factory.Setup(f => f.BookSearchEnabled(true))
                .Returns(_providers);

            _provider1.Setup(p => p.GetBookInfoAsync(bookId))
                .ThrowsAsync(new Exception("Provider 1 failed"));

            _provider2.Setup(p => p.GetBookInfoAsync(bookId))
                .ThrowsAsync(new Exception("Provider 2 failed"));

            _provider3.Setup(p => p.GetBookInfoAsync(bookId))
                .ThrowsAsync(new Exception("Provider 3 failed"));

            // When
            ExceptionVerification.ExpectedWarns(3);
            ExceptionVerification.ExpectedErrors(1);
            Action act = () => Subject.GetBookInfo(bookId);

            // Then
            act.Should().Throw<MetadataNotFoundException>()
                .WithMessage("*Could not find book*");
        }

        [Test]
        public void should_aggregate_author_search_results_from_multiple_providers()
        {
            // Given
            var query = "tolkien";
            var authors1 = new List<Author>
            {
                new Author { ForeignAuthorId = "author1", Name = "J.R.R. Tolkien" }
            };
            var authors2 = new List<Author>
            {
                new Author { ForeignAuthorId = "author2", Name = "Christopher Tolkien" }
            };

            _factory.Setup(f => f.InteractiveSearchEnabled(true))
                .Returns(_providers);

            _provider1.Setup(p => p.SearchForNewAuthorAsync(query))
                .ReturnsAsync(authors1);

            _provider2.Setup(p => p.SearchForNewAuthorAsync(query))
                .ReturnsAsync(authors2);

            _provider3.Setup(p => p.SearchForNewAuthorAsync(query))
                .ReturnsAsync(new List<Author>());

            // When
            var result = Subject.SearchForNewAuthor(query);

            // Then
            result.Should().HaveCount(2);
            result.Should().Contain(a => a.ForeignAuthorId == "author1");
            result.Should().Contain(a => a.ForeignAuthorId == "author2");
        }

        [Test]
        public void should_deduplicate_author_search_results_by_foreign_id()
        {
            // Given
            var query = "tolkien";
            var duplicateAuthor = new Author { ForeignAuthorId = "author1", Name = "J.R.R. Tolkien" };
            var authors1 = new List<Author> { duplicateAuthor };
            var authors2 = new List<Author> { duplicateAuthor }; // Same author from different provider

            _factory.Setup(f => f.InteractiveSearchEnabled(true))
                .Returns(new List<IMetadataProvider> { _provider1.Object, _provider2.Object });

            _provider1.Setup(p => p.SearchForNewAuthorAsync(query))
                .ReturnsAsync(authors1);

            _provider2.Setup(p => p.SearchForNewAuthorAsync(query))
                .ReturnsAsync(authors2);

            // When
            var result = Subject.SearchForNewAuthor(query);

            // Then
            result.Should().HaveCount(1);
            result.First().ForeignAuthorId.Should().Be("author1");
        }

        [Test]
        public void should_continue_author_search_even_if_one_provider_fails()
        {
            // Given
            var query = "tolkien";
            var authors = new List<Author>
            {
                new Author { ForeignAuthorId = "author1", Name = "J.R.R. Tolkien" }
            };

            _factory.Setup(f => f.InteractiveSearchEnabled(true))
                .Returns(_providers);

            _provider1.Setup(p => p.SearchForNewAuthorAsync(query))
                .ThrowsAsync(new Exception("Provider 1 failed"));

            _provider2.Setup(p => p.SearchForNewAuthorAsync(query))
                .ReturnsAsync(authors);

            // When
            ExceptionVerification.ExpectedWarns(1);
            var result = Subject.SearchForNewAuthor(query);

            // Then
            result.Should().HaveCount(1);
            result.First().ForeignAuthorId.Should().Be("author1");
        }

        [Test]
        public void should_return_empty_list_when_no_author_search_providers_available()
        {
            // Given
            var query = "tolkien";

            _factory.Setup(f => f.InteractiveSearchEnabled(true))
                .Returns(new List<IMetadataProvider>());

            // When
            Action act = () => Subject.SearchForNewAuthor(query);

            // Then
            act.Should().Throw<NoMetadataProvidersAvailableException>();
        }

        [Test]
        public void should_aggregate_book_search_results_from_multiple_providers()
        {
            // Given
            var title = "The Lord of the Rings";
            var author = "Tolkien";
            var books1 = new List<Book>
            {
                new Book { ForeignBookId = "book1", Title = "The Fellowship of the Ring" }
            };
            var books2 = new List<Book>
            {
                new Book { ForeignBookId = "book2", Title = "The Two Towers" }
            };

            _factory.Setup(f => f.BookSearchEnabled(true))
                .Returns(_providers);

            _provider1.Setup(p => p.SearchForNewBookAsync(title, author, true))
                .ReturnsAsync(books1);

            _provider2.Setup(p => p.SearchForNewBookAsync(title, author, true))
                .ReturnsAsync(books2);

            _provider3.Setup(p => p.SearchForNewBookAsync(title, author, true))
                .ReturnsAsync(new List<Book>());

            // When
            var result = Subject.SearchForNewBook(title, author);

            // Then
            result.Should().HaveCount(2);
            result.Should().Contain(b => b.ForeignBookId == "book1");
            result.Should().Contain(b => b.ForeignBookId == "book2");
        }

        [Test]
        public void should_deduplicate_book_search_results_by_foreign_id()
        {
            // Given
            var title = "The Hobbit";
            var duplicateBook = new Book { ForeignBookId = "book1", Title = "The Hobbit" };
            var books1 = new List<Book> { duplicateBook };
            var books2 = new List<Book> { duplicateBook };

            _factory.Setup(f => f.BookSearchEnabled(true))
                .Returns(new List<IMetadataProvider> { _provider1.Object, _provider2.Object });

            _provider1.Setup(p => p.SearchForNewBookAsync(title, null, true))
                .ReturnsAsync(books1);

            _provider2.Setup(p => p.SearchForNewBookAsync(title, null, true))
                .ReturnsAsync(books2);

            // When
            var result = Subject.SearchForNewBook(title, null);

            // Then
            result.Should().HaveCount(1);
            result.First().ForeignBookId.Should().Be("book1");
        }

        [Test]
        public void should_search_by_isbn_using_providers_that_support_it()
        {
            // Given
            var isbn = "9780544003415";
            var expectedBook = new Book { ForeignBookId = "book1", Title = "The Hobbit" };

            var isbnCapableProvider = new Mock<IMetadataProvider>();
            SetupProvider(isbnCapableProvider, "ISBNProvider", 80);
            isbnCapableProvider.SetupGet(p => p.Capabilities)
                .Returns(new MetadataProviderCapabilities { SupportsIsbnLookup = true });
            isbnCapableProvider.Setup(p => p.SearchByIsbnAsync(isbn))
                .ReturnsAsync(new List<Book> { expectedBook });

            var nonIsbnProvider = new Mock<IMetadataProvider>();
            SetupProvider(nonIsbnProvider, "NonISBNProvider", 60);
            nonIsbnProvider.SetupGet(p => p.Capabilities)
                .Returns(new MetadataProviderCapabilities { SupportsIsbnLookup = false });

            _factory.Setup(f => f.BookSearchEnabled(true))
                .Returns(new List<IMetadataProvider> { isbnCapableProvider.Object, nonIsbnProvider.Object });

            // When
            var result = Subject.SearchByIsbn(isbn);

            // Then
            result.Should().HaveCount(1);
            result.First().ForeignBookId.Should().Be("book1");
            isbnCapableProvider.Verify(p => p.SearchByIsbnAsync(isbn), Times.Once);
            nonIsbnProvider.Verify(p => p.SearchByIsbnAsync(It.IsAny<string>()), Times.Never);
        }

        [Test]
        public void should_return_empty_list_when_no_isbn_capable_providers()
        {
            // Given
            var isbn = "9780544003415";

            _provider1.SetupGet(p => p.Capabilities)
                .Returns(new MetadataProviderCapabilities { SupportsIsbnLookup = false });
            _provider2.SetupGet(p => p.Capabilities)
                .Returns(new MetadataProviderCapabilities { SupportsIsbnLookup = false });
            _provider3.SetupGet(p => p.Capabilities)
                .Returns(new MetadataProviderCapabilities { SupportsIsbnLookup = false });

            _factory.Setup(f => f.BookSearchEnabled(true))
                .Returns(_providers);

            // When
            var result = Subject.SearchByIsbn(isbn);

            // Then
            result.Should().BeEmpty();
        }

        [Test]
        public void should_aggregate_changed_authors_from_multiple_providers()
        {
            // Given
            var startTime = DateTime.UtcNow.AddDays(-7);
            var changedAuthors1 = new HashSet<string> { "author1", "author2" };
            var changedAuthors2 = new HashSet<string> { "author2", "author3" }; // author2 is duplicate

            _factory.Setup(f => f.AutomaticRefreshEnabled(true))
                .Returns(new List<IMetadataProvider> { _provider1.Object, _provider2.Object });

            _provider1.Setup(p => p.GetChangedAuthorsAsync(startTime))
                .ReturnsAsync(changedAuthors1);

            _provider2.Setup(p => p.GetChangedAuthorsAsync(startTime))
                .ReturnsAsync(changedAuthors2);

            // When
            var result = Subject.GetChangedAuthors(startTime);

            // Then
            result.Should().HaveCount(3);
            result.Should().Contain(new[] { "author1", "author2", "author3" });
        }

        [Test]
        public void should_return_empty_set_when_no_refresh_providers_available()
        {
            // Given
            var startTime = DateTime.UtcNow.AddDays(-7);

            _factory.Setup(f => f.AutomaticRefreshEnabled(true))
                .Returns(new List<IMetadataProvider>());

            // When
            var result = Subject.GetChangedAuthors(startTime);

            // Then
            result.Should().BeEmpty();
        }

        [Test]
        public void should_continue_getting_changed_authors_even_if_one_provider_fails()
        {
            // Given
            var startTime = DateTime.UtcNow.AddDays(-7);
            var changedAuthors = new HashSet<string> { "author1", "author2" };

            _factory.Setup(f => f.AutomaticRefreshEnabled(true))
                .Returns(_providers);

            _provider1.Setup(p => p.GetChangedAuthorsAsync(startTime))
                .ThrowsAsync(new Exception("Provider 1 failed"));

            _provider2.Setup(p => p.GetChangedAuthorsAsync(startTime))
                .ReturnsAsync(changedAuthors);

            _provider3.Setup(p => p.GetChangedAuthorsAsync(startTime))
                .ReturnsAsync(new HashSet<string>());

            // When
            ExceptionVerification.ExpectedWarns(1);
            var result = Subject.GetChangedAuthors(startTime);

            // Then
            result.Should().HaveCount(2);
            result.Should().Contain(new[] { "author1", "author2" });
        }
    }
}
