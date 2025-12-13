import React from 'react';
import Modal from 'Components/Modal/Modal';
import OrganizePreviewModalContentConnector from './OrganizePreviewModalContentConnector';

interface OrganizePreviewModalProps {
  isOpen: boolean;
  onModalClose: () => void;
  authorId: number;
  bookId?: number;
}

function OrganizePreviewModal(props: OrganizePreviewModalProps) {
  const {
    isOpen,
    onModalClose,
    ...otherProps
  } = props;

  return (
    <Modal
      isOpen={isOpen}
      onModalClose={onModalClose}
    >
      {isOpen && (
        <OrganizePreviewModalContentConnector
          {...otherProps}
          onModalClose={onModalClose}
        />
      )}
    </Modal>
  );
}

export default OrganizePreviewModal;
