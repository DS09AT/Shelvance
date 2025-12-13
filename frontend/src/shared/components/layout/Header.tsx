import clsx from 'clsx';

import { Logo } from '@/shared/components/ui/Logo';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';

interface HeaderProps {
  title?: string;
  className?: string;
}

export function Header({ title = 'Readarr', className }: HeaderProps) {
  return (
    <header
      className={clsx(
        'sticky top-0 z-50 flex h-14 items-center justify-between gap-12 border-b border-zinc-900/10 bg-white/90 px-4 backdrop-blur-sm transition sm:px-6 lg:px-8 dark:border-white/10 dark:bg-zinc-900/90',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <Logo className="h-6" />
        {title && (
          <h1 className="text-sm font-semibold text-zinc-900 dark:text-white">
            {title}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
