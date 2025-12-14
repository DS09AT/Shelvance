import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

interface PageToolbarButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  icon?: LucideIcon;
  label?: string;
  active?: boolean;
}

export function PageToolbarButton({ icon: Icon, label, className, active, ...props }: PageToolbarButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        "group flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition cursor-pointer",
        "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
        "dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
        active && "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label && <span>{label}</span>}
    </button>
  );
}
