import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

// Toast variant types
export type ToastVariant = 'default' | 'success' | 'error' | 'destructive' | 'warning' | 'info';

// Toast props interface
export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
}

// Toast context type
export interface ToastContextType {
  toast: (props: Omit<ToastProps, 'id'>) => void;
  dismiss: (id: string) => void;
  toasts: ToastProps[];
}

// Create context
export const ToastContext = createContext<ToastContextType | null>(null);

// Toast provider component
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  // Function to add a toast
  const toast = (props: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastProps = {
      id,
      variant: 'default',
      duration: 5000,
      ...props,
    };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
  };

  // Function to dismiss a toast
  const dismiss = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
    </ToastContext.Provider>
  );
}

// Toast component
function Toast({ 
  id, 
  title, 
  description, 
  variant = 'default', 
  duration = 5000,
  onClose 
}: ToastProps) {
  const { dismiss } = useContext(ToastContext) || { dismiss: () => {} };
  
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        dismiss(id);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [id, duration, dismiss, onClose]);

  return (
    <div
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
        {
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700': variant === 'default',
          'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200': variant === 'success',
          'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200': variant === 'destructive' || variant === 'error',
          'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200': variant === 'warning',
          'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200': variant === 'info',
        }
      )}
    >
      <div className="grid gap-1">
        {title && <h3 className="font-medium">{title}</h3>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      
      <button
        onClick={() => {
          dismiss(id);
          if (onClose) onClose();
        }}
        className={cn(
          'absolute right-2 top-2 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
          {
            'hover:text-gray-700 dark:hover:text-gray-300': variant === 'default',
            'hover:text-green-900 dark:hover:text-green-100': variant === 'success',
            'hover:text-red-900 dark:hover:text-red-100': variant === 'destructive' || variant === 'error',
            'hover:text-yellow-900 dark:hover:text-yellow-100': variant === 'warning',
            'hover:text-blue-900 dark:hover:text-blue-100': variant === 'info',
          }
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Toaster component that renders all active toasts
export function Toaster() {
  const { toasts } = useContext(ToastContext) || { toasts: [] };

  return (
    <div className="fixed top-0 z-[100] flex flex-col items-end gap-2 px-4 pt-4 sm:top-auto sm:bottom-0 sm:right-0 sm:flex-col-reverse sm:pb-4 md:pr-6">
      {toasts.map((toast: ToastProps) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}