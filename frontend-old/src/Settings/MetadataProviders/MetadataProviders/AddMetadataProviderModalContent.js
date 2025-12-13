import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Alert from 'Components/Alert';
import Button from 'Components/Link/Button';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { kinds, scrollDirections } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import AddMetadataProviderItem from './AddMetadataProviderItem';
import styles from './AddMetadataProviderModalContent.css';

class AddMetadataProviderModalContent extends Component {

  //
  // Render

  render() {
    const {
      isSchemaFetching,
      isSchemaPopulated,
      schemaError,
      schema,
      onMetadataProviderSelect,
      onModalClose
    } = this.props;

    return (
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>
          {translate('AddMetadataProvider')}
        </ModalHeader>

        <ModalBody
          className={styles.modalBody}
          scrollDirection={scrollDirections.NONE}
        >
          {
            isSchemaFetching &&
              <LoadingIndicator />
          }

          {
            !isSchemaFetching && !!schemaError &&
              <Alert kind={kinds.DANGER}>
                {translate('UnableToAddNewMetadataProviderPleaseTryAgain')}
              </Alert>
          }

          {
            isSchemaPopulated && !schemaError && schema.length === 0 &&
              <div className={styles.message}>
                <Alert kind={kinds.INFO}>
                  <div>
                    {translate('AllMetadataProvidersHaveBeenAdded')}
                  </div>
                </Alert>
              </div>
          }

          {
            isSchemaPopulated && !schemaError && schema.length > 0 &&
              <div className={styles.metadataProviders}>
                {
                  schema.map((metadataProvider) => {
                    return (
                      <AddMetadataProviderItem
                        key={metadataProvider.implementation}
                        implementation={metadataProvider.implementation}
                        {...metadataProvider}
                        onMetadataProviderSelect={onMetadataProviderSelect}
                      />
                    );
                  })
                }
              </div>
          }
        </ModalBody>

        <ModalFooter>
          <Button
            onPress={onModalClose}
          >
            {translate('Close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    );
  }
}

AddMetadataProviderModalContent.propTypes = {
  isSchemaFetching: PropTypes.bool.isRequired,
  isSchemaPopulated: PropTypes.bool.isRequired,
  schemaError: PropTypes.object,
  schema: PropTypes.arrayOf(PropTypes.object).isRequired,
  onMetadataProviderSelect: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default AddMetadataProviderModalContent;
