import React from 'react';
import { cn } from '../utils/cn';

interface TableProps {
  className?: string;
  children: React.ReactNode;
}

export function Table({ className, children }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className={cn('w-full border-collapse', className)}>{children}</table>
    </div>
  );
}

interface TableHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function TableHeader({ className, children }: TableHeaderProps) {
  return (
    <thead
      className={cn('bg-zinc-50 dark:bg-zinc-900/50', className)}
    >
      {children}
    </thead>
  );
}

interface TableBodyProps {
  className?: string;
  children: React.ReactNode;
}

export function TableBody({ className, children }: TableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

interface TableRowProps {
  className?: string;
  isSelected?: boolean;
  isHoverable?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function TableRow({
  className,
  isSelected = false,
  isHoverable = true,
  onClick,
  children,
}: TableRowProps) {
  return (
    <tr
      className={cn(
        'border-b border-zinc-200 dark:border-zinc-800',
        isHoverable && 'transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50',
        isSelected && 'bg-emerald-50 dark:bg-emerald-900/20',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps {
  className?: string;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export function TableHead({
  className,
  sortable = false,
  sortDirection = null,
  onSort,
  align = 'left',
  children,
}: TableHeadProps) {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <th
      className={cn(
        'px-4 py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100',
        alignStyles[align],
        sortable && 'cursor-pointer select-none hover:bg-zinc-100 dark:hover:bg-zinc-800',
        className
      )}
      onClick={sortable ? onSort : undefined}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <span className="text-zinc-400">
            {sortDirection === 'asc' && '↑'}
            {sortDirection === 'desc' && '↓'}
            {!sortDirection && '↕'}
          </span>
        )}
      </div>
    </th>
  );
}

interface TableCellProps {
  className?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export function TableCell({ className, align = 'left', children }: TableCellProps) {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <td
      className={cn(
        'px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300',
        alignStyles[align],
        className
      )}
    >
      {children}
    </td>
  );
}
