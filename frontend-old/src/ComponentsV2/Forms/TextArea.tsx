import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';
import { inputBaseStyles, inputErrorStyles } from '../utils/variants';

interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharacterCount?: boolean;
  autoResize?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      showCharacterCount = false,
      autoResize = false,
      maxLength,
      className,
      onChange,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = React.useState(
      props.defaultValue?.toString().length || 0
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCharacterCount) {
        setCharCount(e.target.value.length);
      }
      if (autoResize) {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
      onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            inputBaseStyles,
            error && inputErrorStyles,
            autoResize && 'resize-none',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
          maxLength={maxLength}
          onChange={handleChange}
          {...props}
        />
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex-1">
            {error && (
              <p id={`${props.id}-error`} className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            {!error && helperText && (
              <p
                id={`${props.id}-helper`}
                className="text-sm text-zinc-500 dark:text-zinc-400"
              >
                {helperText}
              </p>
            )}
          </div>
          {showCharacterCount && maxLength && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {charCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
