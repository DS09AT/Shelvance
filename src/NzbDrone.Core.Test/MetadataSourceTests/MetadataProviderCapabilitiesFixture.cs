using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.MetadataSource;

namespace NzbDrone.Core.Test.MetadataSourceTests
{
    [TestFixture]
    public class MetadataProviderCapabilitiesFixture
    {
        [Test]
        public void all_should_return_capabilities_with_all_features_enabled()
        {
            // When
            var capabilities = MetadataProviderCapabilities.All();

            // Then
            capabilities.SupportsAuthorSearch.Should().BeTrue();
            capabilities.SupportsBookSearch.Should().BeTrue();
            capabilities.SupportsIsbnLookup.Should().BeTrue();
            capabilities.SupportsAsinLookup.Should().BeTrue();
            capabilities.SupportsSeriesInfo.Should().BeTrue();
            capabilities.SupportsChangeFeed.Should().BeTrue();
            capabilities.SupportsCovers.Should().BeTrue();
            capabilities.SupportsRatings.Should().BeTrue();
            capabilities.SupportsDescriptions.Should().BeTrue();
            capabilities.MaxRequestsPerMinute.Should().Be(0);
        }

        [Test]
        public void none_should_return_capabilities_with_all_features_disabled()
        {
            // When
            var capabilities = MetadataProviderCapabilities.None();

            // Then
            capabilities.SupportsAuthorSearch.Should().BeFalse();
            capabilities.SupportsBookSearch.Should().BeFalse();
            capabilities.SupportsIsbnLookup.Should().BeFalse();
            capabilities.SupportsAsinLookup.Should().BeFalse();
            capabilities.SupportsSeriesInfo.Should().BeFalse();
            capabilities.SupportsChangeFeed.Should().BeFalse();
            capabilities.SupportsCovers.Should().BeFalse();
            capabilities.SupportsRatings.Should().BeFalse();
            capabilities.SupportsDescriptions.Should().BeFalse();
            capabilities.MaxRequestsPerMinute.Should().Be(0);
        }

        [Test]
        public void should_create_custom_capabilities()
        {
            // When
            var capabilities = new MetadataProviderCapabilities
            {
                SupportsAuthorSearch = true,
                SupportsBookSearch = true,
                SupportsIsbnLookup = true,
                SupportsAsinLookup = false,
                SupportsSeriesInfo = false,
                SupportsChangeFeed = true,
                SupportsCovers = true,
                SupportsRatings = false,
                SupportsDescriptions = true,
                MaxRequestsPerMinute = 100
            };

            // Then
            capabilities.SupportsAuthorSearch.Should().BeTrue();
            capabilities.SupportsBookSearch.Should().BeTrue();
            capabilities.SupportsIsbnLookup.Should().BeTrue();
            capabilities.SupportsAsinLookup.Should().BeFalse();
            capabilities.SupportsSeriesInfo.Should().BeFalse();
            capabilities.SupportsChangeFeed.Should().BeTrue();
            capabilities.SupportsCovers.Should().BeTrue();
            capabilities.SupportsRatings.Should().BeFalse();
            capabilities.SupportsDescriptions.Should().BeTrue();
            capabilities.MaxRequestsPerMinute.Should().Be(100);
        }

        [Test]
        public void should_allow_setting_rate_limit()
        {
            // Given
            var capabilities = new MetadataProviderCapabilities
            {
                MaxRequestsPerMinute = 60
            };

            // Then
            capabilities.MaxRequestsPerMinute.Should().Be(60);
        }

        [Test]
        public void should_default_to_unlimited_rate_limit()
        {
            // Given
            var capabilities = new MetadataProviderCapabilities();

            // Then
            capabilities.MaxRequestsPerMinute.Should().Be(0);
        }

        [Test]
        public void should_support_partial_capability_sets()
        {
            // Given - Provider that only supports ISBN lookup
            var isbnOnlyCapabilities = new MetadataProviderCapabilities
            {
                SupportsIsbnLookup = true,
                SupportsCovers = true
            };

            // Then
            isbnOnlyCapabilities.SupportsIsbnLookup.Should().BeTrue();
            isbnOnlyCapabilities.SupportsCovers.Should().BeTrue();
            isbnOnlyCapabilities.SupportsAuthorSearch.Should().BeFalse();
            isbnOnlyCapabilities.SupportsBookSearch.Should().BeFalse();
            isbnOnlyCapabilities.SupportsAsinLookup.Should().BeFalse();
            isbnOnlyCapabilities.SupportsSeriesInfo.Should().BeFalse();
            isbnOnlyCapabilities.SupportsChangeFeed.Should().BeFalse();
            isbnOnlyCapabilities.SupportsRatings.Should().BeFalse();
            isbnOnlyCapabilities.SupportsDescriptions.Should().BeFalse();
        }

        [Test]
        public void should_create_capabilities_for_read_only_provider()
        {
            // Given - Provider that can search but not provide change feed
            var readOnlyCapabilities = new MetadataProviderCapabilities
            {
                SupportsAuthorSearch = true,
                SupportsBookSearch = true,
                SupportsIsbnLookup = true,
                SupportsAsinLookup = true,
                SupportsCovers = true,
                SupportsRatings = true,
                SupportsDescriptions = true,
                SupportsChangeFeed = false // No change feed support
            };

            // Then
            readOnlyCapabilities.SupportsAuthorSearch.Should().BeTrue();
            readOnlyCapabilities.SupportsChangeFeed.Should().BeFalse();
        }

        [Test]
        public void should_create_capabilities_for_limited_metadata_provider()
        {
            // Given - Provider with basic metadata only
            var limitedCapabilities = new MetadataProviderCapabilities
            {
                SupportsAuthorSearch = true,
                SupportsBookSearch = true,
                SupportsCovers = false, // No covers
                SupportsRatings = false, // No ratings
                SupportsDescriptions = true,
                SupportsSeriesInfo = false // No series info
            };

            // Then
            limitedCapabilities.SupportsAuthorSearch.Should().BeTrue();
            limitedCapabilities.SupportsBookSearch.Should().BeTrue();
            limitedCapabilities.SupportsDescriptions.Should().BeTrue();
            limitedCapabilities.SupportsCovers.Should().BeFalse();
            limitedCapabilities.SupportsRatings.Should().BeFalse();
            limitedCapabilities.SupportsSeriesInfo.Should().BeFalse();
        }
    }
}
