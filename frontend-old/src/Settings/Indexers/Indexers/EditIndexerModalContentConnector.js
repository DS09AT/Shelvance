import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveIndexer, setIndexerFieldValue, setIndexerValue, testIndexer, toggleAdvancedSettings } from 'Store/Actions/settingsActions';
import createDeepEqualSelector from 'Store/Selectors/createDeepEqualSelector';
import { selectProviderSettings } from 'Store/Selectors/createProviderSettingsSelector';
import EditIndexerModalContent from './EditIndexerModalContent';

const makeSelector = () => {
  return createDeepEqualSelector(
    (state, { id }) => id,
    (state) => state.settings.indexers,
    (state) => state.settings.advancedSettings,
    (id, section, advancedSettings) => {
      const indexer = selectProviderSettings(section, id);

      return {
        ...indexer,
        advancedSettings
      };
    }
  );
};

function EditIndexerModalContentConnector({ id, onModalClose }) {
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
      dispatch(setIndexerValue({ name, value }));
    },
    [dispatch]
  );

  const onFieldChange = useCallback(
    ({ name, value }) => {
      dispatch(setIndexerFieldValue({ name, value }));
    },
    [dispatch]
  );

  const onSavePress = useCallback(() => {
    dispatch(saveIndexer({ id }));
  }, [dispatch, id]);

  const onTestPress = useCallback(() => {
    dispatch(testIndexer({ id }));
  }, [dispatch, id]);

  const onAdvancedSettingsPress = useCallback(() => {
    dispatch(toggleAdvancedSettings());
  }, [dispatch]);

  return (
    <EditIndexerModalContent
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

EditIndexerModalContentConnector.propTypes = {
  id: PropTypes.number,
  onModalClose: PropTypes.func.isRequired
};

export default EditIndexerModalContentConnector;
