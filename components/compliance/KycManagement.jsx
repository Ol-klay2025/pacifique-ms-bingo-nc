import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

/**
 * Interface de gestion KYC pour la conformité
 */
const KycManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Statistiques KYC
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    highRisk: 0
  });

  // Fonction pour charger les données depuis l'API
  const loadUserData = async () => {
    try {
      setLoading(true);
      // Dans une implémentation réelle, appeler l'API
      // const response = await fetch('/api/kyc/users');
      // const data = await response.json();
      
      // Simulation de données (à remplacer par l'appel API réel)
      const mockData = [
        {
          id: 1024,
          username: 'jean.dupont',
          fullName: 'Jean Dupont',
          email: 'jean.dupont@example.com',
          verificationLevel: 3, // FULL
          verificationStatus: 'verified',
          documents: [
            { type: 'passport', status: 'verified' },
            { type: 'utility_bill', status: 'verified' }
          ],
          riskScore: 15,
          riskLevel: 'low',
          lastUpdated: '2025-04-10T14:30:00Z'
        },
        {
          id: 587,
          username: 'marie.leroux',
          fullName: 'Marie Leroux',
          email: 'marie.leroux@example.com',
          verificationLevel: 2, // ENHANCED
          verificationStatus: 'verified',
          documents: [
            { type: 'national_id', status: 'verified' }
          ],
          riskScore: 25,
          riskLevel: 'low',
          lastUpdated: '2025-04-12T09:45:00Z'
        },
        {
          id: 893,
          username: 'pierre.martin',
          fullName: 'Pierre Martin',
          email: 'pierre.martin@example.com',
          verificationLevel: 1, // BASIC
          verificationStatus: 'pending',
          documents: [
            { type: 'driving_license', status: 'pending' }
          ],
          riskScore: 40,
          riskLevel: 'medium',
          lastUpdated: '2025-04-14T16:20:00Z'
        },
        {
          id: 256,
          username: 'sophie.bernard',
          fullName: 'Sophie Bernard',
          email: 'sophie.bernard@example.com',
          verificationLevel: 0, // NONE
          verificationStatus: 'rejected',
          documents: [
            { type: 'passport', status: 'rejected', reason: 'Document illisible' },
            { type: 'utility_bill', status: 'rejected', reason: 'Document expiré' }
          ],
          riskScore: 75,
          riskLevel: 'high',
          lastUpdated: '2025-04-13T10:15:00Z'
        }
      ];
      
      setUsers(mockData);
      
      // Calcul des statistiques
      setStats({
        total: mockData.length,
        verified: mockData.filter(u => u.verificationStatus === 'verified').length,
        pending: mockData.filter(u => u.verificationStatus === 'pending').length,
        rejected: mockData.filter(u => u.verificationStatus === 'rejected').length,
        highRisk: mockData.filter(u => u.riskLevel === 'high').length
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données KYC:', error);
      setLoading(false);
    }
  };

  // Chargement des données au montage du composant
  useEffect(() => {
    loadUserData();
  }, []);

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (filter === 'all') return matchesSearch;
    if (filter === 'verified') return user.verificationStatus === 'verified' && matchesSearch;
    if (filter === 'pending') return user.verificationStatus === 'pending' && matchesSearch;
    if (filter === 'rejected') return user.verificationStatus === 'rejected' && matchesSearch;
    if (filter === 'high_risk') return user.riskLevel === 'high' && matchesSearch;
    
    return matchesSearch;
  });

  // Fonction pour charger les détails d'un utilisateur
  const loadUserDetails = async (userId) => {
    try {
      // Dans une implémentation réelle, appeler l'API
      // const response = await fetch(`/api/kyc/status/${userId}/admin`);
      // const data = await response.json();
      
      // Simulation de données (à remplacer par l'appel API réel)
      const mockUserDetails = {
        // Données utilisateur complètes (provenant de l'API)
        userId,
        username: users.find(u => u.id === userId)?.username || `user_${userId}`,
        email: users.find(u => u.id === userId)?.email || `user${userId}@example.com`,
        verificationLevel: users.find(u => u.id === userId)?.verificationLevel || 0,
        verificationStatus: users.find(u => u.id === userId)?.verificationStatus || 'pending',
        personalDetails: {
          firstName: "Jean",
          lastName: "Dupont",
          dateOfBirth: "1985-06-15",
          nationality: "FR",
          address: {
            street: "123 Rue du Pacifique",
            city: "Nouméa",
            postalCode: "98800",
            country: "NC"
          },
          phoneNumber: "+687123456"
        },
        documents: [
          {
            id: "doc-1001",
            type: "passport",
            documentNumber: "P12345678",
            issueDate: "2020-01-10",
            expiryDate: "2030-01-10",
            status: "verified",
            submissionDate: "2025-01-10T14:35:22Z",
            verificationDate: "2025-01-12T09:20:15Z"
          },
          {
            id: "doc-1002",
            type: "utility_bill",
            issuer: "EDF",
            issueDate: "2024-12-20",
            status: "verified",
            submissionDate: "2025-01-10T14:36:45Z",
            verificationDate: "2025-01-12T09:25:30Z"
          }
        ],
        riskAssessment: {
          overallRiskScore: 25,
          riskLevel: "low",
          factors: {
            countryRisk: 20,
            activityRisk: 15,
            profileRisk: 30,
            transactionRisk: 35
          }
        },
        financialLimits: {
          daily: {
            deposit: 100000,
            withdrawal: 50000
          },
          weekly: {
            deposit: 500000,
            withdrawal: 200000
          },
          monthly: {
            deposit: 1000000,
            withdrawal: 500000
          }
        }
      };
      
      setSelectedUser(mockUserDetails);
    } catch (error) {
      console.error('Erreur lors du chargement des détails KYC:', error);
    }
  };

  // Formatage du niveau de vérification
  const getVerificationLevelLabel = (level) => {
    switch(level) {
      case 0: return 'Non vérifié';
      case 1: return 'Basique';
      case 2: return 'Avancé';
      case 3: return 'Complet';
      default: return 'Inconnu';
    }
  };

  // Rendu d'un badge pour le statut de vérification
  const renderVerificationBadge = (status) => {
    switch(status) {
      case 'verified': 
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Vérifié</Badge>;
      case 'pending': 
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'rejected': 
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Rendu d'un badge pour le niveau de risque
  const renderRiskBadge = (riskLevel) => {
    switch(riskLevel) {
      case 'low': 
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Faible</Badge>;
      case 'medium': 
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Moyen</Badge>;
      case 'high': 
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Élevé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Formatage de la date pour affichage
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="kyc-management">
      <div className="kyc-header">
        <h2 className="text-2xl font-bold">Gestion KYC</h2>
        <p className="text-gray-500">Vérification d'identité et gestion des risques utilisateurs</p>
      </div>

      <div className="stats-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 my-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vérifiés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.verified}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejetés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risque élevé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.highRisk}</div>
          </CardContent>
        </Card>
      </div>

      <div className="filters-container flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input 
            placeholder="Rechercher par nom, identifiant ou email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="filter-select w-full sm:w-64">
          <Select defaultValue={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les utilisateurs</SelectItem>
              <SelectItem value="verified">Vérifiés</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="rejected">Rejetés</SelectItem>
              <SelectItem value="high_risk">Risque élevé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={loadUserData} variant="outline" className="w-full sm:w-auto">
          Actualiser
        </Button>
      </div>

      <div className="two-column-layout flex flex-col md:flex-row gap-6">
        <div className="users-table-container md:w-1/2">
          {loading ? (
            <div className="loading-indicator">Chargement des données...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Risque</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className={selectedUser?.userId === user.id ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </TableCell>
                      <TableCell>{getVerificationLevelLabel(user.verificationLevel)}</TableCell>
                      <TableCell>{renderVerificationBadge(user.verificationStatus)}</TableCell>
                      <TableCell>{renderRiskBadge(user.riskLevel)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => loadUserDetails(user.id)}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="user-details-container md:w-1/2">
          {selectedUser ? (
            <div className="user-details">
              <div className="bg-gray-50 p-4 rounded-t-lg border-b">
                <h3 className="text-xl font-semibold">{selectedUser.username}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
              </div>

              <div className="user-details-content p-4 border rounded-b-lg">
                <div className="verification-status flex items-center gap-2 mb-4">
                  <span className="font-semibold">Statut:</span>
                  {renderVerificationBadge(selectedUser.verificationStatus)}
                  <span className="ml-4 font-semibold">Niveau:</span>
                  {getVerificationLevelLabel(selectedUser.verificationLevel)}
                </div>

                <h4 className="font-semibold mb-2">Informations personnelles</h4>
                <div className="personal-info mb-4 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500">Nom:</span>
                    <p>{selectedUser.personalDetails.firstName} {selectedUser.personalDetails.lastName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date de naissance:</span>
                    <p>{selectedUser.personalDetails.dateOfBirth}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Nationalité:</span>
                    <p>{selectedUser.personalDetails.nationality}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Téléphone:</span>
                    <p>{selectedUser.personalDetails.phoneNumber}</p>
                  </div>
                </div>

                <div className="address mb-4">
                  <h4 className="font-semibold mb-2">Adresse</h4>
                  <p>{selectedUser.personalDetails.address.street}</p>
                  <p>{selectedUser.personalDetails.address.postalCode} {selectedUser.personalDetails.address.city}</p>
                  <p>{selectedUser.personalDetails.address.country}</p>
                </div>

                <h4 className="font-semibold mb-2">Documents fournis</h4>
                <div className="documents-list mb-4">
                  {selectedUser.documents.map((doc, index) => (
                    <div key={index} className="document-item p-2 border rounded mb-2 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{doc.type.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-500">
                          {doc.documentNumber ? `N° ${doc.documentNumber}` : ''}
                          {doc.expiryDate ? ` • Expire: ${doc.expiryDate}` : ''}
                        </div>
                      </div>
                      {renderVerificationBadge(doc.status)}
                    </div>
                  ))}
                </div>

                <h4 className="font-semibold mb-2">Évaluation des risques</h4>
                <div className="risk-assessment mb-4 flex items-center">
                  <div className="risk-score w-20 h-20 rounded-full flex flex-col items-center justify-center mr-4"
                    style={{ 
                      backgroundColor: `rgba(${255 * selectedUser.riskAssessment.overallRiskScore / 100}, ${255 * (1 - selectedUser.riskAssessment.overallRiskScore / 100)}, 0, 0.2)`,
                      border: `2px solid rgba(${255 * selectedUser.riskAssessment.overallRiskScore / 100}, ${255 * (1 - selectedUser.riskAssessment.overallRiskScore / 100)}, 0, 0.7)`
                    }}>
                    <span className="text-2xl font-bold">{selectedUser.riskAssessment.overallRiskScore}</span>
                    <span className="text-xs">/100</span>
                  </div>
                  <div className="risk-factors grid grid-cols-2 gap-2">
                    <div className="risk-factor">
                      <span className="text-sm text-gray-500">Pays</span>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${selectedUser.riskAssessment.factors.countryRisk}%` }}></div>
                      </div>
                    </div>
                    <div className="risk-factor">
                      <span className="text-sm text-gray-500">Activité</span>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${selectedUser.riskAssessment.factors.activityRisk}%` }}></div>
                      </div>
                    </div>
                    <div className="risk-factor">
                      <span className="text-sm text-gray-500">Profil</span>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${selectedUser.riskAssessment.factors.profileRisk}%` }}></div>
                      </div>
                    </div>
                    <div className="risk-factor">
                      <span className="text-sm text-gray-500">Transactions</span>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${selectedUser.riskAssessment.factors.transactionRisk}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="action-buttons flex gap-2 justify-end mt-6">
                  <Button variant="outline" size="sm">
                    Télécharger rapport
                  </Button>
                  {selectedUser.verificationStatus === 'pending' && (
                    <>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        Rejeter
                      </Button>
                      <Button variant="default" size="sm">
                        Approuver
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-user-selected h-full flex items-center justify-center border rounded-lg p-10 bg-gray-50">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Aucun utilisateur sélectionné</h3>
                <p className="text-gray-500">Cliquez sur "Détails" à côté d'un utilisateur pour afficher ses informations complètes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KycManagement;