using FluentValidation.Validators;

namespace NzbDrone.Core.ImportLists.Exclusions
{
    public class ImportListExclusionExistsValidator : PropertyValidator
    {
        private readonly IImportListExclusionService _importListExclusionService;

        public ImportListExclusionExistsValidator(IImportListExclusionService importListExclusionService)
        {
            _importListExclusionService = importListExclusionService;
        }

        protected override string GetDefaultMessageTemplate() => "This exclusion has already been added.";

        protected override bool IsValid(PropertyValidatorContext context)
        {
            if (context.PropertyValue == null)
            {
                return true;
            }

            // Try to get ID from the instance being validated using reflection
            var instanceId = 0;
            var instance = context.InstanceToValidate;

            if (instance != null)
            {
                var idProperty = instance.GetType().GetProperty("Id");
                if (idProperty != null)
                {
                    var idValue = idProperty.GetValue(instance);
                    if (idValue is int id)
                    {
                        instanceId = id;
                    }
                }
            }

            return !_importListExclusionService.All().Exists(s => s.ForeignId == context.PropertyValue.ToString() && s.Id != instanceId);
        }
    }
}
