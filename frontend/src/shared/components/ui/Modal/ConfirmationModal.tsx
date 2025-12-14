import { Button } from '@/shared/components/ui/Button';
import { Modal } from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isSpinning?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isSpinning = false,
}: ConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="mt-2">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {message}
        </p>
      </div>

      <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-2">
        <Button
          type="button"
          onClick={() => {
            onConfirm();
            // Don't close immediately if spinning, parent handles close after action
            if (!isSpinning) onClose();
          }}
          isLoading={isSpinning}
          className={isDestructive ? 'bg-red-600 hover:bg-red-500 text-white' : ''}
        >
          {confirmLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          {cancelLabel}
        </Button>
      </div>
    </Modal>
  );
}
