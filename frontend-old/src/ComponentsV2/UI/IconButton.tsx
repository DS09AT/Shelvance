import React from 'react';
import { cn } from '../utils/cn';
import { buttonSizes } from '../utils/variants';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'default' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isRound?: boolean;
  ariaLabel: string;
}

const iconButtonVariants = {
  default:
    'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-300 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:border-zinc-700',
  ghost:
    'bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
  danger:
    'bg-transparent text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300',
};

const iconButtonSizes = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
};

export function IconButton({
  icon,
  variant = 'default',
  size = 'md',
  isRound = false,
  ariaLabel,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        isRound ? 'rounded-full' : 'rounded-lg',
        iconButtonVariants[variant],
        iconButtonSizes[size],
        className
      )}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </button>
  );
}
