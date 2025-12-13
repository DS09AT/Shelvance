import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { selectMetadataProvidersSchema, setMetadataProvidersValue } from 'Store/Actions/settingsActions';
import EditMetadataProviderModal from './EditMetadataProviderModal';

function createMapStateToProps() {
  return createSelector(
    (state) => state.settings.metadataProviders,
    (metadataProviders) => {
      const {
        isFetching,
        error,
        isSaving,
        saveError,
        pendingChanges,
        items
      } = metadataProviders;

      return {
        isFetching,
        error,
        isSaving,
        saveError,
        pendingChanges,
        items
      };
    }
  );
}

const mapDispatchToProps = {
  setMetadataProviderValue: setMetadataProvidersValue,
  selectMetadataProviderSchema: selectMetadataProvidersSchema
};

export default connect(createMapStateToProps, mapDispatchToProps)(EditMetadataProviderModal);
