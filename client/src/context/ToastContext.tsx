import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, ShieldAlert } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = { id, message, type, title };

    setToasts((prev) => [...prev.slice(-4), newToast]); // Keep max 5

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let bgClass = 'bg-slate-900 text-white border-slate-700';
          let icon = <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />;

          if (toast.type === 'success') {
            bgClass = 'bg-slate-900/95 text-white border-emerald-500/40 shadow-emerald-900/20';
            icon = <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />;
          } else if (toast.type === 'error') {
            bgClass = 'bg-slate-900/95 text-white border-rose-500/40 shadow-rose-900/20';
            icon = <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />;
          } else if (toast.type === 'warning') {
            bgClass = 'bg-slate-900/95 text-white border-amber-500/40 shadow-amber-900/20';
            icon = <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />;
          } else if (toast.type === 'info') {
            bgClass = 'bg-slate-900/95 text-white border-teal-500/40 shadow-teal-900/20';
            icon = <Info className="h-5 w-5 text-teal-400 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-5 ${bgClass}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 space-y-0.5 pr-1">
                {toast.title && <h4 className="text-xs font-extrabold text-white tracking-tight">{toast.title}</h4>}
                <p className="text-xs font-medium text-slate-200 leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition shrink-0"
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

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
