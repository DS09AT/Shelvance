import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'Components/Modal/Modal';
import AddMetadataProviderModalContentConnector from './AddMetadataProviderModalContentConnector';

function AddMetadataProviderModal({ isOpen, onModalClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onModalClose={onModalClose}
    >
      <AddMetadataProviderModalContentConnector
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

AddMetadataProviderModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default AddMetadataProviderModal;
