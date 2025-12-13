import clsx from 'clsx';

type TagColor = 'emerald' | 'sky' | 'amber' | 'rose' | 'zinc';

const colorStyles: Record<TagColor, string> = {
  emerald: 'bg-emerald-400/10 text-emerald-500 ring-emerald-300/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
  sky: 'bg-sky-400/10 text-sky-500 ring-sky-300/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20',
  amber: 'bg-amber-400/10 text-amber-500 ring-amber-300/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
  rose: 'bg-rose-400/10 text-rose-500 ring-rose-300/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20',
  zinc: 'bg-zinc-400/10 text-zinc-500 ring-zinc-300/20 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-500/20',
};

interface TagProps {
  children: React.ReactNode;
  color?: TagColor;
  className?: string;
}

export function Tag({ children, color = 'zinc', className }: TagProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
        colorStyles[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
