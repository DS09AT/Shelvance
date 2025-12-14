import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import clsx from 'clsx';

export interface BreadcrumbPage {
  name: string;
  href?: string;
  current?: boolean;
}

export function Breadcrumbs({ pages }: { pages: BreadcrumbPage[] }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        <li>
          <div>
            <Link to="/" className="text-zinc-400 hover:text-zinc-500 dark:text-zinc-500 dark:hover:text-zinc-400">
              <Home className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {pages.map((page) => (
          <li key={page.name}>
            <div className="flex items-center">
              <ChevronRight className="h-5 w-5 flex-shrink-0 text-zinc-400 dark:text-zinc-600" aria-hidden="true" />
              {page.href && !page.current ? (
                <Link
                  to={page.href}
                  className="ml-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  aria-current={page.current ? 'page' : undefined}
                >
                  {page.name}
                </Link>
              ) : (
                <span
                  className={clsx(
                    "ml-2 text-sm font-medium",
                    page.current ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"
                  )}
                  aria-current={page.current ? 'page' : undefined}
                >
                  {page.name}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
