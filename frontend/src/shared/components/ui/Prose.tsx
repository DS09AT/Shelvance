import clsx from 'clsx';

interface ProseProps {
  children: React.ReactNode;
  className?: string;
}

export function Prose({ children, className }: ProseProps) {
  return (
    <div className={clsx('prose prose-zinc dark:prose-invert max-w-none', className)}>
      {children}
    </div>
  );
}
