import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearPendingChanges } from 'Store/Actions/baseActions';
import EditMetadataFileModal from './EditMetadataFileModal';

function createMapDispatchToProps(dispatch, props) {
  const section = 'settings.metadataFiles';

  return {
    dispatchClearPendingChanges() {
      dispatch(clearPendingChanges({ section }));
    }
  };
}

class EditMetadataFileModalConnector extends Component {

  //
  // Listeners

  onModalClose = () => {
    this.props.dispatchClearPendingChanges();
    this.props.onModalClose();
  };

  //
  // Render

  render() {
    return (
      <EditMetadataFileModal
        {...this.props}
        onModalClose={this.onModalClose}
      />
    );
  }
}

EditMetadataFileModalConnector.propTypes = {
  onModalClose: PropTypes.func.isRequired,
  dispatchClearPendingChanges: PropTypes.func.isRequired
};

export default connect(null, createMapDispatchToProps)(EditMetadataFileModalConnector);

