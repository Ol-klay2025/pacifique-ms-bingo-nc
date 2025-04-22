import { QueryClient } from '@tanstack/react-query';

/**
 * Options pour la fonction getQueryFn
 */
interface GetQueryFnOptions {
  /**
   * Comportement en cas d'erreur 401 (non authentifié)
   * - "throw": lance une erreur (comportement par défaut)
   * - "returnNull": retourne null au lieu de lancer une erreur
   */
  on401?: 'throw' | 'returnNull';
}

/**
 * Type d'erreur personnalisé avec statut HTTP et message
 */
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Client de requête TanStack Query
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

/**
 * Fonction pour effectuer une requête API avec fetch
 * @param method Méthode HTTP
 * @param url URL de la requête
 * @param body Corps de la requête (optionnel)
 * @param options Options supplémentaires pour fetch (optionnel)
 * @returns Promesse avec la réponse
 */
export async function apiRequest(
  method: string,
  url: string,
  body?: any,
  options: RequestInit = {}
): Promise<Response> {
  const headers = {
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || `Erreur ${response.status}`;
    } catch (e) {
      errorMessage = errorText || `Erreur ${response.status}`;
    }
    
    throw new ApiError(errorMessage, response.status);
  }

  return response;
}

/**
 * Fonction pour créer une fonction de requête pour TanStack Query
 * @param options Options pour la fonction
 * @returns Fonction de requête
 */
export function getQueryFn({ on401 = 'throw' }: GetQueryFnOptions = {}) {
  return async ({ queryKey }: { queryKey: [string, ...unknown[]] }) => {
    const [url, ...params] = queryKey;
    
    try {
      const response = await apiRequest('GET', url);
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401 && on401 === 'returnNull') {
        return null;
      }
      throw error;
    }
  };
}