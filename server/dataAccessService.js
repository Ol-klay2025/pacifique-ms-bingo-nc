/**
 * MS BINGO PACIFIQUE - Service d'accès aux données (GDPR)
 * Version: 15 avril 2025
 * 
 * Ce service gère les fonctionnalités d'accès et d'export des données personnelles
 * conformément au RGPD (GDPR).
 */

const crypto = require('crypto');

// Données de test pour la pré-production
const dataExports = [
  {
    id: 'EXP-001',
    userId: 'USR-298',
    username: 'jean.dupont',
    fullName: 'Jean Dupont',
    format: 'json',
    categories: ['personal_info', 'transactions', 'game_activity', 'login_history', 'consent_history', 'communication_prefs'],
    status: 'completed',
    fileSize: 256480,
    createdAt: new Date('2025-04-10T14:30:00'),
    completedAt: new Date('2025-04-10T14:32:00'),
    requestedBy: 'Jean Dupont',
    processedBy: 'système'
  },
  {
    id: 'EXP-002',
    userId: 'USR-415',
    username: 'marie.leroux',
    fullName: 'Marie Leroux',
    format: 'pdf',
    categories: ['personal_info', 'transactions', 'game_activity'],
    status: 'completed',
    fileSize: 425680,
    createdAt: new Date('2025-04-12T09:45:00'),
    completedAt: new Date('2025-04-12T09:48:00'),
    requestedBy: 'Marie Leroux',
    processedBy: 'système'
  },
  {
    id: 'EXP-003',
    userId: 'USR-189',
    username: 'sophie.bernard',
    fullName: 'Sophie Bernard',
    format: 'csv',
    categories: ['personal_info', 'transactions'],
    status: 'processing',
    createdAt: new Date('2025-04-14T16:20:00'),
    requestedBy: 'Sophie Bernard',
    processedBy: 'système'
  },
  {
    id: 'EXP-004',
    userId: 'USR-732',
    username: 'paul.martin',
    fullName: 'Paul Martin',
    format: 'json',
    categories: ['personal_info', 'transactions', 'game_activity', 'login_history'],
    status: 'completed',
    fileSize: 189240,
    createdAt: new Date('2025-04-05T11:15:00'),
    completedAt: new Date('2025-04-05T11:17:00'),
    requestedBy: 'Paul Martin',
    processedBy: 'système'
  },
  {
    id: 'EXP-005',
    userId: 'USR-298',
    username: 'jean.dupont',
    fullName: 'Jean Dupont',
    format: 'csv',
    categories: ['transactions', 'game_activity'],
    status: 'completed',
    fileSize: 124560,
    createdAt: new Date('2025-04-01T10:30:00'),
    completedAt: new Date('2025-04-01T10:32:00'),
    requestedBy: 'Jean Dupont',
    processedBy: 'système'
  }
];

// Constantes pour les catégories de données
const DATA_CATEGORIES = {
  personal_info: {
    id: 'personal_info',
    name: 'Informations personnelles',
    description: 'Nom, email, téléphone, adresse, etc.',
    type: 'user'
  },
  transactions: {
    id: 'transactions',
    name: 'Transactions financières',
    description: 'Dépôts, retraits, achats de cartons, gains, etc.',
    type: 'financial'
  },
  game_activity: {
    id: 'game_activity',
    name: 'Activité de jeu',
    description: 'Parties jouées, cartons achetés, victoires, etc.',
    type: 'activity'
  },
  login_history: {
    id: 'login_history',
    name: 'Historique de connexion',
    description: 'Dates, appareils, localisations, etc.',
    type: 'security'
  },
  consent_history: {
    id: 'consent_history',
    name: 'Historique des consentements',
    description: 'Acceptations des conditions, permissions marketing, etc.',
    type: 'compliance'
  },
  communication_prefs: {
    id: 'communication_prefs',
    name: 'Préférences de communication',
    description: 'Abonnements aux newsletters, notifications, etc.',
    type: 'preferences'
  }
};

// Formats d'export disponibles
const EXPORT_FORMATS = [
  { id: 'json', name: 'JSON', contentType: 'application/json', extension: '.json' },
  { id: 'csv', name: 'CSV', contentType: 'text/csv', extension: '.csv' },
  { id: 'pdf', name: 'PDF', contentType: 'application/pdf', extension: '.pdf' }
];

/**
 * Récupère la liste des exports avec filtrage et pagination
 */
function getExports({ page = 1, limit = 10, status }) {
  let filteredExports = [...dataExports];
  
  // Appliquer le filtre de statut si spécifié
  if (status) {
    filteredExports = filteredExports.filter(exp => exp.status === status);
  }
  
  // Trier par date de création (le plus récent d'abord)
  filteredExports.sort((a, b) => b.createdAt - a.createdAt);
  
  // Calculer la pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedExports = filteredExports.slice(startIndex, endIndex);
  
  return {
    exports: paginatedExports,
    pagination: {
      total: filteredExports.length,
      page,
      limit,
      pages: Math.ceil(filteredExports.length / limit)
    }
  };
}

/**
 * Récupère un export spécifique par son ID
 */
function getExportById(exportId) {
  return dataExports.find(exp => exp.id === exportId);
}

/**
 * Crée une nouvelle demande d'export
 */
function createExport(userId, format, categories, requestedBy) {
  const exportId = `EXP-${String(dataExports.length + 1).padStart(3, '0')}`;
  
  // Trouver l'utilisateur correspondant (simulé)
  const userInfo = {
    'USR-298': { username: 'jean.dupont', fullName: 'Jean Dupont' },
    'USR-415': { username: 'marie.leroux', fullName: 'Marie Leroux' },
    'USR-189': { username: 'sophie.bernard', fullName: 'Sophie Bernard' },
    'USR-732': { username: 'paul.martin', fullName: 'Paul Martin' },
    'USR-564': { username: 'thomas.leroy', fullName: 'Thomas Leroy' }
  }[userId] || { username: 'unknown', fullName: 'Utilisateur Inconnu' };
  
  const newExport = {
    id: exportId,
    userId,
    username: userInfo.username,
    fullName: userInfo.fullName,
    format: format || 'json',
    categories: categories || Object.keys(DATA_CATEGORIES),
    status: 'processing',
    createdAt: new Date(),
    requestedBy,
    processedBy: 'système'
  };
  
  dataExports.push(newExport);
  
  // Simulation du traitement asynchrone
  setTimeout(() => {
    const exportIndex = dataExports.findIndex(exp => exp.id === exportId);
    if (exportIndex !== -1) {
      dataExports[exportIndex].status = 'completed';
      dataExports[exportIndex].completedAt = new Date();
      dataExports[exportIndex].fileSize = Math.floor(Math.random() * 400000) + 100000; // Taille aléatoire entre 100Ko et 500Ko
    }
  }, 5000); // Simuler 5 secondes de traitement
  
  return exportId;
}

/**
 * Récupère la liste des catégories de données disponibles
 */
function getDataCategories() {
  return DATA_CATEGORIES;
}

/**
 * Récupère la liste des formats d'export disponibles
 */
function getExportFormats() {
  return EXPORT_FORMATS;
}

/**
 * Supprime une demande d'export et les données associées
 */
function deleteExport(exportId) {
  const exportIndex = dataExports.findIndex(exp => exp.id === exportId);
  
  if (exportIndex === -1) {
    return false;
  }
  
  dataExports.splice(exportIndex, 1);
  return true;
}

/**
 * Génère un lien de téléchargement pour un export
 */
function generateDownloadLink(exportId) {
  const exportData = dataExports.find(exp => exp.id === exportId);
  
  if (!exportData || exportData.status !== 'completed') {
    return null;
  }
  
  // Dans une implémentation réelle, cela générerait un lien signé et limité dans le temps
  return {
    url: `/api/gdpr/exports/${exportId}/download`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expire dans 24h
  };
}

module.exports = {
  getExports,
  getExportById,
  createExport,
  getDataCategories,
  getExportFormats,
  deleteExport,
  generateDownloadLink
};