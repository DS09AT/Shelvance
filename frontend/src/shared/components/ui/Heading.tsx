import clsx from 'clsx';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps {
  level?: HeadingLevel;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const headingStyles: Record<HeadingLevel, string> = {
  1: 'text-2xl font-bold text-zinc-900 dark:text-white',
  2: 'text-lg font-semibold text-zinc-900 dark:text-white',
  3: 'text-base font-semibold text-zinc-900 dark:text-white',
  4: 'text-sm font-semibold text-zinc-900 dark:text-white',
  5: 'text-sm font-medium text-zinc-900 dark:text-white',
  6: 'text-xs font-medium text-zinc-900 dark:text-white',
};

export function Heading({
  level = 1,
  children,
  className,
  id,
}: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <Tag
      id={id}
      className={clsx(headingStyles[level], className)}
    >
      {children}
    </Tag>
  );
}
