using FluentValidation;
using NzbDrone.Core.Annotations;
using NzbDrone.Core.ThingiProvider;
using NzbDrone.Core.Validation;

namespace NzbDrone.Core.Download.Clients.Qnap
{
    public class QnapSettingsValidator : AbstractValidator<QnapSettings>
    {
        public QnapSettingsValidator()
        {
            RuleFor(c => c.Host).ValidHost();
            RuleFor(c => c.Port).InclusiveBetween(1, 65535);
            RuleFor(c => c.Username).NotEmpty();
            RuleFor(c => c.Password).NotEmpty();
        }
    }

    public class QnapSettings : IProviderConfig
    {
        private static readonly QnapSettingsValidator Validator = new QnapSettingsValidator();

        public QnapSettings()
        {
            Host = "localhost";
            Port = 443;
            UseSsl = true;
            TempFolder = "";
            DestinationFolder = "";
        }

        [FieldDefinition(0, Label = "Host", Type = FieldType.Textbox)]
        public string Host { get; set; }

        [FieldDefinition(1, Label = "Port", Type = FieldType.Number)]
        public int Port { get; set; }

        [FieldDefinition(2, Label = "Use SSL", Type = FieldType.Checkbox, HelpText = "Use HTTPS connection")]
        public bool UseSsl { get; set; }

        [FieldDefinition(3, Label = "Username", Type = FieldType.Textbox)]
        public string Username { get; set; }

        [FieldDefinition(4, Label = "Password", Type = FieldType.Password, Privacy = PrivacyLevel.Password)]
        public string Password { get; set; }

        [FieldDefinition(5, Label = "Temp Folder", Type = FieldType.Textbox, Advanced = true, HelpText = "Optional temporary folder for incomplete downloads. Leave empty to use QNAP default.")]
        public string TempFolder { get; set; }

        [FieldDefinition(6, Label = "Destination Folder", Type = FieldType.Textbox, Advanced = true, HelpText = "Optional destination folder for completed downloads. Leave empty to use QNAP default.")]
        public string DestinationFolder { get; set; }

        [FieldDefinition(7, Label = "Category", Type = FieldType.Textbox, Advanced = true, HelpText = "Optional category/label for downloads")]
        public string Category { get; set; }

        public NzbDroneValidationResult Validate()
        {
            return new NzbDroneValidationResult(Validator.Validate(this));
        }
    }
}
