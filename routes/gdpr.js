/**
 * MS BINGO PACIFIQUE - Routes GDPR
 * Version: 15 avril 2025
 * 
 * Ce fichier gère les routes liées à la conformité GDPR
 * (Règlement Général sur la Protection des Données)
 */

const express = require('express');
const router = express.Router();

/**
 * @route GET /api/gdpr/data-export/:userId
 * @desc Exporte toutes les données d'un utilisateur (droit d'accès)
 * @access Privé (authentification requise)
 */
router.get('/data-export/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Vérification d'autorisation (dans une vraie application, vérifier l'authentification)
    // Seul l'utilisateur lui-même ou un administrateur peut accéder à ces données
    
    // Récupération des données de l'utilisateur (exemple)
    const userData = {
      // Informations personnelles
      personal: {
        id: userId,
        username: "utilisateur_" + userId,
        email: `user${userId}@example.com`,
        firstName: "Prénom" + userId,
        lastName: "Nom" + userId,
        dateOfBirth: "1985-01-01",
        registrationDate: "2024-01-15",
        lastLogin: "2025-04-15T08:30:00Z"
      },
      
      // Activité de jeu
      gameActivity: [
        { 
          gameId: 101, 
          gameName: "Bingo Régulier", 
          participationDate: "2025-04-14T14:00:00Z",
          cardsPlayed: 3,
          winnings: 1200
        },
        { 
          gameId: 102, 
          gameName: "Bingo Spécial", 
          participationDate: "2025-04-10T18:00:00Z",
          cardsPlayed: 2,
          winnings: 0
        }
      ],
      
      // Transactions financières
      financialTransactions: [
        {
          id: 5001,
          type: "deposit",
          amount: 5000,
          currency: "XPF",
          timestamp: "2025-04-05T09:15:00Z",
          status: "completed"
        },
        {
          id: 5002,
          type: "withdrawal",
          amount: 2000,
          currency: "XPF",
          timestamp: "2025-04-12T16:45:00Z",
          status: "completed"
        }
      ],
      
      // Paramètres et préférences
      preferences: {
        languagePreference: "fr",
        notificationsEnabled: true,
        marketingConsent: false,
        lastUpdated: "2025-03-20T11:22:33Z"
      },
      
      // Journaux d'accès
      accessLogs: [
        {
          timestamp: "2025-04-15T08:30:00Z",
          ipAddress: "192.168.x.x",
          userAgent: "Mozilla/5.0...",
          action: "login"
        },
        {
          timestamp: "2025-04-14T19:45:00Z",
          ipAddress: "192.168.x.x",
          userAgent: "Mozilla/5.0...",
          action: "logout"
        }
      ]
    };
    
    res.json({
      success: true,
      data: userData,
      timestamp: new Date().toISOString(),
      exportType: "GDPR data export"
    });
  } catch (error) {
    console.error('Erreur lors de l\'export des données GDPR:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

/**
 * @route POST /api/gdpr/data-deletion/:userId
 * @desc Supprime ou anonymise toutes les données d'un utilisateur (droit à l'oubli)
 * @access Privé (authentification requise + vérification supplémentaire)
 */
router.post('/data-deletion/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Vérification d'autorisation (dans une vraie application, ajouter une vérification renforcée)
    // Mise en place d'un processus de validation à 2 facteurs pour confirmer la demande
    
    // Données du formulaire de confirmation
    const { confirmationCode, reason } = req.body;
    
    if (!confirmationCode || confirmationCode !== "DELETE-CONFIRM") {
      return res.status(400).json({ 
        success: false,
        message: "Code de confirmation invalide. La suppression nécessite une vérification spéciale."
      });
    }
    
    // Dans une application réelle, on procéderait à :
    // 1. Suppression des données personnelles identifiables
    // 2. Anonymisation des données de jeu et financières pour la conformité réglementaire
    // 3. Conservation des logs minimaux requis par la législation
    // 4. Notification aux services internes pour arrêter les communications
    
    // Simulation de la suppression des données
    const deletionReport = {
      userId,
      deletionTimestamp: new Date().toISOString(),
      deletionStatus: "completed",
      dataCategories: [
        { name: "personal_data", status: "deleted" },
        { name: "game_activity", status: "anonymized" },
        { name: "financial_records", status: "retained_regulatory" },
        { name: "preferences", status: "deleted" },
        { name: "access_logs", status: "anonymized" }
      ],
      retentionReason: "Les données financières sont conservées pendant 5 ans conformément aux exigences réglementaires de lutte contre le blanchiment d'argent."
    };
    
    // Envoi d'une confirmation par email à l'adresse enregistrée (simulé)
    console.log(`[GDPR] Confirmation de suppression de compte envoyée pour l'utilisateur ${userId}`);
    
    res.json({
      success: true,
      message: "Données personnelles supprimées ou anonymisées avec succès",
      details: deletionReport
    });
  } catch (error) {
    console.error('Erreur lors de la suppression des données GDPR:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

/**
 * @route GET /api/gdpr/consent-history/:userId
 * @desc Récupère l'historique des consentements utilisateur
 * @access Privé (authentification requise)
 */
router.get('/consent-history/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Exemple d'historique de consentements
    const consentHistory = [
      {
        id: 1,
        userId,
        consentType: "terms_of_service",
        version: "2.1",
        status: "accepted",
        timestamp: "2024-01-15T10:23:45Z",
        ipAddress: "192.168.1.1"
      },
      {
        id: 2,
        userId,
        consentType: "privacy_policy",
        version: "3.0",
        status: "accepted",
        timestamp: "2024-01-15T10:23:48Z",
        ipAddress: "192.168.1.1"
      },
      {
        id: 3,
        userId,
        consentType: "marketing_communications",
        version: "1.2",
        status: "declined",
        timestamp: "2024-01-15T10:24:02Z",
        ipAddress: "192.168.1.1"
      },
      {
        id: 4,
        userId,
        consentType: "privacy_policy",
        version: "4.0",
        status: "accepted",
        timestamp: "2024-09-22T15:11:33Z",
        ipAddress: "192.168.1.42"
      }
    ];
    
    res.json({
      success: true,
      data: consentHistory
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des consentements:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

/**
 * @route POST /api/gdpr/update-consent/:userId
 * @desc Met à jour les consentements utilisateur
 * @access Privé (authentification requise)
 */
router.post('/update-consent/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Données du formulaire de consentement
    const { consentType, status } = req.body;
    
    // Validation des données
    if (!consentType || !['marketing_communications', 'data_analytics', 'third_party_sharing'].includes(consentType)) {
      return res.status(400).json({ 
        success: false,
        message: "Type de consentement invalide"
      });
    }
    
    if (!status || !['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Statut de consentement invalide"
      });
    }
    
    // Enregistrement du nouveau consentement (simulé)
    const newConsent = {
      id: Math.floor(Math.random() * 1000) + 100,
      userId,
      consentType,
      version: {
        'marketing_communications': '2.0',
        'data_analytics': '1.5',
        'third_party_sharing': '3.1'
      }[consentType],
      status,
      timestamp: new Date().toISOString(),
      ipAddress: req.ip || '127.0.0.1'
    };
    
    res.json({
      success: true,
      message: `Préférence de consentement "${consentType}" mise à jour avec succès`,
      data: newConsent
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du consentement:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

/**
 * @route POST /api/gdpr/export
 * @desc Génère et exporte toutes les données d'un utilisateur dans un format structuré
 * @access Privé (authentification requise + vérification d'identité)
 */
router.post('/export', async (req, res) => {
  try {
    const { userId, format, includeCategories } = req.body;
    
    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ID utilisateur requis"
      });
    }
    
    // Vérification que l'utilisateur a le droit d'accéder à ces données
    // Dans une application réelle, vérifier que l'utilisateur authentifié est soit l'utilisateur lui-même, soit un administrateur
    
    // Format d'export (par défaut JSON)
    const exportFormat = format || 'json';
    if (!['json', 'csv', 'pdf'].includes(exportFormat)) {
      return res.status(400).json({
        success: false,
        message: "Format d'export non pris en charge. Formats acceptés: json, csv, pdf"
      });
    }
    
    // Catégories de données à inclure
    const categories = includeCategories || [
      'personal_info',
      'financial_transactions',
      'game_activity',
      'login_history',
      'consent_history',
      'communication_preferences'
    ];
    
    // Récupération des données utilisateur (simulé)
    const userData = {
      personal_info: {
        id: userId,
        username: `user_${userId}`,
        email: `user${userId}@example.com`,
        name: `Utilisateur ${userId}`,
        phone: '+123456789',
        registration_date: '2024-01-15T08:30:00Z',
        profile_last_updated: '2025-03-20T14:15:22Z'
      },
      financial_transactions: [
        {
          id: 'txn_001',
          type: 'deposit',
          amount: 5000,
          currency: 'XPF',
          method: 'credit_card',
          timestamp: '2025-03-01T10:15:30Z',
          status: 'completed'
        },
        {
          id: 'txn_002',
          type: 'withdrawal',
          amount: 2000,
          currency: 'XPF',
          method: 'bank_transfer',
          timestamp: '2025-03-10T16:45:22Z',
          status: 'completed'
        }
      ],
      game_activity: [
        {
          game_id: 'game_001',
          game_type: 'regular_bingo',
          participation_date: '2025-03-05T14:00:00Z',
          cards_purchased: 3,
          amount_spent: 300,
          winnings: 0
        },
        {
          game_id: 'game_002',
          game_type: 'special_bingo',
          participation_date: '2025-03-12T18:00:00Z',
          cards_purchased: 2,
          amount_spent: 600,
          winnings: 1200
        }
      ],
      login_history: [
        {
          session_id: 'sess_001',
          ip_address: '192.168.1.1',
          device: 'Mobile Android',
          location: 'Nouméa, Nouvelle-Calédonie',
          timestamp: '2025-04-01T08:30:15Z',
          action: 'login'
        },
        {
          session_id: 'sess_002',
          ip_address: '192.168.1.1',
          device: 'Mobile Android',
          location: 'Nouméa, Nouvelle-Calédonie',
          timestamp: '2025-04-01T10:45:22Z',
          action: 'logout'
        }
      ],
      consent_history: [
        {
          consent_type: 'terms_of_service',
          version: '1.2',
          status: 'accepted',
          timestamp: '2024-01-15T08:32:10Z'
        },
        {
          consent_type: 'privacy_policy',
          version: '2.0',
          status: 'accepted',
          timestamp: '2024-01-15T08:32:15Z'
        },
        {
          consent_type: 'marketing_emails',
          version: '1.0',
          status: 'declined',
          timestamp: '2024-01-15T08:33:05Z'
        }
      ],
      communication_preferences: {
        email_notifications: true,
        game_reminders: true,
        marketing_communications: false,
        promotions: false,
        language_preference: 'fr',
        last_updated: '2024-01-15T08:35:00Z'
      }
    };

    // Filtrer les catégories demandées
    const filteredData = {};
    categories.forEach(category => {
      if (userData[category]) {
        filteredData[category] = userData[category];
      }
    });
    
    // Enregistrer la demande d'export GDPR dans le journal d'audit
    console.log(`[GDPR] Export de données demandé pour l'utilisateur ${userId}, format: ${exportFormat}, catégories: ${categories.join(', ')}`);
    
    // Gestion des différents formats
    if (exportFormat === 'json') {
      res.json({
        success: true,
        message: "Export des données utilisateur",
        timestamp: new Date().toISOString(),
        data: filteredData
      });
    } else if (exportFormat === 'csv') {
      // Dans une application réelle, convertir les données en CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="user_${userId}_data_export.csv"`);
      res.status(200).send("Données CSV simulées");
    } else if (exportFormat === 'pdf') {
      // Dans une application réelle, générer un PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="user_${userId}_data_export.pdf"`);
      res.status(200).send("Données PDF simulées");
    }
  } catch (error) {
    console.error('Erreur lors de l\'export GDPR:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;