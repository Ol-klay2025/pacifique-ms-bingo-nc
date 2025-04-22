import React from 'react';
import { X } from 'lucide-react';
import { useToast, Toast } from './use-toast';

/**
 * Composant pour afficher un toast individuel
 */
const ToastItem = ({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) => {
  const getVariantClasses = () => {
    switch (toast.variant) {
      case 'destructive':
        return 'border-red-500 bg-red-50 text-red-700';
      case 'success':
        return 'border-green-500 bg-green-50 text-green-700';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case 'info':
        return 'border-blue-500 bg-blue-50 text-blue-700';
      default:
        return 'border-gray-300 bg-white text-gray-800';
    }
  };

  return (
    <div
      className={`rounded-md border-l-4 shadow-lg p-4 flex items-start ${getVariantClasses()}`}
      role="alert"
    >
      <div className="flex-1">
        {toast.title && <h3 className="font-semibold">{toast.title}</h3>}
        {toast.description && <div className="text-sm mt-1">{toast.description}</div>}
        {toast.action && <div className="mt-2">{toast.action}</div>}
      </div>
      <button
        onClick={onDismiss}
        className="ml-4 text-gray-500 hover:text-gray-900 focus:outline-none"
        aria-label="Fermer"
      >
        <X size={18} />
      </button>
    </div>
  );
};

/**
 * Composant Toaster qui affiche les toasts
 */
export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="animate-fadeIn">
          <ToastItem toast={toast} onDismiss={() => dismiss(toast.id)} />
        </div>
      ))}
    </div>
  );
}