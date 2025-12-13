import React from 'react';
import { cn } from '../utils/cn';
import { Alert } from './Alert';
import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';

export type HealthType = 'ok' | 'notice' | 'warning' | 'error';

export interface HealthAlertProps {
  /** Health status type */
  type: HealthType;
  /** Message text */
  message: string;
  /** Optional wiki URL for more info */
  wikiUrl?: string;
  /** Optional action button */
  onAction?: () => void;
  /** Action button label */
  actionLabel?: string;
  /** Additional className */
  className?: string;
}

const healthConfig = {
  ok: {
    alertType: 'success' as const,
    badgeVariant: 'success' as const,
    label: 'OK',
    icon: '✓',
  },
  notice: {
    alertType: 'info' as const,
    badgeVariant: 'info' as const,
    label: 'Notice',
    icon: 'ℹ',
  },
  warning: {
    alertType: 'warning' as const,
    badgeVariant: 'warning' as const,
    label: 'Warning',
    icon: '⚠',
  },
  error: {
    alertType: 'danger' as const,
    badgeVariant: 'danger' as const,
    label: 'Error',
    icon: '✗',
  },
};

export function HealthAlert({
  type,
  message,
  wikiUrl,
  onAction,
  actionLabel = 'Fix',
  className,
}: HealthAlertProps) {
  const config = healthConfig[type];

  return (
    <Alert type={config.alertType} className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-3">
        <Badge variant={config.badgeVariant} size="sm">
          <span className="mr-1">{config.icon}</span>
          {config.label}
        </Badge>
        <p className="text-sm">{message}</p>
      </div>
      <div className="flex items-center gap-2">
        {wikiUrl && (
          <Button
            variant="text"
            size="sm"
            onClick={() => window.open(wikiUrl, '_blank')}
          >
            Learn More
          </Button>
        )}
        {onAction && (
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </Alert>
  );
}
