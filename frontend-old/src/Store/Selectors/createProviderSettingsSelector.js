import createDeepEqualSelector from 'Store/Selectors/createDeepEqualSelector';
import selectSettings from 'Store/Selectors/selectSettings';

export function selectProviderSettings(section, id) {
  if (!section) {
    return {
      isFetching: false,
      isPopulated: false,
      error: null,
      isSaving: false,
      saveError: null,
      isTesting: false,
      pendingChanges: {},
      settings: {},
      item: {}
    };
  }

  if (!id) {
    const item = Array.isArray(section.schema) ? section.selectedSchema : section.schema;
    const settings = selectSettings(Object.assign({ name: '' }, item), section.pendingChanges, section.saveError);

    const {
      isSchemaFetching: isFetching,
      isSchemaPopulated: isPopulated,
      schemaError: error,
      isSaving,
      saveError,
      isTesting,
      pendingChanges
    } = section;

    return {
      isFetching,
      isPopulated,
      error,
      isSaving,
      saveError,
      isTesting,
      pendingChanges,
      ...settings,
      item: settings.settings
    };
  }

  const {
    isFetching,
    isPopulated,
    error,
    isSaving,
    saveError,
    isTesting,
    pendingChanges
  } = section;

  const target = section.items ? section.items.find((el) => el.id === id) : null;
  const settings = selectSettings(target, pendingChanges, saveError);

  return {
    isFetching,
    isPopulated,
    error,
    isSaving,
    saveError,
    isTesting,
    ...settings,
    item: settings.settings
  };
}

function createProviderSettingsSelector(sectionName) {
  return createDeepEqualSelector(
    (state, { id }) => id,
    (state) => state.settings[sectionName],
    selectProviderSettings
  );
}

export default createProviderSettingsSelector;
