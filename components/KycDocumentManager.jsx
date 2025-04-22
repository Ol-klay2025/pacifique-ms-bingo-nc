/**
 * MS BINGO PACIFIQUE - Gestionnaire de documents KYC
 * Version: 15 avril 2025
 * 
 * Ce composant gère le téléchargement, l'affichage et la vérification des documents
 * requis pour la procédure KYC (Know Your Customer)
 */

import React, { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Upload, Eye, CheckCircle, AlertCircle, FileText,
  Camera, UploadCloud, X, RefreshCw, Shield, Clock
} from 'lucide-react';

// Composants UI
import { Button } from '@/components/ui/button';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Niveaux de vérification KYC
const KYC_LEVELS = {
  NONE: 0,
  BASIC: 1,
  ENHANCED: 2,
  FULL: 3
};

// Descriptions des niveaux
const KYC_LEVEL_DESCRIPTIONS = {
  0: 'Non vérifié',
  1: 'Vérification de base (email + téléphone)',
  2: 'Vérification avancée (document d\'identité)',
  3: 'Vérification complète (avec preuve de résidence)'
};

// Descriptions des niveaux pour les limites
const KYC_LEVEL_LIMITS = {
  0: {
    deposit: { daily: '1 000 XPF', monthly: '5 000 XPF' },
    withdrawal: { daily: '0 XPF', monthly: '0 XPF' }
  },
  1: {
    deposit: { daily: '5 000 XPF', monthly: '25 000 XPF' },
    withdrawal: { daily: '2 000 XPF', monthly: '10 000 XPF' }
  },
  2: {
    deposit: { daily: '25 000 XPF', monthly: '100 000 XPF' },
    withdrawal: { daily: '10 000 XPF', monthly: '50 000 XPF' }
  },
  3: {
    deposit: { daily: '100 000 XPF', monthly: '500 000 XPF' },
    withdrawal: { daily: '50 000 XPF', monthly: '250 000 XPF' }
  }
};

export default function KycDocumentManager({ userId }) {
  const [activeTab, setActiveTab] = useState('status');
  const [activeDocType, setActiveDocType] = useState('passport');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // État pour le prévisionnement du document
  const [previewImage, setPreviewImage] = useState(null);
  
  // Requête pour récupérer le statut KYC de l'utilisateur
  const { 
    data: kycStatus,
    isLoading: isKycStatusLoading
  } = useQuery({
    queryKey: [`/api/kyc/status/${userId}`],
    enabled: !!userId
  });
  
  // Requête pour récupérer les exigences de documents
  const {
    data: documentRequirements,
    isLoading: isRequirementsLoading
  } = useQuery({
    queryKey: ['/api/kyc/document-requirements']
  });
  
  // Mutation pour soumettre un document
  const submitDocumentMutation = useMutation({
    mutationFn: async (documentData) => {
      const res = await apiRequest('POST', `/api/kyc/submit-document/${userId}`, documentData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Document soumis avec succès',
        description: 'Votre document a été envoyé pour vérification. Ce processus peut prendre 24 à 48 heures.',
        variant: 'success'
      });
      queryClient.invalidateQueries(`/api/kyc/status/${userId}`);
      setPreviewImage(null);
      setUploadProgress(0);
    },
    onError: (error) => {
      toast({
        title: 'Erreur lors de la soumission',
        description: error.message || 'Une erreur est survenue lors de l\'envoi du document.',
        variant: 'destructive'
      });
      setUploadProgress(0);
    }
  });
  
  // Gestion du changement de fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Vérification du type de fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Format non supporté',
        description: 'Veuillez soumettre une image au format JPEG ou PNG.',
        variant: 'destructive'
      });
      return;
    }
    
    // Vérification de la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'La taille du fichier doit être inférieure à 5 Mo.',
        variant: 'destructive'
      });
      return;
    }
    
    // Lecture du fichier pour prévisualisation
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Soumission du document
  const handleSubmitDocument = async () => {
    if (!previewImage) {
      toast({
        title: 'Aucun document sélectionné',
        description: 'Veuillez sélectionner un document à soumettre.',
        variant: 'destructive'
      });
      return;
    }
    
    // Simulation de la progression du téléchargement
    const uploadSimulation = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(uploadSimulation);
          return 95;
        }
        return prev + 5;
      });
    }, 200);
    
    // Données du document
    const documentData = {
      documentType: activeDocType,
      documentNumber: document.getElementById('docNumber')?.value || '',
      issueDate: document.getElementById('issueDate')?.value || '',
      expiryDate: document.getElementById('expiryDate')?.value || '',
      countryOfIssue: document.getElementById('countryOfIssue')?.value || 'NC',
      documentImage: previewImage
    };
    
    // Soumission du document
    await submitDocumentMutation.mutateAsync(documentData);
    clearInterval(uploadSimulation);
    setUploadProgress(100);
    
    // Réinitialisation après un court délai
    setTimeout(() => {
      setUploadProgress(0);
    }, 1000);
  };
  
  // Annulation du téléchargement
  const handleCancelUpload = () => {
    setPreviewImage(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  if (isKycStatusLoading || isRequirementsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Chargement des informations KYC...</p>
        </div>
      </div>
    );
  }
  
  const userKycLevel = kycStatus?.data?.verificationLevel || 0;
  const documents = kycStatus?.data?.documents || [];
  const documentReqs = documentRequirements?.data || {};
  const selectedDocReqs = documentReqs[activeDocType] || {};
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vérification d'identité</h2>
          <p className="text-muted-foreground mt-1">
            Complétez votre profil pour accéder à toutes les fonctionnalités
          </p>
        </div>
        <Badge
          className={
            userKycLevel === KYC_LEVELS.NONE ? 'bg-destructive hover:bg-destructive/80' :
            userKycLevel === KYC_LEVELS.BASIC ? 'bg-warning hover:bg-warning/80' :
            userKycLevel === KYC_LEVELS.ENHANCED ? 'bg-info hover:bg-info/80' :
            'bg-success hover:bg-success/80'
          }
        >
          {KYC_LEVEL_DESCRIPTIONS[userKycLevel]}
        </Badge>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Statut actuel</TabsTrigger>
          <TabsTrigger value="upload">Soumettre un document</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="space-y-4">
          {/* Niveau actuel et limitations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                Niveau de vérification actuel
              </CardTitle>
              <CardDescription>
                Votre niveau détermine vos limites de transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span>{userKycLevel} / 3</span>
                  </div>
                  <Progress value={(userKycLevel / 3) * 100} className="h-2" />
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Limites actuelles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 p-3 rounded-md border">
                      <h5 className="font-medium flex items-center text-sm">
                        <UploadCloud className="h-4 w-4 mr-2 text-primary" />
                        Dépôts
                      </h5>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Quotidien</span>
                          <span>{KYC_LEVEL_LIMITS[userKycLevel].deposit.daily}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Mensuel</span>
                          <span>{KYC_LEVEL_LIMITS[userKycLevel].deposit.monthly}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 p-3 rounded-md border">
                      <h5 className="font-medium flex items-center text-sm">
                        <Upload className="h-4 w-4 mr-2 text-primary" />
                        Retraits
                      </h5>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Quotidien</span>
                          <span>{KYC_LEVEL_LIMITS[userKycLevel].withdrawal.daily}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Mensuel</span>
                          <span>{KYC_LEVEL_LIMITS[userKycLevel].withdrawal.monthly}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex flex-col space-y-2 w-full">
                <p className="text-sm text-muted-foreground">
                  Pour augmenter vos limites, complétez votre vérification d'identité.
                </p>
                {userKycLevel < KYC_LEVELS.FULL && (
                  <Button 
                    onClick={() => setActiveTab('upload')}
                    className="w-full sm:w-auto"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Soumettre des documents
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
          
          {/* Documents soumis */}
          <Card>
            <CardHeader>
              <CardTitle>Documents soumis</CardTitle>
              <CardDescription>
                Liste de vos documents de vérification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium">Aucun document soumis</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Vous n'avez pas encore soumis de documents pour la vérification.
                    Soumettez vos documents pour augmenter vos limites de transactions.
                  </p>
                  <Button 
                    variant="default" 
                    className="mt-4"
                    onClick={() => setActiveTab('upload')}
                  >
                    Soumettre un document
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          doc.status === 'verified' ? 'bg-success/20 text-success' :
                          doc.status === 'rejected' ? 'bg-destructive/20 text-destructive' :
                          'bg-warning/20 text-warning'
                        }`}>
                          {doc.status === 'verified' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : doc.status === 'rejected' ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium capitalize">
                            {doc.type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Soumis le {new Date(doc.submissionDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          doc.status === 'verified' ? 'success' :
                          doc.status === 'rejected' ? 'destructive' :
                          'outline'
                        }>
                          {doc.status === 'verified' ? 'Vérifié' :
                           doc.status === 'rejected' ? 'Rejeté' : 'En attente'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Panneau de sélection du type de document */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>1. Sélectionnez le type de document</CardTitle>
                  <CardDescription>
                    Choisissez le document que vous souhaitez soumettre
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.keys(documentReqs).map((docType) => (
                      <button
                        key={docType}
                        className={`flex flex-col items-center p-4 border rounded-md hover:bg-accent/50 transition-colors ${
                          activeDocType === docType ? 'border-primary bg-accent' : ''
                        }`}
                        onClick={() => setActiveDocType(docType)}
                      >
                        <div className={`p-2 rounded-full mb-2 ${
                          activeDocType === docType 
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium capitalize">
                          {docType.replace(/_/g, ' ')}
                        </span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Instructions pour le document sélectionné */}
              <Card>
                <CardHeader>
                  <CardTitle>Instructions</CardTitle>
                  <CardDescription>
                    Comment soumettre ce document correctement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    {selectedDocReqs.description || 'Veuillez sélectionner un type de document.'}
                  </p>
                  
                  {selectedDocReqs.requiredVisibility && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Les éléments suivants doivent être visibles:</h4>
                      <ul className="text-sm list-disc pl-5 space-y-1">
                        {selectedDocReqs.requiredVisibility.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedDocReqs.acceptedFormats && (
                    <div className="p-3 bg-muted rounded-md text-sm">
                      <p className="font-medium">Formats acceptés:</p>
                      <p>{selectedDocReqs.acceptedFormats.join(', ')}</p>
                      {selectedDocReqs.maximumAge && (
                        <p className="mt-1">Âge maximum: {selectedDocReqs.maximumAge}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Panneau de téléchargement */}
            <div>
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>2. Téléverser votre document</CardTitle>
                  <CardDescription>
                    Le document doit être clair et lisible
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                  {!previewImage ? (
                    <div 
                      className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center min-h-[200px] hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/jpeg,image/png"
                      />
                      <UploadCloud className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-center font-medium mb-1">
                        Cliquez ou déposez votre fichier ici
                      </p>
                      <p className="text-center text-sm text-muted-foreground">
                        Formats supportés: JPEG, PNG (max. 5MB)
                      </p>
                      <Button 
                        variant="secondary" 
                        className="mt-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Sélectionner un fichier
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative aspect-[3/2] rounded-md overflow-hidden border bg-muted">
                        <img 
                          src={previewImage} 
                          alt="Document preview" 
                          className="object-contain w-full h-full"
                        />
                        <button
                          className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background"
                          onClick={handleCancelUpload}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      
                      {uploadProgress > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Téléversement en cours...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="h-2" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="docNumber" className="text-sm font-medium">
                        Numéro de document
                      </label>
                      <input
                        id="docNumber"
                        className="w-full px-3 py-2 rounded-md border"
                        placeholder="ex: AB123456"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="countryOfIssue" className="text-sm font-medium">
                        Pays d'émission
                      </label>
                      <select
                        id="countryOfIssue"
                        className="w-full px-3 py-2 rounded-md border"
                      >
                        <option value="NC">Nouvelle-Calédonie</option>
                        <option value="PF">Polynésie française</option>
                        <option value="WF">Wallis-et-Futuna</option>
                        <option value="FR">France</option>
                        <option value="OTHER">Autre</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="issueDate" className="text-sm font-medium">
                        Date d'émission
                      </label>
                      <input
                        id="issueDate"
                        type="date"
                        className="w-full px-3 py-2 rounded-md border"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="expiryDate" className="text-sm font-medium">
                        Date d'expiration
                      </label>
                      <input
                        id="expiryDate"
                        type="date"
                        className="w-full px-3 py-2 rounded-md border"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <div className="flex justify-between w-full">
                    <Button
                      variant="outline"
                      disabled={!previewImage || uploadProgress > 0}
                      onClick={handleCancelUpload}
                    >
                      Annuler
                    </Button>
                    <Button
                      disabled={!previewImage || uploadProgress > 0}
                      onClick={handleSubmitDocument}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Soumettre le document
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique de vérification</CardTitle>
              <CardDescription>
                Suivi complet de votre processus de vérification KYC
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* À implémenter: historique des vérifications KYC */}
              <div className="py-8 text-center">
                <RefreshCw className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  L'historique de vérification sera disponible prochainement
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}