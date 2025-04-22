import React from 'react';
import { BarChart2, Shield, Users, Database, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'wouter';

const DashboardPage = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Tableau de bord</h2>
        <div>
          <span className="badge badge-primary p-2">Mise à jour: 15 avril 2025, 10:30</span>
        </div>
      </div>

      {/* Cartes des modules principaux */}
      <div className="row">
        <div className="col-md-4 mb-4">
          <Link href="/aml">
            <div className="card h-100" style={{ cursor: 'pointer' }}>
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center mb-3">
                  <Shield size={24} className="mr-2" color="#ff8c00" />
                  <h3 className="mb-0">AML</h3>
                </div>
                <div className="mb-3">
                  <p>Anti-Money Laundering</p>
                  <div className="d-flex justify-content-between mb-2">
                    <strong>Alertes totales:</strong>
                    <span>18</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <strong>En attente:</strong>
                    <span className="badge badge-warning">6</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <strong>Risque élevé:</strong>
                    <span className="badge badge-danger">4</span>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-danger" 
                      style={{ width: '22%' }} 
                      role="progressbar" 
                      aria-valuenow="22" 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    ></div>
                    <div 
                      className="progress-bar bg-warning" 
                      style={{ width: '33%' }} 
                      role="progressbar" 
                      aria-valuenow="33" 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4 mb-4">
          <Link href="/kyc">
            <div className="card h-100" style={{ cursor: 'pointer' }}>
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center mb-3">
                  <Users size={24} className="mr-2" color="#0088cc" />
                  <h3 className="mb-0">KYC</h3>
                </div>
                <div className="mb-3">
                  <p>Know Your Customer</p>
                  <div className="d-flex justify-content-between mb-2">
                    <strong>Utilisateurs totaux:</strong>
                    <span>256</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <strong>En attente de vérification:</strong>
                    <span className="badge badge-warning">43</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <strong>Risque élevé:</strong>
                    <span className="badge badge-danger">35</span>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: '73%' }} 
                      role="progressbar" 
                      aria-valuenow="73" 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    ></div>
                    <div 
                      className="progress-bar bg-warning" 
                      style={{ width: '17%' }} 
                      role="progressbar" 
                      aria-valuenow="17" 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4 mb-4">
          <Link href="/gdpr">
            <div className="card h-100" style={{ cursor: 'pointer' }}>
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center mb-3">
                  <Database size={24} className="mr-2" color="#28a745" />
                  <h3 className="mb-0">GDPR</h3>
                </div>
                <div className="mb-3">
                  <p>Export de données</p>
                  <div className="d-flex justify-content-between mb-2">
                    <strong>Exports totaux:</strong>
                    <span>15</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <strong>En cours:</strong>
                    <span className="badge badge-warning">1</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <strong>Exports ce mois:</strong>
                    <span>10</span>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: '93%' }} 
                      role="progressbar" 
                      aria-valuenow="93" 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    ></div>
                    <div 
                      className="progress-bar bg-warning" 
                      style={{ width: '7%' }} 
                      role="progressbar" 
                      aria-valuenow="7" 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Activité récente */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="mb-0">Activité récente</h3>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Module</th>
                  <th>Action</th>
                  <th>Utilisateur</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>15/04/2025 09:45</td>
                  <td><span className="badge badge-danger">AML</span></td>
                  <td>Nouveau signalement créé</td>
                  <td>Sophie Bernard</td>
                  <td><span className="badge badge-warning">En attente</span></td>
                </tr>
                <tr>
                  <td>15/04/2025 08:30</td>
                  <td><span className="badge badge-info">KYC</span></td>
                  <td>Document vérifié</td>
                  <td>Thomas Leroy</td>
                  <td><span className="badge badge-success">Approuvé</span></td>
                </tr>
                <tr>
                  <td>14/04/2025 16:20</td>
                  <td><span className="badge badge-success">GDPR</span></td>
                  <td>Export de données demandé</td>
                  <td>Sophie Bernard</td>
                  <td><span className="badge badge-warning">En cours</span></td>
                </tr>
                <tr>
                  <td>14/04/2025 14:15</td>
                  <td><span className="badge badge-danger">AML</span></td>
                  <td>Signalement mis à jour</td>
                  <td>Jean Dupont</td>
                  <td><span className="badge badge-info">Examiné</span></td>
                </tr>
                <tr>
                  <td>14/04/2025 11:30</td>
                  <td><span className="badge badge-info">KYC</span></td>
                  <td>Niveau de vérification modifié</td>
                  <td>Marie Leroux</td>
                  <td><span className="badge badge-success">Complété</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Résumé de conformité et alertes */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h3 className="mb-0">Statut de conformité</h3>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Conformité globale</span>
                <span className="badge badge-success p-2">92%</span>
              </div>
              <div className="progress mb-4" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-success" 
                  style={{ width: '92%' }} 
                  role="progressbar" 
                  aria-valuenow="92" 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>KYC</span>
                <span className="badge badge-info p-2">95%</span>
              </div>
              <div className="progress mb-4" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-info" 
                  style={{ width: '95%' }} 
                  role="progressbar" 
                  aria-valuenow="95" 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>AML</span>
                <span className="badge badge-warning p-2">85%</span>
              </div>
              <div className="progress mb-4" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-warning" 
                  style={{ width: '85%' }} 
                  role="progressbar" 
                  aria-valuenow="85" 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>GDPR</span>
                <span className="badge badge-success p-2">97%</span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-success" 
                  style={{ width: '97%' }} 
                  role="progressbar" 
                  aria-valuenow="97" 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h3 className="mb-0">Alertes à traiter</h3>
            </div>
            <div className="card-body">
              <div className="list-group">
                <Link href="/aml">
                  <a className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">Signalement critique</h5>
                      <small className="text-danger">
                        <AlertTriangle size={16} className="mr-1" />
                        Urgent
                      </small>
                    </div>
                    <p className="mb-1">Sophie Bernard: Multiples modifications des méthodes de paiement</p>
                    <small className="text-muted">
                      <Clock size={14} className="mr-1" />
                      Il y a 3 heures
                    </small>
                  </a>
                </Link>
                <Link href="/kyc">
                  <a className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">KYC en attente</h5>
                      <small className="text-warning">Haute priorité</small>
                    </div>
                    <p className="mb-1">3 documents nécessitent une vérification</p>
                    <small className="text-muted">
                      <Clock size={14} className="mr-1" />
                      Depuis hier
                    </small>
                  </a>
                </Link>
                <Link href="/aml">
                  <a className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">Transaction suspicieuse</h5>
                      <small className="text-warning">À examiner</small>
                    </div>
                    <p className="mb-1">Jean Dupont: Multiples transactions rapides</p>
                    <small className="text-muted">
                      <Clock size={14} className="mr-1" />
                      Il y a 1 jour
                    </small>
                  </a>
                </Link>
                <Link href="/gdpr">
                  <a className="list-group-item list-group-item-action">
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">Export GDPR</h5>
                      <small className="text-info">En cours</small>
                    </div>
                    <p className="mb-1">Demande d'export de Sophie Bernard en cours de traitement</p>
                    <small className="text-muted">
                      <Clock size={14} className="mr-1" />
                      Il y a 5 heures
                    </small>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;