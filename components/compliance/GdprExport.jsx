import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Badge } from '../ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';

/**
 * Interface d'export de données GDPR pour la conformité
 */
const GdprExport = () => {
  const [userId, setUserId] = useState('');
  const [exportFormat, setExportFormat] = useState('json');
  const [selectedCategories, setSelectedCategories] = useState([
    'personal_info',
    'financial_transactions',
    'game_activity',
    'login_history',
    'consent_history',
    'communication_preferences'
  ]);
  const [exportHistory, setExportHistory] = useState([
    { 
      id: 'EXP-001',
      userId: 'user_1024',
      username: 'Jean Dupont',
      date: '2025-04-10T14:30:00Z',
      format: 'json',
      categories: ['personal_info', 'financial_transactions', 'game_activity'],
      status: 'completed',
      requestedBy: 'user'
    },
    { 
      id: 'EXP-002',
      userId: 'user_587',
      username: 'Marie Leroux',
      date: '2025-04-12T09:45:00Z',
      format: 'pdf',
      categories: ['personal_info', 'login_history', 'consent_history'],
      status: 'completed',
      requestedBy: 'admin'
    },
    { 
      id: 'EXP-003',
      userId: 'user_893',
      username: 'Pierre Martin',
      date: '2025-04-14T16:20:00Z',
      format: 'csv',
      categories: ['personal_info', 'financial_transactions', 'game_activity', 'login_history', 'consent_history', 'communication_preferences'],
      status: 'processing',
      requestedBy: 'regulator'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState(null);

  // Liste des catégories de données exportables
  const availableCategories = [
    { id: 'personal_info', label: 'Informations personnelles', description: 'Nom, email, téléphone, adresse...' },
    { id: 'financial_transactions', label: 'Transactions financières', description: 'Dépôts, retraits, gains...' },
    { id: 'game_activity', label: 'Activité de jeu', description: 'Parties jouées, cartes achetées...' },
    { id: 'login_history', label: 'Historique de connexion', description: 'Dates, appareils, emplacements...' },
    { id: 'consent_history', label: 'Historique des consentements', description: 'Acceptations des CGU, politiques...' },
    { id: 'communication_preferences', label: 'Préférences de communication', description: 'Abonnements, notifications...' }
  ];

  // Fonction pour gérer la sélection/désélection de catégories
  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  // Fonction pour sélectionner toutes les catégories
  const selectAllCategories = () => {
    setSelectedCategories(availableCategories.map(cat => cat.id));
  };

  // Fonction pour désélectionner toutes les catégories
  const deselectAllCategories = () => {
    setSelectedCategories([]);
  };

  // Fonction pour exporter les données
  const exportData = async () => {
    if (!userId) {
      setExportError('Veuillez spécifier un ID utilisateur.');
      return;
    }

    if (selectedCategories.length === 0) {
      setExportError('Veuillez sélectionner au moins une catégorie de données.');
      return;
    }

    setLoading(true);
    setExportError(null);
    setExportSuccess(false);
    
    try {
      // Dans une implémentation réelle, appeler l'API
      // const response = await fetch('/api/gdpr/export', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     userId,
      //     format: exportFormat,
      //     includeCategories: selectedCategories
      //   }),
      // });
      
      // Simulation d'une réponse d'API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Ajouter l'export à l'historique
      const newExport = {
        id: `EXP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        userId: `user_${userId}`,
        username: `Utilisateur ${userId}`,
        date: new Date().toISOString(),
        format: exportFormat,
        categories: [...selectedCategories],
        status: 'completed',
        requestedBy: 'admin'
      };
      
      setExportHistory([newExport, ...exportHistory]);
      setExportSuccess(true);
      
      // Simulation du téléchargement
      if (exportFormat === 'json' || exportFormat === 'csv') {
        // Dans une application réelle, cela serait géré par le backend
        console.log('Téléchargement simulé du fichier d\'export...');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export GDPR:', error);
      setExportError('Une erreur s\'est produite lors de l\'export. Veuillez réessayer.');
    } finally {
      setLoading(false);
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

  // Rendu d'un badge pour le statut d'export
  const renderStatusBadge = (status) => {
    switch(status) {
      case 'completed': 
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Complété</Badge>;
      case 'processing': 
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En cours</Badge>;
      case 'failed': 
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Échoué</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Fonction pour télécharger l'export
  const downloadExport = (exportId) => {
    console.log(`Téléchargement de l'export ${exportId}...`);
    // Dans une application réelle, appeler l'API pour télécharger le fichier
  };

  return (
    <div className="gdpr-export">
      <div className="gdpr-header">
        <h2 className="text-2xl font-bold">Export de données GDPR</h2>
        <p className="text-gray-500">Téléchargement et gestion des exports de données personnelles</p>
      </div>

      <div className="export-container mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="export-form md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Nouvel export</h3>
              
              {exportSuccess && (
                <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
                  Export créé avec succès! Vous pouvez le télécharger dans l'historique des exports.
                </div>
              )}
              
              {exportError && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
                  {exportError}
                </div>
              )}
              
              <div className="form-group mb-4">
                <label className="block text-sm font-medium mb-1">ID Utilisateur</label>
                <Input
                  type="text"
                  placeholder="Entrez l'ID utilisateur"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
              
              <div className="form-group mb-4">
                <label className="block text-sm font-medium mb-1">Format d'export</label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="form-group mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium">Catégories de données</label>
                  <div className="text-xs space-x-2">
                    <button 
                      className="text-blue-600 hover:underline" 
                      onClick={selectAllCategories}
                    >
                      Tout sélectionner
                    </button>
                    <span>•</span>
                    <button 
                      className="text-blue-600 hover:underline" 
                      onClick={deselectAllCategories}
                    >
                      Tout désélectionner
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableCategories.map(category => (
                    <div 
                      key={category.id}
                      className={`cursor-pointer p-3 rounded-md border ${
                        selectedCategories.includes(category.id)
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() => toggleCategory(category.id)}
                    >
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => {}}
                        />
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className="text-xs text-gray-500">{category.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-actions mt-6">
                <Button 
                  onClick={exportData} 
                  disabled={loading || selectedCategories.length === 0 || !userId}
                  className="w-full"
                >
                  {loading ? 'Export en cours...' : 'Exporter les données'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="gdpr-info">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Informations GDPR</h3>
              <div className="text-sm space-y-4">
                <p>
                  Le Règlement Général sur la Protection des Données (RGPD) garantit aux utilisateurs le droit d'accéder aux données personnelles que nous détenons.
                </p>
                <p>
                  Cet outil permet de générer un export complet des données pour:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Répondre aux demandes d'accès des utilisateurs</li>
                  <li>Effectuer des audits de conformité</li>
                  <li>Fournir des données aux autorités régulatrices</li>
                </ul>
                <p className="font-semibold">
                  Les exports doivent être traités comme des informations sensibles.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="export-history mt-6">
        <h3 className="text-xl font-semibold mb-4">Historique des exports</h3>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Export</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Catégories</TableHead>
              <TableHead>Demandé par</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exportHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Aucun historique d'export
                </TableCell>
              </TableRow>
            ) : (
              exportHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.id}</TableCell>
                  <TableCell>
                    <div>{item.username}</div>
                    <div className="text-xs text-gray-500">{item.userId}</div>
                  </TableCell>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell className="uppercase">{item.format}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.categories.slice(0, 2).map(cat => (
                        <Badge key={cat} variant="outline" className="text-xs bg-gray-50">{cat.replace('_', ' ')}</Badge>
                      ))}
                      {item.categories.length > 2 && (
                        <Badge variant="outline" className="text-xs bg-gray-50">+{item.categories.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.requestedBy}</TableCell>
                  <TableCell>{renderStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadExport(item.id)}
                      disabled={item.status !== 'completed'}
                    >
                      Télécharger
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GdprExport;