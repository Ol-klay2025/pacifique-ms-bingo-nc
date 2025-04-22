import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Route, Redirect } from 'wouter';

/**
 * Composant pour protéger les routes qui nécessitent une authentification.
 * 
 * Si l'utilisateur n'est pas connecté, il est redirigé vers la page d'authentification.
 * Pendant le chargement des données de l'utilisateur, un indicateur de chargement est affiché.
 * 
 * @param path Le chemin de la route
 * @param component Le composant à afficher si l'utilisateur est authentifié
 */
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  // Pendant le chargement, afficher un indicateur de chargement
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page d'authentification
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Si l'utilisateur est connecté, afficher le composant demandé
  return <Route path={path} component={Component} />;
}