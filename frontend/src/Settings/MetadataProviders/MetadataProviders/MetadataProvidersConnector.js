import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { deleteMetadataProviders, fetchMetadataProviders } from 'Store/Actions/settingsActions';
import createSortedSectionSelector from 'Store/Selectors/createSortedSectionSelector';
import sortByName from 'Utilities/Array/sortByName';
import MetadataProviders from './MetadataProviders';

function createMapStateToProps() {
  return createSortedSectionSelector('settings.metadataProviders', sortByName);
}

const mapDispatchToProps = {
  dispatchFetchMetadataProviders: fetchMetadataProviders,
  dispatchDeleteMetadataProvider: deleteMetadataProviders
};

class MetadataProvidersConnector extends Component {

  //
  // Lifecycle

  componentDidMount() {
    this.props.dispatchFetchMetadataProviders();
  }

  //
  // Listeners

  onConfirmDeleteMetadataProvider = (id) => {
    this.props.dispatchDeleteMetadataProvider({ id });
  };

  //
  // Render

  render() {
    return (
      <MetadataProviders
        {...this.props}
        onConfirmDeleteMetadataProvider={this.onConfirmDeleteMetadataProvider}
      />
    );
  }
}

MetadataProvidersConnector.propTypes = {
  dispatchFetchMetadataProviders: PropTypes.func.isRequired,
  dispatchDeleteMetadataProvider: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(MetadataProvidersConnector);
