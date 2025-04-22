/**
 * MS BINGO PACIFIQUE - Routes API AML (Anti-Money Laundering)
 * Version: 15 avril 2025
 * 
 * Ce fichier gère les routes liées à la lutte contre le blanchiment d'argent
 */

import express from 'express';

const router = express.Router();

// Route pour vérifier l'état du service AML
router.get('/health', (req, res) => {
  res.json({ 
    service: 'AML', 
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Route pour obtenir les alertes AML (Anti-Money Laundering)
router.get('/alerts', (req, res) => {
  try {
    // Filtre par statut (opened, closed, all)
    const status = req.query.status || 'opened';
    
    // Filtre par niveau de risque (low, medium, high, all)
    const risk = req.query.risk || 'all';
    
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
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

// Route pour obtenir les transactions d'un utilisateur
router.get('/transactions/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Exemple de données (dans une vraie application, ces données viendraient d'une base de données)
    const transactions = [
      {
        id: 1001,
        user_id: userId,
        type: "deposit",
        amount: 1000,
        method: "credit_card",
        timestamp: new Date().toISOString(),
        status: "completed"
      },
      {
        id: 1002,
        user_id: userId,
        type: "game_purchase",
        amount: 200,
        game_id: 123,
        cards: 2,
        timestamp: new Date().toISOString(),
        status: "completed"
      },
      {
        id: 1003,
        user_id: userId,
        type: "withdrawal",
        amount: 500,
        method: "bank_transfer",
        timestamp: new Date().toISOString(),
        status: "pending"
      }
    ];
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération des transactions pour l'utilisateur ${req.params.userId}:`, error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Route pour traiter une alerte AML
router.post('/alerts/:alertId/process', (req, res) => {
  try {
    const alertId = parseInt(req.params.alertId);
    const { action, notes } = req.body;
    
    // Validation de l'action
    if (!['close', 'escalate', 'flag_user'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Action invalide. Les actions possibles sont: close, escalate, flag_user' 
      });
    }
    
    // Traitement de l'alerte (dans une vraie application, cela modifierait les données dans une base de données)
    
    res.json({
      success: true,
      message: `Alerte #${alertId} traitée avec succès. Action: ${action}`,
      data: {
        alert_id: alertId,
        action,
        notes,
        processed_by: req.user?.id || 'system',
        processed_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`Erreur lors du traitement de l'alerte ${req.params.alertId}:`, error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Route pour obtenir le tableau de bord AML
router.get('/dashboard', (req, res) => {
  try {
    // Exemple de données de tableau de bord
    const dashboard = {
      alerts_summary: {
        total: 42,
        opened: 24,
        closed: 18,
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
        net_deposits_7d: 350000
      },
      flagged_users: {
        total: 15,
        high_risk: 5,
        medium_risk: 10
      },
      recent_activities: [
        {
          type: "new_alert",
          user_id: 456,
          user_name: "Pierre Leroy",
          alert_type: "unusual_pattern",
          timestamp: new Date().toISOString()
        },
        {
          type: "alert_closed",
          alert_id: 123,
          user_id: 789,
          user_name: "Sophie Martin",
          closed_by: "admin",
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

export default router;