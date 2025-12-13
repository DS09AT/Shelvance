import React from 'react';
import Button from 'Components/Link/Button';
import SpinnerButton from 'Components/Link/SpinnerButton';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { kinds } from 'Helpers/Props';
import HistoryDetails from './HistoryDetails.tsx';

interface HistoryDetailsModalProps {
  isOpen: boolean;
  eventType: string;
  sourceTitle: string;
  data: any;
  isMarkingAsFailed?: boolean;
  shortDateFormat: string;
  timeFormat: string;
  onMarkAsFailedPress: () => void;
  onModalClose: () => void;
}

function getHeaderTitle(eventType: string) {
  switch (eventType) {
    case 'grabbed':
      return 'Grabbed';
    case 'downloadFailed':
      return 'Download Failed';
    case 'bookFileImported':
      return 'Book Imported';
    case 'bookFileDeleted':
      return 'Book File Deleted';
    case 'bookFileRenamed':
      return 'Book File Renamed';
    case 'bookFileRetagged':
      return 'Book File Tags Updated';
    case 'bookImportIncomplete':
      return 'Book Import Incomplete';
    case 'downloadImported':
      return 'Download Completed';
    case 'downloadIgnored':
      return 'Download Ignored';
    default:
      return 'Unknown';
  }
}

function HistoryDetailsModal(props: HistoryDetailsModalProps) {
  const {
    isOpen,
    eventType,
    sourceTitle,
    data,
    isMarkingAsFailed = false,
    shortDateFormat,
    timeFormat,
    onMarkAsFailedPress,
    onModalClose
  } = props;

  return (
    <Modal
      isOpen={isOpen}
      onModalClose={onModalClose}
    >
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>
          {getHeaderTitle(eventType)}
        </ModalHeader>

        <ModalBody>
          <HistoryDetails
            eventType={eventType}
            sourceTitle={sourceTitle}
            data={data}
            shortDateFormat={shortDateFormat}
            timeFormat={timeFormat}
          />
        </ModalBody>

        <ModalFooter>
          {
            eventType === 'grabbed' &&
              <SpinnerButton
                className="mr-auto"
                kind={kinds.DANGER}
                isSpinning={isMarkingAsFailed}
                onPress={onMarkAsFailedPress}
              >
                Mark as Failed
              </SpinnerButton>
          }

          <Button
            onPress={onModalClose}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default HistoryDetailsModal;
