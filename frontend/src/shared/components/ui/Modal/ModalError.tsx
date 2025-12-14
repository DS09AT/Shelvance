import { Button } from '@/shared/components/ui/Button';
import { Modal } from './Modal';
import { ModalHeader } from './ModalHeader';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';

interface ModalErrorProps {
  isOpen: boolean;
  onClose: () => void;
  error?: Error | null;
  title?: string;
  message?: string;
}

export function ModalError({
  isOpen,
  onClose,
  error,
  title = 'Error',
  message = 'There was an error loading this item',
}: ModalErrorProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title={title} onClose={onClose} className="border-b-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20" />
      <ModalBody>
        <div className="text-sm text-zinc-600 dark:text-zinc-300">
          <p>{message}</p>
          {error && (
            <div className="mt-4 rounded-md bg-zinc-100 p-3 font-mono text-xs text-red-600 dark:bg-zinc-800 dark:text-red-400">
              {error.message}
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
}
