'use client';

import { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  toast: (tone: ToastTone, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

const toneStyles: Record<ToastTone, { box: string; Icon: typeof Info }> = {
  success: { box: 'bg-success-soft text-success border-success/30', Icon: CheckCircle },
  error: { box: 'bg-danger-soft text-danger border-danger/30', Icon: AlertCircle },
  warning: { box: 'bg-warning-soft text-warning border-warning/30', Icon: AlertTriangle },
  info: { box: 'bg-info-soft text-info border-info/30', Icon: Info },
};

const AUTO_DISMISS_MS = 4000;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev.slice(-3), { id, tone, message }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 left-1/2 z-[200] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
        {toasts.map(({ id, tone, message }) => {
          const { box, Icon } = toneStyles[tone];
          return (
            <div
              key={id}
              className={`modal-pop pointer-events-auto flex items-start gap-2 rounded-lg border px-4 py-3 shadow-lg ${box}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm font-medium">{message}</p>
              <button
                onClick={() => dismiss(id)}
                aria-label="Tutup notifikasi"
                className="-m-1 flex min-h-8 min-w-8 items-center justify-center rounded opacity-70 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
