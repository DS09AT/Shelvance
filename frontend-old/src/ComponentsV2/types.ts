/**
 * Shared TypeScript types
 */

export type Size = 'sm' | 'md' | 'lg' | 'xl';

export type Variant = 'primary' | 'secondary' | 'outline' | 'text' | 'filled' | 'danger';

export type ColorVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface SizeableComponentProps extends BaseComponentProps {
  size?: Size;
}

export interface VariantComponentProps extends BaseComponentProps {
  variant?: Variant;
}
