import React from 'react';
import { cn } from '../utils/cn';

export interface DescriptionListItem {
  term: string;
  description: React.ReactNode;
}

export interface DescriptionListProps {
  /** List items with term and description */
  items: DescriptionListItem[];
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Divider between items */
  divided?: boolean;
  /** Additional className */
  className?: string;
}

const sizeStyles = {
  sm: {
    term: 'text-xs',
    description: 'text-xs',
    gap: 'gap-1',
  },
  md: {
    term: 'text-sm',
    description: 'text-sm',
    gap: 'gap-2',
  },
  lg: {
    term: 'text-base',
    description: 'text-base',
    gap: 'gap-3',
  },
};

export function DescriptionList({
  items,
  orientation = 'horizontal',
  size = 'md',
  divided = false,
  className,
}: DescriptionListProps) {
  const styles = sizeStyles[size];

  return (
    <dl className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            orientation === 'horizontal'
              ? 'flex justify-between'
              : 'flex flex-col',
            styles.gap,
            divided && index !== 0 && 'border-t border-zinc-200 dark:border-zinc-800 pt-4'
          )}
        >
          <dt
            className={cn(
              'font-medium text-zinc-900 dark:text-zinc-100',
              styles.term,
              orientation === 'horizontal' && 'flex-shrink-0'
            )}
          >
            {item.term}
          </dt>
          <dd
            className={cn(
              'text-zinc-600 dark:text-zinc-400',
              styles.description,
              orientation === 'horizontal' && 'text-right'
            )}
          >
            {item.description}
          </dd>
        </div>
      ))}
    </dl>
  );
}
