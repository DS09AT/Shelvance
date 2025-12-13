import { useState } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { Logo } from '@/shared/components/ui/Logo';
import { HeroPattern } from '@/shared/components/ui/HeroPattern';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="h-full lg:ml-72 xl:ml-80">
      {/* Desktop Sidebar */}
      <motion.header
        layoutScroll
        className="contents lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex"
      >
        <div className="contents lg:pointer-events-auto lg:block lg:w-72 lg:overflow-y-auto lg:border-r lg:border-zinc-900/10 lg:px-6 lg:pb-8 lg:pt-4 lg:dark:border-white/10 xl:w-80">
          <div className="hidden lg:flex">
            <a href="/" aria-label="Home">
              <Logo className="h-8 w-8" />
            </a>
          </div>
          <Header mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} />
          <Navigation className="hidden lg:mt-10 lg:block" />
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="relative flex h-full flex-col px-4 pt-14 sm:px-6 lg:px-8">
        <main className="flex-auto">
          <HeroPattern />
          <div className="relative mx-auto max-w-2xl py-16 lg:max-w-5xl">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
