import React from 'react';
import Modal from 'Components/Modal/Modal';
import RetagPreviewModalContentConnector from './RetagPreviewModalContentConnector';

interface RetagPreviewModalProps {
  isOpen: boolean;
  onModalClose: () => void;
  authorId: number;
  bookId?: number;
}

function RetagPreviewModal(props: RetagPreviewModalProps) {
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
        <RetagPreviewModalContentConnector
          {...otherProps}
          onModalClose={onModalClose}
        />
      )}
    </Modal>
  );
}

export default RetagPreviewModal;
