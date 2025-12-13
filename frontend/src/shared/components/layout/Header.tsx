import clsx from 'clsx';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';

import { Button } from '@/shared/components/ui';
import { Logo } from '@/shared/components/ui/Logo';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { MobileNavigation } from './MobileNavigation';
import { Search, MobileSearch, SearchDialog } from './Search';

interface HeaderProps {
  className?: string;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

function TopLevelNavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        className="text-sm/5 text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        {children}
      </a>
    </li>
  );
}

export function Header({ className, mobileNavOpen, setMobileNavOpen }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const { scrollY } = useScroll();
  const bgOpacityLight = useTransform(scrollY, [0, 72], ['50%', '90%']);
  const bgOpacityDark = useTransform(scrollY, [0, 72], ['20%', '80%']);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen(true);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <motion.div
        className={clsx(
          'fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-12 px-4 transition sm:px-6 lg:left-72 lg:z-30 lg:px-8 xl:left-80',
          !mobileNavOpen && 'backdrop-blur-xs lg:left-72 xl:left-80 dark:backdrop-blur-sm',
          mobileNavOpen
            ? 'bg-white dark:bg-zinc-900'
            : 'bg-white/(--bg-opacity-light) dark:bg-zinc-900/(--bg-opacity-dark)',
          className,
        )}
        style={
          {
            '--bg-opacity-light': bgOpacityLight,
            '--bg-opacity-dark': bgOpacityDark,
          } as React.CSSProperties
        }
      >
        <div
          className={clsx(
            'absolute inset-x-0 top-full h-px transition',
            !mobileNavOpen && 'bg-zinc-900/7.5 dark:bg-white/7.5',
          )}
        />

        <Search open={searchOpen} setOpen={setSearchOpen} />
        <div className="flex items-center gap-5 lg:hidden">
          <MobileNavigation isOpen={mobileNavOpen} setIsOpen={setMobileNavOpen} />
          <a href="/" aria-label="Home">
            <Logo className="h-8 w-8" />
          </a>
        </div>
        <div className="flex items-center gap-5">
          <nav className="hidden md:block">
            <ul role="list" className="flex items-center gap-8">
              <TopLevelNavItem href="#library">Library</TopLevelNavItem>
              <TopLevelNavItem href="#settings">Settings</TopLevelNavItem>
              <TopLevelNavItem href="#system">System</TopLevelNavItem>
            </ul>
          </nav>
          <div className="hidden md:block md:h-5 md:w-px md:bg-zinc-900/10 md:dark:bg-white/15" />
          <div className="flex gap-4">
            <MobileSearch open={searchOpen} setOpen={setSearchOpen} />
            <ThemeToggle />
          </div>
          <div className="hidden min-[416px]:contents">
            <Button href="#signin">Sign in</Button>
          </div>
        </div>
      </motion.div>
      <SearchDialog open={searchOpen} setOpen={setSearchOpen} />
    </>
  );
}
