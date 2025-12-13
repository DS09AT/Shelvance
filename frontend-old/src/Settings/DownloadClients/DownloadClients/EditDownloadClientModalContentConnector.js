import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  saveDownloadClient,
  setDownloadClientFieldValue,
  setDownloadClientValue,
  testDownloadClient,
  toggleAdvancedSettings
} from 'Store/Actions/settingsActions';
import createDeepEqualSelector from 'Store/Selectors/createDeepEqualSelector';
import { selectProviderSettings } from 'Store/Selectors/createProviderSettingsSelector';
import EditDownloadClientModalContent from './EditDownloadClientModalContent';

const makeSelector = () => {
  return createDeepEqualSelector(
    (state, { id }) => id,
    (state) => state.settings.downloadClients,
    (state) => state.settings.advancedSettings,
    (id, section, advancedSettings) => {
      const downloadClient = selectProviderSettings(section, id);

      return {
        ...downloadClient,
        advancedSettings
      };
    }
  );
};

function EditDownloadClientModalContentConnector({ id, onModalClose }) {
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
      dispatch(setDownloadClientValue({ name, value }));
    },
    [dispatch]
  );

  const onFieldChange = useCallback(
    ({ name, value }) => {
      dispatch(setDownloadClientFieldValue({ name, value }));
    },
    [dispatch]
  );

  const onSavePress = useCallback(() => {
    dispatch(saveDownloadClient({ id }));
  }, [dispatch, id]);

  const onTestPress = useCallback(() => {
    dispatch(testDownloadClient({ id }));
  }, [dispatch, id]);

  const onAdvancedSettingsPress = useCallback(() => {
    dispatch(toggleAdvancedSettings());
  }, [dispatch]);

  return (
    <EditDownloadClientModalContent
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

EditDownloadClientModalContentConnector.propTypes = {
  id: PropTypes.number,
  onModalClose: PropTypes.func.isRequired
};

export default EditDownloadClientModalContentConnector;
