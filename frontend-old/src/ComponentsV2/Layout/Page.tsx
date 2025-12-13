import React from 'react';
import { cn } from '../utils/cn';

interface PageProps {
  className?: string;
  children: React.ReactNode;
}

export function Page({ className, children }: PageProps) {
  return (
    <div className={cn('min-h-screen bg-zinc-50 dark:bg-zinc-950', className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function PageHeader({ className, children }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900',
        className
      )}
    >
      {children}
    </header>
  );
}

interface PageTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function PageTitle({ className, children }: PageTitleProps) {
  return (
    <h1
      className={cn('text-2xl font-bold text-zinc-900 dark:text-zinc-100', className)}
    >
      {children}
    </h1>
  );
}

interface PageContentProps {
  className?: string;
  children: React.ReactNode;
}

export function PageContent({ className, children }: PageContentProps) {
  return <main className={cn('p-6', className)}>{children}</main>;
}

interface PageFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function PageFooter({ className, children }: PageFooterProps) {
  return (
    <footer
      className={cn(
        'border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900',
        className
      )}
    >
      {children}
    </footer>
  );
}

interface ContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  children: React.ReactNode;
}

export function Container({ size = 'xl', className, children }: ContainerProps) {
  const sizeStyles = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizeStyles[size], className)}>
      {children}
    </div>
  );
}
