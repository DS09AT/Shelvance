using System;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MetadataSourceTests
{
    [TestFixture]
    public class MetadataProviderStatusServiceFixture : CoreTest<MetadataProviderStatusService>
    {
        private Mock<IMetadataProviderStatusRepository> _repository;
        private Mock<IEventAggregator> _eventAggregator;
        private Mock<IRuntimeInfo> _runtimeInfo;
        private int _providerId;

        [SetUp]
        public void Setup()
        {
            _repository = Mocker.GetMock<IMetadataProviderStatusRepository>();
            _eventAggregator = Mocker.GetMock<IEventAggregator>();
            _runtimeInfo = Mocker.GetMock<IRuntimeInfo>();

            _providerId = 1;

            _runtimeInfo.SetupGet(r => r.StartTime).Returns(DateTime.UtcNow.AddHours(-1));
        }

        [Test]
        public void should_record_successful_query()
        {
            // Given
            var existingStatus = new MetadataProviderStatus
            {
                ProviderId = _providerId,
                SuccessfulQueryCount = 5,
                FailedQueryCount = 2,
                EscalationLevel = 1
            };

            _repository.Setup(r => r.FindByProviderId(_providerId))
                .Returns(existingStatus);

            // When
            Subject.RecordSuccess(_providerId);

            // Then
            _repository.Verify(r => r.Upsert(It.Is<MetadataProviderStatus>(s =>
                s.ProviderId == _providerId &&
                s.SuccessfulQueryCount == 6 &&
                s.LastSuccessfulQuery != null &&
                s.EscalationLevel == 0 &&
                s.DisabledTill == null)), Times.Once);
        }

        [Test]
        public void should_increment_successful_query_count()
        {
            // Given
            var existingStatus = new MetadataProviderStatus
            {
                ProviderId = _providerId,
                SuccessfulQueryCount = 10
            };

            MetadataProviderStatus updatedStatus = null;
            _repository.Setup(r => r.FindByProviderId(_providerId))
                .Returns(() => updatedStatus ?? existingStatus);
            _repository.Setup(r => r.Upsert(It.IsAny<MetadataProviderStatus>()))
                .Callback<MetadataProviderStatus>(s => updatedStatus = s);

            // When
            Subject.RecordSuccess(_providerId);

            // Then
            Subject.GetSuccessfulQueryCount(_providerId).Should().Be(11);
        }

        [Test]
        public void should_record_failed_query()
        {
            // Given
            var existingStatus = new MetadataProviderStatus
            {
                ProviderId = _providerId,
                SuccessfulQueryCount = 10,
                FailedQueryCount = 0
            };

            _repository.Setup(r => r.FindByProviderId(_providerId))
                .Returns(existingStatus);

            // When
            Subject.RecordFailure(_providerId);

            // Then
            _repository.Verify(r => r.Upsert(It.Is<MetadataProviderStatus>(s =>
                s.ProviderId == _providerId &&
                s.FailedQueryCount == 1 &&
                s.MostRecentFailure != null &&
                s.EscalationLevel > 0)), Times.Once);
        }

        [Test]
        public void should_increment_failed_query_count()
        {
            // Given
            var existingStatus = new MetadataProviderStatus
            {
                ProviderId = _providerId,
                FailedQueryCount = 5
            };

            MetadataProviderStatus updatedStatus = null;
            _repository.Setup(r => r.FindByProviderId(_providerId))
                .Returns(() => updatedStatus ?? existingStatus);
            _repository.Setup(r => r.Upsert(It.IsAny<MetadataProviderStatus>()))
                .Callback<MetadataProviderStatus>(s => updatedStatus = s);

            // When
            Subject.RecordFailure(_providerId);

            // Then
            Subject.GetFailedQueryCount(_providerId).Should().Be(6);
        }

        [Test]
        public void should_escalate_on_multiple_failures()
        {
            // Given
            var existingStatus = new MetadataProviderStatus
            {
                ProviderId = _providerId,
                EscalationLevel = 2,
                MostRecentFailure = DateTime.UtcNow.AddMinutes(-10)
            };

            _repository.Setup(r => r.FindByProviderId(_providerId))
                .Returns(existingStatus);

            // When
            Subject.RecordFailure(_providerId);

            // Then
            _repository.Verify(r => r.Upsert(It.Is<MetadataProviderStatus>(s =>
                s.EscalationLevel == 3 &&
                s.DisabledTill != null &&
                s.DisabledTill > DateTime.UtcNow)), Times.Once);
        }

        [Test]
        public void should_set_disabled_till_on_failure()
        {
            // Given
            var existingStatus = new MetadataProviderStatus
            {
                ProviderId = _providerId,
                EscalationLevel = 1
            };

            _repository.Setup(r => r.FindByProviderId(_providerId))
                .Returns(existingStatus);

            // When
            Subject.RecordFailure(_providerId);

            // Then
            _repository.Verify(r => r.Upsert(It.Is<MetadataProviderStatus>(s =>
                s.DisabledTill != null &&
                s.DisabledTill.Value > DateTime.UtcNow)), Times.Once);
        }

        [Test]
        public void should_clear_disabled_till_on_success()
        {
            // Given
            var existingStatus = new MetadataProviderStatus
            {
                ProviderId = _providerId,
                EscalationLevel = 3,
                DisabledTill = DateTime.UtcNow.AddHours(1),
                InitialFailure = DateTime.UtcNow.AddHours(-2),
                MostRecentFailure = DateTime.UtcNow.AddMinutes(-30)
            };

            _repository.Setup(r => r.FindByProviderId(_providerId))
                .Returns(existingStatus);

            // When
            Subject.RecordSuccess(_providerId);

            // Then
            _repository.Verify(r => r.Upsert(It.Is<MetadataProviderStatus>(s =>
                s.DisabledTill == null &&
                s.EscalationLevel == 0 &&
                s.InitialFailure == null &&
                s.MostRecentFailure == null)), Times.Once);
        }

        [Test]
        public void should_get_last_successful_query()
        {
            // Given
            var expectedTime = DateTime.UtcNow.AddMinutes(-15);
            var existingStatus = new MetadataProviderStatus
            {
                ProviderId = _providerId,
                LastSuccessfulQuery = expectedTime
            };

            _repository.Setup(r => r.FindByProviderId(_providerId))
                .Returns(existingStatus);

            // When
            var result = Subject.GetLastSuccessfulQuery(_providerId);

            // Then
            result.Should().Be(expectedTime);
        }

        [Test]
        public void should_return_null_for_last_successful_query_if_never_succeeded()
        {
            // Given
            var existingStatus = new MetadataProviderStatus
            {
                ProviderId = _providerId,
                LastSuccessfulQuery = null
            };

            _repository.Setup(r => r.FindByProviderId(_providerId))
                .Returns(existingStatus);

            // When
            var result = Subject.GetLastSuccessfulQuery(_providerId);

            // Then
            result.Should().BeNull();
        }

        [Test]
        public void should_get_blocked_providers()
        {
            // Given
            var blockedStatuses = new[]
            {
                new MetadataProviderStatus
                {
                    ProviderId = 1,
                    DisabledTill = DateTime.UtcNow.AddHours(1),
                    EscalationLevel = 3
                },
                new MetadataProviderStatus
                {
                    ProviderId = 2,
                    DisabledTill = DateTime.UtcNow.AddMinutes(30),
                    EscalationLevel = 2
                },
                new MetadataProviderStatus
                {
                    ProviderId = 3,
                    DisabledTill = null, // Not blocked
                    EscalationLevel = 0
                }
            };

            _repository.Setup(r => r.All())
                .Returns(blockedStatuses.ToList());

            // When
            var result = Subject.GetBlockedProviders();

            // Then
            result.Should().HaveCount(2);
            result.Should().OnlyContain(s => s.DisabledTill != null && s.DisabledTill > DateTime.UtcNow);
        }

        [Test]
        public void should_not_include_expired_blocks_in_blocked_providers()
        {
            // Given
            var statuses = new[]
            {
                new MetadataProviderStatus
                {
                    ProviderId = 1,
                    DisabledTill = DateTime.UtcNow.AddHours(1), // Still blocked
                    EscalationLevel = 3
                },
                new MetadataProviderStatus
                {
                    ProviderId = 2,
                    DisabledTill = DateTime.UtcNow.AddHours(-1), // Block expired
                    EscalationLevel = 2
                }
            };

            _repository.Setup(r => r.All())
                .Returns(statuses.ToList());

            // When
            var result = Subject.GetBlockedProviders();

            // Then
            result.Should().HaveCount(1);
            result.First().ProviderId.Should().Be(1);
        }

        [Test]
        public void should_record_connection_failure()
        {
            // Given
            _repository.Setup(r => r.FindByProviderId(_providerId))
                .Returns((MetadataProviderStatus)null);

            // When
            Subject.RecordConnectionFailure(_providerId);

            // Then
            _repository.Verify(r => r.Upsert(It.Is<MetadataProviderStatus>(s =>
                s.ProviderId == _providerId &&
                s.InitialFailure != null &&
                s.MostRecentFailure != null)), Times.Once);
        }

        [Test]
        public void should_create_new_status_if_not_exists()
        {
            // Given
            _repository.Setup(r => r.FindByProviderId(_providerId))
                .Returns((MetadataProviderStatus)null);

            // When
            Subject.RecordSuccess(_providerId);

            // Then
            _repository.Verify(r => r.Upsert(It.Is<MetadataProviderStatus>(s =>
                s.ProviderId == _providerId &&
                s.SuccessfulQueryCount == 1)), Times.Once);
        }
    }
}
