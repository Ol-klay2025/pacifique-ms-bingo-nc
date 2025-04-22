import React, { useState } from 'react';
import { Database, Search, Filter, AlertCircle, Check, Download, Info, File, CheckSquare, Square } from 'lucide-react';

const GdprExportPage = () => {
  const [activeTab, setActiveTab] = useState('new-export');
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Database size={24} className="mr-3" color="#28a745" />
          <h2 className="mb-0">Export GDPR</h2>
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
                className={`nav-link ${activeTab === 'new-export' ? 'active' : ''}`}
                href="#new-export"
                onClick={(e) => { e.preventDefault(); setActiveTab('new-export'); }}
              >
                Nouvel export
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                href="#history"
                onClick={(e) => { e.preventDefault(); setActiveTab('history'); }}
              >
                Historique des exports
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                href="#info"
                onClick={(e) => { e.preventDefault(); setActiveTab('info'); }}
              >
                Informations GDPR
              </a>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {activeTab === 'new-export' && <NewExportTab />}
          {activeTab === 'history' && <HistoryTab />}
          {activeTab === 'info' && <InfoTab />}
        </div>
      </div>
    </div>
  );
};

const NewExportTab = () => {
  const [userId, setUserId] = useState('');
  const [format, setFormat] = useState('json');
  const [selectedCategories, setSelectedCategories] = useState([
    'personal_info',
    'transactions',
    'game_activity',
    'login_history',
    'consent_history',
    'communication_prefs'
  ]);
  
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  const selectAllCategories = () => {
    setSelectedCategories([
      'personal_info',
      'transactions',
      'game_activity',
      'login_history',
      'consent_history',
      'communication_prefs'
    ]);
  };
  
  const deselectAllCategories = () => {
    setSelectedCategories([]);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Dans une implémentation réelle, appeler l'API pour créer l'export
    alert(`Demande d'export créée pour l'utilisateur ${userId}`);
  };
  
  return (
    <div className="row">
      <div className="col-md-8">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userId">ID Utilisateur</label>
            <input
              type="text"
              className="form-control"
              id="userId"
              placeholder="Entrez l'ID utilisateur (ex: USR-123)"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
            <small className="form-text text-muted">
              L'ID de l'utilisateur dont vous souhaitez exporter les données.
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="format">Format d'export</label>
            <select
              className="form-control"
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <small className="form-text text-muted">
              Format dans lequel les données seront exportées.
            </small>
          </div>
          
          <div className="form-group">
            <label>Catégories de données</label>
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={selectAllCategories}
                  >
                    Tout sélectionner
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={deselectAllCategories}
                  >
                    Tout désélectionner
                  </button>
                </div>
                
                <div className="list-group">
                  <div className="list-group-item">
                    <div className="d-flex align-items-center">
                      <div className="mr-3">
                        {selectedCategories.includes('personal_info') ? (
                          <CheckSquare size={20} className="text-primary" onClick={() => toggleCategory('personal_info')} style={{ cursor: 'pointer' }} />
                        ) : (
                          <Square size={20} onClick={() => toggleCategory('personal_info')} style={{ cursor: 'pointer' }} />
                        )}
                      </div>
                      <div>
                        <strong>Informations personnelles</strong>
                        <p className="mb-0 text-muted small">Nom, email, téléphone, adresse, etc.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="list-group-item">
                    <div className="d-flex align-items-center">
                      <div className="mr-3">
                        {selectedCategories.includes('transactions') ? (
                          <CheckSquare size={20} className="text-primary" onClick={() => toggleCategory('transactions')} style={{ cursor: 'pointer' }} />
                        ) : (
                          <Square size={20} onClick={() => toggleCategory('transactions')} style={{ cursor: 'pointer' }} />
                        )}
                      </div>
                      <div>
                        <strong>Transactions financières</strong>
                        <p className="mb-0 text-muted small">Dépôts, retraits, achats de cartons, gains, etc.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="list-group-item">
                    <div className="d-flex align-items-center">
                      <div className="mr-3">
                        {selectedCategories.includes('game_activity') ? (
                          <CheckSquare size={20} className="text-primary" onClick={() => toggleCategory('game_activity')} style={{ cursor: 'pointer' }} />
                        ) : (
                          <Square size={20} onClick={() => toggleCategory('game_activity')} style={{ cursor: 'pointer' }} />
                        )}
                      </div>
                      <div>
                        <strong>Activité de jeu</strong>
                        <p className="mb-0 text-muted small">Parties jouées, cartons achetés, victoires, etc.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="list-group-item">
                    <div className="d-flex align-items-center">
                      <div className="mr-3">
                        {selectedCategories.includes('login_history') ? (
                          <CheckSquare size={20} className="text-primary" onClick={() => toggleCategory('login_history')} style={{ cursor: 'pointer' }} />
                        ) : (
                          <Square size={20} onClick={() => toggleCategory('login_history')} style={{ cursor: 'pointer' }} />
                        )}
                      </div>
                      <div>
                        <strong>Historique de connexion</strong>
                        <p className="mb-0 text-muted small">Dates, appareils, localisations, etc.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="list-group-item">
                    <div className="d-flex align-items-center">
                      <div className="mr-3">
                        {selectedCategories.includes('consent_history') ? (
                          <CheckSquare size={20} className="text-primary" onClick={() => toggleCategory('consent_history')} style={{ cursor: 'pointer' }} />
                        ) : (
                          <Square size={20} onClick={() => toggleCategory('consent_history')} style={{ cursor: 'pointer' }} />
                        )}
                      </div>
                      <div>
                        <strong>Historique des consentements</strong>
                        <p className="mb-0 text-muted small">Acceptations des conditions, permissions marketing, etc.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="list-group-item">
                    <div className="d-flex align-items-center">
                      <div className="mr-3">
                        {selectedCategories.includes('communication_prefs') ? (
                          <CheckSquare size={20} className="text-primary" onClick={() => toggleCategory('communication_prefs')} style={{ cursor: 'pointer' }} />
                        ) : (
                          <Square size={20} onClick={() => toggleCategory('communication_prefs')} style={{ cursor: 'pointer' }} />
                        )}
                      </div>
                      <div>
                        <strong>Préférences de communication</strong>
                        <p className="mb-0 text-muted small">Abonnements aux newsletters, notifications, etc.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!userId || selectedCategories.length === 0}
            >
              <Database size={16} className="mr-2" />
              Exporter les données
            </button>
          </div>
        </form>
      </div>
      
      <div className="col-md-4">
        <div className="card">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">Informations sur l'export</h5>
          </div>
          <div className="card-body">
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), les utilisateurs ont le droit d'accéder à leurs données personnelles.
            </p>
            <ul className="text-muted">
              <li>Les exports sont générés au format sélectionné et incluent toutes les catégories de données choisies.</li>
              <li>L'utilisateur recevra un lien de téléchargement par email une fois l'export prêt.</li>
              <li>Les données sensibles sont cryptées pour garantir leur sécurité.</li>
              <li>Les exports sont automatiquement supprimés après 30 jours.</li>
            </ul>
            <div className="alert alert-warning mt-3" role="alert">
              <AlertCircle size={16} className="mr-2" />
              <small>
                Toutes les demandes d'export sont enregistrées et auditables pour des raisons de conformité.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoryTab = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div>
      {/* Filtres et recherche */}
      <div className="row mb-4">
        <div className="col-md-8 mb-3">
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <Search size={16} />
              </span>
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher par ID, nom d'utilisateur ou ID d'export..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4 mb-3">
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
              <option value="completed">Complété</option>
              <option value="processing">En cours</option>
              <option value="failed">Échoué</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Tableau des exports */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>ID Export</th>
              <th>Utilisateur</th>
              <th>Format</th>
              <th>Catégories</th>
              <th>Date de demande</th>
              <th>Statut</th>
              <th>Taille</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>EXP-001</td>
              <td>Jean Dupont</td>
              <td>JSON</td>
              <td>6 catégories</td>
              <td>10/04/2025 14:30</td>
              <td><span className="badge badge-success">Complété</span></td>
              <td>256 Ko</td>
              <td>
                <button className="btn btn-sm btn-info mr-1" title="Détails">
                  <Info size={14} />
                </button>
                <button className="btn btn-sm btn-success" title="Télécharger">
                  <Download size={14} />
                </button>
              </td>
            </tr>
            <tr>
              <td>EXP-002</td>
              <td>Marie Leroux</td>
              <td>PDF</td>
              <td>3 catégories</td>
              <td>12/04/2025 09:45</td>
              <td><span className="badge badge-success">Complété</span></td>
              <td>426 Ko</td>
              <td>
                <button className="btn btn-sm btn-info mr-1" title="Détails">
                  <Info size={14} />
                </button>
                <button className="btn btn-sm btn-success" title="Télécharger">
                  <Download size={14} />
                </button>
              </td>
            </tr>
            <tr>
              <td>EXP-003</td>
              <td>Sophie Bernard</td>
              <td>CSV</td>
              <td>2 catégories</td>
              <td>14/04/2025 16:20</td>
              <td><span className="badge badge-warning">En cours</span></td>
              <td>-</td>
              <td>
                <button className="btn btn-sm btn-info" title="Détails">
                  <Info size={14} />
                </button>
              </td>
            </tr>
            <tr>
              <td>EXP-004</td>
              <td>Paul Martin</td>
              <td>JSON</td>
              <td>4 catégories</td>
              <td>05/04/2025 11:15</td>
              <td><span className="badge badge-success">Complété</span></td>
              <td>189 Ko</td>
              <td>
                <button className="btn btn-sm btn-info mr-1" title="Détails">
                  <Info size={14} />
                </button>
                <button className="btn btn-sm btn-success" title="Télécharger">
                  <Download size={14} />
                </button>
              </td>
            </tr>
            <tr>
              <td>EXP-005</td>
              <td>Jean Dupont</td>
              <td>CSV</td>
              <td>2 catégories</td>
              <td>01/04/2025 10:30</td>
              <td><span className="badge badge-success">Complété</span></td>
              <td>125 Ko</td>
              <td>
                <button className="btn btn-sm btn-info mr-1" title="Détails">
                  <Info size={14} />
                </button>
                <button className="btn btn-sm btn-success" title="Télécharger">
                  <Download size={14} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          <span className="text-muted">Affichage de 1-5 sur 15 résultats</span>
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
                <a className="page-link" href="#next">&raquo;</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

const InfoTab = () => {
  return (
    <div className="row">
      <div className="col-md-8">
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Règlement Général sur la Protection des Données (RGPD)</h5>
          </div>
          <div className="card-body">
            <h6>Droits des utilisateurs</h6>
            <p>
              Le RGPD confère aux utilisateurs plusieurs droits concernant leurs données personnelles :
            </p>
            <ul>
              <li><strong>Droit d'accès</strong> - Les utilisateurs peuvent demander une copie de leurs données personnelles.</li>
              <li><strong>Droit de rectification</strong> - Les utilisateurs peuvent demander la correction des données inexactes.</li>
              <li><strong>Droit à l'effacement</strong> - Les utilisateurs peuvent demander la suppression de leurs données.</li>
              <li><strong>Droit à la limitation du traitement</strong> - Les utilisateurs peuvent demander la restriction du traitement de leurs données.</li>
              <li><strong>Droit à la portabilité des données</strong> - Les utilisateurs peuvent demander le transfert de leurs données vers un autre service.</li>
              <li><strong>Droit d'opposition</strong> - Les utilisateurs peuvent s'opposer au traitement de leurs données.</li>
            </ul>
            
            <h6 className="mt-4">Procédure de réponse aux demandes GDPR</h6>
            <ol>
              <li>Recevoir et consigner la demande (généralement via ce module).</li>
              <li>Vérifier l'identité du demandeur.</li>
              <li>Évaluer la demande et déterminer sa validité.</li>
              <li>Recueillir les données requises de nos systèmes.</li>
              <li>Fournir les données au format demandé dans le délai légal (30 jours).</li>
              <li>Documenter l'ensemble du processus pour des raisons d'audit.</li>
            </ol>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Formats d'export disponibles</h5>
          </div>
          <div className="card-body">
            <div className="d-flex mb-4">
              <div className="mr-3">
                <File size={40} />
              </div>
              <div>
                <h6>JSON (JavaScript Object Notation)</h6>
                <p className="text-muted mb-0">
                  Format structuré lisible par machine, idéal pour les développeurs ou pour l'importation dans d'autres systèmes.
                  Préserve la structure hiérarchique des données et fournit les données dans leur forme la plus complète.
                </p>
              </div>
            </div>
            
            <div className="d-flex mb-4">
              <div className="mr-3">
                <File size={40} />
              </div>
              <div>
                <h6>CSV (Comma-Separated Values)</h6>
                <p className="text-muted mb-0">
                  Format tabulaire simple pouvant être ouvert dans Excel ou d'autres tableurs.
                  Idéal pour les utilisateurs qui souhaitent analyser ou manipuler leurs données.
                  Certaines relations entre les données peuvent être simplifiées.
                </p>
              </div>
            </div>
            
            <div className="d-flex">
              <div className="mr-3">
                <File size={40} />
              </div>
              <div>
                <h6>PDF (Portable Document Format)</h6>
                <p className="text-muted mb-0">
                  Format de document présentant les données de manière formatée et lisible.
                  Inclut un résumé des données et des explications sur leur utilisation.
                  Idéal pour les utilisateurs qui souhaitent simplement consulter leurs données.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-4">
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Délais légaux</h5>
          </div>
          <div className="card-body">
            <p>
              Selon le RGPD, nous disposons de <strong>30 jours</strong> pour répondre à une demande d'accès aux données.
              Ce délai peut être prolongé de deux mois supplémentaires si nécessaire, compte tenu de la complexité et du nombre de demandes.
            </p>
            <div className="alert alert-warning">
              <AlertCircle size={16} className="mr-2" />
              <small>
                Le non-respect des délais de réponse peut entraîner des sanctions administratives importantes.
              </small>
            </div>
          </div>
        </div>
        
        <div className="card mb-4">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">Conservation des données</h5>
          </div>
          <div className="card-body">
            <ul className="text-muted">
              <li><strong>Données personnelles :</strong> 3 ans après la dernière activité</li>
              <li><strong>Données de transaction :</strong> 5 ans (exigence légale)</li>
              <li><strong>Données de jeu :</strong> 2 ans après la dernière activité</li>
              <li><strong>Logs de connexion :</strong> 1 an</li>
              <li><strong>Données de consentement :</strong> Durée du compte + 3 ans</li>
              <li><strong>Communications :</strong> 3 ans après la dernière interaction</li>
            </ul>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">Coordonnées DPO</h5>
          </div>
          <div className="card-body">
            <p>
              Pour toute question relative à la protection des données :
            </p>
            <address>
              <strong>Délégué à la Protection des Données</strong><br />
              MS BINGO PACIFIQUE<br />
              privacy@ms-bingo-pacifique.com<br />
              +687 12 34 56
            </address>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GdprExportPage;