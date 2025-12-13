import React from 'react';
import { cn } from '../utils/cn';

export interface ProgressBarProps {
  /** Progress percentage (0-100) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** Show label inside bar */
  showLabel?: boolean;
  /** Custom label text */
  label?: string;
  /** Additional className for container */
  className?: string;
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-4',
};

const variantStyles = {
  primary: 'bg-emerald-500 dark:bg-emerald-600',
  success: 'bg-green-500 dark:bg-green-600',
  warning: 'bg-amber-500 dark:bg-amber-600',
  danger: 'bg-red-500 dark:bg-red-600',
  info: 'bg-blue-500 dark:bg-blue-600',
};

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayLabel = label || `${Math.round(percentage)}%`;

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800',
          sizeStyles[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-in-out',
            variantStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        >
          {showLabel && size === 'lg' && (
            <span className="flex h-full items-center justify-center text-xs font-medium text-white">
              {displayLabel}
            </span>
          )}
        </div>
      </div>
      {showLabel && size !== 'lg' && (
        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          {displayLabel}
        </div>
      )}
    </div>
  );
}
