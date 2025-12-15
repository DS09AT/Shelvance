using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.MetadataSource;
using Shelvance.Api.V1.MetadataProvider;

namespace NzbDrone.Api.Test.MetadataProviderTests
{
    [TestFixture]
    public class MetadataProviderResourceMapperFixture
    {
        private MetadataProviderResourceMapper _mapper;

        [SetUp]
        public void Setup()
        {
            _mapper = new MetadataProviderResourceMapper();
        }

        [Test]
        public void should_map_definition_to_resource()
        {
            // Given
            var definition = new MetadataProviderDefinition
            {
                Id = 1,
                Name = "TestProvider",
                Implementation = "TestProviderImpl",
                EnableAuthorSearch = true,
                EnableBookSearch = true,
                EnableAutomaticRefresh = false,

                Priority = 75,
                Tags = new System.Collections.Generic.HashSet<int> { 1, 2, 3 }
            };

            // When
            var resource = _mapper.ToResource(definition);

            // Then
            resource.Should().NotBeNull();
            resource.Id.Should().Be(1);
            resource.Name.Should().Be("TestProvider");
            resource.Implementation.Should().Be("TestProviderImpl");
            resource.EnableAuthorSearch.Should().BeTrue();
            resource.EnableBookSearch.Should().BeTrue();
            resource.EnableAutomaticRefresh.Should().BeFalse();

            resource.Priority.Should().Be(75);
            resource.Tags.Should().BeEquivalentTo(new[] { 1, 2, 3 });
        }

        [Test]
        public void should_map_resource_to_definition()
        {
            // Given
            var resource = new MetadataProviderResource
            {
                Id = 1,
                Name = "TestProvider",
                Implementation = "TestProviderImpl",
                EnableAuthorSearch = true,
                EnableBookSearch = false,
                EnableAutomaticRefresh = true,

                Priority = 60,
                Tags = new System.Collections.Generic.HashSet<int> { 4, 5 }
            };

            // When
            var definition = _mapper.ToModel(resource);

            // Then
            definition.Should().NotBeNull();
            definition.Id.Should().Be(1);
            definition.Name.Should().Be("TestProvider");
            definition.Implementation.Should().Be("TestProviderImpl");
            definition.EnableAuthorSearch.Should().BeTrue();
            definition.EnableBookSearch.Should().BeFalse();
            definition.EnableAutomaticRefresh.Should().BeTrue();

            definition.Priority.Should().Be(60);
            definition.Tags.Should().BeEquivalentTo(new[] { 4, 5 });
        }

        [Test]
        public void should_return_null_when_mapping_null_definition()
        {
            // When
            var resource = _mapper.ToResource(null);

            // Then
            resource.Should().BeNull();
        }

        [Test]
        public void should_return_null_when_mapping_null_resource()
        {
            // When
            var definition = _mapper.ToModel(null);

            // Then
            definition.Should().BeNull();
        }

        [Test]
        public void should_handle_minimum_priority()
        {
            // Given
            var definition = new MetadataProviderDefinition
            {
                Priority = 1
            };

            // When
            var resource = _mapper.ToResource(definition);

            // Then
            resource.Priority.Should().Be(1);
        }

        [Test]
        public void should_handle_maximum_priority()
        {
            // Given
            var definition = new MetadataProviderDefinition
            {
                Priority = 100
            };

            // When
            var resource = _mapper.ToResource(definition);

            // Then
            resource.Priority.Should().Be(100);
        }

        [Test]
        public void should_map_all_features_disabled()
        {
            // Given
            var definition = new MetadataProviderDefinition
            {
                EnableAuthorSearch = false,
                EnableBookSearch = false,
                EnableAutomaticRefresh = false
            };

            // When
            var resource = _mapper.ToResource(definition);

            // Then
            resource.EnableAuthorSearch.Should().BeFalse();
            resource.EnableBookSearch.Should().BeFalse();
            resource.EnableAutomaticRefresh.Should().BeFalse();
        }

        [Test]
        public void should_map_all_features_enabled()
        {
            // Given
            var definition = new MetadataProviderDefinition
            {
                EnableAuthorSearch = true,
                EnableBookSearch = true,
                EnableAutomaticRefresh = true
            };

            // When
            var resource = _mapper.ToResource(definition);

            // Then
            resource.EnableAuthorSearch.Should().BeTrue();
            resource.EnableBookSearch.Should().BeTrue();
            resource.EnableAutomaticRefresh.Should().BeTrue();
        }

        [Test]
        public void should_preserve_empty_tags()
        {
            // Given
            var definition = new MetadataProviderDefinition
            {
                Tags = new System.Collections.Generic.HashSet<int>()
            };

            // When
            var resource = _mapper.ToResource(definition);

            // Then
            resource.Tags.Should().BeEmpty();
        }

        [Test]
        public void should_round_trip_definition_to_resource_and_back()
        {
            // Given
            var originalDefinition = new MetadataProviderDefinition
            {
                Id = 5,
                Name = "RoundTripProvider",
                Implementation = "RoundTripImpl",
                EnableAuthorSearch = true,
                EnableBookSearch = false,
                EnableAutomaticRefresh = true,

                Priority = 42,
                Tags = new System.Collections.Generic.HashSet<int> { 10, 20 }
            };

            // When
            var resource = _mapper.ToResource(originalDefinition);
            var roundTrippedDefinition = _mapper.ToModel(resource);

            // Then
            roundTrippedDefinition.Should().NotBeNull();
            roundTrippedDefinition.Id.Should().Be(originalDefinition.Id);
            roundTrippedDefinition.Name.Should().Be(originalDefinition.Name);
            roundTrippedDefinition.Implementation.Should().Be(originalDefinition.Implementation);
            roundTrippedDefinition.EnableAuthorSearch.Should().Be(originalDefinition.EnableAuthorSearch);
            roundTrippedDefinition.EnableBookSearch.Should().Be(originalDefinition.EnableBookSearch);
            roundTrippedDefinition.EnableAutomaticRefresh.Should().Be(originalDefinition.EnableAutomaticRefresh);

            roundTrippedDefinition.Priority.Should().Be(originalDefinition.Priority);
            roundTrippedDefinition.Tags.Should().BeEquivalentTo(originalDefinition.Tags);
        }
    }
}
