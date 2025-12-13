import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { Play, Calendar, Clock, AlertTriangle, Settings, Laptop, ChevronDown, ChevronRight } from 'lucide-react';

import { Button } from '@/shared/components/ui';
import { remToPx } from '@/shared/lib/remToPx';
import { translate } from '@/shared/lib/i18n';

interface NavLink {
  title: string;
  href: string;
  onClick?: (e: React.MouseEvent) => void;
}

interface NavGroup {
  title: string;
  href?: string;
  icon?: React.ElementType;
  links: NavLink[];
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

function getNavigation(): NavGroup[] {
  return [
    {
      title: translate('Library'),
      href: '/',
      icon: Play,
      links: [
        { title: translate('Authors'), href: '/authors' },
        { title: translate('Books'), href: '/books' },
        { title: translate('AddNew'), href: '/add/search' },
        { title: translate('Bookshelf'), href: '/shelf' },
        { title: translate('UnmappedFiles'), href: '/unmapped' },
      ],
    },
    {
      title: translate('Calendar'),
      href: '/calendar',
      icon: Calendar,
      links: [],
    },
    {
      title: translate('Activity'),
      href: '/activity/queue',
      icon: Clock,
      links: [
        { title: translate('Queue'), href: '/activity/queue' },
        { title: translate('History'), href: '/activity/history' },
        { title: translate('Blocklist'), href: '/activity/blocklist' },
      ],
    },
    {
      title: translate('Wanted'),
      href: '/wanted/missing',
      icon: AlertTriangle,
      links: [
        { title: translate('Missing'), href: '/wanted/missing' },
        { title: translate('CutoffUnmet'), href: '/wanted/cutoffunmet' },
      ],
    },
    {
      title: translate('Settings'),
      href: '/settings',
      icon: Settings,
      links: [
        { title: translate('MediaManagement'), href: '/settings/mediamanagement' },
        { title: translate('Profiles'), href: '/settings/profiles' },
        { title: translate('Quality'), href: '/settings/quality' },
        { title: translate('CustomFormats'), href: '/settings/customformats' },
        { title: translate('Indexers'), href: '/settings/indexers' },
        { title: translate('DownloadClients'), href: '/settings/downloadclients' },
        { title: translate('ImportLists'), href: '/settings/importlists' },
        { title: translate('Connect'), href: '/settings/connect' },
        { title: translate('Metadata'), href: '/settings/metadata' },
        { title: translate('Tags'), href: '/settings/tags' },
        { title: translate('General'), href: '/settings/general' },
        { title: translate('Ui'), href: '/settings/ui' },
      ],
    },
    {
      title: translate('System'),
      href: '/system/status',
      icon: Laptop,
      links: [
        { title: translate('Status'), href: '/system/status' },
        { title: translate('Tasks'), href: '/system/tasks' },
        { title: translate('Backup'), href: '/system/backup' },
        { title: translate('Updates'), href: '/system/updates' },
        { title: translate('Events'), href: '/system/events' },
        { title: translate('LogFiles'), href: '/system/logs/files' },
      ],
    },
  ];
}

function ActivePageMarker({ activeIndex }: { activeIndex: number }) {
  const itemHeight = remToPx(2);
  const offset = remToPx(0.25);
  const top = offset + activeIndex * itemHeight;

  return (
    <motion.div
      layout
      className="absolute left-2 h-6 w-px bg-primary-500"
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

function NavLinkComponent({ href, children, onClick }: NavLinkProps) {
  const location = useLocation();
  const activeLink = location.pathname === href;

  return (
    <Link
      to={href}
      onClick={onClick}
      aria-current={activeLink ? 'page' : undefined}
      className={clsx(
        'flex justify-between gap-2 py-1 pl-4 pr-3 text-sm transition',
        activeLink
          ? 'text-zinc-900 dark:text-white'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
      )}
    >
      <span className="truncate">{children}</span>
    </Link>
  );
}

function NavigationGroup({
  group,
  isOpen,
  onToggle,
}: {
  group: NavGroup;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasLinks = group.links.length > 0;
  const activeIndex = group.links.findIndex((link) => link.href === location.pathname);
  
  const headerClasses = "flex items-center w-full text-left text-xs font-semibold text-zinc-900 transition hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300 group-hover/header:translate-x-0.5";

  const IconComponent = group.icon;

  const handleHeaderClick = (e: React.MouseEvent) => {
    if (group.href) {
        e.preventDefault();
        navigate(group.href);
    }
    if (hasLinks) {
        onToggle();
    }
  };

  return (
    <li className="relative mt-6">
      <div className="group/header">
        {group.href ? (
          <a
            href={group.href}
            onClick={handleHeaderClick}
            className={clsx(headerClasses, "py-1 cursor-pointer block")}
          >
            {IconComponent && <IconComponent className="h-4 w-4 mr-2 text-zinc-500 group-hover/header:text-zinc-700 dark:text-zinc-400 dark:group-hover/header:text-zinc-200 inline-block align-text-bottom" />}
            {group.title}
            {hasLinks && (isOpen ? <ChevronDown className="h-4 w-4 ml-auto text-zinc-400 inline-block" /> : <ChevronRight className="h-4 w-4 ml-auto text-zinc-400 inline-block" />)}
          </a>
        ) : (
          <button 
            onClick={onToggle}
            className={clsx(headerClasses, "py-1")}
          >
            {IconComponent && <IconComponent className="h-4 w-4 mr-2 text-zinc-500 group-hover/header:text-zinc-700 dark:text-zinc-400 dark:group-hover/header:text-zinc-200 inline-block align-text-bottom" />}
            {group.title}
            {hasLinks && (isOpen ? <ChevronDown className="h-4 w-4 ml-auto text-zinc-400 inline-block" /> : <ChevronRight className="h-4 w-4 ml-auto text-zinc-400 inline-block" />)}
          </button>
        )}
      </div>

      {hasLinks && (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="relative mt-3 pl-2">
                <AnimatePresence initial={false}>
                  {activeIndex !== -1 && <VisibleSectionHighlight activeIndex={activeIndex} />}
                </AnimatePresence>
                <motion.div
                  layout
                  className="absolute inset-y-0 left-2 w-px bg-zinc-900/10 dark:bg-white/5"
                />
                <AnimatePresence initial={false}>
                  {activeIndex !== -1 && <ActivePageMarker activeIndex={activeIndex} />}
                </AnimatePresence>
                <ul role="list" className="border-l border-transparent">
                  {group.links.map((link) => (
                    <motion.li key={link.href} layout="position" className="relative">
                      <NavLinkComponent
                        href={link.href}
                        onClick={() => {}}
                      >
                        {link.title}
                      </NavLinkComponent>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </li>
  );
}

export function Navigation({ className }: { className?: string }) {
  const navigation = getNavigation();
  const location = useLocation();
  const [openGroupTitle, setOpenGroupTitle] = useState<string | null>(null);

  useEffect(() => {
    const activeGroup = navigation.find(g => 
      g.links.some(l => l.href === location.pathname) || g.href === location.pathname
    );
    
    if (activeGroup) {
      setOpenGroupTitle(activeGroup.title);
    }
  }, [location.pathname]);

  return (
    <nav className={className}>
      <ul role="list">
        {navigation.map((group) => (
          <NavigationGroup
            key={group.title}
            group={group}
            isOpen={group.title === openGroupTitle || group.links.length === 0}
            onToggle={() => {
              setOpenGroupTitle(group.title === openGroupTitle ? null : group.title);
            }}
          />
        ))}
        <li className="sticky bottom-0 z-10 mt-6 min-[416px]:hidden">
          <Button href="#signin" variant="filled" className="w-full">
            {translate('SignIn')}
          </Button>
        </li>
      </ul>
    </nav>
  );
}