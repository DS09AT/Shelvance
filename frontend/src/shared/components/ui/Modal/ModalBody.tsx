import clsx from 'clsx';

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={clsx("px-4 py-4 sm:px-6 overflow-y-auto max-h-[calc(100vh-200px)]", className)}>
      {children}
    </div>
  );
}
