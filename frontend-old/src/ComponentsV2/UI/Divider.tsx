import React from 'react';
import { cn } from '../utils/cn';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  label?: string;
}

export function Divider({ orientation = 'horizontal', className, label }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn('h-full w-px bg-zinc-200 dark:bg-zinc-800', className)}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (label) {
    return (
      <div
        className={cn('relative flex items-center', className)}
        role="separator"
        aria-orientation="horizontal"
      >
        <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
        <span className="mx-4 flex-shrink text-sm text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
        <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
      </div>
    );
  }

  return (
    <hr
      className={cn('border-t border-zinc-200 dark:border-zinc-800', className)}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}
