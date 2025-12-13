import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { saveMetadataFiles, setMetadataFilesFieldValue, setMetadataFilesValue } from 'Store/Actions/settingsActions';
import selectSettings from 'Store/Selectors/selectSettings';
import EditMetadataFileModalContent from './EditMetadataFileModalContent';

function createMapStateToProps() {
  return createSelector(
    (state, { id }) => id,
    (state) => state.settings.metadata,
    (id, metadata) => {
      const {
        isSaving,
        saveError,
        pendingChanges,
        items
      } = metadata;

      const settings = selectSettings(_.find(items, { id }), pendingChanges, saveError);

      return {
        id,
        isSaving,
        saveError,
        item: settings.settings,
        ...settings
      };
    }
  );
}

const mapDispatchToProps = {
  setMetadataFilesValue,
  setMetadataFilesFieldValue,
  saveMetadataFiles
};

class EditMetadataFileModalContentConnector extends Component {

  //
  // Lifecycle

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isSaving && !this.props.isSaving && !this.props.saveError) {
      this.props.onModalClose();
    }
  }

  //
  // Listeners

  onInputChange = ({ name, value }) => {
    this.props.setMetadataFilesValue({ name, value });
  };

  onFieldChange = ({ name, value }) => {
    this.props.setMetadataFilesFieldValue({ name, value });
  };

  onSavePress = () => {
    this.props.saveMetadataFiles({ id: this.props.id });
  };

  //
  // Render

  render() {
    return (
      <EditMetadataFileModalContent
        {...this.props}
        onSavePress={this.onSavePress}
        onInputChange={this.onInputChange}
        onFieldChange={this.onFieldChange}
      />
    );
  }
}

EditMetadataFileModalContentConnector.propTypes = {
  id: PropTypes.number,
  isSaving: PropTypes.bool.isRequired,
  saveError: PropTypes.object,
  item: PropTypes.object.isRequired,
  setMetadataFilesValue: PropTypes.func.isRequired,
  setMetadataFilesFieldValue: PropTypes.func.isRequired,
  saveMetadataFiles: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(EditMetadataFileModalContentConnector);

