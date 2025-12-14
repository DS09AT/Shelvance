import clsx from 'clsx';

export function Table({ children, className }: React.ComponentPropsWithoutRef<'table'>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className={clsx("min-w-full divide-y divide-zinc-200 dark:divide-zinc-800", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: React.ComponentPropsWithoutRef<'thead'>) {
  return <thead className="bg-zinc-50 dark:bg-zinc-900">{children}</thead>;
}

export function TableBody({ children }: React.ComponentPropsWithoutRef<'tbody'>) {
  return <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">{children}</tbody>;
}

export function TableRow({ children, className, onClick }: React.ComponentPropsWithoutRef<'tr'>) {
  return (
    <tr 
      className={clsx("transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50", className)} 
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableHeader({ children, className }: React.ComponentPropsWithoutRef<'th'>) {
  return (
    <th
      scope="col"
      className={clsx("px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400", className)}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className }: React.ComponentPropsWithoutRef<'td'>) {
  return (
    <td className={clsx("whitespace-nowrap px-4 py-3 text-sm text-zinc-900 dark:text-zinc-300", className)}>
      {children}
    </td>
  );
}
