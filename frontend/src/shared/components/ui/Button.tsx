import clsx from 'clsx';
import { ArrowRight, Loader2 } from 'lucide-react';

const variantStyles = {
  primary:
    'rounded-full bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-primary-400/10 dark:text-primary-400 dark:ring-1 dark:ring-inset dark:ring-primary-400/20 dark:hover:bg-primary-400/10 dark:hover:text-primary-300 dark:hover:ring-primary-300',
  secondary:
    'rounded-full bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-primary-500 dark:text-white dark:hover:bg-primary-400',
  filled:
    'rounded-full bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-primary-500 dark:text-white dark:hover:bg-primary-400',
  outline:
    'rounded-full py-1 px-3 text-zinc-700 ring-1 ring-inset ring-zinc-900/10 hover:bg-zinc-900/2.5 hover:text-zinc-900 dark:text-zinc-400 dark:ring-white/10 dark:hover:bg-white/5 dark:hover:text-white',
  text: 'text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-500',
};

type ButtonProps = {
  variant?: keyof typeof variantStyles;
  arrow?: 'left' | 'right';
  isLoading?: boolean;
  disabled?: boolean;
} & (
  | (React.ComponentPropsWithoutRef<'button'> & { href?: never })
  | (React.ComponentPropsWithoutRef<'a'> & { href: string })
);

export function Button({
  variant = 'primary',
  className,
  children,
  arrow,
  href,
  isLoading,
  disabled = false,
  ...props
}: ButtonProps) {
  const isDisabled = isLoading || disabled;

  const combinedClassName = clsx(
    'inline-flex gap-0.5 justify-center overflow-hidden text-sm font-medium transition items-center',
    variantStyles[variant],
    isDisabled && 'opacity-70 cursor-not-allowed',
    className,
  );

  const arrowIcon = (
    <ArrowRight
      className={clsx(
        'mt-0.5 h-5 w-5',
        variant === 'text' && 'relative top-px',
        arrow === 'left' && '-ml-1 rotate-180',
        arrow === 'right' && '-mr-1',
      )}
    />
  );

  const content = (
    <>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {arrow === 'left' && arrowIcon}
      {children}
      {arrow === 'right' && arrowIcon}
    </>
  );

  if (href) {
    return (
      <a className={combinedClassName} href={href} {...(props as React.ComponentPropsWithoutRef<'a'>)}>
        {content}
      </a>
    );
  }

  return (
    <button
      className={combinedClassName}
      disabled={isDisabled}
      {...(props as React.ComponentPropsWithoutRef<'button'>)}
    >
      {content}
    </button>
  );
}
