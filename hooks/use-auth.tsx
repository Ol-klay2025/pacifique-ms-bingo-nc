import React, { createContext, ReactNode, useContext } from 'react';
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from '@tanstack/react-query';
import { getQueryFn, apiRequest, queryClient } from '../lib/queryClient';
import { useToast } from '../components/ui/use-toast';

// Définition temporaire de User pour éviter l'importation circulaire
interface User {
  id: number;
  username: string;
  email: string | null;
  passwordHash?: string;
  password?: string;
  balance: number;
  language: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  subscriptionEndDate: Date | null;
  cardTheme: string | null;
  appTheme: string | null;
  isAdmin?: boolean;
  createdAt: Date;
}

/**
 * Type d'entrée pour la connexion
 */
type LoginData = {
  username: string;
  password: string;
};

/**
 * Type d'entrée pour l'inscription
 */
type RegisterData = {
  username: string;
  password: string;
  email?: string;
  language?: string;
};

/**
 * Type de contexte d'authentification
 */
export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<any, Error, LoginData>;
  logoutMutation: UseMutationResult<any, Error, void>;
  registerMutation: UseMutationResult<any, Error, RegisterData>;
};

/**
 * Contexte d'authentification pour partager l'état d'authentification
 * dans toute l'application
 */
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Fournisseur du contexte d'authentification qui gère l'état de l'utilisateur
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // Requête pour obtenir l'utilisateur actuel
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/user'],
    queryFn: async ({ queryKey }) => {
      try {
        const response = await apiRequest('GET', queryKey[0] as string);
        return await response.json();
      } catch (error) {
        if ((error as any).status === 401) {
          return null;
        }
        throw error;
      }
    }
  });

  // Mutation pour se connecter
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest('POST', '/api/login', credentials);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data);
      toast({
        title: 'Connexion réussie',
        description: `Bienvenue, ${data.username} !`,
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Échec de la connexion',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation pour s'inscrire
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest('POST', '/api/register', userData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data);
      toast({
        title: 'Inscription réussie',
        description: 'Votre compte a été créé avec succès !',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Échec de l\'inscription',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation pour se déconnecter
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null);
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté avec succès.',
        variant: 'info',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Échec de la déconnexion',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Valeur du contexte
  const value = {
    user: user ?? null,
    isLoading,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte d'authentification
 * @returns Contexte d'authentification
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  
  return context;
}