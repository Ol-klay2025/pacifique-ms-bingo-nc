/**
 * MS BINGO PACIFIQUE - Service KYC (Know Your Customer)
 * Version: 15 avril 2025
 * 
 * Ce service gère les fonctionnalités de vérification d'identité des utilisateurs.
 */

// Données de test pour la pré-production
const users = [
  {
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
        verifiedAt: new Date('2025-03-12T09:45:00'),
        verifiedBy: 'Michel Dupuis'
      },
      {
        type: 'proof_of_address',
        description: 'Facture EDF',
        issueDate: '2024-12-20',
        status: 'verified',
        verifiedAt: new Date('2025-03-12T09:46:00'),
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
    registeredAt: new Date('2025-03-10T14:20:00'),
    lastVerificationUpdate: new Date('2025-03-12T09:46:00')
  },
  {
    id: 'USR-415',
    username: 'marie.leroux',
    email: 'marie.leroux@example.com',
    fullName: 'Marie Leroux',
    birthDate: '1990-12-23',
    nationality: 'FR',
    phone: '+687234567',
    status: 'verified',
    verificationLevel: 'enhanced',
    address: {
      street: '45 Avenue des Cocotiers',
      city: 'Nouméa',
      postalCode: '98800',
      country: 'NC'
    },
    documents: [
      {
        type: 'id_card',
        number: 'ID87654321',
        issueDate: '2022-05-20',
        expiryDate: '2032-05-19',
        status: 'verified',
        verifiedAt: new Date('2025-03-15T11:20:00'),
        verifiedBy: 'Michel Dupuis'
      },
      {
        type: 'proof_of_address',
        description: 'Facture d\'eau',
        issueDate: '2025-01-05',
        status: 'verified',
        verifiedAt: new Date('2025-03-15T11:25:00'),
        verifiedBy: 'Michel Dupuis'
      }
    ],
    riskAssessment: {
      score: 40,
      level: 'medium',
      factors: {
        country: 30,
        activity: 35,
        profile: 45,
        transactions: 50
      }
    },
    limits: {
      daily: 75000,
      weekly: 300000,
      monthly: 1000000
    },
    registeredAt: new Date('2025-03-12T10:15:00'),
    lastVerificationUpdate: new Date('2025-03-15T11:25:00')
  },
  {
    id: 'USR-189',
    username: 'sophie.bernard',
    email: 'sophie.bernard@example.com',
    fullName: 'Sophie Bernard',
    birthDate: '1988-09-30',
    nationality: 'FR',
    phone: '+687345678',
    status: 'pending',
    verificationLevel: 'basic',
    address: {
      street: '78 Boulevard du Lagon',
      city: 'Nouméa',
      postalCode: '98800',
      country: 'NC'
    },
    documents: [
      {
        type: 'driving_license',
        number: 'DL112233',
        issueDate: '2019-11-10',
        expiryDate: '2029-11-09',
        status: 'pending',
        uploadedAt: new Date('2025-04-14T16:30:00')
      }
    ],
    riskAssessment: {
      score: 60,
      level: 'medium',
      factors: {
        country: 40,
        activity: 70,
        profile: 65,
        transactions: 65
      }
    },
    limits: {
      daily: 50000,
      weekly: 200000,
      monthly: 500000
    },
    registeredAt: new Date('2025-04-10T09:20:00'),
    lastVerificationUpdate: new Date('2025-04-14T16:30:00')
  },
  {
    id: 'USR-732',
    username: 'paul.martin',
    email: 'paulmartin75@example.com',
    fullName: 'Paul Martin',
    birthDate: '1975-03-20',
    nationality: 'FR',
    phone: '+687456789',
    status: 'rejected',
    verificationLevel: 'basic',
    address: {
      street: '15 Rue des Palmiers',
      city: 'Nouméa',
      postalCode: '98800',
      country: 'NC'
    },
    documents: [
      {
        type: 'passport',
        number: 'P98765432',
        issueDate: '2021-08-15',
        expiryDate: '2031-08-14',
        status: 'rejected',
        verifiedAt: new Date('2025-04-11T14:20:00'),
        verifiedBy: 'Michel Dupuis',
        rejectionReason: 'Document potentiellement altéré'
      }
    ],
    riskAssessment: {
      score: 85,
      level: 'high',
      factors: {
        country: 70,
        activity: 90,
        profile: 80,
        transactions: 100
      }
    },
    limits: {
      daily: 25000,
      weekly: 100000,
      monthly: 300000
    },
    registeredAt: new Date('2025-04-10T16:42:08'),
    lastVerificationUpdate: new Date('2025-04-11T14:20:00')
  },
  {
    id: 'USR-564',
    username: 'thomas.leroy',
    email: 'thomas.leroy@example.com',
    fullName: 'Thomas Leroy',
    birthDate: '1982-11-05',
    nationality: 'FR',
    phone: '+687567890',
    status: 'pending',
    verificationLevel: 'enhanced',
    address: {
      street: '25 Avenue des Flamboyants',
      city: 'Nouméa',
      postalCode: '98800',
      country: 'NC'
    },
    documents: [
      {
        type: 'passport',
        number: 'P45678901',
        issueDate: '2018-04-25',
        expiryDate: '2028-04-24',
        status: 'verified',
        verifiedAt: new Date('2025-04-03T10:15:00'),
        verifiedBy: 'Michel Dupuis'
      },
      {
        type: 'proof_of_address',
        description: 'Facture téléphone',
        issueDate: '2025-03-15',
        status: 'pending',
        uploadedAt: new Date('2025-04-12T15:45:00')
      }
    ],
    riskAssessment: {
      score: 70,
      level: 'high',
      factors: {
        country: 60,
        activity: 80,
        profile: 65,
        transactions: 75
      }
    },
    limits: {
      daily: 30000,
      weekly: 150000,
      monthly: 400000
    },
    registeredAt: new Date('2025-04-01T11:30:00'),
    lastVerificationUpdate: new Date('2025-04-12T15:45:00')
  }
];

// Métriques pour le tableau de bord
const dashboardMetrics = {
  total: 256,
  byLevel: {
    none: 12,
    basic: 57,
    enhanced: 97,
    full: 90
  },
  byStatus: {
    pending: 43,
    verified: 187,
    rejected: 26
  },
  byRisk: {
    low: 112,
    medium: 98,
    high: 35,
    critical: 11
  },
  recent: {
    today: 5,
    yesterday: 8,
    thisWeek: 32,
    lastWeek: 45
  }
};

/**
 * Récupère la liste des utilisateurs KYC avec filtrage et pagination
 */
function getUsers({ page = 1, limit = 10, level, status, search }) {
  let filteredUsers = [...users];
  
  // Appliquer les filtres si spécifiés
  if (level) {
    filteredUsers = filteredUsers.filter(user => user.verificationLevel === level);
  }
  
  if (status) {
    filteredUsers = filteredUsers.filter(user => user.status === status);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.fullName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower)
    );
  }
  
  // Calculer la pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  return {
    users: paginatedUsers,
    pagination: {
      total: filteredUsers.length,
      page,
      limit,
      pages: Math.ceil(filteredUsers.length / limit)
    }
  };
}

/**
 * Récupère un utilisateur spécifique par son ID
 */
function getUserById(userId) {
  return users.find(user => user.id === userId);
}

/**
 * Met à jour le statut KYC d'un utilisateur
 */
function updateUserStatus(userId, status, level, notes, username) {
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return false;
  }
  
  const user = users[userIndex];
  
  // Mise à jour du statut si fourni
  if (status) {
    user.status = status;
  }
  
  // Mise à jour du niveau si fourni
  if (level) {
    user.verificationLevel = level;
    
    // Ajuster les limites en fonction du niveau
    switch (level) {
      case 'basic':
        user.limits = { daily: 50000, weekly: 200000, monthly: 500000 };
        break;
      case 'enhanced':
        user.limits = { daily: 75000, weekly: 300000, monthly: 1000000 };
        break;
      case 'full':
        user.limits = { daily: 100000, weekly: 500000, monthly: 1500000 };
        break;
      default:
        user.limits = { daily: 25000, weekly: 100000, monthly: 300000 };
    }
  }
  
  // Ajouter une note si fournie
  if (notes) {
    if (!user.notes) {
      user.notes = [];
    }
    
    user.notes.push({
      author: username,
      content: notes,
      timestamp: new Date()
    });
  }
  
  user.lastVerificationUpdate = new Date();
  users[userIndex] = user;
  
  return true;
}

/**
 * Récupère les métriques pour le tableau de bord KYC
 */
function getDashboardMetrics() {
  return dashboardMetrics;
}

/**
 * Met à jour le statut d'un document
 */
function updateDocumentStatus(userId, documentType, status, rejectionReason, username) {
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return false;
  }
  
  const documentIndex = user.documents.findIndex(doc => doc.type === documentType);
  
  if (documentIndex === -1) {
    return false;
  }
  
  const document = user.documents[documentIndex];
  document.status = status;
  document.verifiedAt = new Date();
  document.verifiedBy = username;
  
  if (status === 'rejected' && rejectionReason) {
    document.rejectionReason = rejectionReason;
  }
  
  user.documents[documentIndex] = document;
  user.lastVerificationUpdate = new Date();
  
  // Mettre à jour le statut global de l'utilisateur si tous les documents sont vérifiés
  const allVerified = user.documents.every(doc => doc.status === 'verified');
  if (allVerified) {
    user.status = 'verified';
  } else if (user.documents.some(doc => doc.status === 'rejected')) {
    user.status = 'rejected';
  } else {
    user.status = 'pending';
  }
  
  return true;
}

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus,
  getDashboardMetrics,
  updateDocumentStatus
};