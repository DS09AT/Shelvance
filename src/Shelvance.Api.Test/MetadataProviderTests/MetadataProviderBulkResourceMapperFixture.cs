using System.Collections.Generic;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.MetadataSource;
using Shelvance.Api.V1.MetadataProvider;

namespace NzbDrone.Api.Test.MetadataProviderTests
{
    [TestFixture]
    public class MetadataProviderBulkResourceMapperFixture
    {
        private MetadataProviderBulkResourceMapper _mapper;

        [SetUp]
        public void Setup()
        {
            _mapper = new MetadataProviderBulkResourceMapper();
        }

        [Test]
        public void should_update_all_providers_with_bulk_resource()
        {
            // Given
            var bulkResource = new MetadataProviderBulkResource
            {
                EnableAuthorSearch = true,
                EnableBookSearch = false,
                EnableAutomaticRefresh = true,
                Priority = 80
            };

            var existingDefinitions = new List<MetadataProviderDefinition>
            {
                new MetadataProviderDefinition
                {
                    Id = 1,
                    EnableAuthorSearch = false,
                    EnableBookSearch = true,
                    EnableAutomaticRefresh = false,
                    Priority = 50
                },
                new MetadataProviderDefinition
                {
                    Id = 2,
                    EnableAuthorSearch = false,
                    EnableBookSearch = true,
                    EnableAutomaticRefresh = false,
                    Priority = 60
                }
            };

            // When
            var result = _mapper.UpdateModel(bulkResource, existingDefinitions);

            // Then
            result.Should().HaveCount(2);
            result.Should().OnlyContain(d =>
                d.EnableAuthorSearch == true &&
                d.EnableBookSearch == false &&
                d.EnableAutomaticRefresh == true &&
                d.Priority == 80);
        }

        [Test]
        public void should_only_update_specified_properties()
        {
            // Given - Only Priority is specified
            var bulkResource = new MetadataProviderBulkResource
            {
                Priority = 95
            };

            var existingDefinitions = new List<MetadataProviderDefinition>
            {
                new MetadataProviderDefinition
                {
                    Id = 1,
                    EnableAuthorSearch = true,
                    EnableBookSearch = false,
                    EnableAutomaticRefresh = true,
                    Priority = 50
                }
            };

            // When
            var result = _mapper.UpdateModel(bulkResource, existingDefinitions);

            // Then
            result[0].Priority.Should().Be(95);
            result[0].EnableAuthorSearch.Should().BeTrue(); // Unchanged
            result[0].EnableBookSearch.Should().BeFalse(); // Unchanged
            result[0].EnableAutomaticRefresh.Should().BeTrue(); // Unchanged
        }

        [Test]
        public void should_handle_null_bulk_resource()
        {
            // Given
            var existingDefinitions = new List<MetadataProviderDefinition>
            {
                new MetadataProviderDefinition { Id = 1 }
            };

            // When
            var result = _mapper.UpdateModel(null, existingDefinitions);

            // Then
            result.Should().BeEmpty();
        }

        [Test]
        public void should_handle_empty_existing_definitions()
        {
            // Given
            var bulkResource = new MetadataProviderBulkResource
            {
                Priority = 80
            };

            var existingDefinitions = new List<MetadataProviderDefinition>();

            // When
            var result = _mapper.UpdateModel(bulkResource, existingDefinitions);

            // Then
            result.Should().BeEmpty();
        }

        [Test]
        public void should_update_enable_author_search_only()
        {
            // Given
            var bulkResource = new MetadataProviderBulkResource
            {
                EnableAuthorSearch = true
            };

            var existingDefinitions = new List<MetadataProviderDefinition>
            {
                new MetadataProviderDefinition
                {
                    Id = 1,
                    EnableAuthorSearch = false,
                    Priority = 50
                }
            };

            // When
            var result = _mapper.UpdateModel(bulkResource, existingDefinitions);

            // Then
            result[0].EnableAuthorSearch.Should().BeTrue();
            result[0].Priority.Should().Be(50); // Unchanged
        }

        [Test]
        public void should_update_enable_book_search_only()
        {
            // Given
            var bulkResource = new MetadataProviderBulkResource
            {
                EnableBookSearch = false
            };

            var existingDefinitions = new List<MetadataProviderDefinition>
            {
                new MetadataProviderDefinition
                {
                    Id = 1,
                    EnableBookSearch = true,
                    Priority = 50
                }
            };

            // When
            var result = _mapper.UpdateModel(bulkResource, existingDefinitions);

            // Then
            result[0].EnableBookSearch.Should().BeFalse();
            result[0].Priority.Should().Be(50); // Unchanged
        }

        [Test]
        public void should_update_enable_automatic_refresh_only()
        {
            // Given
            var bulkResource = new MetadataProviderBulkResource
            {
                EnableAutomaticRefresh = true
            };

            var existingDefinitions = new List<MetadataProviderDefinition>
            {
                new MetadataProviderDefinition
                {
                    Id = 1,
                    EnableAutomaticRefresh = false,
                    Priority = 50
                }
            };

            // When
            var result = _mapper.UpdateModel(bulkResource, existingDefinitions);

            // Then
            result[0].EnableAutomaticRefresh.Should().BeTrue();
            result[0].Priority.Should().Be(50); // Unchanged
        }

        [Test]
        public void should_update_enable_interactive_search_only()
        {
            // Given
            var bulkResource = new MetadataProviderBulkResource
            {
            };

            var existingDefinitions = new List<MetadataProviderDefinition>
            {
                new MetadataProviderDefinition
                {
                    Id = 1,
                    Priority = 50
                }
            };

            // When
            var result = _mapper.UpdateModel(bulkResource, existingDefinitions);

            // Then
            result[0].Priority.Should().Be(50); // Unchanged
        }

        [Test]
        public void should_preserve_unspecified_properties()
        {
            // Given
            var bulkResource = new MetadataProviderBulkResource
            {
                EnableAuthorSearch = true

                // All other properties are null
            };

            var existingDefinitions = new List<MetadataProviderDefinition>
            {
                new MetadataProviderDefinition
                {
                    Id = 1,
                    EnableAuthorSearch = false,
                    EnableBookSearch = true,
                    EnableAutomaticRefresh = false,
                    Priority = 75
                }
            };

            // When
            var result = _mapper.UpdateModel(bulkResource, existingDefinitions);

            // Then
            result[0].EnableAuthorSearch.Should().BeTrue(); // Updated
            result[0].EnableBookSearch.Should().BeTrue(); // Preserved
            result[0].EnableAutomaticRefresh.Should().BeFalse(); // Preserved
            result[0].Priority.Should().Be(75); // Preserved
        }

        [Test]
        public void should_update_multiple_providers_independently()
        {
            // Given
            var bulkResource = new MetadataProviderBulkResource
            {
                Priority = 85
            };

            var existingDefinitions = new List<MetadataProviderDefinition>
            {
                new MetadataProviderDefinition
                {
                    Id = 1,
                    Name = "Provider1",
                    Priority = 50,
                    EnableAuthorSearch = true
                },
                new MetadataProviderDefinition
                {
                    Id = 2,
                    Name = "Provider2",
                    Priority = 60,
                    EnableAuthorSearch = false
                }
            };

            // When
            var result = _mapper.UpdateModel(bulkResource, existingDefinitions);

            // Then
            result.Should().HaveCount(2);
            result[0].Priority.Should().Be(85);
            result[1].Priority.Should().Be(85);
            result[0].EnableAuthorSearch.Should().BeTrue(); // Preserved
            result[1].EnableAuthorSearch.Should().BeFalse(); // Preserved
            result[0].Name.Should().Be("Provider1"); // Preserved
            result[1].Name.Should().Be("Provider2"); // Preserved
        }
    }
}
