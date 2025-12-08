using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using FluentValidation.Results;
using Moq;
using NLog;
using NUnit.Framework;
using NzbDrone.Core.Books;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.ThingiProvider;
using NzbDrone.Core.Validation;

namespace NzbDrone.Core.Test.MetadataSourceTests
{
    [TestFixture]
    public class MetadataProviderBaseFixture : CoreTest
    {
        private TestMetadataProvider _provider;
        private Mock<IMetadataProviderStatusService> _statusService;

        [SetUp]
        public void Setup()
        {
            _statusService = Mocker.GetMock<IMetadataProviderStatusService>();
            _provider = new TestMetadataProvider(_statusService.Object, Mocker.Resolve<Logger>());
            _provider.Definition = new MetadataProviderDefinition
            {
                Id = 1,
                Name = "TestProvider",
                Priority = 50
            };
        }

        [Test]
        public async Task should_record_success_when_get_author_info_succeeds()
        {
            // Given
            var authorId = "author123";
            _provider.ShouldSucceed = true;

            // When
            var result = await _provider.GetAuthorInfoAsync(authorId);

            // Then
            result.Should().NotBeNull();
            _statusService.Verify(s => s.RecordSuccess(_provider.Definition.Id), Times.Once);
        }

        [Test]
        public async Task should_record_failure_when_get_author_info_fails()
        {
            // Given
            var authorId = "author123";
            _provider.ShouldThrow = true;

            // When
            Func<Task> act = async () => await _provider.GetAuthorInfoAsync(authorId);

            // Then
            await act.Should().ThrowAsync<Exception>();
            _statusService.Verify(s => s.RecordFailure(_provider.Definition.Id, It.IsAny<TimeSpan>()), Times.Once);
        }

        [Test]
        public async Task should_throw_not_supported_when_author_search_not_supported()
        {
            // Given
            var authorId = "author123";
            _provider.TestCapabilities.SupportsAuthorSearch = false;

            // When
            Func<Task> act = async () => await _provider.GetAuthorInfoAsync(authorId);

            // Then
            await act.Should().ThrowAsync<NotSupportedException>()
                .WithMessage("*does not support author search*");
        }

        [Test]
        public async Task should_record_success_when_get_book_info_succeeds()
        {
            // Given
            var bookId = "book123";
            _provider.ShouldSucceed = true;

            // When
            var result = await _provider.GetBookInfoAsync(bookId);

            // Then
            result.Should().NotBeNull();
            _statusService.Verify(s => s.RecordSuccess(_provider.Definition.Id), Times.Once);
        }

        [Test]
        public async Task should_record_failure_when_get_book_info_fails()
        {
            // Given
            var bookId = "book123";
            _provider.ShouldThrow = true;

            // When
            Func<Task> act = async () => await _provider.GetBookInfoAsync(bookId);

            // Then
            await act.Should().ThrowAsync<Exception>();
            _statusService.Verify(s => s.RecordFailure(_provider.Definition.Id, It.IsAny<TimeSpan>()), Times.Once);
        }

        [Test]
        public async Task should_throw_not_supported_when_book_search_not_supported()
        {
            // Given
            var bookId = "book123";
            _provider.TestCapabilities.SupportsBookSearch = false;

            // When
            Func<Task> act = async () => await _provider.GetBookInfoAsync(bookId);

            // Then
            await act.Should().ThrowAsync<NotSupportedException>()
                .WithMessage("*does not support book search*");
        }

        [Test]
        public async Task should_record_success_when_author_search_succeeds()
        {
            // Given
            var query = "tolkien";
            _provider.ShouldSucceed = true;

            // When
            var result = await _provider.SearchForNewAuthorAsync(query);

            // Then
            result.Should().NotBeNull();
            _statusService.Verify(s => s.RecordSuccess(_provider.Definition.Id), Times.Once);
        }

        [Test]
        public async Task should_record_failure_when_author_search_fails()
        {
            // Given
            var query = "tolkien";
            _provider.ShouldThrow = true;

            // When
            Func<Task> act = async () => await _provider.SearchForNewAuthorAsync(query);

            // Then
            await act.Should().ThrowAsync<Exception>();
            _statusService.Verify(s => s.RecordFailure(_provider.Definition.Id, It.IsAny<TimeSpan>()), Times.Once);
        }

        [Test]
        public async Task should_record_success_when_book_search_succeeds()
        {
            // Given
            var title = "The Hobbit";
            _provider.ShouldSucceed = true;

            // When
            var result = await _provider.SearchForNewBookAsync(title, null, true);

            // Then
            result.Should().NotBeNull();
            _statusService.Verify(s => s.RecordSuccess(_provider.Definition.Id), Times.Once);
        }

        [Test]
        public async Task should_record_failure_when_book_search_fails()
        {
            // Given
            var title = "The Hobbit";
            _provider.ShouldThrow = true;

            // When
            Func<Task> act = async () => await _provider.SearchForNewBookAsync(title, null, true);

            // Then
            await act.Should().ThrowAsync<Exception>();
            _statusService.Verify(s => s.RecordFailure(_provider.Definition.Id, It.IsAny<TimeSpan>()), Times.Once);
        }

        [Test]
        public async Task should_record_success_when_isbn_search_succeeds()
        {
            // Given
            var isbn = "9780544003415";
            _provider.ShouldSucceed = true;

            // When
            var result = await _provider.SearchByIsbnAsync(isbn);

            // Then
            result.Should().NotBeNull();
            _statusService.Verify(s => s.RecordSuccess(_provider.Definition.Id), Times.Once);
        }

        [Test]
        public async Task should_throw_not_supported_when_isbn_lookup_not_supported()
        {
            // Given
            var isbn = "9780544003415";
            _provider.TestCapabilities.SupportsIsbnLookup = false;

            // When
            Func<Task> act = async () => await _provider.SearchByIsbnAsync(isbn);

            // Then
            await act.Should().ThrowAsync<NotSupportedException>()
                .WithMessage("*does not support ISBN lookup*");
        }

        [Test]
        public async Task should_record_success_when_asin_search_succeeds()
        {
            // Given
            var asin = "B0084B5TK8";
            _provider.ShouldSucceed = true;

            // When
            var result = await _provider.SearchByAsinAsync(asin);

            // Then
            result.Should().NotBeNull();
            _statusService.Verify(s => s.RecordSuccess(_provider.Definition.Id), Times.Once);
        }

        [Test]
        public async Task should_throw_not_supported_when_asin_lookup_not_supported()
        {
            // Given
            var asin = "B0084B5TK8";
            _provider.TestCapabilities.SupportsAsinLookup = false;

            // When
            Func<Task> act = async () => await _provider.SearchByAsinAsync(asin);

            // Then
            await act.Should().ThrowAsync<NotSupportedException>()
                .WithMessage("*does not support ASIN lookup*");
        }

        [Test]
        public async Task should_record_success_when_get_changed_authors_succeeds()
        {
            // Given
            var startTime = DateTime.UtcNow.AddDays(-7);
            _provider.ShouldSucceed = true;

            // When
            var result = await _provider.GetChangedAuthorsAsync(startTime);

            // Then
            result.Should().NotBeNull();
            _statusService.Verify(s => s.RecordSuccess(_provider.Definition.Id), Times.Once);
        }

        [Test]
        public async Task should_throw_not_supported_when_change_feed_not_supported()
        {
            // Given
            var startTime = DateTime.UtcNow.AddDays(-7);
            _provider.TestCapabilities.SupportsChangeFeed = false;

            // When
            Func<Task> act = async () => await _provider.GetChangedAuthorsAsync(startTime);

            // Then
            await act.Should().ThrowAsync<NotSupportedException>()
                .WithMessage("*does not support change feed*");
        }

        [Test]
        public void test_should_return_valid_result_on_success()
        {
            // Given
            _provider.ShouldSucceed = true;

            // When
            var result = _provider.Test();

            // Then
            result.IsValid.Should().BeTrue();
            result.Errors.Should().BeEmpty();
        }

        [Test]
        public void test_should_return_invalid_result_on_failure()
        {
            // Given
            _provider.ShouldThrow = true;

            // When
            var result = _provider.Test();

            // Then
            result.IsValid.Should().BeFalse();
            result.Errors.Should().NotBeEmpty();
        }

        [Test]
        public void to_string_should_return_definition_name()
        {
            // When
            var result = _provider.ToString();

            // Then
            result.Should().Be("TestProvider");
        }

        [Test]
        public void to_string_should_return_provider_name_when_no_definition()
        {
            // Given
            _provider.Definition = null;

            // When
            var result = _provider.ToString();

            // Then
            result.Should().Be("TestProvider");
        }
    }

    // Test implementation of MetadataProviderBase
    internal class TestMetadataProvider : MetadataProviderBase<TestProviderSettingsForBase>
    {
        public bool ShouldSucceed { get; set; } = true;
        public bool ShouldThrow { get; set; } = false;
        public MetadataProviderCapabilities TestCapabilities { get; set; } = MetadataProviderCapabilities.All();

        public TestMetadataProvider(IMetadataProviderStatusService statusService, Logger logger)
            : base(statusService, logger)
        {
        }

        public override string Name => "TestProvider";
        public override int Priority => 50;
        public override MetadataProviderCapabilities Capabilities => TestCapabilities;

        protected override Task<Author> GetAuthorInfoInternalAsync(string foreignAuthorId, bool useCache = true)
        {
            if (ShouldThrow)
            {
                throw new Exception("Test exception");
            }

            if (!ShouldSucceed)
            {
                return Task.FromResult<Author>(null);
            }

            return Task.FromResult(new Author
            {
                ForeignAuthorId = foreignAuthorId,
                Name = "Test Author"
            });
        }

        protected override Task<Tuple<string, Book, List<AuthorMetadata>>> GetBookInfoInternalAsync(string foreignBookId)
        {
            if (ShouldThrow)
            {
                throw new Exception("Test exception");
            }

            if (!ShouldSucceed)
            {
                return Task.FromResult<Tuple<string, Book, List<AuthorMetadata>>>(null);
            }

            return Task.FromResult(new Tuple<string, Book, List<AuthorMetadata>>(
                "author123",
                new Book { ForeignBookId = foreignBookId, Title = "Test Book" },
                new List<AuthorMetadata>()));
        }

        protected override Task<List<Author>> SearchForNewAuthorInternalAsync(string query)
        {
            if (ShouldThrow)
            {
                throw new Exception("Test exception");
            }

            if (!ShouldSucceed)
            {
                return Task.FromResult(new List<Author>());
            }

            return Task.FromResult(new List<Author>
            {
                new Author { ForeignAuthorId = "author1", Name = "Test Author" }
            });
        }

        protected override Task<List<Book>> SearchForNewBookInternalAsync(string title, string author, bool getAllEditions)
        {
            if (ShouldThrow)
            {
                throw new Exception("Test exception");
            }

            if (!ShouldSucceed)
            {
                return Task.FromResult(new List<Book>());
            }

            return Task.FromResult(new List<Book>
            {
                new Book { ForeignBookId = "book1", Title = title }
            });
        }

        protected override Task<List<Book>> SearchByIsbnInternalAsync(string isbn)
        {
            if (ShouldThrow)
            {
                throw new Exception("Test exception");
            }

            if (!ShouldSucceed)
            {
                return Task.FromResult(new List<Book>());
            }

            return Task.FromResult(new List<Book>
            {
                new Book { ForeignBookId = "book1", Title = "Test Book" }
            });
        }

        protected override Task<List<Book>> SearchByAsinInternalAsync(string asin)
        {
            if (ShouldThrow)
            {
                throw new Exception("Test exception");
            }

            if (!ShouldSucceed)
            {
                return Task.FromResult(new List<Book>());
            }

            return Task.FromResult(new List<Book>
            {
                new Book { ForeignBookId = "book1", Title = "Test Book" }
            });
        }

        protected override Task<HashSet<string>> GetChangedAuthorsInternalAsync(DateTime startTime)
        {
            if (ShouldThrow)
            {
                throw new Exception("Test exception");
            }

            if (!ShouldSucceed)
            {
                return Task.FromResult(new HashSet<string>());
            }

            return Task.FromResult(new HashSet<string> { "author1", "author2" });
        }

        protected override Task TestInternal(List<ValidationFailure> failures)
        {
            if (ShouldThrow)
            {
                throw new Exception("Test exception");
            }

            return Task.CompletedTask;
        }
    }

    internal class TestProviderSettingsForBase : IProviderConfig
    {
        public NzbDroneValidationResult Validate()
        {
            return new NzbDroneValidationResult();
        }
    }
}
