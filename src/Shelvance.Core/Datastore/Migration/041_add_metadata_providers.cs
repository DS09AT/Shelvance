using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    /// <summary>
    /// Creates the MetadataProviders and MetadataProviderStatus tables
    /// This enables the new plugin-based metadata provider architecture
    /// </summary>
    [Migration(041)]
    public class add_metadata_providers : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            // Create MetadataProviders table (similar to Indexers)
            Create.TableForModel("MetadataProviders")
                .WithColumn("Name").AsString().Unique()
                .WithColumn("Implementation").AsString()
                .WithColumn("Settings").AsString().Nullable()
                .WithColumn("ConfigContract").AsString().Nullable()
                .WithColumn("EnableAuthorSearch").AsBoolean().WithDefaultValue(true)
                .WithColumn("EnableBookSearch").AsBoolean().WithDefaultValue(true)
                .WithColumn("EnableAutomaticRefresh").AsBoolean().WithDefaultValue(true)
                .WithColumn("Priority").AsInt32().WithDefaultValue(50)
                .WithColumn("Tags").AsString().Nullable();

            // Create MetadataProviderStatus table (for failure tracking & backoff)
            Create.TableForModel("MetadataProviderStatus")
                .WithColumn("ProviderId").AsInt32().Unique()
                .WithColumn("InitialFailure").AsDateTime().Nullable()
                .WithColumn("MostRecentFailure").AsDateTime().Nullable()
                .WithColumn("EscalationLevel").AsInt32().WithDefaultValue(0)
                .WithColumn("DisabledTill").AsDateTime().Nullable()
                .WithColumn("LastSuccessfulQuery").AsDateTime().Nullable()
                .WithColumn("SuccessfulQueryCount").AsInt64().WithDefaultValue(0)
                .WithColumn("FailedQueryCount").AsInt64().WithDefaultValue(0);

            // No default providers are inserted here - they will be initialized on first startup
            // This allows the application to dynamically detect available provider implementations
        }
    }
}
