'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styleMap = {
  success: {
    border: 'border-[#10b981]/40',
    bg: 'bg-[#10b981]/10',
    icon: 'text-[#10b981]',
    title: 'text-[#10b981]',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  },
  error: {
    border: 'border-[#ef4444]/40',
    bg: 'bg-[#ef4444]/10',
    icon: 'text-[#ef4444]',
    title: 'text-[#ef4444]',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
  },
  warning: {
    border: 'border-[#f59e0b]/40',
    bg: 'bg-[#f59e0b]/10',
    icon: 'text-[#f59e0b]',
    title: 'text-[#f59e0b]',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  },
  info: {
    border: 'border-[#3b82f6]/40',
    bg: 'bg-[#3b82f6]/10',
    icon: 'text-[#3b82f6]',
    title: 'text-[#3b82f6]',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const style = styleMap[toast.type];
  const Icon = iconMap[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border ${style.border} ${style.bg} ${style.glow} backdrop-blur-md p-4 min-w-[300px] max-w-[420px] animate-fade-in-down`}
      role="alert"
    >
      <Icon size={18} className={`${style.icon} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${style.title}`}>{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[#737373] hover:text-white transition-colors flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-4), { id, type, title, message, duration }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-auto">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
