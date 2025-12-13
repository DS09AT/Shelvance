import { createAction } from 'redux-actions';
import createFetchHandler from 'Store/Actions/Creators/createFetchHandler';
import createSaveHandler from 'Store/Actions/Creators/createSaveHandler';
import createSetSettingValueReducer from 'Store/Actions/Creators/Reducers/createSetSettingValueReducer';
import { createThunk } from 'Store/thunks';

//
// Variables

const section = 'settings.metadataExport';

//
// Actions Types

export const FETCH_METADATA_EXPORT = 'settings/metadataExport/fetchMetadataExport';
export const SET_METADATA_EXPORT_VALUE = 'settings/metadataExport/setMetadataExportValue';
export const SAVE_METADATA_EXPORT = 'settings/metadataExport/saveMetadataExport';

//
// Action Creators

export const fetchMetadataExport = createThunk(FETCH_METADATA_EXPORT);
export const saveMetadataExport = createThunk(SAVE_METADATA_EXPORT);
export const setMetadataExportValue = createAction(SET_METADATA_EXPORT_VALUE, (payload) => {
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
    pendingChanges: {},
    isSaving: false,
    saveError: null,
    item: {}
  },

  //
  // Action Handlers

  actionHandlers: {
    [FETCH_METADATA_EXPORT]: createFetchHandler(section, '/config/metadataexport'),
    [SAVE_METADATA_EXPORT]: createSaveHandler(section, '/config/metadataexport')
  },

  //
  // Reducers

  reducers: {
    [SET_METADATA_EXPORT_VALUE]: createSetSettingValueReducer(section)
  }

};
