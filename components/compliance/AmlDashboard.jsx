import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

/**
 * Tableau de bord AML pour la visualisation et la gestion des alertes
 */
const AmlDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Statistiques pour le tableau de bord
  const [stats, setStats] = useState({
    totalReports: 0,
    highRiskReports: 0,
    pendingReviews: 0,
    recentActivity: 0
  });

  // Fonction pour charger les données depuis l'API
  const loadReportData = async () => {
    try {
      setLoading(true);
      // Dans une implémentation réelle, appeler l'API
      // const response = await fetch('/api/aml/alerts');
      // const data = await response.json();
      
      // Simulation de données (à remplacer par l'appel API réel)
      const mockData = [
        {
          id: 'REP-5436-285',
          targetUserId: 'user_1024',
          userName: 'Jean Dupont',
          reason: 'Multiples transactions suspectes',
          severityLevel: 'high',
          status: 'pending',
          riskScore: 82,
          submissionDate: '2025-04-14T08:30:00Z',
          lastUpdated: '2025-04-14T08:30:00Z',
        },
        {
          id: 'REP-7689-102',
          targetUserId: 'user_587',
          userName: 'Marie Leroux',
          reason: 'Dépôt important sans source de revenu vérifiée',
          severityLevel: 'medium',
          status: 'under_review',
          riskScore: 65,
          submissionDate: '2025-04-13T14:20:00Z',
          lastUpdated: '2025-04-14T09:15:00Z',
        },
        {
          id: 'REP-2315-731',
          targetUserId: 'user_893',
          userName: 'Pierre Martin',
          reason: 'Comportement de jeu inhabituel',
          severityLevel: 'low',
          status: 'resolved',
          riskScore: 35,
          submissionDate: '2025-04-10T11:05:00Z',
          lastUpdated: '2025-04-12T16:40:00Z',
        },
        {
          id: 'REP-9874-415',
          targetUserId: 'user_256',
          userName: 'Sophie Bernard',
          reason: 'Multiples modifications de méthodes de paiement',
          severityLevel: 'critical',
          status: 'escalated',
          riskScore: 95,
          submissionDate: '2025-04-15T07:10:00Z',
          lastUpdated: '2025-04-15T07:30:00Z',
        }
      ];
      
      setReports(mockData);
      
      // Calcul des statistiques
      setStats({
        totalReports: mockData.length,
        highRiskReports: mockData.filter(r => r.severityLevel === 'high' || r.severityLevel === 'critical').length,
        pendingReviews: mockData.filter(r => r.status === 'pending' || r.status === 'under_review').length,
        recentActivity: mockData.filter(r => new Date(r.submissionDate) > new Date(Date.now() - 24*60*60*1000)).length
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports AML:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  // Filtrer les rapports en fonction du filtre sélectionné et du terme de recherche
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.targetUserId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (filter === 'all') return matchesSearch;
    if (filter === 'high') return (report.severityLevel === 'high' || report.severityLevel === 'critical') && matchesSearch;
    if (filter === 'pending') return (report.status === 'pending' || report.status === 'under_review') && matchesSearch;
    if (filter === 'resolved') return report.status === 'resolved' && matchesSearch;
    
    return matchesSearch;
  });

  // Rendu d'un badge pour le niveau de sévérité
  const renderSeverityBadge = (severity) => {
    switch(severity) {
      case 'low': 
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Faible</Badge>;
      case 'medium': 
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Moyen</Badge>;
      case 'high': 
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Élevé</Badge>;
      case 'critical': 
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Critique</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Rendu d'un badge pour le statut
  const renderStatusBadge = (status) => {
    switch(status) {
      case 'pending': 
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">En attente</Badge>;
      case 'under_review': 
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">En révision</Badge>;
      case 'escalated': 
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Escaladé</Badge>;
      case 'resolved': 
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Résolu</Badge>;
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
    <div className="aml-dashboard">
      <div className="dashboard-header">
        <h2 className="text-2xl font-bold">Tableau de bord Anti-Money Laundering</h2>
        <p className="text-gray-500">Gestion et suivi des signalements d'activités suspectes</p>
      </div>

      <div className="stats-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total signalements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalReports}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risque élevé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.highRiskReports}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.pendingReviews}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dernières 24h</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.recentActivity}</div>
          </CardContent>
        </Card>
      </div>

      <div className="filters-container flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input 
            placeholder="Rechercher par ID, utilisateur ou description..." 
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
              <SelectItem value="all">Tous les signalements</SelectItem>
              <SelectItem value="high">Risque élevé</SelectItem>
              <SelectItem value="pending">En attente de revue</SelectItem>
              <SelectItem value="resolved">Résolus</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={loadReportData} variant="outline" className="w-full sm:w-auto">
          Actualiser
        </Button>
      </div>

      <div className="reports-table-container">
        {loading ? (
          <div className="loading-indicator">Chargement des données...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Signalement</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Sévérité</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    Aucun signalement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono">{report.id}</TableCell>
                    <TableCell>{report.userName}<br/><span className="text-xs text-gray-500">{report.targetUserId}</span></TableCell>
                    <TableCell className="max-w-[200px] truncate" title={report.reason}>{report.reason}</TableCell>
                    <TableCell>{renderSeverityBadge(report.severityLevel)}</TableCell>
                    <TableCell>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: `rgba(${255 * report.riskScore / 100}, ${255 * (1 - report.riskScore / 100)}, 0, 0.2)`,
                          border: `2px solid rgba(${255 * report.riskScore / 100}, ${255 * (1 - report.riskScore / 100)}, 0, 0.7)`
                        }}>
                        {report.riskScore}
                      </div>
                    </TableCell>
                    <TableCell>{renderStatusBadge(report.status)}</TableCell>
                    <TableCell>{formatDate(report.submissionDate)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2">
                        Détails
                      </Button>
                      <Button variant="outline" size="sm">
                        {report.status === 'resolved' ? 'Réouvrir' : 'Marquer résolu'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AmlDashboard;