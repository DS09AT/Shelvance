import { createAction } from 'redux-actions';
import { sortDirections } from 'Helpers/Props';
import createFetchHandler from 'Store/Actions/Creators/createFetchHandler';
import createFetchSchemaHandler from 'Store/Actions/Creators/createFetchSchemaHandler';
import createRemoveItemHandler from 'Store/Actions/Creators/createRemoveItemHandler';
import createSaveProviderHandler, { createCancelSaveProviderHandler } from 'Store/Actions/Creators/createSaveProviderHandler';
import createTestProviderHandler, { createCancelTestProviderHandler } from 'Store/Actions/Creators/createTestProviderHandler';
import createSetProviderFieldValueReducer from 'Store/Actions/Creators/Reducers/createSetProviderFieldValueReducer';
import createSetSettingValueReducer from 'Store/Actions/Creators/Reducers/createSetSettingValueReducer';
import { createThunk } from 'Store/thunks';
import getSectionState from 'Utilities/State/getSectionState';
import selectProviderSchema from 'Utilities/State/selectProviderSchema';
import updateSectionState from 'Utilities/State/updateSectionState';

//
// Variables

const section = 'settings.metadataProviders';

//
// Actions Types

export const FETCH_METADATA_PROVIDERS = 'settings/metadataProviders/fetchMetadataProviders';
export const FETCH_METADATA_PROVIDERS_SCHEMA = 'settings/metadataProviders/fetchMetadataProvidersSchema';
export const SELECT_METADATA_PROVIDERS_SCHEMA = 'settings/metadataProviders/selectMetadataProvidersSchema';
export const SET_METADATA_PROVIDERS_VALUE = 'settings/metadataProviders/setMetadataProvidersValue';
export const SET_METADATA_PROVIDERS_FIELD_VALUE = 'settings/metadataProviders/setMetadataProvidersFieldValue';
export const SAVE_METADATA_PROVIDERS = 'settings/metadataProviders/saveMetadataProviders';
export const CANCEL_SAVE_METADATA_PROVIDERS = 'settings/metadataProviders/cancelSaveMetadataProviders';
export const DELETE_METADATA_PROVIDERS = 'settings/metadataProviders/deleteMetadataProviders';
export const TEST_METADATA_PROVIDERS = 'settings/metadataProviders/testMetadataProviders';
export const CANCEL_TEST_METADATA_PROVIDERS = 'settings/metadataProviders/cancelTestMetadataProviders';

//
// Action Creators

export const fetchMetadataProviders = createThunk(FETCH_METADATA_PROVIDERS);
export const fetchMetadataProvidersSchema = createThunk(FETCH_METADATA_PROVIDERS_SCHEMA);
export const selectMetadataProvidersSchema = createAction(SELECT_METADATA_PROVIDERS_SCHEMA);

export const saveMetadataProviders = createThunk(SAVE_METADATA_PROVIDERS);
export const cancelSaveMetadataProviders = createThunk(CANCEL_SAVE_METADATA_PROVIDERS);
export const deleteMetadataProviders = createThunk(DELETE_METADATA_PROVIDERS);
export const testMetadataProviders = createThunk(TEST_METADATA_PROVIDERS);
export const cancelTestMetadataProviders = createThunk(CANCEL_TEST_METADATA_PROVIDERS);

export const setMetadataProvidersValue = createAction(SET_METADATA_PROVIDERS_VALUE, (payload) => {
  return {
    section,
    ...payload
  };
});

export const setMetadataProvidersFieldValue = createAction(SET_METADATA_PROVIDERS_FIELD_VALUE, (payload) => {
  return {
    section,
    ...payload
  };
});

//
// Details

export default {

  //
  // State

  defaultState: {
    isFetching: false,
    isPopulated: false,
    error: null,
    isSchemaFetching: false,
    isSchemaPopulated: false,
    schemaError: null,
    schema: [],
    selectedSchema: {},
    isSaving: false,
    saveError: null,
    isDeleting: false,
    deleteError: null,
    isTesting: false,
    items: [],
    pendingChanges: {},
    sortKey: 'priority',
    sortDirection: sortDirections.DESCENDING,
    sortPredicates: {
      priority: function(item) {
        return item.priority || 0;
      },
      name: function(item) {
        return item.name.toLowerCase();
      }
    }
  },

  //
  // Action Handlers

  actionHandlers: {
    [FETCH_METADATA_PROVIDERS]: createFetchHandler(section, '/metadataprovider'),
    [FETCH_METADATA_PROVIDERS_SCHEMA]: createFetchSchemaHandler(section, '/metadataprovider/schema'),

    [SAVE_METADATA_PROVIDERS]: createSaveProviderHandler(section, '/metadataprovider'),
    [CANCEL_SAVE_METADATA_PROVIDERS]: createCancelSaveProviderHandler(section),
    [DELETE_METADATA_PROVIDERS]: createRemoveItemHandler(section, '/metadataprovider'),
    [TEST_METADATA_PROVIDERS]: createTestProviderHandler(section, '/metadataprovider'),
    [CANCEL_TEST_METADATA_PROVIDERS]: createCancelTestProviderHandler(section)
  },

  //
  // Reducers

  reducers: {
    [SET_METADATA_PROVIDERS_VALUE]: createSetSettingValueReducer(section),
    [SET_METADATA_PROVIDERS_FIELD_VALUE]: createSetProviderFieldValueReducer(section),

    [SELECT_METADATA_PROVIDERS_SCHEMA]: (state, { payload }) => {
      return selectProviderSchema(state, section, payload, (selectedSchema) => {
        selectedSchema.enable = true;
        selectedSchema.enableAuthorSearch = selectedSchema.supportsAuthorSearch;
        selectedSchema.enableBookSearch = selectedSchema.supportsBookSearch;
        selectedSchema.enableInteractiveSearch = selectedSchema.supportsInteractiveSearch;

        return selectedSchema;
      });
    }
  }

};
