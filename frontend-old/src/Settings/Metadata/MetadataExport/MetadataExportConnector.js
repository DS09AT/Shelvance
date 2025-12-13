import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { clearPendingChanges } from 'Store/Actions/baseActions';
import { fetchMetadataExport, saveMetadataExport, setMetadataExportValue } from 'Store/Actions/settingsActions';
import createSettingsSectionSelector from 'Store/Selectors/createSettingsSectionSelector';
import MetadataExport from './MetadataExport';

const SECTION = 'metadataExport';

function createMapStateToProps() {
  return createSelector(
    (state) => state.settings.advancedSettings,
    createSettingsSectionSelector(SECTION),
    (advancedSettings, sectionSettings) => {
      return {
        advancedSettings,
        ...sectionSettings
      };
    }
  );
}

const mapDispatchToProps = {
  dispatchFetchMetadataExport: fetchMetadataExport,
  dispatchSetMetadataExportValue: setMetadataExportValue,
  dispatchSaveMetadataExport: saveMetadataExport,
  dispatchClearPendingChanges: clearPendingChanges
};

class MetadataExportConnector extends Component {

  //
  // Lifecycle

  componentDidMount() {
    const {
      dispatchFetchMetadataExport,
      dispatchSaveMetadataExport,
      onChildMounted
    } = this.props;

    dispatchFetchMetadataExport();
    onChildMounted(dispatchSaveMetadataExport);
  }

  componentDidUpdate(prevProps) {
    const {
      hasPendingChanges,
      isSaving,
      onChildStateChange
    } = this.props;

    if (
      prevProps.isSaving !== isSaving ||
      prevProps.hasPendingChanges !== hasPendingChanges
    ) {
      onChildStateChange({
        isSaving,
        hasPendingChanges
      });
    }
  }

  componentWillUnmount() {
    this.props.dispatchClearPendingChanges({ section: 'settings.metadataExport' });
  }

  //
  // Listeners

  onInputChange = ({ name, value }) => {
    this.props.dispatchSetMetadataExportValue({ name, value });
  };

  //
  // Render

  render() {
    return (
      <MetadataExport
        onInputChange={this.onInputChange}
        {...this.props}
      />
    );
  }
}

MetadataExportConnector.propTypes = {
  isSaving: PropTypes.bool.isRequired,
  hasPendingChanges: PropTypes.bool.isRequired,
  dispatchFetchMetadataExport: PropTypes.func.isRequired,
  dispatchSetMetadataExportValue: PropTypes.func.isRequired,
  dispatchSaveMetadataExport: PropTypes.func.isRequired,
  dispatchClearPendingChanges: PropTypes.func.isRequired,
  onChildMounted: PropTypes.func.isRequired,
  onChildStateChange: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(MetadataExportConnector);
