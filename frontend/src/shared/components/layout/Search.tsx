import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useState, useEffect, useRef } from 'react';

function SearchIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.01 12a4.25 4.25 0 1 0-6.02-6 4.25 4.25 0 0 0 6.02 6Zm0 0 3.24 3.25"
      />
    </svg>
  );
}

function SearchDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={() => setOpen(false)} className="fixed inset-0 z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-400/25 backdrop-blur-xs data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-black/40"
      />

      <div className="fixed inset-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-20 md:py-32 lg:px-8 lg:py-[15vh]">
        <DialogPanel
          transition
          className="mx-auto transform-gpu overflow-hidden rounded-lg bg-zinc-50 shadow-xl ring-1 ring-zinc-900/7.5 data-closed:scale-95 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:max-w-xl dark:bg-zinc-900 dark:ring-zinc-800"
        >
          <div className="group relative flex h-12">
            <SearchIcon className="pointer-events-none absolute top-0 left-3 h-full w-5 stroke-zinc-500" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find something..."
              className="flex-auto appearance-none bg-transparent pl-10 pr-4 text-zinc-900 outline-hidden placeholder:text-zinc-500 focus:w-full focus:flex-none sm:text-sm dark:text-white [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
              onKeyDown={(e) => {
                if (e.key === 'Escape' && !query) {
                  setOpen(false);
                }
              }}
            />
          </div>
          {query && (
            <div className="border-t border-zinc-200 bg-white p-6 text-center dark:border-zinc-100/5 dark:bg-white/2.5">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Search functionality coming soon...
              </p>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export function Search({ setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const [modifierKey, setModifierKey] = useState<string>();

  useEffect(() => {
    setModifierKey(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ? '⌘' : 'Ctrl ');
  }, []);

  return (
    <div className="hidden lg:block lg:max-w-md lg:flex-auto">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-8 w-full items-center gap-2 rounded-full bg-white pr-3 pl-2 text-sm text-zinc-500 ring-1 ring-zinc-900/10 transition hover:ring-zinc-900/20 lg:flex dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10 dark:ring-inset dark:hover:ring-white/20"
      >
        <SearchIcon className="h-5 w-5 stroke-current" />
        Find something...
        <kbd className="ml-auto text-2xs text-zinc-400 dark:text-zinc-500">
          <kbd className="font-sans">{modifierKey}</kbd>
          <kbd className="font-sans">K</kbd>
        </kbd>
      </button>
    </div>
  );
}

export function MobileSearch({ setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="relative flex size-6 items-center justify-center rounded-md transition hover:bg-zinc-900/5 lg:hidden dark:hover:bg-white/5"
      aria-label="Find something..."
    >
      <span className="absolute size-12 pointer-fine:hidden" />
      <SearchIcon className="h-5 w-5 stroke-zinc-900 dark:stroke-white" />
    </button>
  );
}

export { SearchDialog };
