/**
 * MS BINGO PACIFIQUE - Service AML (Anti-Money Laundering)
 * Version: 15 avril 2025
 * 
 * Ce service gère les fonctionnalités de détection et suivi des activités suspectes
 * liées au blanchiment d'argent.
 */

const crypto = require('crypto');

// Données de test pour la pré-production
const alerts = [
  {
    id: 'AML-001-23456',
    userId: 'USR-298',
    username: 'jean.dupont',
    fullName: 'Jean Dupont',
    riskLevel: 'high',
    status: 'pending',
    type: 'suspicious_transaction',
    description: 'Multiples transactions rapides excédant 50 000 XPF en moins de 10 minutes',
    details: {
      transactions: [
        { id: 'TXN-3456', amount: 25000, timestamp: new Date('2025-04-14T08:23:15') },
        { id: 'TXN-3457', amount: 30000, timestamp: new Date('2025-04-14T08:25:42') }
      ],
      frequency: 'Anormal',
      pattern: 'Dépôt suivi d\'un retrait immédiat'
    },
    createdAt: new Date('2025-04-14T08:30:00'),
    updatedAt: new Date('2025-04-14T08:30:00'),
    assignedTo: null,
    notes: []
  },
  {
    id: 'AML-002-34567',
    userId: 'USR-415',
    username: 'marie.leroux',
    fullName: 'Marie Leroux',
    riskLevel: 'medium',
    status: 'pending',
    type: 'unusual_deposit',
    description: 'Dépôt important sans source de fonds identifiable',
    details: {
      transactions: [
        { id: 'TXN-4532', amount: 350000, timestamp: new Date('2025-04-13T14:15:08') }
      ],
      frequency: 'Premier dépôt',
      pattern: 'Montant élevé pour un nouvel utilisateur'
    },
    createdAt: new Date('2025-04-13T14:20:00'),
    updatedAt: new Date('2025-04-13T14:20:00'),
    assignedTo: null,
    notes: []
  },
  {
    id: 'AML-003-45678',
    userId: 'USR-189',
    username: 'sophie.bernard',
    fullName: 'Sophie Bernard',
    riskLevel: 'critical',
    status: 'pending',
    type: 'payment_method_switching',
    description: 'Multiples modifications des méthodes de paiement en peu de temps',
    details: {
      activity: [
        { action: 'ADD_PAYMENT_METHOD', method: 'carte_credit', timestamp: new Date('2025-04-15T07:01:12') },
        { action: 'ADD_PAYMENT_METHOD', method: 'wallet_crypto', timestamp: new Date('2025-04-15T07:03:45') },
        { action: 'REMOVE_PAYMENT_METHOD', method: 'carte_credit', timestamp: new Date('2025-04-15T07:05:30') },
        { action: 'ADD_PAYMENT_METHOD', method: 'virement', timestamp: new Date('2025-04-15T07:08:22') }
      ],
      frequency: 'Très élevée',
      pattern: 'Rotation rapide de méthodes de paiement'
    },
    createdAt: new Date('2025-04-15T07:10:00'),
    updatedAt: new Date('2025-04-15T07:10:00'),
    assignedTo: null,
    notes: []
  },
  {
    id: 'AML-004-56789',
    userId: 'USR-732',
    username: 'paul.martin',
    fullName: 'Paul Martin',
    riskLevel: 'low',
    status: 'closed',
    type: 'multiple_accounts',
    description: 'Tentative de création de comptes multiples avec des informations similaires',
    details: {
      relatedAccounts: [
        { userId: 'USR-730', email: 'paul.martin75@example.com', createdAt: new Date('2025-04-10T16:23:45') },
        { userId: 'USR-731', email: 'paul.martin.75@example.com', createdAt: new Date('2025-04-10T16:35:12') },
        { userId: 'USR-732', email: 'paulmartin75@example.com', createdAt: new Date('2025-04-10T16:42:08') }
      ],
      similarities: ['Adresse IP', 'Appareil', 'Nom similaire'],
      pattern: 'Création de comptes séquentiels'
    },
    createdAt: new Date('2025-04-10T16:45:00'),
    updatedAt: new Date('2025-04-12T11:30:00'),
    assignedTo: 'Michel Dupuis',
    notes: [
      {
        author: 'Michel Dupuis',
        content: 'Après vérification, il s\'agit d\'un utilisateur légitime qui a eu des problèmes d\'inscription. Pas de risque identifié.',
        timestamp: new Date('2025-04-12T11:30:00')
      }
    ]
  },
  {
    id: 'AML-005-67890',
    userId: 'USR-564',
    username: 'thomas.leroy',
    fullName: 'Thomas Leroy',
    riskLevel: 'high',
    status: 'investigating',
    type: 'gaming_pattern',
    description: 'Motif de jeu inhabituel avec mises minimales suivies de retraits importants',
    details: {
      patterns: [
        { date: '2025-04-08', activity: 'Mises minimales pendant 2h, puis retrait de 25000 XPF' },
        { date: '2025-04-09', activity: 'Mises minimales pendant 1h, puis retrait de 30000 XPF' },
        { date: '2025-04-11', activity: 'Mises minimales pendant 3h, puis retrait de 40000 XPF' }
      ],
      frequency: 'Répétitif',
      pattern: 'Potentiel smurfing/layering'
    },
    createdAt: new Date('2025-04-12T09:15:00'),
    updatedAt: new Date('2025-04-13T10:30:00'),
    assignedTo: 'Amélie Laurent',
    notes: [
      {
        author: 'Amélie Laurent',
        content: 'Investigation en cours. J\'ai demandé des informations supplémentaires sur l\'historique de transactions.',
        timestamp: new Date('2025-04-13T10:30:00')
      }
    ]
  }
];

// Métriques pour le tableau de bord
const dashboardMetrics = {
  total: 18,
  byRisk: {
    low: 3,
    medium: 5,
    high: 8,
    critical: 2
  },
  byStatus: {
    pending: 6,
    investigating: 8,
    resolved: 2,
    closed: 2
  },
  byType: {
    suspicious_transaction: 7,
    unusual_deposit: 3,
    payment_method_switching: 2,
    multiple_accounts: 4,
    gaming_pattern: 2
  },
  recent: {
    today: 2,
    yesterday: 3,
    thisWeek: 10,
    lastWeek: 8
  }
};

/**
 * Récupère la liste des alertes AML avec filtrage et pagination
 */
function getAlerts({ page = 1, limit = 10, risk, status, search }) {
  let filteredAlerts = [...alerts];
  
  // Appliquer les filtres si spécifiés
  if (risk) {
    filteredAlerts = filteredAlerts.filter(alert => alert.riskLevel === risk);
  }
  
  if (status) {
    filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredAlerts = filteredAlerts.filter(alert => 
      alert.fullName.toLowerCase().includes(searchLower) ||
      alert.id.toLowerCase().includes(searchLower) ||
      alert.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Calculer la pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);
  
  return {
    alerts: paginatedAlerts,
    pagination: {
      total: filteredAlerts.length,
      page,
      limit,
      pages: Math.ceil(filteredAlerts.length / limit)
    }
  };
}

/**
 * Récupère une alerte spécifique par son ID
 */
function getAlertById(alertId) {
  return alerts.find(alert => alert.id === alertId);
}

/**
 * Met à jour le statut d'une alerte
 */
function updateAlertStatus(alertId, status, notes, username) {
  const alertIndex = alerts.findIndex(alert => alert.id === alertId);
  
  if (alertIndex === -1) {
    return false;
  }
  
  const alert = alerts[alertIndex];
  alert.status = status;
  alert.updatedAt = new Date();
  
  if (status === 'investigating' && !alert.assignedTo) {
    alert.assignedTo = username;
  }
  
  if (notes) {
    alert.notes.push({
      author: username,
      content: notes,
      timestamp: new Date()
    });
  }
  
  alerts[alertIndex] = alert;
  return true;
}

/**
 * Récupère les métriques pour le tableau de bord AML
 */
function getDashboardMetrics() {
  return dashboardMetrics;
}

/**
 * Crée une nouvelle alerte AML
 */
function createAlert(alertData) {
  const newAlert = {
    id: `AML-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignedTo: null,
    notes: [],
    ...alertData
  };
  
  alerts.unshift(newAlert);
  dashboardMetrics.total += 1;
  dashboardMetrics.byRisk[newAlert.riskLevel] += 1;
  dashboardMetrics.byStatus[newAlert.status] += 1;
  dashboardMetrics.byType[newAlert.type] += 1;
  dashboardMetrics.recent.today += 1;
  
  return newAlert;
}

module.exports = {
  getAlerts,
  getAlertById,
  updateAlertStatus,
  getDashboardMetrics,
  createAlert
};