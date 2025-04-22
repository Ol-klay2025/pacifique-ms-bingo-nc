import React, { useState } from 'react';
import { Tabs, Tab } from '../components/ui/tabs';
import AmlDashboard from '../components/compliance/AmlDashboard';
import KycManagement from '../components/compliance/KycManagement';
import GdprExport from '../components/compliance/GdprExport';

/**
 * Interface d'administration de la conformité MS BINGO
 * Ce composant gère l'affichage des interfaces AML, KYC et GDPR
 */
const ComplianceAdmin = () => {
  const [activeTab, setActiveTab] = useState('aml');

  return (
    <div className="compliance-admin-container">
      <header className="admin-header">
        <div className="logo-container">
          <h1>MS BINGO PACIFIQUE</h1>
          <div className="admin-badge">Administration Conformité</div>
        </div>
        <div className="user-info">
          <span className="user-name">Admin</span>
          <button className="logout-button">Déconnexion</button>
        </div>
      </header>

      <main className="admin-content">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="compliance-tabs">
          <Tab value="aml" label="AML">
            <AmlDashboard />
          </Tab>
          <Tab value="kyc" label="KYC">
            <KycManagement />
          </Tab>
          <Tab value="gdpr" label="GDPR">
            <GdprExport />
          </Tab>
        </Tabs>
      </main>

      <footer className="admin-footer">
        <p>MS BINGO PACIFIQUE &copy; 2025 - Développé pour les régulateurs ANJ</p>
        <div className="version-info">Version 1.0.3 - Mise à jour: 15/04/2025</div>
      </footer>
    </div>
  );
};

export default ComplianceAdmin;