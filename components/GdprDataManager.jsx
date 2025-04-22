/**
 * MS BINGO PACIFIQUE - Gestionnaire de données GDPR
 * Version: 15 avril 2025
 * 
 * Ce composant permet aux utilisateurs de gérer leurs droits GDPR (Règlement Général sur la Protection des Données)
 * y compris l'accès à leurs données, le droit à l'oubli, et la gestion des consentements.
 */

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Download, Trash2, Shield, Eye, AlertTriangle,
  CheckCircle, Clock, RefreshCw, X, Lock, Settings
} from 'lucide-react';

// Composants UI
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// Formatter pour les dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

export default function GdprDataManager({ userId }) {
  const [activeTab, setActiveTab] = useState('data-access');
  const [isConsentDialogOpen, setIsConsentDialogOpen] = useState(false);
  const [activeConsent, setActiveConsent] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const { toast } = useToast();
  
  // Requête pour récupérer les données personnelles de l'utilisateur
  const {
    data: userData,
    isLoading: isUserDataLoading,
    refetch: refetchUserData
  } = useQuery({
    queryKey: [`/api/gdpr/data-export/${userId}`],
    enabled: !!userId && activeTab === 'data-access'
  });
  
  // Requête pour récupérer l'historique des consentements
  const {
    data: consentHistory,
    isLoading: isConsentHistoryLoading,
    refetch: refetchConsentHistory
  } = useQuery({
    queryKey: [`/api/gdpr/consent-history/${userId}`],
    enabled: !!userId && activeTab === 'consents'
  });
  
  // Requête pour récupérer les journaux d'accès
  const {
    data: accessLogs,
    isLoading: isAccessLogsLoading,
    refetch: refetchAccessLogs
  } = useQuery({
    queryKey: [`/api/gdpr/access-logs/${userId}`],
    enabled: !!userId && activeTab === 'access-logs'
  });
  
  // Mutation pour mettre à jour un consentement
  const updateConsentMutation = useMutation({
    mutationFn: async (consentData) => {
      const res = await apiRequest('POST', `/api/gdpr/update-consent/${userId}`, consentData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Consentement mis à jour',
        description: 'Vos préférences de consentement ont été enregistrées.',
        variant: 'default'
      });
      refetchConsentHistory();
      setIsConsentDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la mise à jour du consentement.',
        variant: 'destructive'
      });
    }
  });
  
  // Mutation pour demander la suppression du compte
  const requestDeletionMutation = useMutation({
    mutationFn: async (deletionData) => {
      const res = await apiRequest('POST', `/api/gdpr/data-deletion/${userId}`, deletionData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Demande traitée',
        description: 'Votre demande de suppression a été enregistrée.',
        variant: 'default'
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la demande de suppression.',
        variant: 'destructive'
      });
    }
  });
  
  // Gestion du changement de consentement
  const handleConsentChange = (consentType, status) => {
    updateConsentMutation.mutate({
      consentType,
      status
    });
  };
  
  // Gestion de la demande de suppression
  const handleDeletionRequest = () => {
    if (confirmationCode !== 'DELETE-CONFIRM') {
      toast({
        title: 'Code incorrect',
        description: 'Le code de confirmation saisi est incorrect.',
        variant: 'destructive'
      });
      return;
    }
    
    requestDeletionMutation.mutate({
      confirmationCode,
      reason: deleteReason
    });
  };
  
  // Téléchargement des données
  const handleDownloadData = () => {
    if (!userData?.data) return;
    
    // Préparation des données pour le téléchargement
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify(userData.data, null, 2)
    );
    
    // Création d'un lien de téléchargement
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `ms-bingo-data-${userId}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: 'Téléchargement démarré',
      description: 'Vos données personnelles sont en cours de téléchargement.',
      variant: 'default'
    });
  };
  
  if (isUserDataLoading || isConsentHistoryLoading || isAccessLogsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Chargement des informations GDPR...</p>
        </div>
      </div>
    );
  }
  
  // Données récupérées ou valeurs par défaut
  const userDataExport = userData?.data || {};
  const consents = consentHistory?.data || [];
  const logs = accessLogs?.data || [];
  
  // Consentements actuels (dernière version pour chaque type)
  const currentConsents = {};
  if (consents.length > 0) {
    consents.forEach(consent => {
      // Si ce type de consentement n'existe pas encore ou si cette version est plus récente
      if (!currentConsents[consent.consentType] || 
          new Date(consent.timestamp) > new Date(currentConsents[consent.consentType].timestamp)) {
        currentConsents[consent.consentType] = consent;
      }
    });
  }
  
  // Types de consentements disponibles
  const consentTypes = [
    {
      id: 'marketing_communications',
      name: 'Communications marketing',
      description: 'Recevoir des informations sur les promotions, nouveaux jeux et événements spéciaux'
    },
    {
      id: 'data_analytics',
      name: 'Analyse de données',
      description: 'Autoriser l\'analyse de vos données de jeu pour améliorer votre expérience'
    },
    {
      id: 'third_party_sharing',
      name: 'Partage avec des tiers',
      description: 'Autoriser le partage de vos données avec des partenaires sélectionnés'
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion de la confidentialité</h2>
          <p className="text-muted-foreground mt-1">
            Contrôlez vos données personnelles et vos préférences
          </p>
        </div>
        <Badge variant="outline" className="flex items-center">
          <Lock className="h-3.5 w-3.5 mr-1" />
          GDPR
        </Badge>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="data-access">Mes données</TabsTrigger>
          <TabsTrigger value="consents">Consentements</TabsTrigger>
          <TabsTrigger value="access-logs">Journaux d'accès</TabsTrigger>
          <TabsTrigger value="account-deletion">Suppression</TabsTrigger>
        </TabsList>
        
        <TabsContent value="data-access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-primary" />
                Vos données personnelles
              </CardTitle>
              <CardDescription>
                Exportez et consultez vos données personnelles conformément au RGPD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md bg-muted/50">
                <div className="space-y-1">
                  <h3 className="font-medium">Exporter vos données</h3>
                  <p className="text-sm text-muted-foreground">
                    Téléchargez une copie complète de vos informations personnelles
                  </p>
                </div>
                <Button onClick={handleDownloadData}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="personal-info">
                  <AccordionTrigger>Informations personnelles</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {userDataExport.personal ? (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="space-y-1">
                            <p className="font-medium">Identité</p>
                            <p className="text-muted-foreground">
                              {userDataExport.personal.firstName} {userDataExport.personal.lastName}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">Nom d'utilisateur</p>
                            <p className="text-muted-foreground">{userDataExport.personal.username}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">Email</p>
                            <p className="text-muted-foreground">{userDataExport.personal.email}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">Date de naissance</p>
                            <p className="text-muted-foreground">{userDataExport.personal.dateOfBirth}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">Date d'inscription</p>
                            <p className="text-muted-foreground">{formatDate(userDataExport.personal.registrationDate)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">Dernière connexion</p>
                            <p className="text-muted-foreground">{formatDate(userDataExport.personal.lastLogin)}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Aucune information personnelle disponible</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="game-activity">
                  <AccordionTrigger>Activité de jeu</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {userDataExport.gameActivity && userDataExport.gameActivity.length > 0 ? (
                        userDataExport.gameActivity.map((activity, index) => (
                          <div key={index} className="p-3 border rounded-md">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{activity.gameName}</h4>
                              <Badge variant="outline">{formatDate(activity.participationDate)}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Cartons joués:</span>{' '}
                                <span>{activity.cardsPlayed}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Gains:</span>{' '}
                                <span>{activity.winnings} XPF</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">Aucune activité de jeu enregistrée</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="financial">
                  <AccordionTrigger>Transactions financières</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {userDataExport.financialTransactions && userDataExport.financialTransactions.length > 0 ? (
                        userDataExport.financialTransactions.map((transaction, index) => (
                          <div key={index} className="p-3 border rounded-md">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium capitalize">
                                {transaction.type === 'deposit' ? 'Dépôt' : 
                                 transaction.type === 'withdrawal' ? 'Retrait' : transaction.type}
                              </h4>
                              <Badge 
                                variant={transaction.status === 'completed' ? 'default' : 'outline'}
                              >
                                {transaction.status === 'completed' ? 'Complété' : 'En attente'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Montant:</span>{' '}
                                <span>{transaction.amount} {transaction.currency}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Date:</span>{' '}
                                <span>{formatDate(transaction.timestamp)}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">ID Transaction:</span>{' '}
                                <span className="font-mono text-xs">{transaction.id}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">Aucune transaction financière enregistrée</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="preferences">
                  <AccordionTrigger>Préférences</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {userDataExport.preferences ? (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="space-y-1">
                            <p className="font-medium">Langue préférée</p>
                            <p className="text-muted-foreground">{userDataExport.preferences.languagePreference}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">Notifications</p>
                            <p className="text-muted-foreground">
                              {userDataExport.preferences.notificationsEnabled ? 'Activées' : 'Désactivées'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">Consentement marketing</p>
                            <p className="text-muted-foreground">
                              {userDataExport.preferences.marketingConsent ? 'Accordé' : 'Refusé'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">Dernière mise à jour</p>
                            <p className="text-muted-foreground">{formatDate(userDataExport.preferences.lastUpdated)}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Aucune préférence enregistrée</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <p className="text-sm text-muted-foreground">
                Conformément au RGPD, vous avez le droit d'accéder à toutes vos données personnelles 
                collectées par MS BINGO PACIFIQUE.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="consents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                Gestion des consentements
              </CardTitle>
              <CardDescription>
                Contrôlez comment nous utilisons vos données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {consentTypes.map((consent) => {
                  const currentValue = currentConsents[consent.id];
                  const isAccepted = currentValue ? currentValue.status === 'accepted' : false;
                  
                  return (
                    <div 
                      key={consent.id} 
                      className="flex items-center justify-between p-4 border rounded-md"
                    >
                      <div className="space-y-1 mr-4">
                        <h3 className="font-medium">{consent.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {consent.description}
                        </p>
                        {currentValue && (
                          <p className="text-xs text-muted-foreground">
                            Dernière mise à jour: {formatDate(currentValue.timestamp)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`consent-${consent.id}`} className="sr-only">
                          {consent.name}
                        </Label>
                        <Switch
                          id={`consent-${consent.id}`}
                          checked={isAccepted}
                          onCheckedChange={(checked) => {
                            handleConsentChange(consent.id, checked ? 'accepted' : 'declined');
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="space-y-2 w-full">
                <p className="text-sm text-muted-foreground">
                  Vous pouvez modifier vos préférences de consentement à tout moment.
                  Toutes les modifications sont enregistrées conformément au RGPD.
                </p>
                <div className="flex justify-between w-full">
                  <Button
                    variant="outline"
                    onClick={() => refetchConsentHistory()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      setActiveTab('account-deletion');
                    }}
                  >
                    Gérer le droit à l'oubli
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Historique des consentements</CardTitle>
              <CardDescription>
                Toutes les modifications de vos préférences de consentement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consents.length > 0 ? (
                <div className="space-y-4">
                  {consents.map((consent, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border rounded-md">
                      <div className={`mt-1 rounded-full p-2 ${
                        consent.status === 'accepted' 
                          ? 'bg-success/20 text-success' 
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {consent.status === 'accepted' 
                          ? <CheckCircle className="h-4 w-4" /> 
                          : <X className="h-4 w-4" />}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium capitalize">
                            {consent.consentType.replace(/_/g, ' ')}
                          </p>
                          <Badge variant="outline">
                            v{consent.version}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {consent.status === 'accepted' 
                            ? 'Consentement accordé' 
                            : 'Consentement refusé'}
                        </p>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatDate(consent.timestamp)}</span>
                          <span>IP: {consent.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucun historique de consentement disponible
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="access-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                Journaux d'accès à votre compte
              </CardTitle>
              <CardDescription>
                Surveillez les connexions et actions effectuées sur votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length > 0 ? (
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          log.action === 'login' ? 'bg-success/20 text-success' :
                          log.action === 'logout' ? 'bg-primary/20 text-primary' :
                          log.action === 'password_change' ? 'bg-warning/20 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {log.action === 'login' ? <CheckCircle className="h-4 w-4" /> :
                           log.action === 'logout' ? <Eye className="h-4 w-4" /> :
                           log.action === 'password_change' ? <Settings className="h-4 w-4" /> :
                           <Clock className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium capitalize">
                            {log.action === 'login' ? 'Connexion' :
                             log.action === 'logout' ? 'Déconnexion' :
                             log.action === 'password_change' ? 'Changement de mot de passe' :
                             log.action === 'profile_update' ? 'Mise à jour du profil' :
                             log.action === 'game_access' ? 'Accès au jeu' :
                             log.action}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(log.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-mono">{log.ipAddress}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {log.userAgent}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucun journal d'accès disponible
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex justify-between items-center w-full">
                <p className="text-sm text-muted-foreground">
                  Si vous constatez des connexions suspectes, contactez immédiatement notre support.
                </p>
                <Button
                  variant="outline"
                  onClick={() => refetchAccessLogs()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account-deletion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Droit à l'oubli (suppression de compte)
              </CardTitle>
              <CardDescription>
                Demandez la suppression de vos données personnelles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-md bg-destructive/10 space-y-2">
                <h3 className="font-medium text-destructive">Attention</h3>
                <p className="text-sm">
                  La suppression de votre compte est irréversible. Toutes vos données personnelles
                  seront supprimées conformément à notre politique de confidentialité et au RGPD.
                </p>
                <p className="text-sm">
                  Certaines données sont conservées pour des raisons légales (lutte contre le blanchiment d'argent)
                  pendant une durée de 5 ans.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Que se passe-t-il lors de la suppression ?</h3>
                  <ul className="space-y-1 text-sm list-disc pl-5">
                    <li>Vos informations personnelles sont supprimées</li>
                    <li>Votre nom d'utilisateur et adresse email sont anonymisés</li>
                    <li>Votre compte est désactivé définitivement</li>
                    <li>Vous ne pourrez plus accéder à la plateforme avec ce compte</li>
                    <li>Les fonds restants sur votre compte seront perdus</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Êtes-vous sûr de vouloir continuer ?</h3>
                  <p className="text-sm">
                    Si vous préférez simplement vous désabonner des communications,
                    vous pouvez ajuster vos préférences dans l'onglet "Consentements".
                  </p>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Demander la suppression de mon compte
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Confirmer la suppression du compte
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Veuillez confirmer votre demande.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirmation-code">
                Saisissez le code de confirmation
              </Label>
              <Input
                id="confirmation-code"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="DELETE-CONFIRM"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Saisissez exactement DELETE-CONFIRM pour confirmer.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delete-reason">
                Raison de la suppression (optionnel)
              </Label>
              <Input
                id="delete-reason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Veuillez indiquer la raison de votre demande"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletionRequest}
              disabled={!confirmationCode}
            >
              Confirmer la suppression
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}