import { useEffect } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import { BrowserRouter } from 'react-router-dom';
import { SignalRProvider } from './SignalRProvider';
import { ToastProvider } from '@/shared/components/ui/Toast';
import { SignalRToaster } from '@/features/system/components/SignalRToaster';
import { StatusMessageProvider } from './StatusMessageProvider';

function ThemeWatcher() {
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    function onMediaChange() {
      const systemTheme = media.matches ? 'dark' : 'light';
      if (resolvedTheme === systemTheme) {
        setTheme('system');
      }
    }

    onMediaChange();
    media.addEventListener('change', onMediaChange);

    return () => {
      media.removeEventListener('change', onMediaChange);
    };
  }, [resolvedTheme, setTheme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange={true}>
      <ThemeWatcher />
      <BrowserRouter basename={window.Readarr?.urlBase}>
        <ToastProvider>
          <StatusMessageProvider>
            <SignalRProvider>
              <SignalRToaster />
              {children}
            </SignalRProvider>
          </StatusMessageProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
