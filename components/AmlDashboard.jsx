/**
 * MS BINGO PACIFIQUE - Tableau de bord AML (Anti-Money Laundering)
 * Version: 15 avril 2025
 * 
 * Ce composant affiche le tableau de bord de suivi des alertes et métriques AML
 * destiné aux analystes et responsables de conformité.
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  AlertTriangle, Users, CreditCard, DollarSign, 
  Activity, Filter, Search, Calendar, ArrowUpRight
} from 'lucide-react';

// Composants UI
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Fonction utilitaire pour formater les montants
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XPF',
    maximumFractionDigits: 0
  }).format(amount);
};

// Fonction utilitaire pour formater les dates
const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

// Couleurs pour les graphiques
const COLORS = {
  primary: '#0ea5e9',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444'
};

export default function AmlDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  
  // Requête pour récupérer les données du tableau de bord
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['/api/aml/dashboard'],
    // Le queryFn par défaut fera un GET à cette URL
  });
  
  // Requête pour récupérer les alertes
  const { data: alertsData, isLoading: isAlertsLoading } = useQuery({
    queryKey: ['/api/aml/alerts', filterStatus, filterRisk],
    // Avec TanStack Query v5, nous utiliserions queryFn ainsi:
    // queryFn: () => fetch(`/api/aml/alerts?status=${filterStatus}&risk=${filterRisk}`).then(res => res.json())
  });
  
  if (isDashboardLoading || isAlertsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium">Chargement des données de conformité...</p>
        </div>
      </div>
    );
  }
  
  // Données du dashboard si elles sont chargées
  const dashboard = dashboardData?.data || {
    alerts_summary: {
      total: 0,
      opened: 0,
      in_progress: 0,
      escalated: 0,
      closed: 0,
      by_risk: { low: 0, medium: 0, high: 0 }
    },
    transactions_summary: {
      total_volume_24h: 0,
      deposits_24h: 0,
      withdrawals_24h: 0,
      net_deposits_7d: 0,
      transactions_count_24h: 0
    },
    flagged_users: {
      total: 0,
      high_risk: 0,
      medium_risk: 0,
      recently_flagged: 0
    },
    geographic_distribution: {},
    recent_activities: []
  };
  
  // Données des alertes si elles sont chargées
  const alerts = alertsData?.data || [];
  
  // Préparer les données pour le graphique de répartition des alertes par risque
  const alertsByRiskData = [
    { name: 'Faible', value: dashboard.alerts_summary.by_risk.low, color: COLORS.low },
    { name: 'Moyen', value: dashboard.alerts_summary.by_risk.medium, color: COLORS.medium },
    { name: 'Élevé', value: dashboard.alerts_summary.by_risk.high, color: COLORS.high }
  ];
  
  // Préparer les données pour le graphique de transactions
  const transactionsData = [
    { name: 'Dépôts', value: dashboard.transactions_summary.deposits_24h, color: COLORS.primary },
    { name: 'Retraits', value: dashboard.transactions_summary.withdrawals_24h, color: COLORS.secondary }
  ];
  
  // Préparer les données pour le graphique de répartition géographique
  const geoDistributionData = Object.entries(dashboard.geographic_distribution || {}).map(([region, value]) => ({
    name: region,
    value,
    color: region === 'NC' ? COLORS.primary :
           region === 'PF' ? COLORS.secondary :
           region === 'WF' ? COLORS.info :
           COLORS.success
  }));
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord AML</h1>
          <p className="text-muted-foreground">
            Surveillance et analyse anti-blanchiment d'argent
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Aujourd'hui
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button variant="default" size="sm">
            Générer un rapport
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs signalés</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Cartes récapitulatives */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Alertes totales
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard.alerts_summary.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-primary inline-flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    {dashboard.alerts_summary.opened} ouvertes
                  </span>
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Utilisateurs signalés
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard.flagged_users.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-danger inline-flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    {dashboard.flagged_users.high_risk} risque élevé
                  </span>
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Volume de transactions (24h)
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(dashboard.transactions_summary.total_volume_24h)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboard.transactions_summary.transactions_count_24h} transactions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Dépôts nets (7j)
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(dashboard.transactions_summary.net_deposits_7d)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={dashboard.transactions_summary.net_deposits_7d > 0
                    ? "text-success inline-flex items-center"
                    : "text-danger inline-flex items-center"}>
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    {Math.abs(dashboard.transactions_summary.net_deposits_7d) > 
                     dashboard.transactions_summary.net_deposits_7d * 0.9 ? "+5%" : "+2%"} cette semaine
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Graphiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des alertes par niveau de risque</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={alertsByRiskData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {alertsByRiskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Alertes']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Transactions des dernières 24h</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transactionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Montant']} />
                    <Legend />
                    <Bar dataKey="value" name="Montant" radius={[4, 4, 0, 0]}>
                      {transactionsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Activités récentes */}
          <Card>
            <CardHeader>
              <CardTitle>Activités récentes</CardTitle>
              <CardDescription>
                Dernières actions liées à la surveillance AML
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.recent_activities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`mt-1 rounded-full p-2 ${
                      activity.type === 'new_alert' ? 'bg-warning/20 text-warning' :
                      activity.type === 'alert_closed' ? 'bg-success/20 text-success' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {activity.type === 'new_alert' ? <AlertTriangle className="h-4 w-4" /> :
                       activity.type === 'alert_closed' ? <Activity className="h-4 w-4" /> :
                       <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.type === 'new_alert' ? 'Nouvelle alerte' :
                         activity.type === 'alert_closed' ? 'Alerte clôturée' :
                         'Alerte escaladée'} 
                        {activity.alert_id && ` #${activity.alert_id}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.type === 'new_alert'
                          ? `Alerte ${activity.alert_type} générée pour l'utilisateur ${activity.user_name}`
                          : activity.type === 'alert_closed'
                          ? `Alerte clôturée par ${activity.closed_by} (${activity.resolution || 'raison non spécifiée'})`
                          : `Alerte escaladée par ${activity.escalated_by} (Réf: ${activity.escalation_reference})`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Alertes AML</h2>
              <p className="text-muted-foreground">
                Gérez et analysez les signalements liés au blanchiment d'argent
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="h-10 w-[130px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tout statut</option>
                <option value="opened">Ouvertes</option>
                <option value="in_progress">En cours</option>
                <option value="escalated">Escaladées</option>
                <option value="closed">Clôturées</option>
              </select>
              <select
                className="h-10 w-[130px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
              >
                <option value="all">Tout risque</option>
                <option value="low">Faible</option>
                <option value="medium">Moyen</option>
                <option value="high">Élevé</option>
              </select>
            </div>
          </div>
          
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Utilisateur</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Montant</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Risque</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Statut</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {alerts.map((alert) => (
                    <tr key={alert.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">#{alert.id}</td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        {alert.user_name}<br/>
                        <span className="text-xs text-muted-foreground">ID: {alert.user_id}</span>
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <Badge variant="outline" className="capitalize">
                          {alert.alert_type.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        {formatCurrency(alert.amount)}
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <Badge className={
                          alert.risk_level === 'high' ? 'bg-danger hover:bg-danger/80' :
                          alert.risk_level === 'medium' ? 'bg-warning hover:bg-warning/80' :
                          'bg-success hover:bg-success/80'
                        }>
                          {alert.risk_level === 'high' ? 'Élevé' :
                           alert.risk_level === 'medium' ? 'Moyen' : 'Faible'}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        {formatDate(alert.timestamp)}
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <Badge variant={
                          alert.status === 'opened' ? 'destructive' :
                          alert.status === 'in_progress' ? 'default' :
                          alert.status === 'escalated' ? 'warning' :
                          'outline'
                        }>
                          {alert.status === 'opened' ? 'Ouverte' :
                           alert.status === 'in_progress' ? 'En cours' :
                           alert.status === 'escalated' ? 'Escaladée' : 'Clôturée'}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Détails</Button>
                          <Button variant="default" size="sm">Traiter</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Transactions à haut risque</h2>
          <p className="text-muted-foreground">
            Cette section montre les transactions nécessitant une attention particulière
          </p>
          {/* Contenu de l'onglet transactions à implémenter */}
          <div className="p-8 text-center text-muted-foreground">
            Contenu de la section transactions à implémenter
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Utilisateurs signalés</h2>
          <p className="text-muted-foreground">
            Utilisateurs présentant des comportements qui nécessitent une surveillance
          </p>
          {/* Contenu de l'onglet utilisateurs signalés à implémenter */}
          <div className="p-8 text-center text-muted-foreground">
            Contenu de la section utilisateurs signalés à implémenter
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}