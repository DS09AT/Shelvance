import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';
import { Fragment } from 'react';

interface PageToolbarMenuProps {
  icon?: LucideIcon;
  label: string;
  children: React.ReactNode;
}

export function PageToolbarMenu({ icon: Icon, label, children }: PageToolbarMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        className={clsx(
          "group flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition cursor-pointer",
          "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
          "dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-zinc-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden dark:divide-zinc-700 dark:bg-zinc-800 dark:ring-white/10 z-50">
          {children}
        </MenuItems>
      </Transition>
    </Menu>
  );
}

export function PageToolbarMenuItem({ onClick, children, active: isActive }: { onClick?: () => void, children: React.ReactNode, active?: boolean }) {
  return (
    <MenuItem>
      {({ focus }) => (
        <button
          className={clsx(
            focus ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-white' : 'text-zinc-700 dark:text-zinc-300',
            isActive ? 'font-semibold' : '',
            'group flex w-full items-center px-4 py-2 text-sm'
          )}
          onClick={onClick}
        >
          {children}
        </button>
      )}
    </MenuItem>
  );
}
