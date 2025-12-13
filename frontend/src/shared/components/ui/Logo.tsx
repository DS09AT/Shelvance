import clsx from 'clsx';

export function Logo(props: React.ComponentPropsWithoutRef<'img'>) {
  const { className, ...rest } = props;

  return (
    <img
      src="/content/images/Logo.svg"
      alt="Readarr"
      width={32}
      height={32}
      className={clsx('h-8 w-8', className)}
      {...rest}
    />
  );
}
