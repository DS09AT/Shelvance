import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearPendingChanges } from 'Store/Actions/baseActions';
import { cancelSaveMetadataProviders, cancelTestMetadataProviders, saveMetadataProviders, setMetadataProvidersFieldValue, setMetadataProvidersValue, testMetadataProviders } from 'Store/Actions/settingsActions';
import createDeepEqualSelector from 'Store/Selectors/createDeepEqualSelector';
import { selectProviderSettings } from 'Store/Selectors/createProviderSettingsSelector';
import EditMetadataProviderModalContent from './EditMetadataProviderModalContent';

const makeSelector = () => {
  return createDeepEqualSelector(
    (state, { id }) => id,
    (state) => state.settings.metadataProviders,
    (state) => state.settings.advancedSettings,
    (id, section, advancedSettings) => {
      const metadataProvider = selectProviderSettings(section, id);

      return {
        ...metadataProvider,
        advancedSettings
      };
    }
  );
};

function EditMetadataProviderModalContentConnector({ id, ...otherProps }) {
  const dispatch = useDispatch();

  const selector = useMemo(makeSelector, []);

  const stateProps = useSelector((state) => selector(state, { id }));

  const actions = useMemo(
    () => ({
      setMetadataProviderValue: (payload) => dispatch(setMetadataProvidersValue(payload)),
      setMetadataProviderFieldValue: (payload) => dispatch(setMetadataProvidersFieldValue(payload)),
      saveMetadataProvider: (payload) => dispatch(saveMetadataProviders(payload)),
      cancelSaveMetadataProvider: () => dispatch(cancelSaveMetadataProviders()),
      testMetadataProvider: (payload) => dispatch(testMetadataProviders(payload)),
      cancelTestMetadataProvider: () => dispatch(cancelTestMetadataProviders()),
      clearPendingChanges: (payload) => dispatch(clearPendingChanges(payload))
    }),
    [dispatch]
  );

  return (
    <EditMetadataProviderModalContent
      {...stateProps}
      {...actions}
      {...otherProps}
    />
  );
}

EditMetadataProviderModalContentConnector.propTypes = {
  id: PropTypes.number
};

export default EditMetadataProviderModalContentConnector;
