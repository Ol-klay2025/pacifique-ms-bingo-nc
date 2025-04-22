/**
 * MS BINGO PACIFIQUE - Page d'administration
 * Version: 15 avril 2025
 * 
 * Ce composant fournit un tableau de bord d'administration complet pour
 * la gestion AML, KYC et GDPR de la plateforme MS BINGO Pacifique.
 */

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { 
  ShieldAlert, Users, FileText, Settings, BarChart3, 
  HelpCircle, LogOut, ChevronRight, MenuIcon, X
} from 'lucide-react';

// Composants de l'interface utilisateur
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// Composants spécifiques à l'administration
import AmlDashboard from '@/components/AmlDashboard';
import KycDocumentManager from '@/components/KycDocumentManager';
import GdprDataManager from '@/components/GdprDataManager';

// Hook pour les toasts
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const { user, logoutMutation } = useAuth();
  const [activeSection, setActiveSection] = useState('aml');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { toast } = useToast();
  
  // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  // Vérifier si l'utilisateur a les autorisations d'administrateur
  const hasAdminRole = user.roles && (
    user.roles.includes('admin') || 
    user.roles.includes('super_admin') || 
    user.roles.includes('aml_analyst') || 
    user.roles.includes('kyc_agent')
  );
  
  if (!hasAdminRole) {
    return <Redirect to="/" />;
  }
  
  // Gérer la déconnexion
  const handleLogout = () => {
    logoutMutation.mutate();
    toast({
      title: 'Déconnexion réussie',
      description: 'Vous avez été déconnecté avec succès.',
    });
  };
  
  // Navigation latérale
  const navItems = [
    {
      id: 'aml',
      label: 'Tableau de bord AML',
      icon: <ShieldAlert className="h-5 w-5" />,
      description: 'Surveillance anti-blanchiment d'argent',
      roles: ['admin', 'super_admin', 'aml_analyst']
    },
    {
      id: 'kyc',
      label: 'Gestion KYC',
      icon: <Users className="h-5 w-5" />,
      description: 'Vérification d\'identité des utilisateurs',
      roles: ['admin', 'super_admin', 'kyc_agent']
    },
    {
      id: 'gdpr',
      label: 'Conformité GDPR',
      icon: <FileText className="h-5 w-5" />,
      description: 'Gestion des données personnelles',
      roles: ['admin', 'super_admin']
    },
    {
      id: 'reports',
      label: 'Rapports & Statistiques',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Analyses et tendances',
      roles: ['admin', 'super_admin']
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <Settings className="h-5 w-5" />,
      description: 'Configuration du système',
      roles: ['admin', 'super_admin']
    },
    {
      id: 'help',
      label: 'Aide & Support',
      icon: <HelpCircle className="h-5 w-5" />,
      description: 'Documentation et assistance',
      roles: ['admin', 'super_admin', 'aml_analyst', 'kyc_agent']
    }
  ];
  
  // Filtrer les éléments de navigation basés sur les rôles de l'utilisateur
  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.some(role => user.roles.includes(role));
  });
  
  // Déterminer le contenu principal en fonction de la section active
  const renderMainContent = () => {
    switch (activeSection) {
      case 'aml':
        return <AmlDashboard />;
      case 'kyc':
        return <KycDocumentManager userId="admin-view" />;
      case 'gdpr':
        return <GdprDataManager userId="admin-view" />;
      case 'reports':
        return (
          <div className="h-[80vh] flex items-center justify-center text-center">
            <div>
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Rapports & Statistiques</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Cette section sera disponible prochainement. Elle permettra de générer des rapports
                détaillés sur l'activité de la plateforme.
              </p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="h-[80vh] flex items-center justify-center text-center">
            <div>
              <Settings className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Paramètres</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Cette section sera disponible prochainement. Elle permettra de configurer
                les différents aspects de la plateforme.
              </p>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="h-[80vh] flex items-center justify-center text-center">
            <div>
              <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Aide & Support</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Cette section sera disponible prochainement. Elle regroupera la documentation
                et les ressources d'assistance pour les administrateurs.
              </p>
            </div>
          </div>
        );
      default:
        return <AmlDashboard />;
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar pour écrans larges */}
      <div className="hidden md:flex md:w-64 lg:w-72 flex-col border-r bg-muted/20">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">MS BINGO PACIFIQUE</h1>
          <p className="text-sm text-muted-foreground">Interface d'administration</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {filteredNavItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`w-full flex items-center space-x-3 p-3 rounded-md transition-colors ${
                    activeSection === item.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span className={activeSection === item.id ? 'text-primary-foreground' : 'text-muted-foreground'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">{user.username}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.roles && user.roles.length > 0 ? user.roles[0] : 'Utilisateur'}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Barre de navigation mobile */}
        <header className="md:hidden flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-bold">MS BINGO Admin</h1>
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%]">
              <SheetHeader>
                <SheetTitle>MS BINGO PACIFIQUE</SheetTitle>
              </SheetHeader>
              <nav className="mt-8">
                <ul className="space-y-2">
                  {filteredNavItems.map((item) => (
                    <li key={item.id}>
                      <button
                        className={`w-full flex items-center justify-between p-3 rounded-md transition-colors ${
                          activeSection === item.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => {
                          setActiveSection(item.id);
                          setMobileNavOpen(false);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto border-t pt-4 absolute bottom-8 left-0 right-0 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.roles && user.roles.length > 0 ? user.roles[0] : 'Utilisateur'}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </header>
        
        {/* Fil d'Ariane et titre de section */}
        <header className="border-b p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {filteredNavItems.find(item => item.id === activeSection)?.label || 'Tableau de bord'}
              </h2>
              <p className="text-muted-foreground">
                {filteredNavItems.find(item => item.id === activeSection)?.description || ''}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              {activeSection === 'aml' && (
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Générer un rapport
                </Button>
              )}
            </div>
          </div>
        </header>
        
        {/* Contenu principal basé sur la section active */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {renderMainContent()}
        </main>
        
        {/* Pied de page */}
        <footer className="border-t p-4 text-center text-xs text-muted-foreground">
          MS BINGO PACIFIQUE &copy; 2025 | Version 1.0.0 | Interface d'administration
        </footer>
      </div>
    </div>
  );
}