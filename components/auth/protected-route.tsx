import { Route, Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/auth-context';

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

const ProtectedRoute = ({ path, component: Component }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  return (
    <Route
      path={path}
      component={() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        return <Component />;
      }}
    />
  );
};

export { ProtectedRoute };
export default ProtectedRoute;