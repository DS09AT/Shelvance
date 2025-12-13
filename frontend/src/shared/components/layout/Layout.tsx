import { Footer } from './Footer';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-full flex-col bg-white antialiased dark:bg-zinc-900">
      <Header />
      <div className="flex flex-1 flex-col px-4 pt-14 sm:px-6 lg:px-8">
        <main className="mx-auto w-full max-w-2xl flex-auto lg:max-w-5xl">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
