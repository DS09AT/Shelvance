import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { fetchMetadataProvidersSchema, selectMetadataProvidersSchema } from 'Store/Actions/settingsActions';
import AddMetadataProviderModalContent from './AddMetadataProviderModalContent';

function createMapStateToProps() {
  return createSelector(
    (state) => state.settings.metadataProviders,
    (metadataProviders) => {
      const {
        isSchemaFetching,
        isSchemaPopulated,
        schemaError,
        schema,
        items
      } = metadataProviders;

      // Filter out provider types that are already added
      const existingImplementations = items.map((item) => item.implementation);
      const availableSchema = schema.filter(
        (provider) => !existingImplementations.includes(provider.implementation)
      );

      return {
        isSchemaFetching,
        isSchemaPopulated,
        schemaError,
        schema: availableSchema
      };
    }
  );
}

const mapDispatchToProps = {
  fetchMetadataProvidersSchema,
  selectMetadataProvidersSchema
};

class AddMetadataProviderModalContentConnector extends Component {

  //
  // Lifecycle

  componentDidMount() {
    this.props.fetchMetadataProvidersSchema();
  }

  //
  // Listeners

  onMetadataProviderSelect = ({ implementation }) => {
    this.props.selectMetadataProvidersSchema({ implementation });
    this.props.onModalClose({ metadataProviderSelected: true });
  };

  //
  // Render

  render() {
    return (
      <AddMetadataProviderModalContent
        {...this.props}
        onMetadataProviderSelect={this.onMetadataProviderSelect}
      />
    );
  }
}

AddMetadataProviderModalContentConnector.propTypes = {
  fetchMetadataProvidersSchema: PropTypes.func.isRequired,
  selectMetadataProvidersSchema: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(AddMetadataProviderModalContentConnector);
