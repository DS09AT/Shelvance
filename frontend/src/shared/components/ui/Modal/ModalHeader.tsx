import clsx from 'clsx';
import { DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';

interface ModalHeaderProps {
  children?: React.ReactNode;
  title?: string;
  onClose?: () => void;
  className?: string;
}

export function ModalHeader({ children, title, onClose, className }: ModalHeaderProps) {
  return (
    <div className={clsx("flex items-center justify-between px-4 py-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800", className)}>
      {title && (
        <DialogTitle as="h3" className="text-base font-semibold leading-6 text-zinc-900 dark:text-white">
          {title}
        </DialogTitle>
      )}
      {children}
      {onClose && (
        <button
          type="button"
          className="ml-auto rounded-md bg-white text-zinc-400 hover:text-zinc-500 focus:outline-hidden dark:bg-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-400"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
