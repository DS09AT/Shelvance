using System;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.MetadataSource;

namespace NzbDrone.Core.Test.MetadataSourceTests
{
    [TestFixture]
    public class MetadataProviderExceptionFixture
    {
        [Test]
        public void should_create_metadata_provider_exception_with_message()
        {
            // Given
            var message = "Test exception message";

            // When
            var exception = new MetadataProviderException(message);

            // Then
            exception.Message.Should().Be(message);
        }

        [Test]
        public void should_create_metadata_provider_exception_with_formatted_message()
        {
            // Given
            var format = "Error with provider {0} at {1}";
            var provider = "TestProvider";
            var time = DateTime.UtcNow;

            // When
            var exception = new MetadataProviderException(format, provider, time);

            // Then
            exception.Message.Should().Contain("TestProvider");
        }

        [Test]
        public void should_create_metadata_provider_exception_with_inner_exception()
        {
            // Given
            var message = "Outer exception";
            var innerException = new InvalidOperationException("Inner exception");

            // When
            var exception = new MetadataProviderException(message, innerException);

            // Then
            exception.Message.Should().Be(message);
            exception.InnerException.Should().Be(innerException);
        }

        [Test]
        public void should_set_provider_name()
        {
            // Given
            var exception = new MetadataProviderException("Test");
            var providerName = "OpenLibrary";

            // When
            exception.ProviderName = providerName;

            // Then
            exception.ProviderName.Should().Be(providerName);
        }

        [Test]
        public void should_create_no_metadata_providers_available_exception()
        {
            // When
            var exception = new NoMetadataProvidersAvailableException();

            // Then
            exception.Message.Should().Be("No metadata providers are available or enabled");
        }

        [Test]
        public void should_create_no_metadata_providers_available_exception_with_custom_message()
        {
            // Given
            var message = "Custom no providers message";

            // When
            var exception = new NoMetadataProvidersAvailableException(message);

            // Then
            exception.Message.Should().Be(message);
        }

        [Test]
        public void should_create_metadata_not_found_exception_with_message()
        {
            // Given
            var message = "Could not find author with ID author123";

            // When
            var exception = new MetadataNotFoundException(message);

            // Then
            exception.Message.Should().Be(message);
        }

        [Test]
        public void should_create_metadata_not_found_exception_with_inner_exception()
        {
            // Given
            var message = "Could not find book";
            var innerException = new Exception("All providers failed");

            // When
            var exception = new MetadataNotFoundException(message, innerException);

            // Then
            exception.Message.Should().Be(message);
            exception.InnerException.Should().Be(innerException);
        }

        [Test]
        public void no_providers_exception_should_inherit_from_metadata_provider_exception()
        {
            // Given
            var exception = new NoMetadataProvidersAvailableException();

            // Then
            exception.Should().BeAssignableTo<MetadataProviderException>();
        }

        [Test]
        public void metadata_not_found_exception_should_inherit_from_metadata_provider_exception()
        {
            // Given
            var exception = new MetadataNotFoundException("Not found");

            // Then
            exception.Should().BeAssignableTo<MetadataProviderException>();
        }

        [Test]
        public void should_be_throwable()
        {
            // Given
            var exception = new MetadataProviderException("Test error");

            // When
            Action act = () => throw exception;

            // Then
            act.Should().Throw<MetadataProviderException>()
                .WithMessage("Test error");
        }

        [Test]
        public void should_be_catchable_as_base_type()
        {
            // Given
            var exception = new MetadataNotFoundException("Not found");

            // When
            Action act = () => throw exception;

            // Then
            act.Should().Throw<MetadataProviderException>();
        }

        [Test]
        public void should_preserve_stack_trace()
        {
            // Given
            Exception caughtException = null;

            try
            {
                ThrowMetadataProviderException();
            }
            catch (MetadataProviderException ex)
            {
                caughtException = ex;
            }

            // Then
            caughtException.Should().NotBeNull();
            caughtException.StackTrace.Should().Contain(nameof(ThrowMetadataProviderException));
        }

        private void ThrowMetadataProviderException()
        {
            throw new MetadataProviderException("Test exception");
        }
    }
}
