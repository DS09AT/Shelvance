import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { fetchMetadataFiles } from 'Store/Actions/settingsActions';
import createSortedSectionSelector from 'Store/Selectors/createSortedSectionSelector';
import sortByName from 'Utilities/Array/sortByName';
import MetadataFiles from './MetadataFiles.tsx';

function createMapStateToProps() {
  return createSortedSectionSelector('settings.metadataFiles', sortByName);
}

const mapDispatchToProps = {
  fetchMetadataFiles
};

class MetadataFilesConnector extends Component {

  //
  // Lifecycle

  componentDidMount() {
    this.props.fetchMetadataFiles();
  }

  //
  // Render

  render() {
    return (
      <MetadataFiles
        {...this.props}
        onConfirmDeleteMetadata={this.onConfirmDeleteMetadata}
      />
    );
  }
}

MetadataFilesConnector.propTypes = {
  fetchMetadataFiles: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(MetadataFilesConnector);
