import clsx from 'clsx';

export function PageToolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900", className)}>
      {children}
    </div>
  );
}

export function PageToolbarSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("flex items-center gap-2", className)}>
      {children}
    </div>
  );
}
