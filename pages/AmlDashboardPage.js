import React, { useState } from 'react';
import { Shield, Search, Filter, AlertCircle, Check, Clock, X, Info, ExternalLink } from 'lucide-react';

const AmlDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Shield size={24} className="mr-3" color="#ff8c00" />
          <h2 className="mb-0">Anti-Money Laundering</h2>
        </div>
        <div>
          <span className="badge badge-primary p-2">Mise à jour: 15 avril 2025, 10:30</span>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <a 
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                href="#dashboard"
                onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
              >
                Tableau de bord
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${activeTab === 'alerts' ? 'active' : ''}`}
                href="#alerts"
                onClick={(e) => { e.preventDefault(); setActiveTab('alerts'); }}
              >
                Alertes
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                href="#reports"
                onClick={(e) => { e.preventDefault(); setActiveTab('reports'); }}
              >
                Rapports
              </a>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'alerts' && <AlertsTab />}
          {activeTab === 'reports' && <ReportsTab />}
        </div>
      </div>
    </div>
  );
};

const DashboardTab = () => {
  return (
    <div>
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-light">
            <div className="card-body text-center">
              <h1 className="display-4 mb-0">18</h1>
              <p className="text-muted">Alertes totales</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-danger text-white">
            <div className="card-body text-center">
              <h1 className="display-4 mb-0">4</h1>
              <p className="mb-0">Risque élevé</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning">
            <div className="card-body text-center">
              <h1 className="display-4 mb-0">6</h1>
              <p className="mb-0">En attente</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h1 className="display-4 mb-0">2</h1>
              <p className="mb-0">Dernières 24h</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Risques par type</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Transactions suspectes</span>
                <span className="badge badge-danger">7</span>
              </div>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div className="progress-bar bg-danger" style={{ width: '39%' }} role="progressbar" aria-valuenow="39" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Dépôts inhabituels</span>
                <span className="badge badge-warning">3</span>
              </div>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div className="progress-bar bg-warning" style={{ width: '17%' }} role="progressbar" aria-valuenow="17" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Rotation des méthodes de paiement</span>
                <span className="badge badge-info">2</span>
              </div>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div className="progress-bar bg-info" style={{ width: '11%' }} role="progressbar" aria-valuenow="11" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Comptes multiples</span>
                <span className="badge badge-dark">4</span>
              </div>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div className="progress-bar bg-dark" style={{ width: '22%' }} role="progressbar" aria-valuenow="22" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Motifs de jeu suspects</span>
                <span className="badge badge-secondary">2</span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div className="progress-bar bg-secondary" style={{ width: '11%' }} role="progressbar" aria-valuenow="11" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Alertes récentes</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <a href="#alert-1" className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">Transactions rapides multiples</h6>
                    <small className="badge badge-danger">Élevé</small>
                  </div>
                  <p className="mb-1">Jean Dupont - 50 000 XPF en 10 minutes</p>
                  <small className="text-muted">14 avril 2025, 08:30</small>
                </a>
                <a href="#alert-2" className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">Dépôt important sans source</h6>
                    <small className="badge badge-warning">Moyen</small>
                  </div>
                  <p className="mb-1">Marie Leroux - 350 000 XPF</p>
                  <small className="text-muted">13 avril 2025, 14:20</small>
                </a>
                <a href="#alert-3" className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">Rotation rapide des méthodes de paiement</h6>
                    <small className="badge badge-danger">Critique</small>
                  </div>
                  <p className="mb-1">Sophie Bernard - 4 méthodes en 10 minutes</p>
                  <small className="text-muted">15 avril 2025, 07:10</small>
                </a>
                <a href="#alert-4" className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">Comptes multiples détectés</h6>
                    <small className="badge badge-success">Résolu</small>
                  </div>
                  <p className="mb-1">Paul Martin - 3 comptes similaires</p>
                  <small className="text-muted">10 avril 2025, 16:45</small>
                </a>
              </div>
            </div>
            <div className="card-footer text-center">
              <a href="#all-alerts" className="btn btn-sm btn-link">Voir toutes les alertes</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertsTab = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div>
      {/* Filtres et recherche */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <Search size={16} />
              </span>
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher par ID, nom ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <Filter size={16} />
              </span>
            </div>
            <select
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="investigating">En cours</option>
              <option value="resolved">Résolu</option>
              <option value="closed">Fermé</option>
            </select>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <AlertCircle size={16} />
              </span>
            </div>
            <select
              className="form-control"
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
            >
              <option value="all">Tous les risques</option>
              <option value="critical">Critique</option>
              <option value="high">Élevé</option>
              <option value="medium">Moyen</option>
              <option value="low">Faible</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Tableau des alertes */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Utilisateur</th>
              <th>Description</th>
              <th>Niveau de risque</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>AML-001-23456</td>
              <td>Jean Dupont</td>
              <td>Multiples transactions rapides excédant 50 000 XPF</td>
              <td><span className="badge badge-danger">Élevé</span></td>
              <td><span className="badge badge-warning">En attente</span></td>
              <td>14/04/2025 08:30</td>
              <td>
                <button className="btn btn-sm btn-info mr-1" title="Détails">
                  <Info size={14} />
                </button>
                <button className="btn btn-sm btn-primary mr-1" title="Examiner">
                  <Clock size={14} />
                </button>
              </td>
            </tr>
            <tr>
              <td>AML-002-34567</td>
              <td>Marie Leroux</td>
              <td>Dépôt important sans source identifiable</td>
              <td><span className="badge badge-warning">Moyen</span></td>
              <td><span className="badge badge-warning">En attente</span></td>
              <td>13/04/2025 14:20</td>
              <td>
                <button className="btn btn-sm btn-info mr-1" title="Détails">
                  <Info size={14} />
                </button>
                <button className="btn btn-sm btn-primary mr-1" title="Examiner">
                  <Clock size={14} />
                </button>
              </td>
            </tr>
            <tr>
              <td>AML-003-45678</td>
              <td>Sophie Bernard</td>
              <td>Multiples modifications des méthodes de paiement</td>
              <td><span className="badge badge-danger">Critique</span></td>
              <td><span className="badge badge-warning">En attente</span></td>
              <td>15/04/2025 07:10</td>
              <td>
                <button className="btn btn-sm btn-info mr-1" title="Détails">
                  <Info size={14} />
                </button>
                <button className="btn btn-sm btn-primary mr-1" title="Examiner">
                  <Clock size={14} />
                </button>
              </td>
            </tr>
            <tr>
              <td>AML-004-56789</td>
              <td>Paul Martin</td>
              <td>Tentative de création de comptes multiples</td>
              <td><span className="badge badge-success">Faible</span></td>
              <td><span className="badge badge-secondary">Fermé</span></td>
              <td>10/04/2025 16:45</td>
              <td>
                <button className="btn btn-sm btn-info mr-1" title="Détails">
                  <Info size={14} />
                </button>
              </td>
            </tr>
            <tr>
              <td>AML-005-67890</td>
              <td>Thomas Leroy</td>
              <td>Motif de jeu inhabituel avec mises minimales</td>
              <td><span className="badge badge-danger">Élevé</span></td>
              <td><span className="badge badge-info">En cours</span></td>
              <td>12/04/2025 09:15</td>
              <td>
                <button className="btn btn-sm btn-info mr-1" title="Détails">
                  <Info size={14} />
                </button>
                <button className="btn btn-sm btn-success mr-1" title="Approuver">
                  <Check size={14} />
                </button>
                <button className="btn btn-sm btn-danger" title="Rejeter">
                  <X size={14} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          <span className="text-muted">Affichage de 1-5 sur 18 résultats</span>
        </div>
        <div>
          <nav aria-label="Pagination">
            <ul className="pagination pagination-sm mb-0">
              <li className="page-item disabled">
                <a className="page-link" href="#previous">&laquo;</a>
              </li>
              <li className="page-item active">
                <a className="page-link" href="#page1">1</a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#page2">2</a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#page3">3</a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#page4">4</a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#next">&raquo;</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

const ReportsTab = () => {
  return (
    <div>
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Générer un rapport</h5>
            </div>
            <div className="card-body">
              <form>
                <div className="form-group">
                  <label htmlFor="reportType">Type de rapport</label>
                  <select className="form-control" id="reportType">
                    <option value="monthly">Résumé mensuel</option>
                    <option value="risk">Analyse des risques</option>
                    <option value="alerts">Alertes AML</option>
                    <option value="users">Profils utilisateurs</option>
                    <option value="transactions">Transactions suspectes</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="dateRange">Période</label>
                  <select className="form-control" id="dateRange">
                    <option value="last-week">Dernière semaine</option>
                    <option value="last-month">Dernier mois</option>
                    <option value="last-quarter">Dernier trimestre</option>
                    <option value="year-to-date">Depuis le début de l'année</option>
                    <option value="custom">Personnalisé</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="format">Format</label>
                  <select className="form-control" id="format">
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div className="form-group">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="includeDetails" />
                    <label className="form-check-label" htmlFor="includeDetails">
                      Inclure les détails complets
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  Générer le rapport
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Rapports récents</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <a href="#report-1" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Rapport mensuel AML</h6>
                    <small className="text-muted">Généré le 01/04/2025</small>
                  </div>
                  <button className="btn btn-sm btn-secondary">
                    <ExternalLink size={14} className="mr-1" />
                    PDF
                  </button>
                </a>
                <a href="#report-2" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Analyse des risques T1 2025</h6>
                    <small className="text-muted">Généré le 31/03/2025</small>
                  </div>
                  <button className="btn btn-sm btn-secondary">
                    <ExternalLink size={14} className="mr-1" />
                    Excel
                  </button>
                </a>
                <a href="#report-3" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Alertes par type</h6>
                    <small className="text-muted">Généré le 15/03/2025</small>
                  </div>
                  <button className="btn btn-sm btn-secondary">
                    <ExternalLink size={14} className="mr-1" />
                    CSV
                  </button>
                </a>
                <a href="#report-4" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Transactions suspectes</h6>
                    <small className="text-muted">Généré le 01/03/2025</small>
                  </div>
                  <button className="btn btn-sm btn-secondary">
                    <ExternalLink size={14} className="mr-1" />
                    PDF
                  </button>
                </a>
              </div>
            </div>
            <div className="card-footer text-center">
              <a href="#all-reports" className="btn btn-sm btn-link">Voir tous les rapports</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Rapports programmés</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Fréquence</th>
                  <th>Destinataires</th>
                  <th>Dernière exécution</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Rapport AML hebdomadaire</td>
                  <td>Alertes AML</td>
                  <td>Hebdomadaire (Lundi)</td>
                  <td>compliance@ms-bingo-pacifique.com</td>
                  <td>08/04/2025</td>
                  <td><span className="badge badge-success">Actif</span></td>
                  <td>
                    <button className="btn btn-sm btn-info mr-1" title="Modifier">
                      <Info size={14} />
                    </button>
                    <button className="btn btn-sm btn-warning" title="Suspendre">
                      <X size={14} />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Résumé mensuel AML</td>
                  <td>Résumé complet</td>
                  <td>Mensuel (1er jour)</td>
                  <td>direction@ms-bingo-pacifique.com</td>
                  <td>01/04/2025</td>
                  <td><span className="badge badge-success">Actif</span></td>
                  <td>
                    <button className="btn btn-sm btn-info mr-1" title="Modifier">
                      <Info size={14} />
                    </button>
                    <button className="btn btn-sm btn-warning" title="Suspendre">
                      <X size={14} />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Profils à risque élevé</td>
                  <td>Analyse des risques</td>
                  <td>Quotidien</td>
                  <td>alerte-risque@ms-bingo-pacifique.com</td>
                  <td>15/04/2025</td>
                  <td><span className="badge badge-success">Actif</span></td>
                  <td>
                    <button className="btn btn-sm btn-info mr-1" title="Modifier">
                      <Info size={14} />
                    </button>
                    <button className="btn btn-sm btn-warning" title="Suspendre">
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmlDashboardPage;