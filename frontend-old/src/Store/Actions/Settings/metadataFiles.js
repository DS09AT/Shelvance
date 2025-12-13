import { createAction } from 'redux-actions';
import createFetchHandler from 'Store/Actions/Creators/createFetchHandler';
import createSaveProviderHandler from 'Store/Actions/Creators/createSaveProviderHandler';
import createSetProviderFieldValueReducer from 'Store/Actions/Creators/Reducers/createSetProviderFieldValueReducer';
import createSetSettingValueReducer from 'Store/Actions/Creators/Reducers/createSetSettingValueReducer';
import { createThunk } from 'Store/thunks';

//
// Variables

const section = 'settings.metadataFiles';

//
// Actions Types

export const FETCH_METADATA_FILES = 'settings/metadataFiles/fetchMetadataFiles';
export const SET_METADATA_FILES_VALUE = 'settings/metadataFiles/setMetadataFilesValue';
export const SET_METADATA_FILES_FIELD_VALUE = 'settings/metadataFiles/setMetadataFilesFieldValue';
export const SAVE_METADATA_FILES = 'settings/metadataFiles/saveMetadataFiles';

//
// Action Creators

export const fetchMetadataFiles = createThunk(FETCH_METADATA_FILES);
export const saveMetadataFiles = createThunk(SAVE_METADATA_FILES);

export const setMetadataFilesValue = createAction(SET_METADATA_FILES_VALUE, (payload) => {
  return {
    section,
    ...payload
  };
});

export const setMetadataFilesFieldValue = createAction(SET_METADATA_FILES_FIELD_VALUE, (payload) => {
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
    isSaving: false,
    saveError: null,
    items: [],
    pendingChanges: {}
  },

  //
  // Action Handlers

  actionHandlers: {
    [FETCH_METADATA_FILES]: createFetchHandler(section, '/metadatafiles'),
    [SAVE_METADATA_FILES]: createSaveProviderHandler(section, '/metadatafiles')
  },

  //
  // Reducers

  reducers: {
    [SET_METADATA_FILES_VALUE]: createSetSettingValueReducer(section),
    [SET_METADATA_FILES_FIELD_VALUE]: createSetProviderFieldValueReducer(section)
  }

};
