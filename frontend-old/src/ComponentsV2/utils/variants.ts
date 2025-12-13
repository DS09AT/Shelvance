export const buttonVariants = {
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 focus:ring-emerald-500',
  secondary:
    'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 focus:ring-zinc-500',
  outline:
    'border border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 focus:ring-zinc-500',
  text: 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 focus:ring-emerald-500',
  filled:
    'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 focus:ring-emerald-500',
  danger:
    'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:ring-red-500',
} as const;

export const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
} as const;

export const badgeVariants = {
  success:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/30',
  warning:
    'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/30',
  error:
    'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/30',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-400 dark:ring-sky-400/30',
  neutral:
    'bg-zinc-50 text-zinc-700 ring-zinc-600/20 dark:bg-zinc-400/10 dark:text-zinc-400 dark:ring-zinc-400/30',
  primary:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/30',
} as const;

export const badgeSizes = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-sm',
  lg: 'px-2.5 py-1 text-base',
} as const;

export const alertVariants = {
  info: 'bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-400/10 dark:text-sky-400 dark:border-sky-400/30',
  success:
    'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-400/30',
  warning:
    'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/30',
  error:
    'bg-red-50 text-red-900 border-red-200 dark:bg-red-400/10 dark:text-red-400 dark:border-red-400/30',
} as const;

export const inputBaseStyles =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20';

export const inputErrorStyles =
  'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/20';

export const cardVariants = {
  default: 'bg-white dark:bg-zinc-900',
  bordered: 'bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800',
  elevated: 'bg-white shadow-md dark:bg-zinc-900 dark:shadow-zinc-950/50',
} as const;
