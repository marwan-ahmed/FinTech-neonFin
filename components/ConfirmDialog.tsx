'use client';

import { useState, createContext, useContext, useCallback, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

type ConfirmVariant = 'danger' | 'warning';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType>({
  confirm: () => Promise.resolve(false),
});

export function useConfirm() {
  return useContext(ConfirmContext);
}

const variantStyles = {
  danger: {
    icon: 'bg-[#ef4444]/15 text-[#ef4444]',
    button: 'bg-[#ef4444] hover:bg-[#dc2626] text-white',
    border: 'border-[#ef4444]/30',
  },
  warning: {
    icon: 'bg-[#f59e0b]/15 text-[#f59e0b]',
    button: 'bg-[#f59e0b] hover:bg-[#d97706] text-black',
    border: 'border-[#f59e0b]/30',
  },
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolveRef.current?.(true);
    resolveRef.current = null;
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolveRef.current?.(false);
    resolveRef.current = null;
  };

  const variant = options?.variant || 'danger';
  const styles = variantStyles[variant];
  const IconComponent = variant === 'danger' ? Trash2 : AlertTriangle;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {isOpen && options && (
        <>
          {/* خلفية ضبابية */}
          <div
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={handleCancel}
          />

          {/* نافذة التأكيد */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
            <div
              className={`w-full max-w-sm rounded-2xl border ${styles.border} bg-[#141414] shadow-[0_25px_50px_rgba(0,0,0,0.5)] animate-scale-in`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* رأس النافذة */}
              <div className="flex items-start gap-4 p-6 pb-3">
                <div className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${styles.icon}`}>
                  <IconComponent size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white">{options.title}</h3>
                  <p className="mt-1 text-sm text-[#737373] leading-relaxed">{options.message}</p>
                </div>
                <button
                  onClick={handleCancel}
                  className="flex-shrink-0 text-[#737373] hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* أزرار الإجراء */}
              <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-[#262626]">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-bold text-[#ededed] bg-[#262626] rounded-lg hover:bg-[#333] transition-colors"
                >
                  {options.cancelText || 'إلغاء'}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 active:scale-95 ${styles.button}`}
                >
                  {options.confirmText || 'تأكيد'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </ConfirmContext.Provider>
  );
}
