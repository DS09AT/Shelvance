using System.Linq;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Datastore.Migration
{
    [TestFixture]
    public class add_metadata_providersFixture : MigrationTest<Core.Datastore.Migration.add_metadata_providers>
    {
        [Test]
        public void should_create_metadata_providers_table()
        {
            var db = WithMigrationTestDb();

            var columns = db.Query<dynamic>("PRAGMA table_info(MetadataProviders)");
            columns.Should().NotBeEmpty();
        }

        [Test]
        public void should_create_metadata_provider_status_table()
        {
            var db = WithMigrationTestDb();

            var columns = db.Query<dynamic>("PRAGMA table_info(MetadataProviderStatus)");
            columns.Should().NotBeEmpty();
        }

        [Test]
        public void should_insert_provider_successfully()
        {
            var db = WithMigrationTestDb();

            // Insert provider after migration
            db.Query("INSERT INTO MetadataProviders (Name, Implementation, Settings, ConfigContract, EnableAuthorSearch, EnableBookSearch, EnableAutomaticRefresh, Priority) VALUES ('TestProvider', 'TestProviderImpl', '{}', 'TestSettings', 1, 1, 1, 50)");

            var providers = db.Query<MetadataProviderDefinition041>("SELECT * FROM MetadataProviders");
            providers.Should().HaveCount(1);
            providers.First().Name.Should().Be("TestProvider");
            providers.First().Priority.Should().Be(50);
        }

        [Test]
        public void should_have_default_values()
        {
            var db = WithMigrationTestDb();

            // Insert provider with minimal fields after migration
            db.Query("INSERT INTO MetadataProviders (Name, Implementation) VALUES ('MinimalProvider', 'Minimal')");

            var providers = db.Query<MetadataProviderDefinition041>("SELECT * FROM MetadataProviders");
            var provider = providers.First();

            provider.EnableAuthorSearch.Should().BeTrue();
            provider.EnableBookSearch.Should().BeTrue();
            provider.EnableAutomaticRefresh.Should().BeTrue();
            provider.Priority.Should().Be(50);
        }
    }

    public class MetadataProviderDefinition041
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Implementation { get; set; }
        public string Settings { get; set; }
        public string ConfigContract { get; set; }
        public bool EnableAuthorSearch { get; set; }
        public bool EnableBookSearch { get; set; }
        public bool EnableAutomaticRefresh { get; set; }
        public int Priority { get; set; }
        public string Tags { get; set; }
    }
}
