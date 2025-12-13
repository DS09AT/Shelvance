import React from 'react';
import { cn } from '../utils/cn';

export interface FieldSetProps {
  /** Legend text */
  legend?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Children content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

const sizeStyles = {
  sm: {
    legend: 'text-sm',
    padding: 'p-3',
  },
  md: {
    legend: 'text-base',
    padding: 'p-4',
  },
  lg: {
    legend: 'text-lg',
    padding: 'p-6',
  },
};

export function FieldSet({ legend, size = 'md', children, className }: FieldSetProps) {
  const styles = sizeStyles[size];

  return (
    <fieldset
      className={cn(
        'rounded-lg border border-zinc-200 dark:border-zinc-800',
        styles.padding,
        className
      )}
    >
      {legend && (
        <legend
          className={cn(
            'px-2 font-semibold text-zinc-900 dark:text-zinc-100',
            styles.legend
          )}
        >
          {legend}
        </legend>
      )}
      {children}
    </fieldset>
  );
}
