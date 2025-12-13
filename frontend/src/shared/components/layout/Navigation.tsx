import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { Button } from '@/shared/components/ui';
import { remToPx } from '@/shared/lib/remToPx';

interface NavLink {
  title: string;
  href: string;
}

interface NavGroup {
  title: string;
  links: NavLink[];
}

const navigation: NavGroup[] = [
  {
    title: 'Library',
    links: [
      { title: 'Authors', href: '#authors' },
      { title: 'Books', href: '#books' },
      { title: 'Calendar', href: '#calendar' },
      { title: 'Activity', href: '#activity' },
    ],
  },
  {
    title: 'Management',
    links: [
      { title: 'Wanted', href: '#wanted' },
      { title: 'Queue', href: '#queue' },
      { title: 'History', href: '#history' },
      { title: 'Blocklist', href: '#blocklist' },
    ],
  },
  {
    title: 'Settings',
    links: [
      { title: 'Media Management', href: '#settings-media' },
      { title: 'Profiles', href: '#settings-profiles' },
      { title: 'Indexers', href: '#settings-indexers' },
      { title: 'Download Clients', href: '#settings-downloads' },
      { title: 'General', href: '#settings-general' },
    ],
  },
  {
    title: 'System',
    links: [
      { title: 'Status', href: '#system-status' },
      { title: 'Tasks', href: '#system-tasks' },
      { title: 'Logs', href: '#system-logs' },
      { title: 'Updates', href: '#system-updates' },
    ],
  },
];

function ActivePageMarker({ activeIndex }: { activeIndex: number }) {
  const itemHeight = remToPx(2);
  const offset = remToPx(0.25);
  const top = offset + activeIndex * itemHeight;

  return (
    <motion.div
      layout
      className="absolute left-2 h-6 w-px bg-emerald-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      style={{ top }}
    />
  );
}

function VisibleSectionHighlight({ activeIndex }: { activeIndex: number }) {
  const itemHeight = remToPx(2);
  const top = activeIndex * itemHeight;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      className="absolute inset-x-0 top-0 bg-zinc-800/2.5 will-change-transform dark:bg-white/2.5"
      style={{ borderRadius: 8, height: itemHeight, top }}
    />
  );
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

function NavLinkComponent({ href, children, active = false, onClick }: NavLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex justify-between gap-2 py-1 pl-4 pr-3 text-sm transition',
        active
          ? 'text-zinc-900 dark:text-white'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
      )}
    >
      <span className="truncate">{children}</span>
    </a>
  );
}

function NavigationGroup({
  group,
  activeHref,
  onLinkClick,
}: {
  group: NavGroup;
  activeHref: string;
  onLinkClick: (href: string) => void;
}) {
  const activeIndex = group.links.findIndex((link) => link.href === activeHref);
  const isActiveGroup = activeIndex !== -1;

  return (
    <li className="relative mt-6">
      <motion.h2
        layout="position"
        className="text-xs font-semibold text-zinc-900 dark:text-white"
      >
        {group.title}
      </motion.h2>
      <div className="relative mt-3 pl-2">
        <AnimatePresence initial={false}>
          {isActiveGroup && <VisibleSectionHighlight activeIndex={activeIndex} />}
        </AnimatePresence>
        <motion.div
          layout
          className="absolute inset-y-0 left-2 w-px bg-zinc-900/10 dark:bg-white/5"
        />
        <AnimatePresence initial={false}>
          {isActiveGroup && <ActivePageMarker activeIndex={activeIndex} />}
        </AnimatePresence>
        <ul role="list" className="border-l border-transparent">
          {group.links.map((link) => (
            <motion.li key={link.href} layout="position" className="relative">
              <NavLinkComponent
                href={link.href}
                active={link.href === activeHref}
                onClick={(e) => {
                  e.preventDefault();
                  onLinkClick(link.href);
                }}
              >
                {link.title}
              </NavLinkComponent>
            </motion.li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export function Navigation({ className }: { className?: string }) {
  const [activeHref, setActiveHref] = useState('#authors');

  return (
    <nav className={className}>
      <ul role="list">
        {navigation.map((group) => (
          <NavigationGroup
            key={group.title}
            group={group}
            activeHref={activeHref}
            onLinkClick={setActiveHref}
          />
        ))}
        <li className="sticky bottom-0 z-10 mt-6 min-[416px]:hidden">
          <Button href="#signin" variant="filled" className="w-full">
            Sign in
          </Button>
        </li>
      </ul>
    </nav>
  );
}
