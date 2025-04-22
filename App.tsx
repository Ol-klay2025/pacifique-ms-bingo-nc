import { Route, Switch } from 'wouter';
import { ProtectedRoute } from './lib/protected-route';

// Pages
import HomePage from './pages/home-page';
import AuthPage from './pages/auth-page';
import RecommendationsPage from './pages/recommendations';
import NotFound from './pages/not-found';
import NavMenu from './components/nav-menu';

// Styles pour les barres de progression du lancement
import './styles/progress-bar.css';

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/recommendations" component={RecommendationsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  // Note: La fonction AuthProvider a été déplacée dans main.tsx
  // et la structure JSX des providers a été réorganisée
  return (
    <div className="flex min-h-screen bg-background">
      <NavMenu />
      <main className="flex-1 overflow-y-auto">
        <Router />
      </main>
    </div>
  );
}