/**
 * MS BINGO PACIFIQUE - Routes AML (Anti-Money Laundering)
 * Version: 15 avril 2025
 * 
 * Ce fichier gère les routes liées à la conformité anti-blanchiment d'argent
 */

const express = require('express');
const router = express.Router();

/**
 * @route GET /api/aml/health
 * @desc Vérifie l'état du service AML
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({ 
    service: 'AML', 
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route GET /api/aml/alerts
 * @desc Récupère les alertes AML avec filtrage et pagination
 * @access Privé (authentification + rôle AML_ANALYST requis)
 */
router.get('/alerts', (req, res) => {
  try {
    // Filtre par statut (opened, closed, all)
    const status = req.query.status || 'opened';
    
    // Filtre par niveau de risque (low, medium, high, all)
    const risk = req.query.risk || 'all';
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Exemple de données (dans une vraie application, ces données viendraient d'une base de données)
    const alerts = [
      { 
        id: 1, 
        user_id: 101,
        user_name: "Jean Martin",
        alert_type: "large_deposit",
        amount: 15000,
        risk_level: "medium",
        timestamp: new Date().toISOString(),
        status: "opened",
        details: "Dépôt important sans activité de jeu correspondante"
      },
      { 
        id: 2, 
        user_id: 234,
        user_name: "Marie Durand",
        alert_type: "rapid_cycling",
        amount: 5000,
        risk_level: "high",
        timestamp: new Date().toISOString(),
        status: "opened",
        details: "Cycles rapides de dépôts et retraits sans activité de jeu significative"
      },
      { 
        id: 3, 
        user_id: 189,
        user_name: "Paul Legrand",
        alert_type: "suspicious_pattern",
        amount: 7500,
        risk_level: "high",
        timestamp: new Date().toISOString(),
        status: "opened",
        details: "Schéma de transactions correspondant à un fractionnement potentiel"
      },
      { 
        id: 4, 
        user_id: 422,
        user_name: "Luc Petit",
        alert_type: "third_party_transfer",
        amount: 3000,
        risk_level: "medium",
        timestamp: new Date().toISOString(),
        status: "opened",
        details: "Tentative de transfert vers un tiers"
      },
      { 
        id: 5, 
        user_id: 567,
        user_name: "Sophie Blanc",
        alert_type: "multiple_accounts",
        amount: 2500,
        risk_level: "low",
        timestamp: new Date().toISOString(),
        status: "closed",
        details: "Résolu après vérification - comptes appartenant à des membres de la même famille"
      }
    ];
    
    // Filtrage par statut
    let filteredAlerts = alerts;
    if (status !== 'all') {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }
    
    // Filtrage par niveau de risque
    if (risk !== 'all') {
      filteredAlerts = filteredAlerts.filter(alert => alert.risk_level === risk);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedAlerts,
      pagination: {
        total: filteredAlerts.length,
        page,
        limit,
        total_pages: Math.ceil(filteredAlerts.length / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes AML:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

/**
 * @route GET /api/aml/alert/:alertId
 * @desc Récupère les détails d'une alerte spécifique
 * @access Privé (authentification + rôle AML_ANALYST requis)
 */
router.get('/alert/:alertId', (req, res) => {
  try {
    const alertId = parseInt(req.params.alertId);
    
    // Dans une vraie application, récupérer depuis la base de données
    const alertDetails = {
      id: alertId,
      user_id: 101,
      user_name: "Jean Martin",
      alert_type: "large_deposit",
      risk_level: "medium",
      status: "opened",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      
      // Détails spécifiques à l'alerte
      details: {
        trigger_amount: 15000,
        currency: "XPF",
        trigger_rule: "single_deposit_over_10000",
        detection_method: "automatic"
      },
      
      // Transactions associées
      related_transactions: [
        {
          id: 456789,
          type: "deposit",
          amount: 15000,
          currency: "XPF",
          payment_method: "credit_card",
          timestamp: new Date().toISOString(),
          status: "completed"
        }
      ],
      
      // Historique de traitement
      processing_history: [
        {
          action: "alert_created",
          timestamp: new Date().toISOString(),
          performed_by: "system",
          notes: "Alerte générée automatiquement par le système"
        }
      ],
      
      // Profil utilisateur
      user_profile: {
        id: 101,
        name: "Jean Martin",
        registration_date: "2024-10-15T08:30:00Z",
        kyc_level: "enhanced",
        risk_score: 65,
        recent_activity_summary: {
          deposits_30d: 20000,
          withdrawals_30d: 3000,
          games_played_30d: 12,
          average_bet_size: 500
        }
      }
    };
    
    res.json({
      success: true,
      data: alertDetails
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails d\'alerte AML:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

/**
 * @route POST /api/aml/alert/:alertId/update
 * @desc Met à jour le statut d'une alerte
 * @access Privé (authentification + rôle AML_ANALYST requis)
 */
router.post('/alert/:alertId/update', (req, res) => {
  try {
    const alertId = parseInt(req.params.alertId);
    const { status, notes, resolution_type } = req.body;
    
    // Validation
    if (!status || !['opened', 'in_progress', 'escalated', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Statut d'alerte non valide"
      });
    }
    
    if (status === 'closed' && !resolution_type) {
      return res.status(400).json({
        success: false,
        message: "Type de résolution requis pour clôturer une alerte"
      });
    }
    
    // Dans une application réelle, mise à jour en base de données
    
    // Construction de la réponse
    const updatedAlert = {
      id: alertId,
      previous_status: "opened",
      new_status: status,
      updated_at: new Date().toISOString(),
      updated_by: req.user ? req.user.id : "admin_test",
      notes: notes || "",
      resolution_type: resolution_type || null
    };
    
    // Si l'alerte est escaladée, simuler la notification aux autorités
    if (status === 'escalated') {
      console.log(`[AML] Alerte ${alertId} escaladée aux autorités réglementaires`);
      updatedAlert.escalation_reference = "ESC-" + Date.now().toString().substring(7);
    }
    
    res.json({
      success: true,
      message: `Alerte ${alertId} mise à jour avec succès`,
      data: updatedAlert
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour d\'alerte AML:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

/**
 * @route GET /api/aml/dashboard
 * @desc Récupère les métriques pour le tableau de bord AML
 * @access Privé (authentification + rôle AML_MANAGER requis)
 */
router.get('/dashboard', (req, res) => {
  try {
    // Exemple de données de tableau de bord
    const dashboard = {
      alerts_summary: {
        total: 42,
        opened: 24,
        in_progress: 10,
        escalated: 3,
        closed: 5,
        by_risk: {
          low: 12,
          medium: 18,
          high: 12
        }
      },
      transactions_summary: {
        total_volume_24h: 250000,
        deposits_24h: 120000,
        withdrawals_24h: 75000,
        net_deposits_7d: 350000,
        transactions_count_24h: 345
      },
      flagged_users: {
        total: 15,
        high_risk: 5,
        medium_risk: 10,
        recently_flagged: 3
      },
      geographic_distribution: {
        // Répartition géographique des utilisateurs actifs
        "NC": 45, // Nouvelle-Calédonie
        "PF": 30, // Polynésie française
        "WF": 10, // Wallis-et-Futuna
        "FR": 15  // France métropolitaine
      },
      recent_activities: [
        {
          type: "new_alert",
          alert_id: 42,
          user_id: 456,
          user_name: "Pierre Leroy",
          alert_type: "unusual_pattern",
          risk_level: "high",
          timestamp: new Date().toISOString()
        },
        {
          type: "alert_closed",
          alert_id: 38,
          user_id: 789,
          user_name: "Sophie Martin",
          closed_by: "admin_23",
          resolution: "false_positive",
          timestamp: new Date().toISOString()
        },
        {
          type: "alert_escalated",
          alert_id: 36,
          user_id: 321,
          user_name: "Michel Dupont",
          escalated_by: "admin_45",
          escalation_reference: "ESC-5437891",
          timestamp: new Date().toISOString()
        }
      ]
    };
    
    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du tableau de bord AML:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

/**
 * @route POST /api/aml/report-suspicious
 * @desc Permet de signaler un comportement suspect pour analyse AML
 * @access Privé (authentification requise)
 */
router.post('/report-suspicious', (req, res) => {
  try {
    const { 
      targetUserId, 
      reportingUserId, 
      reason, 
      details, 
      transactionIds,
      attachedEvidence,
      severityLevel 
    } = req.body;
    
    // Validation des données
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "ID de l'utilisateur ciblé requis"
      });
    }
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Motif du signalement requis"
      });
    }
    
    // Validation du niveau de sévérité
    const validSeverityLevels = ['low', 'medium', 'high', 'critical'];
    const reportSeverity = severityLevel || 'medium';
    
    if (!validSeverityLevels.includes(reportSeverity)) {
      return res.status(400).json({
        success: false,
        message: "Niveau de sévérité non valide. Valeurs acceptées: low, medium, high, critical"
      });
    }
    
    // Création d'un identifiant unique pour ce signalement
    const reportId = 'REP-' + Date.now().toString().substring(7) + '-' + Math.floor(Math.random() * 1000);
    
    // Enregistrement du signalement (simulé)
    const report = {
      id: reportId,
      targetUserId,
      reportingUserId: reportingUserId || 'anonymous',
      reason,
      details: details || '',
      transactionIds: transactionIds || [],
      attachedEvidence: attachedEvidence || null,
      severityLevel: reportSeverity,
      status: 'submitted',
      submissionDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    // Logique de notification interne (simulée)
    // Dans une application réelle, envoyer des notifications aux analystes AML en fonction du niveau de sévérité
    console.log(`[AML] Nouveau signalement ${reportId} reçu avec niveau de sévérité ${reportSeverity}`);
    
    if (reportSeverity === 'high' || reportSeverity === 'critical') {
      console.log(`[AML] ALERTE: Signalement prioritaire ${reportId} nécessitant une attention immédiate`);
      // Dans une implémentation réelle, envoi d'alertes par email/SMS/notification push
    }
    
    // Création d'une nouvelle alerte AML basée sur ce signalement
    let riskScore = 0;
    
    // Calcul simplifié du score de risque
    switch (reportSeverity) {
      case 'low': riskScore = 25; break;
      case 'medium': riskScore = 50; break;
      case 'high': riskScore = 75; break;
      case 'critical': riskScore = 90; break;
      default: riskScore = 50;
    }
    
    // Si des preuves sont attachées, augmenter le score de risque
    if (attachedEvidence) {
      riskScore += 10;
    }
    
    // Si plusieurs transactions sont signalées, augmenter le score de risque
    if (transactionIds && transactionIds.length > 3) {
      riskScore += 15;
    }
    
    // Limiter le score maximum à 100
    riskScore = Math.min(riskScore, 100);
    
    // Création d'une alerte correspondant au signalement
    const alert = {
      id: Math.floor(Math.random() * 1000) + 1000,
      source: 'manual_report',
      sourceId: reportId,
      userId: targetUserId,
      alertType: 'suspicious_activity_report',
      riskScore,
      riskLevel: riskScore >= 75 ? 'high' : (riskScore >= 50 ? 'medium' : 'low'),
      status: 'opened',
      createdAt: new Date().toISOString(),
      priority: reportSeverity === 'critical' ? 'immediate' : 'normal'
    };
    
    res.status(201).json({
      success: true,
      message: "Signalement transmis avec succès à l'équipe Anti-Money Laundering",
      data: {
        reportId,
        status: 'submitted',
        alertId: alert.id,
        estimatedReviewTime: reportSeverity === 'critical' ? '1 heure' : '24 heures',
        nextSteps: "Votre signalement sera analysé par notre équipe. Vous pouvez suivre son statut avec l'identifiant fourni."
      }
    });
  } catch (error) {
    console.error('Erreur lors du signalement d\'activité suspecte:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;