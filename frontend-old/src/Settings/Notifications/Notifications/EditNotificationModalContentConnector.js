import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  saveNotification,
  setNotificationFieldValue,
  setNotificationValue,
  testNotification,
  toggleAdvancedSettings
} from 'Store/Actions/settingsActions';
import createDeepEqualSelector from 'Store/Selectors/createDeepEqualSelector';
import { selectProviderSettings } from 'Store/Selectors/createProviderSettingsSelector';
import EditNotificationModalContent from './EditNotificationModalContent';

const makeSelector = () => {
  return createDeepEqualSelector(
    (state, { id }) => id,
    (state) => state.settings.notifications,
    (state) => state.settings.advancedSettings,
    (id, section, advancedSettings) => {
      const notification = selectProviderSettings(section, id);

      return {
        ...notification,
        advancedSettings
      };
    }
  );
};

function EditNotificationModalContentConnector({ id, onModalClose }) {
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
      dispatch(setNotificationValue({ name, value }));
    },
    [dispatch]
  );

  const onFieldChange = useCallback(
    ({ name, value }) => {
      dispatch(setNotificationFieldValue({ name, value }));
    },
    [dispatch]
  );

  const onSavePress = useCallback(() => {
    dispatch(saveNotification({ id }));
  }, [dispatch, id]);

  const onTestPress = useCallback(() => {
    dispatch(testNotification({ id }));
  }, [dispatch, id]);

  const onAdvancedSettingsPress = useCallback(() => {
    dispatch(toggleAdvancedSettings());
  }, [dispatch]);

  return (
    <EditNotificationModalContent
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

EditNotificationModalContentConnector.propTypes = {
  id: PropTypes.number,
  onModalClose: PropTypes.func.isRequired
};

export default EditNotificationModalContentConnector;
