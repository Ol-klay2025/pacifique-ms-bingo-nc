import React, { useState, FC, ReactNode } from 'react';
import { ToastContext, Toast, ToastProps } from './use-toast';

/**
 * Fournisseur pour le contexte Toast
 */
export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Ajouter un nouveau toast
  const toast = (props: ToastProps) => {
    // Créer un ID unique
    const id = Math.random().toString(36).slice(2);
    const newToast: Toast = {
      id,
      title: props.title,
      description: props.description,
      variant: props.variant || 'default',
      action: props.action,
      duration: props.duration || 5000, // 5 secondes par défaut
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-suppression après la durée spécifiée
    setTimeout(() => {
      dismiss(id);
    }, newToast.duration);

    return id;
  };

  // Supprimer un toast par son ID
  const dismiss = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const value = {
    toasts,
    toast,
    dismiss,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};