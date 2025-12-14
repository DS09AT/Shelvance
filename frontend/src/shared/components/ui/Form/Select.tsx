import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.ComponentPropsWithoutRef<'select'> {
  label?: string;
  options: { value: string | number; label: string; disabled?: boolean }[];
  className?: string;
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="relative">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          {label}
        </label>
      )}
      <select
        className={clsx(
          "block w-full appearance-none rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-zinc-900 ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6",
          "dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-primary-500",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -mt-2 h-4 w-4 text-zinc-400" />
    </div>
  );
}
