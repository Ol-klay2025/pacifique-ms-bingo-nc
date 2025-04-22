import React, { useState } from 'react';
import { Users, Search, Filter, AlertCircle, Check, Clock, X, Info, User, Shield, FileText, MapPin } from 'lucide-react';

const KycManagementPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState(null);
  
  const handleUserSelect = (userId) => {
    // Dans une implémentation réelle, on ferait une requête API pour obtenir les détails de l'utilisateur
    setSelectedUser({
      id: 'USR-298',
      username: 'jean.dupont',
      email: 'jean.dupont@example.com',
      fullName: 'Jean Dupont',
      birthDate: '1985-06-15',
      nationality: 'FR',
      phone: '+687123456',
      status: 'verified',
      verificationLevel: 'full',
      address: {
        street: '123 Rue du Pacifique',
        city: 'Nouméa',
        postalCode: '98800',
        country: 'NC'
      },
      documents: [
        {
          type: 'passport',
          number: 'P12345678',
          issueDate: '2020-01-15',
          expiryDate: '2030-01-10',
          status: 'verified',
          verifiedAt: '2025-03-12T09:45:00',
          verifiedBy: 'Michel Dupuis'
        },
        {
          type: 'proof_of_address',
          description: 'Facture EDF',
          issueDate: '2024-12-20',
          status: 'verified',
          verifiedAt: '2025-03-12T09:46:00',
          verifiedBy: 'Michel Dupuis'
        }
      ],
      riskAssessment: {
        score: 25,
        level: 'low',
        factors: {
          country: 20,
          activity: 15,
          profile: 30,
          transactions: 35
        }
      },
      limits: {
        daily: 100000,
        weekly: 500000,
        monthly: 1500000
      },
      registeredAt: '2025-03-10T14:20:00',
      lastVerificationUpdate: '2025-03-12T09:46:00'
    });
    setActiveTab('user-details');
  };
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Users size={24} className="mr-3" color="#0088cc" />
          <h2 className="mb-0">Know Your Customer</h2>
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
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                href="#users"
                onClick={(e) => { e.preventDefault(); setActiveTab('users'); }}
              >
                Utilisateurs
              </a>
            </li>
            {selectedUser && (
              <li className="nav-item">
                <a 
                  className={`nav-link ${activeTab === 'user-details' ? 'active' : ''}`}
                  href="#user-details"
                  onClick={(e) => { e.preventDefault(); setActiveTab('user-details'); }}
                >
                  {selectedUser.fullName}
                </a>
              </li>
            )}
          </ul>
        </div>
        <div className="card-body">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'users' && <UsersTab onUserSelect={handleUserSelect} />}
          {activeTab === 'user-details' && selectedUser && <UserDetailsTab user={selectedUser} />}
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
              <h1 className="display-4 mb-0">256</h1>
              <p className="text-muted">Utilisateurs totaux</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h1 className="display-4 mb-0">187</h1>
              <p className="mb-0">Vérifiés</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning">
            <div className="card-body text-center">
              <h1 className="display-4 mb-0">43</h1>
              <p className="mb-0">En attente</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-danger text-white">
            <div className="card-body text-center">
              <h1 className="display-4 mb-0">26</h1>
              <p className="mb-0">Rejetés</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Niveaux de vérification</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Niveau complet</span>
                <span className="badge badge-success">90</span>
              </div>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div className="progress-bar bg-success" style={{ width: '35%' }} role="progressbar" aria-valuenow="35" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Niveau avancé</span>
                <span className="badge badge-info">97</span>
              </div>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div className="progress-bar bg-info" style={{ width: '38%' }} role="progressbar" aria-valuenow="38" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Niveau basique</span>
                <span className="badge badge-warning">57</span>
              </div>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div className="progress-bar bg-warning" style={{ width: '22%' }} role="progressbar" aria-valuenow="22" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Non vérifié</span>
                <span className="badge badge-danger">12</span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div className="progress-bar bg-danger" style={{ width: '5%' }} role="progressbar" aria-valuenow="5" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Documents récents</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <a href="#doc-1" className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">Permis de conduire</h6>
                    <small className="badge badge-warning">En attente</small>
                  </div>
                  <p className="mb-1">Sophie Bernard</p>
                  <small className="text-muted">Soumis le 14 avril 2025</small>
                </a>
                <a href="#doc-2" className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">Facture téléphone</h6>
                    <small className="badge badge-warning">En attente</small>
                  </div>
                  <p className="mb-1">Thomas Leroy</p>
                  <small className="text-muted">Soumis le 12 avril 2025</small>
                </a>
                <a href="#doc-3" className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">Passeport</h6>
                    <small className="badge badge-success">Vérifié</small>
                  </div>
                  <p className="mb-1">Thomas Leroy</p>
                  <small className="text-muted">Vérifié le 3 avril 2025</small>
                </a>
                <a href="#doc-4" className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">Passeport</h6>
                    <small className="badge badge-danger">Rejeté</small>
                  </div>
                  <p className="mb-1">Paul Martin</p>
                  <small className="text-muted">Rejeté le 11 avril 2025</small>
                </a>
              </div>
            </div>
            <div className="card-footer text-center">
              <a href="#all-documents" className="btn btn-sm btn-link">Voir tous les documents</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Utilisateurs à risque élevé</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Score de risque</th>
                  <th>Niveau de vérification</th>
                  <th>Statut</th>
                  <th>Inscrit le</th>
                  <th>Facteurs de risque</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Paul Martin</td>
                  <td><span className="badge badge-danger">85</span></td>
                  <td><span className="badge badge-warning">Basique</span></td>
                  <td><span className="badge badge-danger">Rejeté</span></td>
                  <td>10/04/2025</td>
                  <td>Documents suspects, localisation</td>
                  <td>
                    <button className="btn btn-sm btn-info mr-1" title="Détails">
                      <Info size={14} />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Thomas Leroy</td>
                  <td><span className="badge badge-danger">70</span></td>
                  <td><span className="badge badge-info">Avancé</span></td>
                  <td><span className="badge badge-warning">En attente</span></td>
                  <td>01/04/2025</td>
                  <td>Activité suspecte, localisation</td>
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
                  <td>Sophie Bernard</td>
                  <td><span className="badge badge-warning">60</span></td>
                  <td><span className="badge badge-warning">Basique</span></td>
                  <td><span className="badge badge-warning">En attente</span></td>
                  <td>10/04/2025</td>
                  <td>Transactions inhabituelles</td>
                  <td>
                    <button className="btn btn-sm btn-info mr-1" title="Détails">
                      <Info size={14} />
                    </button>
                    <button className="btn btn-sm btn-primary mr-1" title="Examiner">
                      <Clock size={14} />
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

const UsersTab = ({ onUserSelect }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
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
              placeholder="Rechercher par nom, email ou ID..."
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
              <option value="verified">Vérifié</option>
              <option value="pending">En attente</option>
              <option value="rejected">Rejeté</option>
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
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="all">Tous les niveaux</option>
              <option value="full">Complet</option>
              <option value="enhanced">Avancé</option>
              <option value="basic">Basique</option>
              <option value="none">Non vérifié</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Tableau des utilisateurs */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom complet</th>
              <th>Email</th>
              <th>Niveau de vérification</th>
              <th>Statut</th>
              <th>Risque</th>
              <th>Inscrit le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr onClick={() => onUserSelect('USR-298')}>
              <td>USR-298</td>
              <td>Jean Dupont</td>
              <td>jean.dupont@example.com</td>
              <td><span className="badge badge-success">Complet</span></td>
              <td><span className="badge badge-success">Vérifié</span></td>
              <td><span className="badge badge-success">Faible</span></td>
              <td>10/03/2025</td>
              <td>
                <button className="btn btn-sm btn-info mr-1" title="Détails">
                  <Info size={14} />
                </button>
              </td>
            </tr>
            <tr onClick={() => onUserSelect('USR-415')}>
              <td>USR-415</td>
              <td>Marie Leroux</td>
              <td>marie.leroux@example.com</td>
              <td><span className="badge badge-info">Avancé</span></td>
              <td><span className="badge badge-success">Vérifié</span></td>
              <td><span className="badge badge-warning">Moyen</span></td>
              <td>12/03/2025</td>
              <td>
                <button className="btn btn-sm btn-info mr-1" title="Détails">
                  <Info size={14} />
                </button>
              </td>
            </tr>
            <tr onClick={() => onUserSelect('USR-189')}>
              <td>USR-189</td>
              <td>Sophie Bernard</td>
              <td>sophie.bernard@example.com</td>
              <td><span className="badge badge-warning">Basique</span></td>
              <td><span className="badge badge-warning">En attente</span></td>
              <td><span className="badge badge-warning">Moyen</span></td>
              <td>10/04/2025</td>
              <td>
                <button className="btn btn-sm btn-info mr-1" title="Détails">
                  <Info size={14} />
                </button>
                <button className="btn btn-sm btn-primary mr-1" title="Examiner">
                  <Clock size={14} />
                </button>
              </td>
            </tr>
            <tr onClick={() => onUserSelect('USR-732')}>
              <td>USR-732</td>
              <td>Paul Martin</td>
              <td>paulmartin75@example.com</td>
              <td><span className="badge badge-warning">Basique</span></td>
              <td><span className="badge badge-danger">Rejeté</span></td>
              <td><span className="badge badge-danger">Élevé</span></td>
              <td>10/04/2025</td>
              <td>
                <button className="btn btn-sm btn-info mr-1" title="Détails">
                  <Info size={14} />
                </button>
              </td>
            </tr>
            <tr onClick={() => onUserSelect('USR-564')}>
              <td>USR-564</td>
              <td>Thomas Leroy</td>
              <td>thomas.leroy@example.com</td>
              <td><span className="badge badge-info">Avancé</span></td>
              <td><span className="badge badge-warning">En attente</span></td>
              <td><span className="badge badge-danger">Élevé</span></td>
              <td>01/04/2025</td>
              <td>
                <button className="btn btn-sm btn-info mr-1" title="Détails">
                  <Info size={14} />
                </button>
                <button className="btn btn-sm btn-primary mr-1" title="Examiner">
                  <Clock size={14} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          <span className="text-muted">Affichage de 1-5 sur 256 résultats</span>
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

const UserDetailsTab = ({ user }) => {
  const [activeSection, setActiveSection] = useState('personal');
  
  return (
    <div>
      <div className="mb-4">
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <User size={24} className="mr-3" />
                <div>
                  <h4 className="mb-0">{user.fullName}</h4>
                  <p className="text-muted mb-0">{user.email}</p>
                </div>
              </div>
              <div className="d-flex">
                <span className={`badge p-2 mr-2 verification-${user.verificationLevel}`}>
                  {user.verificationLevel === 'full' && 'Niveau Complet'}
                  {user.verificationLevel === 'enhanced' && 'Niveau Avancé'}
                  {user.verificationLevel === 'basic' && 'Niveau Basique'}
                  {user.verificationLevel === 'none' && 'Non Vérifié'}
                </span>
                <span className={`badge p-2 status-${user.status}`}>
                  {user.status === 'verified' && 'Vérifié'}
                  {user.status === 'pending' && 'En Attente'}
                  {user.status === 'rejected' && 'Rejeté'}
                </span>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="d-flex mb-3">
                  <div className="mr-4">
                    <strong>ID:</strong>
                  </div>
                  <div>{user.id}</div>
                </div>
                <div className="d-flex mb-3">
                  <div className="mr-4">
                    <strong>Nom d'utilisateur:</strong>
                  </div>
                  <div>{user.username}</div>
                </div>
                <div className="d-flex mb-3">
                  <div className="mr-4">
                    <strong>Date de naissance:</strong>
                  </div>
                  <div>{new Date(user.birthDate).toLocaleDateString('fr-FR')}</div>
                </div>
                <div className="d-flex mb-3">
                  <div className="mr-4">
                    <strong>Nationalité:</strong>
                  </div>
                  <div>{user.nationality}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex mb-3">
                  <div className="mr-4">
                    <strong>Téléphone:</strong>
                  </div>
                  <div>{user.phone}</div>
                </div>
                <div className="d-flex mb-3">
                  <div className="mr-4">
                    <strong>Inscrit le:</strong>
                  </div>
                  <div>{new Date(user.registeredAt).toLocaleString('fr-FR')}</div>
                </div>
                <div className="d-flex mb-3">
                  <div className="mr-4">
                    <strong>Dernière mise à jour:</strong>
                  </div>
                  <div>{new Date(user.lastVerificationUpdate).toLocaleString('fr-FR')}</div>
                </div>
                <div className="d-flex mb-3">
                  <div className="mr-4">
                    <strong>Score de risque:</strong>
                  </div>
                  <div>
                    <span className={`badge p-2 ${user.riskAssessment.score < 30 ? 'badge-success' : user.riskAssessment.score < 60 ? 'badge-warning' : 'badge-danger'}`}>
                      {user.riskAssessment.score}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <a 
                  className={`nav-link ${activeSection === 'personal' ? 'active' : ''}`}
                  href="#personal"
                  onClick={(e) => { e.preventDefault(); setActiveSection('personal'); }}
                >
                  <User size={16} className="mr-1" />
                  Informations personnelles
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activeSection === 'documents' ? 'active' : ''}`}
                  href="#documents"
                  onClick={(e) => { e.preventDefault(); setActiveSection('documents'); }}
                >
                  <FileText size={16} className="mr-1" />
                  Documents
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activeSection === 'risk' ? 'active' : ''}`}
                  href="#risk"
                  onClick={(e) => { e.preventDefault(); setActiveSection('risk'); }}
                >
                  <Shield size={16} className="mr-1" />
                  Évaluation du risque
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activeSection === 'limits' ? 'active' : ''}`}
                  href="#limits"
                  onClick={(e) => { e.preventDefault(); setActiveSection('limits'); }}
                >
                  <AlertCircle size={16} className="mr-1" />
                  Limites financières
                </a>
              </li>
            </ul>
            
            {activeSection === 'personal' && (
              <div>
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Adresse</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="d-flex mb-3">
                          <div className="mr-4">
                            <strong>Rue:</strong>
                          </div>
                          <div>{user.address.street}</div>
                        </div>
                        <div className="d-flex mb-3">
                          <div className="mr-4">
                            <strong>Ville:</strong>
                          </div>
                          <div>{user.address.city}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex mb-3">
                          <div className="mr-4">
                            <strong>Code postal:</strong>
                          </div>
                          <div>{user.address.postalCode}</div>
                        </div>
                        <div className="d-flex mb-3">
                          <div className="mr-4">
                            <strong>Pays:</strong>
                          </div>
                          <div>{user.address.country}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button className="btn btn-sm btn-outline-primary">
                        <MapPin size={14} className="mr-1" />
                        Afficher sur la carte
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Notes</h5>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <textarea className="form-control" rows="3" placeholder="Ajouter une note..."></textarea>
                    </div>
                    <button className="btn btn-sm btn-primary">Enregistrer la note</button>
                    
                    <div className="mt-4">
                      <p className="text-muted small">Aucune note disponible</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'documents' && (
              <div>
                <div className="mb-4">
                  <h5>Documents vérifiés</h5>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Numéro</th>
                          <th>Date d'émission</th>
                          <th>Date d'expiration</th>
                          <th>Statut</th>
                          <th>Vérifié par</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user.documents.map((doc, index) => (
                          <tr key={index}>
                            <td>
                              {doc.type === 'passport' && 'Passeport'}
                              {doc.type === 'id_card' && 'Carte d\'identité'}
                              {doc.type === 'driving_license' && 'Permis de conduire'}
                              {doc.type === 'proof_of_address' && 'Justificatif de domicile'}
                              {doc.description && ` (${doc.description})`}
                            </td>
                            <td>{doc.number || '-'}</td>
                            <td>{doc.issueDate}</td>
                            <td>{doc.expiryDate || '-'}</td>
                            <td>
                              <span className={`badge status-${doc.status}`}>
                                {doc.status === 'verified' && 'Vérifié'}
                                {doc.status === 'pending' && 'En Attente'}
                                {doc.status === 'rejected' && 'Rejeté'}
                              </span>
                            </td>
                            <td>{doc.verifiedBy || '-'}</td>
                            <td>
                              <button className="btn btn-sm btn-info mr-1" title="Voir le document">
                                <Info size={14} />
                              </button>
                              {doc.status === 'pending' && (
                                <>
                                  <button className="btn btn-sm btn-success mr-1" title="Approuver">
                                    <Check size={14} />
                                  </button>
                                  <button className="btn btn-sm btn-danger" title="Rejeter">
                                    <X size={14} />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Exigences de documents</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Type de document</th>
                            <th>Statut</th>
                            <th>Niveau requis</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Pièce d'identité</td>
                            <td><span className="badge badge-success">Fourni</span></td>
                            <td>Basique</td>
                          </tr>
                          <tr>
                            <td>Justificatif de domicile</td>
                            <td><span className="badge badge-success">Fourni</span></td>
                            <td>Basique</td>
                          </tr>
                          <tr>
                            <td>Pièce d'identité secondaire</td>
                            <td><span className="badge badge-success">Fourni</span></td>
                            <td>Avancé</td>
                          </tr>
                          <tr>
                            <td>Selfie avec pièce d'identité</td>
                            <td><span className="badge badge-success">Fourni</span></td>
                            <td>Avancé</td>
                          </tr>
                          <tr>
                            <td>Justificatif de revenus</td>
                            <td><span className="badge badge-success">Fourni</span></td>
                            <td>Complet</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'risk' && (
              <div>
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Score de risque global</h5>
                  </div>
                  <div className="card-body text-center">
                    <div className="d-flex justify-content-center align-items-center mb-4">
                      <div style={{ 
                        width: '150px', 
                        height: '150px', 
                        borderRadius: '50%', 
                        background: `conic-gradient(${user.riskAssessment.score < 30 ? '#28a745' : user.riskAssessment.score < 60 ? '#ffc107' : '#dc3545'} ${user.riskAssessment.score}%, #e9ecef 0%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{ 
                          width: '120px', 
                          height: '120px', 
                          borderRadius: '50%', 
                          background: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          fontWeight: 'bold'
                        }}>
                          {user.riskAssessment.score}/100
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className={`badge p-2 ${user.riskAssessment.score < 30 ? 'badge-success' : user.riskAssessment.score < 60 ? 'badge-warning' : 'badge-danger'}`}>
                        {user.riskAssessment.level === 'low' && 'Risque Faible'}
                        {user.riskAssessment.level === 'medium' && 'Risque Moyen'}
                        {user.riskAssessment.level === 'high' && 'Risque Élevé'}
                        {user.riskAssessment.level === 'critical' && 'Risque Critique'}
                      </span>
                    </div>
                    <p className="text-muted">
                      Dernière évaluation: {new Date(user.lastVerificationUpdate).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Facteurs de risque</h5>
                  </div>
                  <div className="card-body">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <strong>Pays</strong>
                          <span className="text-muted ml-2">(localisation, nationalité)</span>
                        </div>
                        <span className="badge badge-info">{user.riskAssessment.factors.country}/100</span>
                      </div>
                      <div className="progress mb-4" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar ${user.riskAssessment.factors.country < 30 ? 'bg-success' : user.riskAssessment.factors.country < 60 ? 'bg-warning' : 'bg-danger'}`}
                          style={{ width: `${user.riskAssessment.factors.country}%` }}
                          role="progressbar"
                          aria-valuenow={user.riskAssessment.factors.country}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <strong>Activité</strong>
                          <span className="text-muted ml-2">(fréquence, horaires, montants)</span>
                        </div>
                        <span className="badge badge-info">{user.riskAssessment.factors.activity}/100</span>
                      </div>
                      <div className="progress mb-4" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar ${user.riskAssessment.factors.activity < 30 ? 'bg-success' : user.riskAssessment.factors.activity < 60 ? 'bg-warning' : 'bg-danger'}`}
                          style={{ width: `${user.riskAssessment.factors.activity}%` }}
                          role="progressbar"
                          aria-valuenow={user.riskAssessment.factors.activity}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <strong>Profil</strong>
                          <span className="text-muted ml-2">(âge, historique, documents)</span>
                        </div>
                        <span className="badge badge-info">{user.riskAssessment.factors.profile}/100</span>
                      </div>
                      <div className="progress mb-4" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar ${user.riskAssessment.factors.profile < 30 ? 'bg-success' : user.riskAssessment.factors.profile < 60 ? 'bg-warning' : 'bg-danger'}`}
                          style={{ width: `${user.riskAssessment.factors.profile}%` }}
                          role="progressbar"
                          aria-valuenow={user.riskAssessment.factors.profile}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <strong>Transactions</strong>
                          <span className="text-muted ml-2">(volumes, méthodes, motifs)</span>
                        </div>
                        <span className="badge badge-info">{user.riskAssessment.factors.transactions}/100</span>
                      </div>
                      <div className="progress mb-4" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar ${user.riskAssessment.factors.transactions < 30 ? 'bg-success' : user.riskAssessment.factors.transactions < 60 ? 'bg-warning' : 'bg-danger'}`}
                          style={{ width: `${user.riskAssessment.factors.transactions}%` }}
                          role="progressbar"
                          aria-valuenow={user.riskAssessment.factors.transactions}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'limits' && (
              <div>
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Limites financières</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Période</th>
                            <th>Limite actuelle (XPF)</th>
                            <th>Limite maximale (XPF)</th>
                            <th>Utilisation récente</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Quotidien</td>
                            <td>{user.limits.daily.toLocaleString('fr-FR')}</td>
                            <td>{
                              user.verificationLevel === 'full' ? '100 000' :
                              user.verificationLevel === 'enhanced' ? '75 000' :
                              user.verificationLevel === 'basic' ? '50 000' : '25 000'
                            }</td>
                            <td>
                              <div className="progress" style={{ height: '8px' }}>
                                <div className="progress-bar bg-info" style={{ width: '35%' }} role="progressbar" aria-valuenow="35" aria-valuemin="0" aria-valuemax="100"></div>
                              </div>
                              <small className="text-muted">35% (35 000 XPF)</small>
                            </td>
                          </tr>
                          <tr>
                            <td>Hebdomadaire</td>
                            <td>{user.limits.weekly.toLocaleString('fr-FR')}</td>
                            <td>{
                              user.verificationLevel === 'full' ? '500 000' :
                              user.verificationLevel === 'enhanced' ? '300 000' :
                              user.verificationLevel === 'basic' ? '200 000' : '100 000'
                            }</td>
                            <td>
                              <div className="progress" style={{ height: '8px' }}>
                                <div className="progress-bar bg-info" style={{ width: '45%' }} role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100"></div>
                              </div>
                              <small className="text-muted">45% (225 000 XPF)</small>
                            </td>
                          </tr>
                          <tr>
                            <td>Mensuel</td>
                            <td>{user.limits.monthly.toLocaleString('fr-FR')}</td>
                            <td>{
                              user.verificationLevel === 'full' ? '1 500 000' :
                              user.verificationLevel === 'enhanced' ? '1 000 000' :
                              user.verificationLevel === 'basic' ? '500 000' : '300 000'
                            }</td>
                            <td>
                              <div className="progress" style={{ height: '8px' }}>
                                <div className="progress-bar bg-info" style={{ width: '25%' }} role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                              </div>
                              <small className="text-muted">25% (375 000 XPF)</small>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4">
                      <h6>Modifier les limites</h6>
                      <p className="text-muted small">
                        Les limites sont déterminées par le niveau de vérification de l'utilisateur.
                        Pour augmenter les limites, l'utilisateur doit compléter un niveau de vérification supérieur.
                      </p>
                      <div className="form-group">
                        <label>Limitation spéciale</label>
                        <select className="form-control">
                          <option value="none">Aucune</option>
                          <option value="reduced">Limites réduites (-50%)</option>
                          <option value="blocked">Bloquer les transactions</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Raison</label>
                        <textarea className="form-control" rows="2"></textarea>
                      </div>
                      <button className="btn btn-warning">Appliquer une limitation</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-4 text-right">
              <button className="btn btn-secondary mr-2">Annuler</button>
              <button className="btn btn-success">Enregistrer les modifications</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycManagementPage;