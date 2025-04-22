import { 
  ToastContext, 
  ToastContextType, 
  ToastProvider as ToastProviderComponent, 
  Toaster as ToasterComponent
} from '../components/ui/toast';
import { useContext } from 'react';

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  
  if (context === null) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
}

export const ToastProvider = ToastProviderComponent;
export const Toaster = ToasterComponent;