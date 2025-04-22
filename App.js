import React, { useState } from 'react';
import { Route, Switch, Link, useLocation } from 'wouter';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AmlDashboardPage from './pages/AmlDashboardPage';
import KycManagementPage from './pages/KycManagementPage';
import GdprExportPage from './pages/GdprExportPage';
import NotFoundPage from './pages/NotFoundPage';

// Icônes de navigation
import {
  BarChart2,
  Shield,
  Users,
  Database,
  Settings,
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react';

// Contexte d'authentification
import { AuthProvider, useAuth } from './hooks/useAuth';

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent = () => {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Si l'utilisateur n'est pas connecté, afficher la page de connexion
  if (!user) {
    return <LoginPage />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-container">
      {/* En-tête */}
      <header className="header">
        <div className="d-flex align-items-center">
          <button className="btn btn-link d-md-none mr-3" onClick={toggleSidebar}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="mb-0">MS BINGO PACIFIQUE</h1>
        </div>
        <div className="d-flex align-items-center">
          <div className="mr-3">
            <span className="badge badge-light">{user.username}</span>
          </div>
          <button className="btn btn-sm btn-light" onClick={logout}>
            <LogOut size={16} className="mr-1" /> Déconnexion
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* Barre latérale de navigation */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav>
            <ul className="nav-list">
              <li className="nav-item">
                <Link href="/dashboard" className={`nav-link ${location === '/dashboard' ? 'active' : ''}`}>
                  <BarChart2 className="nav-icon" />
                  <span>Tableau de bord</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/aml" className={`nav-link ${location === '/aml' ? 'active' : ''}`}>
                  <Shield className="nav-icon" />
                  <span>Anti-Money Laundering</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/kyc" className={`nav-link ${location === '/kyc' ? 'active' : ''}`}>
                  <Users className="nav-icon" />
                  <span>Know Your Customer</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/gdpr" className={`nav-link ${location === '/gdpr' ? 'active' : ''}`}>
                  <Database className="nav-icon" />
                  <span>Export GDPR</span>
                </Link>
              </li>
              <li className="nav-item mt-4">
                <Link href="/settings" className={`nav-link ${location === '/settings' ? 'active' : ''}`}>
                  <Settings className="nav-icon" />
                  <span>Paramètres</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/notifications" className={`nav-link ${location === '/notifications' ? 'active' : ''}`}>
                  <Bell className="nav-icon" />
                  <span>Notifications</span>
                  <span className="badge badge-primary ml-2">3</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Contenu principal */}
        <main className="content" onClick={() => setSidebarOpen(false)}>
          <Switch>
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/aml" component={AmlDashboardPage} />
            <Route path="/kyc" component={KycManagementPage} />
            <Route path="/gdpr" component={GdprExportPage} />
            <Route path="/" component={DashboardPage} />
            <Route component={NotFoundPage} />
          </Switch>
        </main>
      </div>

      {/* Pied de page */}
      <footer className="footer">
        <div>
          &copy; 2025 MS BINGO PACIFIQUE - Interface d'administration de conformité
          <span className="ml-2">v1.0.0</span>
        </div>
      </footer>
    </div>
  );
};

export default App;