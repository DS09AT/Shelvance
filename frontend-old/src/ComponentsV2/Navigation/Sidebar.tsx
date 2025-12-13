import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';

interface SidebarProps {
  isCollapsed?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Sidebar({ isCollapsed = false, className, children }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col border-r border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {children}
    </aside>
  );
}

interface SidebarHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function SidebarHeader({ className, children }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        'border-b border-zinc-200 px-4 py-4 dark:border-zinc-800',
        className
      )}
    >
      {children}
    </div>
  );
}

interface SidebarContentProps {
  className?: string;
  children: React.ReactNode;
}

export function SidebarContent({ className, children }: SidebarContentProps) {
  return <nav className={cn('flex-1 overflow-y-auto px-2 py-4', className)}>{children}</nav>;
}

interface SidebarItemProps {
  to: string;
  icon?: React.ReactNode;
  isCollapsed?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function SidebarItem({
  to,
  icon,
  isCollapsed = false,
  className,
  children,
}: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
          : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
        isCollapsed && 'justify-center',
        className
      )}
      title={isCollapsed ? children?.toString() : undefined}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {!isCollapsed && <span>{children}</span>}
    </Link>
  );
}

interface SidebarSectionProps {
  title?: string;
  isCollapsed?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function SidebarSection({
  title,
  isCollapsed = false,
  className,
  children,
}: SidebarSectionProps) {
  return (
    <div className={cn('mb-4', className)}>
      {title && !isCollapsed && (
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {title}
        </h3>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}
