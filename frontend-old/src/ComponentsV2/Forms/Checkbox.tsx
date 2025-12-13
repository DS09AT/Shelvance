import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, indeterminate = false, className, ...props }, ref) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => checkboxRef.current!);

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            ref={checkboxRef}
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-zinc-300 text-emerald-600 transition-colors focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-emerald-500 dark:focus:ring-emerald-400/20',
              error &&
                'border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:ring-red-400/20',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3">
            <label
              htmlFor={props.id}
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              {label}
            </label>
            {error && (
              <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            ref={ref}
            type="radio"
            className={cn(
              'h-4 w-4 border-zinc-300 text-emerald-600 transition-colors focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-emerald-500 dark:focus:ring-emerald-400/20',
              error &&
                'border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:ring-red-400/20',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3">
            <label
              htmlFor={props.id}
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              {label}
            </label>
            {error && (
              <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
