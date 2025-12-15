using System;
using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.ThingiProvider;
using NzbDrone.Core.Validation;

namespace NzbDrone.Core.Test.MetadataSourceTests
{
    [TestFixture]
    public class MetadataProviderFactoryFixture : CoreTest<MetadataProviderFactory>
    {
        private Mock<IMetadataProviderStatusService> _statusService;
        private Mock<IMetadataProviderRepository> _repository;
        private List<IMetadataProvider> _providers;
        private List<MetadataProviderDefinition> _definitions;

        [SetUp]
        public void Setup()
        {
            _statusService = Mocker.GetMock<IMetadataProviderStatusService>();
            _repository = Mocker.GetMock<IMetadataProviderRepository>();

            _definitions = new List<MetadataProviderDefinition>
            {
                new MetadataProviderDefinition
                {
                    Id = 1,
                    Name = "HighPriorityProvider",
                    Implementation = "TestProviderHigh",
                    ConfigContract = nameof(TestProviderSettingsForFactory),
                    Priority = 90,
                    Enable = true,
                    EnableAuthorSearch = true,
                    EnableBookSearch = true,
                    EnableAutomaticRefresh = true,
                    Settings = new TestProviderSettingsForFactory()
                },
                new MetadataProviderDefinition
                {
                    Id = 2,
                    Name = "MediumPriorityProvider",
                    Implementation = "TestProviderMedium",
                    ConfigContract = nameof(TestProviderSettingsForFactory),
                    Priority = 50,
                    Enable = true,
                    EnableAuthorSearch = true,
                    EnableBookSearch = false,
                    EnableAutomaticRefresh = true,
                    Settings = new TestProviderSettingsForFactory()
                },
                new MetadataProviderDefinition
                {
                    Id = 3,
                    Name = "LowPriorityProvider",
                    Implementation = "TestProviderLow",
                    ConfigContract = nameof(TestProviderSettingsForFactory),
                    Priority = 10,
                    Enable = true,
                    EnableAuthorSearch = false,
                    EnableBookSearch = true,
                    EnableAutomaticRefresh = false,
                    Settings = new TestProviderSettingsForFactory()
                }
            };

            // Create mock providers
            var provider1 = new Mock<IMetadataProvider>();
            provider1.SetupGet(p => p.Definition).Returns(_definitions[0]);
            provider1.SetupGet(p => p.Name).Returns("HighPriorityProvider");
            provider1.SetupGet(p => p.Priority).Returns(90);
            provider1.SetupGet(p => p.ConfigContract).Returns(typeof(TestProviderSettingsForFactory));
            provider1.Setup(p => p.Test()).Returns(new NzbDroneValidationResult());

            var provider2 = new Mock<IMetadataProvider>();
            provider2.SetupGet(p => p.Definition).Returns(_definitions[1]);
            provider2.SetupGet(p => p.Name).Returns("MediumPriorityProvider");
            provider2.SetupGet(p => p.Priority).Returns(50);
            provider2.SetupGet(p => p.ConfigContract).Returns(typeof(TestProviderSettingsForFactory));
            provider2.Setup(p => p.Test()).Returns(new NzbDroneValidationResult());

            var provider3 = new Mock<IMetadataProvider>();
            provider3.SetupGet(p => p.Definition).Returns(_definitions[2]);
            provider3.SetupGet(p => p.Name).Returns("LowPriorityProvider");
            provider3.SetupGet(p => p.Priority).Returns(10);
            provider3.SetupGet(p => p.ConfigContract).Returns(typeof(TestProviderSettingsForFactory));
            provider3.Setup(p => p.Test()).Returns(new NzbDroneValidationResult());

            _providers = new List<IMetadataProvider> { provider1.Object, provider2.Object, provider3.Object };
            Mocker.SetConstant<IEnumerable<IMetadataProvider>>(_providers);

            _repository.Setup(r => r.All()).Returns(_definitions);
            _repository.Setup(r => r.Get(It.IsAny<int>()))
                .Returns((int id) => _definitions.FirstOrDefault(d => d.Id == id));
            _repository.Setup(r => r.Find(It.IsAny<int>()))
                .Returns((int id) => _definitions.FirstOrDefault(d => d.Id == id));

            _statusService.Setup(s => s.GetBlockedProviders())
                .Returns(new List<MetadataProviderStatus>());
        }

        [Test]
        public void should_return_providers_ordered_by_priority()
        {
            // Given
            var availableProviders = Subject.GetByPriority();

            // Then
            availableProviders.Should().NotBeEmpty();

            // Verify descending priority order
            for (var i = 0; i < availableProviders.Count - 1; i++)
            {
                var currentPriority = ((MetadataProviderDefinition)availableProviders[i].Definition).Priority;
                var nextPriority = ((MetadataProviderDefinition)availableProviders[i + 1].Definition).Priority;
                currentPriority.Should().BeGreaterOrEqualTo(nextPriority);
            }
        }

        [Test]
        public void should_filter_blocked_providers()
        {
            // Given
            var blockedStatus = new MetadataProviderStatus
            {
                ProviderId = 1,
                DisabledTill = DateTime.UtcNow.AddHours(1),
                EscalationLevel = 3
            };

            _statusService.Setup(s => s.GetBlockedProviders())
                .Returns(new List<MetadataProviderStatus> { blockedStatus });

            // When
            var availableProviders = Subject.GetByPriority(filterBlocked: true);

            // Then
            availableProviders.Should().NotContain(p => p.Definition.Id == 1);
        }

        [Test]
        public void should_not_filter_blocked_providers_when_disabled()
        {
            // Given
            var blockedStatus = new MetadataProviderStatus
            {
                ProviderId = 1,
                DisabledTill = DateTime.UtcNow.AddHours(1),
                EscalationLevel = 3
            };

            _statusService.Setup(s => s.GetBlockedProviders())
                .Returns(new List<MetadataProviderStatus> { blockedStatus });

            // When
            var availableProviders = Subject.GetByPriority(filterBlocked: false);

            // Then - should include all providers regardless of block status
            availableProviders.Count.Should().BeGreaterOrEqualTo(_definitions.Count);
        }

        [Test]
        public void author_search_enabled_should_only_return_providers_with_author_search()
        {
            // When
            var providers = Subject.AuthorSearchEnabled(filterBlocked: false);

            // Then
            providers.Should().OnlyContain(p =>
                ((MetadataProviderDefinition)p.Definition).EnableAuthorSearch);
        }

        [Test]
        public void book_search_enabled_should_only_return_providers_with_book_search()
        {
            // When
            var providers = Subject.BookSearchEnabled(filterBlocked: false);

            // Then
            providers.Should().OnlyContain(p =>
                ((MetadataProviderDefinition)p.Definition).EnableBookSearch);
        }

        [Test]
        public void automatic_refresh_enabled_should_only_return_providers_with_automatic_refresh()
        {
            // When
            var providers = Subject.AutomaticRefreshEnabled(filterBlocked: false);

            // Then
            providers.Should().OnlyContain(p =>
                ((MetadataProviderDefinition)p.Definition).EnableAutomaticRefresh);
        }

        [Test]
        public void interactive_search_enabled_should_only_return_providers_with_author_or_book_search()
        {
            // When
            var providers = Subject.InteractiveSearchEnabled(filterBlocked: false);

            // Then - should return providers with either author or book search enabled
            providers.Should().OnlyContain(p =>
                ((MetadataProviderDefinition)p.Definition).EnableAuthorSearch ||
                ((MetadataProviderDefinition)p.Definition).EnableBookSearch);
        }

        [Test]
        public void test_should_record_success_on_valid_provider()
        {
            // Given
            var definition = _definitions[0];
            definition.Settings = new TestProviderSettingsForFactory();

            // When
            var result = Subject.Test(definition);

            // Then
            result.IsValid.Should().BeTrue();
            _statusService.Verify(s => s.RecordSuccess(definition.Id), Times.Once);
        }

        [Test]
        public void test_should_record_failure_on_invalid_provider()
        {
            // Given
            var definition = _definitions[0];
            definition.Settings = new TestProviderSettingsForFactory { ThrowOnValidation = true };

            // When
            var result = Subject.Test(definition);

            // Then
            result.IsValid.Should().BeFalse();
            _statusService.Verify(s => s.RecordFailure(definition.Id, It.IsAny<TimeSpan>()), Times.Once);
        }

        [Test]
        public void should_get_provider_by_id()
        {
            // Given
            var expectedId = 1;

            // When
            var definition = Subject.Get(expectedId);

            // Then
            definition.Should().NotBeNull();
            definition.Id.Should().Be(expectedId);
        }

        [Test]
        public void should_find_provider_by_id()
        {
            // Given
            var expectedId = 2;

            // When
            var definition = Subject.Find(expectedId);

            // Then
            definition.Should().NotBeNull();
            definition.Id.Should().Be(expectedId);
        }

        [Test]
        public void find_should_return_null_for_nonexistent_id()
        {
            // Given
            var nonexistentId = 999;

            // When
            var definition = Subject.Find(nonexistentId);

            // Then
            definition.Should().BeNull();
        }

        [Test]
        public void exists_should_return_true_for_existing_provider()
        {
            // Given
            var existingId = 1;

            // When
            var exists = Subject.Exists(existingId);

            // Then
            exists.Should().BeTrue();
        }

        [Test]
        public void exists_should_return_false_for_nonexistent_provider()
        {
            // Given
            var nonexistentId = 999;

            // When
            var exists = Subject.Exists(nonexistentId);

            // Then
            exists.Should().BeFalse();
        }

        [Test]
        public void create_should_insert_provider_definition()
        {
            // Given
            var newDefinition = new MetadataProviderDefinition
            {
                Name = "NewProvider",
                Implementation = "TestProviderNew",
                Priority = 75
            };

            _repository.Setup(r => r.Insert(It.IsAny<MetadataProviderDefinition>()))
                .Returns((MetadataProviderDefinition d) =>
                {
                    d.Id = 4;
                    return d;
                });

            // When
            var result = Subject.Create(newDefinition);

            // Then
            result.Should().NotBeNull();
            result.Id.Should().Be(4);
            _repository.Verify(r => r.Insert(It.IsAny<MetadataProviderDefinition>()), Times.Once);
        }

        [Test]
        public void update_should_modify_provider_definition()
        {
            // Given
            var definition = _definitions[0];
            definition.Priority = 95;

            // When
            Subject.Update(definition);

            // Then
            _repository.Verify(r => r.Update(definition), Times.Once);
        }

        [Test]
        public void delete_should_remove_provider_definition()
        {
            // Given
            var idToDelete = 1;

            // When
            Subject.Delete(idToDelete);

            // Then
            _repository.Verify(r => r.Delete(idToDelete), Times.Once);
        }
    }

    // Test helper classes
    internal class TestProviderSettingsForFactory : IProviderConfig
    {
        public bool ThrowOnValidation { get; set; }

        public NzbDroneValidationResult Validate()
        {
            if (ThrowOnValidation)
            {
                throw new Exception("Validation failed");
            }

            return new NzbDroneValidationResult();
        }
    }
}
