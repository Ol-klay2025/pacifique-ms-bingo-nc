import { createContext, useContext } from 'react';

/**
 * Type pour les variants des toast (info, succès, erreur...)
 */
type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

/**
 * Structure d'un toast
 */
export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: React.ReactNode;
  duration?: number;
}

/**
 * Structure pour les props d'ouverture d'un toast
 */
export interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: React.ReactNode;
  duration?: number;
}

/**
 * Context pour le système de toast
 */
interface ToastContextType {
  toasts: Toast[];
  toast: (props: ToastProps) => void;
  dismiss: (id: string) => void;
}

/**
 * Création du context pour les toasts
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Hook pour utiliser le système de toast
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast doit être utilisé à l\'intérieur d\'un ToastProvider');
  }
  
  return context;
};

// Exporter le contexte pour l'utiliser dans le fournisseur
export { ToastContext };