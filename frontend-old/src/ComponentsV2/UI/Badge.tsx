import React from 'react';
import { cn } from '../utils/cn';
import { badgeVariants, badgeSizes } from '../utils/variants';
import type { ColorVariant, Size } from '../types';

interface BadgeProps {
  variant?: ColorVariant;
  size?: Exclude<Size, 'xl'>;
  className?: string;
  children: React.ReactNode;
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-medium ring-1 ring-inset',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
