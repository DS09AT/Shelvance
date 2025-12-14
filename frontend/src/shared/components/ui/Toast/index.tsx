import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { nanoid } from 'nanoid';
import clsx from 'clsx';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'> & { id?: string }) => void;
  updateToast: (id: string, toast: Partial<Omit<Toast, 'id'>>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'text-green-500 dark:text-green-400',
  error: 'text-red-500 dark:text-red-400',
  warning: 'text-amber-500 dark:text-amber-400',
  info: 'text-blue-500 dark:text-blue-400',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const Icon = icons[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-lg bg-white/80 p-4 shadow-lg ring-1 ring-black/5 backdrop-blur-md dark:bg-zinc-900/80 dark:ring-white/10"
    >
      <div className="flex-shrink-0">
        <Icon className={clsx("h-5 w-5", colors[toast.type])} aria-hidden="true" />
      </div>
      <div className="ml-3 w-0 flex-1 pt-0.5">
        {toast.title && (
          <p className="text-sm font-medium text-zinc-900 dark:text-white">{toast.title}</p>
        )}
        <p className={clsx("text-sm text-zinc-500 dark:text-zinc-400", toast.title && "mt-1")}>
          {toast.message}
        </p>
      </div>
      <div className="ml-4 flex flex-shrink-0">
        <button
          type="button"
          className="inline-flex rounded-md bg-transparent text-zinc-400 hover:text-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:text-zinc-500 dark:hover:text-zinc-400"
          onClick={() => onRemove(toast.id)}
        >
          <span className="sr-only">Close</span>
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const setToastTimeout = useCallback((id: string, duration: number, callback: () => void) => {
    const timeout = timeoutRefs.current.get(id);
    if (timeout !== undefined) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
    if (duration > 0) {
      timeoutRefs.current.set(id, setTimeout(callback, duration));
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    const timeout = timeoutRefs.current.get(id);
    if (timeout !== undefined) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ id, type, title, message, duration = 5000 }: Omit<Toast, 'id'> & { id?: string }) => {
    const toastId = id || nanoid();

    setToasts((prev) => {
      const existingToast = prev.find(t => t.id === toastId);
      if (existingToast) {
        return prev.map(t => t.id === toastId ? { ...t, type, title, message, duration } : t);
      }
    setToasts((prev) => {
      const exists = prev.some(t => t.id === id);
      if (!exists && process.env.NODE_ENV === 'development') {
        console.warn(`[Toast] Tried to update non-existent toast with id: ${id}`);
      }
      return prev.map(t => t.id === id ? { ...t, ...updates } : t);
    }); ? { ...t, ...updates } : t);
      // After updating, find the updated toast to get the correct duration
      const updatedToast = updatedToasts.find(t => t.id === id);
      const duration = updates.duration !== undefined
        ? updates.duration
        : updatedToast?.duration;
      if (duration !== undefined) {
        setToastTimeout(id, duration, () => removeToast(id));
      }
      return updatedToasts;
    });[setToastTimeout, removeToast]);

  const updateToast = useCallback((id: string, updates: Partial<Omit<Toast, 'id'>>) => {
    setToasts((prev) => prev.map(t => t.id === id ? { ...t, ...updates } : t));

    if (updates.duration !== undefined) {
      setToastTimeout(id, updates.duration, () => removeToast(id));
    }
  }, [setToastTimeout, removeToast]);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, updateToast, removeToast }}>
      {children}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-end sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-start">
          <AnimatePresence>
            {toasts.map((toast) => (
              <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}
