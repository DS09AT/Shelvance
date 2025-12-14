import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export interface StatusMessage {
  id: number;
  name: string;
  message?: string;
  status: 'started' | 'completed' | 'failed' | 'queued';
  startedOn?: string;
  stateChangeTime?: string;
  sendUpdatesToClient?: boolean;
}

interface StatusMessageContextType {
  messages: StatusMessage[];
  updateMessage: (message: StatusMessage) => void;
  removeMessage: (id: number) => void;
}

const StatusMessageContext = createContext<StatusMessageContextType | undefined>(undefined);

export function useStatusMessage() {
  const context = useContext(StatusMessageContext);
  if (!context) {
    throw new Error('useStatusMessage must be used within a StatusMessageProvider');
  }
  return context;
}

export function StatusMessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<StatusMessage[]>([]);
  const timeoutRefs = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const setMessageTimeout = useCallback((id: number, duration: number, callback: () => void) => {
    clearTimeout(timeoutRefs.current.get(id));
    if (duration > 0) {
      timeoutRefs.current.set(id, setTimeout(callback, duration));
    }
  }, []);

  const removeMessage = useCallback((id: number) => {
    clearTimeout(timeoutRefs.current.get(id));
    timeoutRefs.current.delete(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMessage = useCallback((message: StatusMessage) => {
    setMessages((prev) => {
      const existing = prev.find((m) => m.id === message.id);

      if (existing) {
        // Update existing message
        return prev.map((m) => (m.id === message.id ? message : m));
      }

      // Add message for any status (started, queued, completed, failed)
      // This handles cases where terminal-state messages arrive before started/queued
      return [...prev, message];
    });

    // Handle timeout outside of state setter to avoid stale closures
    if (message.status === 'completed' || message.status === 'failed') {
      setMessageTimeout(message.id, 2000, () => removeMessage(message.id));
    }
  }, [setMessageTimeout, removeMessage]);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current.clear();
    };
  }, []);

  return (
    <StatusMessageContext.Provider value={{ messages, updateMessage, removeMessage }}>
      {children}
    </StatusMessageContext.Provider>
  );
}

