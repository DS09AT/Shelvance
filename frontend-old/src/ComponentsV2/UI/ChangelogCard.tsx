import React from 'react';
import { cn } from '../utils/cn';
import { Card } from './Card';
import { Badge } from './Badge';

export interface ChangelogEntry {
  /** Change type */
  type: 'new' | 'fixed' | 'improved' | 'changed' | 'removed';
  /** Change description */
  description: string;
}

export interface ChangelogCardProps {
  /** Version number */
  version: string;
  /** Release date */
  date?: string;
  /** List of changes */
  changes: ChangelogEntry[];
  /** Is this the current version */
  isCurrent?: boolean;
  /** Additional className */
  className?: string;
}

const typeConfig = {
  new: {
    label: 'New',
    variant: 'success' as const,
    icon: '✨',
  },
  fixed: {
    label: 'Fixed',
    variant: 'danger' as const,
    icon: '🐛',
  },
  improved: {
    label: 'Improved',
    variant: 'info' as const,
    icon: '⚡',
  },
  changed: {
    label: 'Changed',
    variant: 'warning' as const,
    icon: '🔄',
  },
  removed: {
    label: 'Removed',
    variant: 'neutral' as const,
    icon: '🗑️',
  },
};

export function ChangelogCard({
  version,
  date,
  changes,
  isCurrent = false,
  className,
}: ChangelogCardProps) {
  return (
    <Card variant="bordered" className={cn('relative', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Version {version}
          </h3>
          {isCurrent && (
            <Badge variant="success" size="sm">
              Current
            </Badge>
          )}
        </div>
        {date && (
          <time className="text-sm text-zinc-500 dark:text-zinc-400">{date}</time>
        )}
      </div>

      {/* Changes List */}
      <ul className="space-y-3">
        {changes.map((change, index) => {
          const config = typeConfig[change.type];
          return (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 text-lg" aria-label={config.label}>
                {config.icon}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={config.variant} size="sm">
                    {config.label}
                  </Badge>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {change.description}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
