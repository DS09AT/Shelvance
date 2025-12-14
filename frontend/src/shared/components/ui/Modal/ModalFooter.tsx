import clsx from 'clsx';

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={clsx("flex flex-row-reverse gap-2 bg-zinc-50 px-4 py-3 sm:px-6 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800", className)}>
      {children}
    </div>
  );
}
