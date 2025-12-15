using FluentValidation;
using NzbDrone.Core.Annotations;
using NzbDrone.Core.Validation;

namespace NzbDrone.Core.Indexers.Gutenberg
{
    public class GutenbergSettingsValidator : AbstractValidator<GutenbergSettings>
    {
        public GutenbergSettingsValidator()
        {
            RuleFor(c => c.BaseUrl).ValidRootUrl();
        }
    }

    public class GutenbergSettings : IIndexerSettings
    {
        private static readonly GutenbergSettingsValidator Validator = new GutenbergSettingsValidator();

        public GutenbergSettings()
        {
            BaseUrl = GutenbergConstants.DEFAULT_BASE_URL;
        }

        [FieldDefinition(0, Label = "URL", Advanced = true, HelpText = "GutenbergBaseUrlHelpText")]
        public string BaseUrl { get; set; }

        [FieldDefinition(1, Type = FieldType.Number, Label = "Early Download Limit", Unit = "days", HelpText = "Time before release date Shelvance will download from this indexer, empty is no limit", Advanced = true)]
        public int? EarlyReleaseLimit { get; set; }

        public NzbDroneValidationResult Validate()
        {
            return new NzbDroneValidationResult(Validator.Validate(this));
        }
    }
}
