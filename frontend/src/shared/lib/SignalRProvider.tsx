import { useEffect } from 'react';
import { signalRService } from '@/features/system/services/signalRService';

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    signalRService.start();

    return () => {
      signalRService.stop();
    };
  }, []);

  return <>{children}</>;
}
