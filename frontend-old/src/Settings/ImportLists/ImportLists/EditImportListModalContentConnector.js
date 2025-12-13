import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  saveImportList,
  setImportListFieldValue,
  setImportListValue,
  testImportList,
  toggleAdvancedSettings
} from 'Store/Actions/settingsActions';
import createDeepEqualSelector from 'Store/Selectors/createDeepEqualSelector';
import { selectProviderSettings } from 'Store/Selectors/createProviderSettingsSelector';
import selectShowMetadataProfile from 'Store/Selectors/selectShowMetadataProfile';
import EditImportListModalContent from './EditImportListModalContent';

const makeSelector = () => {
  return createDeepEqualSelector(
    (state, { id }) => id,
    (state) => state.settings.importLists,
    (state) => state.settings.advancedSettings,
    selectShowMetadataProfile,
    (id, section, advancedSettings, showMetadataProfile) => {
      const providerSettings = selectProviderSettings(section, id);

      return {
        ...providerSettings,
        advancedSettings,
        showMetadataProfile
      };
    }
  );
};

function EditImportListModalContentConnector({ id, onModalClose }) {
  const dispatch = useDispatch();

  const selector = useMemo(makeSelector, []);

  const stateProps = useSelector((state) => selector(state, { id }));

  const { isSaving, saveError } = stateProps;

  const prevIsSavingRef = useRef(isSaving);

  useEffect(() => {
    if (prevIsSavingRef.current && !isSaving && !saveError) {
      onModalClose();
    }
    prevIsSavingRef.current = isSaving;
  }, [isSaving, saveError, onModalClose]);

  const onInputChange = useCallback(
    ({ name, value }) => {
      dispatch(setImportListValue({ name, value }));
    },
    [dispatch]
  );

  const onFieldChange = useCallback(
    ({ name, value }) => {
      dispatch(setImportListFieldValue({ name, value }));
    },
    [dispatch]
  );

  const onSavePress = useCallback(() => {
    dispatch(saveImportList({ id }));
  }, [dispatch, id]);

  const onTestPress = useCallback(() => {
    dispatch(testImportList({ id }));
  }, [dispatch, id]);

  const onAdvancedSettingsPress = useCallback(() => {
    dispatch(toggleAdvancedSettings());
  }, [dispatch]);

  return (
    <EditImportListModalContent
      {...stateProps}
      onSavePress={onSavePress}
      onTestPress={onTestPress}
      onAdvancedSettingsPress={onAdvancedSettingsPress}
      onInputChange={onInputChange}
      onFieldChange={onFieldChange}
      onModalClose={onModalClose}
    />
  );
}

EditImportListModalContentConnector.propTypes = {
  id: PropTypes.number,
  onModalClose: PropTypes.func.isRequired
};

export default EditImportListModalContentConnector;
