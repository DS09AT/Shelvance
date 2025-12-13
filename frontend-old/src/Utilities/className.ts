/**
 * Reusable utility for merging className strings
 */

export { clsx } from 'clsx';

/**
 * Type-safe className utility
 * Use this for combining conditional classes in components
 * 
 * @example
 * import { cn } from 'Utilities/className';
 * 
 * <div className={cn(
 *   'base-class',
 *   isActive && 'active-class',
 *   isPrimary ? 'primary' : 'secondary'
 * )} />
 */
export { clsx as cn } from 'clsx';
