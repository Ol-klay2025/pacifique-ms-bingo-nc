/**
 * MS BINGO PACIFIQUE - Routes KYC (Know Your Customer)
 * Version: 15 avril 2025
 * 
 * Ce fichier gère les routes liées à la vérification d'identité des utilisateurs
 * et implémente les exigences réglementaires pour la connaissance client
 */

const express = require('express');
const router = express.Router();

// Niveaux de vérification KYC
const KYC_LEVELS = {
  NONE: 0,       // Non vérifié
  BASIC: 1,      // Vérification de base (email + téléphone)
  ENHANCED: 2,   // Vérification avancée (documents d'identité)
  FULL: 3        // Vérification complète (avec preuve de résidence)
};

// Types de documents acceptés
const DOCUMENT_TYPES = [
  "passport",
  "national_id",
  "driving_license",
  "residence_permit",
  "utility_bill",
  "bank_statement"
];

/**
 * @route GET /api/kyc/status/:userId
 * @desc Récupère le statut KYC d'un utilisateur
 * @access Privé (authentification requise)
 */
router.get('/status/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Dans une application réelle, ces données viendraient de la base de données
    // Exemple statique pour démonstration
    const kycStatus = {
      userId,
      verificationLevel: KYC_LEVELS.ENHANCED,
      verificationStatus: "verified",
      lastUpdated: new Date().toISOString(),
      documents: [
        {
          type: "passport",
          status: "verified",
          submissionDate: "2025-01-10T14:35:22Z",
          verificationDate: "2025-01-12T09:20:15Z",
          expiryDate: "2030-01-10T00:00:00Z"
        },
        {
          type: "utility_bill",
          status: "verified",
          submissionDate: "2025-01-10T14:36:45Z",
          verificationDate: "2025-01-12T09:25:30Z",
          expiryDate: "2025-07-10T00:00:00Z" // 6 mois de validité
        }
      ],
      restrictions: [],
      allowedDepositLimit: 1000000, // 1 million XPF
      allowedWithdrawalLimit: 500000 // 500 000 XPF
    };
    
    res.json({
      success: true,
      data: kycStatus
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du statut KYC:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

/**
 * @route POST /api/kyc/submit-document/:userId
 * @desc Soumet un document pour vérification KYC
 * @access Privé (authentification requise)
 */
router.post('/submit-document/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Validation des données soumises
    const { documentType, documentNumber, issueDate, expiryDate, countryOfIssue, documentImage } = req.body;
    
    if (!documentType || !DOCUMENT_TYPES.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: "Type de document non valide. Types acceptés: " + DOCUMENT_TYPES.join(", ")
      });
    }
    
    if (!documentImage) {
      return res.status(400).json({
        success: false,
        message: "Image du document requise"
      });
    }
    
    // Vérification de base du format d'image (dans une application réelle, analyse plus approfondie)
    if (!documentImage.startsWith("data:image/")) {
      return res.status(400).json({
        success: false,
        message: "Format d'image invalide. Formats acceptés: JPEG, PNG"
      });
    }
    
    // Simulation du traitement et de l'enregistrement du document
    // Dans une application réelle:
    // 1. Vérification de l'authenticité du document par des services tiers ou IA
    // 2. Vérification des données OCR par rapport aux données saisies
    // 3. Stockage sécurisé des documents avec chiffrement
    // 4. Mise en file d'attente pour vérification manuelle si nécessaire
    
    const submissionResult = {
      submissionId: Math.floor(Math.random() * 10000) + 1000,
      userId,
      documentType,
      status: "pending",
      submissionDate: new Date().toISOString(),
      estimatedCompletionTime: "24-48 heures",
      nextSteps: "Votre document sera vérifié par notre équipe. Vous recevrez une notification une fois le processus terminé."
    };
    
    res.json({
      success: true,
      message: "Document soumis avec succès pour vérification",
      data: submissionResult
    });
  } catch (error) {
    console.error('Erreur lors de la soumission du document KYC:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

/**
 * @route GET /api/kyc/document-requirements
 * @desc Récupère les exigences pour chaque type de document
 * @access Public
 */
router.get('/document-requirements', (req, res) => {
  try {
    const requirements = {
      passport: {
        description: "Passeport international valide",
        acceptedFormats: ["JPEG", "PNG"],
        requiredPages: ["Page principale avec photo"],
        requiredVisibility: [
          "Photo clairement visible",
          "Numéro de passeport complet",
          "Nom complet",
          "Date de naissance",
          "Date d'expiration",
          "Pays d'émission"
        ],
        examples: [
          "http://example.com/sample-passport.jpg" // URL d'exemple (ne pas utiliser en production)
        ]
      },
      national_id: {
        description: "Carte d'identité nationale",
        acceptedFormats: ["JPEG", "PNG"],
        requiredPages: ["Recto", "Verso"],
        requiredVisibility: [
          "Photo clairement visible",
          "Numéro d'identité complet",
          "Nom complet",
          "Date de naissance",
          "Date d'expiration"
        ],
        examples: [
          "http://example.com/sample-id-front.jpg",
          "http://example.com/sample-id-back.jpg"
        ]
      },
      driving_license: {
        description: "Permis de conduire",
        acceptedFormats: ["JPEG", "PNG"],
        requiredPages: ["Recto", "Verso"],
        requiredVisibility: [
          "Photo clairement visible",
          "Numéro de permis complet",
          "Nom complet",
          "Date de naissance",
          "Date d'expiration",
          "Catégories"
        ],
        examples: [
          "http://example.com/sample-license-front.jpg",
          "http://example.com/sample-license-back.jpg"
        ]
      },
      utility_bill: {
        description: "Facture de services publics (électricité, eau, internet)",
        acceptedFormats: ["JPEG", "PNG", "PDF"],
        maximumAge: "3 mois",
        requiredVisibility: [
          "Nom complet correspondant à l'identité déclarée",
          "Adresse complète",
          "Date d'émission (moins de 3 mois)",
          "Nom du fournisseur de service"
        ],
        examples: [
          "http://example.com/sample-utility-bill.jpg"
        ]
      },
      bank_statement: {
        description: "Relevé bancaire",
        acceptedFormats: ["JPEG", "PNG", "PDF"],
        maximumAge: "3 mois",
        requiredVisibility: [
          "Nom complet correspondant à l'identité déclarée",
          "Adresse complète",
          "Date d'émission (moins de 3 mois)",
          "Nom de la banque",
          "Numéro de compte (les 4 derniers chiffres suffisent)"
        ],
        examples: [
          "http://example.com/sample-bank-statement.jpg"
        ]
      }
    };
    
    res.json({
      success: true,
      data: requirements
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des exigences de document:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

/**
 * @route GET /api/kyc/verification-history/:userId
 * @desc Récupère l'historique des vérifications KYC d'un utilisateur
 * @access Privé (authentification + autorisation administrateur requise)
 */
router.get('/verification-history/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Dans une application réelle, vérifier que l'utilisateur est un administrateur
    
    // Exemple d'historique de vérification (dans une application réelle, vient de la base de données)
    const verificationHistory = [
      {
        id: 1,
        userId,
        timestamp: "2024-12-15T10:30:42Z",
        action: "level_upgrade",
        fromLevel: KYC_LEVELS.NONE,
        toLevel: KYC_LEVELS.BASIC,
        reason: "Vérification de l'email et du téléphone",
        actionBy: "system"
      },
      {
        id: 2,
        userId,
        timestamp: "2025-01-10T14:40:22Z",
        action: "document_submission",
        documentType: "passport",
        status: "submitted",
        actionBy: "user"
      },
      {
        id: 3,
        userId,
        timestamp: "2025-01-12T09:20:15Z",
        action: "document_verification",
        documentType: "passport",
        status: "approved",
        actionBy: "admin_45",
        notes: "Document authentique, toutes les informations correspondent"
      },
      {
        id: 4,
        userId,
        timestamp: "2025-01-12T09:22:30Z",
        action: "level_upgrade",
        fromLevel: KYC_LEVELS.BASIC,
        toLevel: KYC_LEVELS.ENHANCED,
        reason: "Vérification du passeport réussie",
        actionBy: "admin_45"
      }
    ];
    
    res.json({
      success: true,
      data: verificationHistory
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique de vérification:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

/**
 * @route POST /api/kyc/verify-document/:documentId
 * @desc Vérifie et valide un document soumis (endpoint administrateur)
 * @access Privé (authentification + autorisation administrateur requise)
 */
router.post('/verify-document/:documentId', (req, res) => {
  try {
    const documentId = parseInt(req.params.documentId);
    const { status, notes, verificationLevel } = req.body;
    
    // Vérifier que l'utilisateur est un administrateur KYC
    
    // Validation des données
    if (!status || !["approved", "rejected", "additional_info_required"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Statut non valide"
      });
    }
    
    // Traitement de la vérification (simulé)
    const verificationResult = {
      documentId,
      previousStatus: "pending",
      newStatus: status,
      verificationDate: new Date().toISOString(),
      verifiedBy: req.user ? req.user.id : "admin_test",
      notes: notes || "",
      userNotified: true
    };
    
    // Si approuvé et niveau de vérification fourni, mettre à jour le niveau de l'utilisateur
    if (status === "approved" && verificationLevel) {
      // Dans une application réelle, mettre à jour le niveau de vérification de l'utilisateur
      console.log(`[KYC] Niveau de vérification utilisateur mis à jour: ${verificationLevel}`);
    }
    
    res.json({
      success: true,
      message: `Document ${documentId} marqué comme "${status}"`,
      data: verificationResult
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du document:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

/**
 * @route GET /api/kyc/status/:userId/admin
 * @desc Récupère le statut KYC détaillé d'un utilisateur (version administrateur)
 * @access Privé (authentification + rôle ADMIN ou COMPLIANCE_OFFICER requis)
 */
router.get('/status/:userId/admin', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Dans une application réelle, vérifier que l'utilisateur est administrateur ou responsable conformité
    // if (!req.user.roles.includes('ADMIN') && !req.user.roles.includes('COMPLIANCE_OFFICER')) {
    //   return res.status(403).json({ success: false, message: "Accès non autorisé" });
    // }
    
    // Dans une application réelle, ces données viendraient de la base de données
    // Exemple enrichi avec beaucoup plus de détails pour les administrateurs
    const kycStatus = {
      // Informations de base
      userId,
      username: `user_${userId}`,
      email: `user${userId}@example.com`,
      verificationLevel: KYC_LEVELS.ENHANCED,
      verificationStatus: "verified",
      createdAt: "2024-01-15T08:30:00Z",
      lastUpdated: new Date().toISOString(),
      
      // Détails personnels (informations collectées)
      personalDetails: {
        firstName: "Jean",
        lastName: "Dupont",
        dateOfBirth: "1985-06-15",
        nationality: "FR",
        address: {
          street: "123 Rue du Pacifique",
          city: "Nouméa",
          postalCode: "98800",
          country: "NC",
          verificationStatus: "verified",
          verificationDate: "2025-01-12T09:23:10Z"
        },
        phoneNumber: "+687123456",
        phoneVerified: true,
        emailVerified: true
      },
      
      // Documents soumis et vérifiés
      documents: [
        {
          id: "doc-1001",
          type: "passport",
          documentNumber: "P12345678",
          country: "FR",
          issueDate: "2020-01-10",
          expiryDate: "2030-01-10",
          status: "verified",
          submissionDate: "2025-01-10T14:35:22Z",
          verificationDate: "2025-01-12T09:20:15Z",
          verifiedBy: "admin_45",
          notes: "Document authentique, toutes les informations correspondent"
        },
        {
          id: "doc-1002",
          type: "utility_bill",
          issuer: "EDF",
          issueDate: "2024-12-20",
          status: "verified",
          submissionDate: "2025-01-10T14:36:45Z",
          verificationDate: "2025-01-12T09:25:30Z",
          verifiedBy: "admin_45",
          notes: "Facture récente, adresse correspond aux informations déclarées"
        }
      ],
      
      // Évaluations de risque
      riskAssessment: {
        overallRiskScore: 25, // 0-100, où 100 est le plus risqué
        riskLevel: "low", // low, medium, high
        factors: {
          countryRisk: 20,
          activityRisk: 15,
          profileRisk: 30,
          transactionRisk: 35
        },
        lastAssessment: "2025-01-15T10:00:00Z",
        nextScheduledReview: "2025-07-15T00:00:00Z",
        reviewFrequency: "semi-annual" // based on risk level
      },
      
      // Alertes et drapeaux
      flags: {
        hasActiveAlerts: false,
        isOnWatchlist: false,
        isPEP: false, // Politically Exposed Person
        isSanctioned: false,
        isRestricted: false,
        restrictionNotes: null
      },
      
      // Historique des changements de statut
      statusHistory: [
        {
          fromStatus: "none",
          toStatus: "basic",
          date: "2024-01-15T10:30:42Z",
          changedBy: "system",
          reason: "Email and phone verification"
        },
        {
          fromStatus: "basic",
          toStatus: "enhanced",
          date: "2025-01-12T09:22:30Z",
          changedBy: "admin_45",
          reason: "ID document verification success"
        }
      ],
      
      // Limites financières
      financialLimits: {
        daily: {
          deposit: 100000,
          withdrawal: 50000,
          currentUsage: {
            deposit: 0,
            withdrawal: 0
          }
        },
        weekly: {
          deposit: 500000,
          withdrawal: 200000,
          currentUsage: {
            deposit: 5000,
            withdrawal: 2000
          }
        },
        monthly: {
          deposit: 1000000,
          withdrawal: 500000,
          currentUsage: {
            deposit: 5000,
            withdrawal: 2000
          }
        },
        singleTransaction: {
          maximum: 200000
        }
      },
      
      // Informations de conformité interne
      complianceInfo: {
        assignedOfficer: "officer_23",
        lastReviewDate: "2025-01-15T10:00:00Z",
        nextReviewDate: "2025-04-15T00:00:00Z",
        reviewNotes: "Aucun problème détecté. Profil de risque stable.",
        manualChecks: [
          {
            type: "document_authenticity",
            date: "2025-01-12T09:20:15Z",
            result: "pass",
            performedBy: "admin_45"
          },
          {
            type: "name_screening",
            date: "2025-01-12T09:30:45Z",
            result: "pass",
            performedBy: "admin_45"
          }
        ]
      }
    };
    
    res.json({
      success: true,
      data: kycStatus
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du statut KYC admin:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;