import React from 'react';
import Button from 'Components/Link/Button';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import Scroller from 'Components/Scroller/Scroller';
import { scrollDirections } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

interface LogsTableDetailsModalProps {
  isOpen: boolean;
  message: string;
  exception?: string;
  onModalClose: () => void;
}

function LogsTableDetailsModal(props: LogsTableDetailsModalProps) {
  const { isOpen, message, exception, onModalClose } = props;

  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>Details</ModalHeader>

        <ModalBody>
          <div className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">
            {translate('Message')}
          </div>

          <Scroller
            className="mb-3 block overflow-auto whitespace-pre break-all rounded border border-zinc-300 bg-zinc-50 p-2 font-mono text-xs leading-relaxed text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            scrollDirection={scrollDirections.HORIZONTAL}
          >
            {message}
          </Scroller>

          {!!exception && (
            <div>
              <div className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">
                {translate('Exception')}
              </div>
              <Scroller
                className="mb-3 block overflow-auto whitespace-pre break-all rounded border border-zinc-300 bg-zinc-50 p-2 font-mono text-xs leading-relaxed text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                scrollDirection={scrollDirections.HORIZONTAL}
              >
                {exception}
              </Scroller>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onPress={onModalClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default LogsTableDetailsModal;
