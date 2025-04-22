/**
 * Routes API pour la gestion des droits RGPD
 * Ce fichier définit les routes pour l'accès et la suppression des données personnelles
 */

const express = require('express');
const router = express.Router();
const { db } = require('../db');
const path = require('path');
const fs = require('fs');
const { ensureAuthenticated, ensureAdmin } = require('../auth');

// Middleware pour vérifier l'authentification
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Accès non autorisé' });
}

/**
 * Crée une demande d'accès aux données personnelles
 * POST /api/gdpr/request-data
 */
router.post('/request-data', ensureAuthenticated, async (req, res) => {
  try {
    const { format = 'json' } = req.body;
    
    // Vérifier si une demande récente (moins de 7 jours) existe déjà
    const existingRequest = await db.query(
      'SELECT * FROM gdpr_export_requests WHERE user_id = $1 AND request_date > NOW() - INTERVAL \'7 day\' ORDER BY request_date DESC LIMIT 1',
      [req.user.id]
    );
    
    if (existingRequest.rows.length > 0) {
      const existing = existingRequest.rows[0];
      if (existing.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Une demande est déjà en cours de traitement',
          requestId: existing.id,
          requestDate: existing.request_date
        });
      }
    }
    
    // Insérer une nouvelle demande
    const result = await db.query(
      'INSERT INTO gdpr_export_requests (user_id, format) VALUES ($1, $2) RETURNING *',
      [req.user.id, format]
    );
    
    const exportRequest = result.rows[0];
    
    // Pour la démonstration, nous allons immédiatement générer les données
    // Dans une version de production, ce serait traité par un processus asynchrone
    const userData = await collectUserData(req.user.id);
    
    // Mettre à jour le statut de la demande
    await db.query(
      'UPDATE gdpr_export_requests SET status = $1 WHERE id = $2',
      ['completed', exportRequest.id]
    );
    
    res.json({
      success: true,
      message: 'Données personnelles générées avec succès',
      requestId: exportRequest.id,
      data: userData
    });
    
  } catch (error) {
    console.error('Erreur lors de la demande d\'accès aux données:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * Crée une demande de suppression de données personnelles (droit à l'oubli)
 * POST /api/gdpr/request-deletion
 */
router.post('/request-deletion', ensureAuthenticated, async (req, res) => {
  try {
    const { reason } = req.body;
    
    // Vérifier si une demande récente (moins de 30 jours) existe déjà
    const existingRequest = await db.query(
      'SELECT * FROM gdpr_deletion_requests WHERE user_id = $1 AND request_date > NOW() - INTERVAL \'30 day\' ORDER BY request_date DESC LIMIT 1',
      [req.user.id]
    );
    
    if (existingRequest.rows.length > 0) {
      const existing = existingRequest.rows[0];
      if (existing.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Une demande de suppression est déjà en cours de traitement',
          requestId: existing.id,
          requestDate: existing.request_date
        });
      }
    }
    
    // Insérer une nouvelle demande
    const result = await db.query(
      'INSERT INTO gdpr_deletion_requests (user_id, reason) VALUES ($1, $2) RETURNING *',
      [req.user.id, reason || 'Aucune raison fournie']
    );
    
    const deletionRequest = result.rows[0];
    
    res.json({
      success: true,
      message: 'Demande de suppression enregistrée avec succès',
      requestId: deletionRequest.id,
      requestDate: deletionRequest.request_date,
      status: deletionRequest.status
    });
    
  } catch (error) {
    console.error('Erreur lors de la demande de suppression:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * Récupère le statut d'une demande de suppression
 * GET /api/gdpr/deletion-status/:requestId
 */
router.get('/deletion-status/:requestId', ensureAuthenticated, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const result = await db.query(
      'SELECT * FROM gdpr_deletion_requests WHERE id = $1 AND user_id = $2',
      [requestId, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }
    
    const deletionRequest = result.rows[0];
    
    res.json({
      success: true,
      requestId: deletionRequest.id,
      requestDate: deletionRequest.request_date,
      status: deletionRequest.status,
      completionDate: deletionRequest.completion_date
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du statut de la demande:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * Enregistre ou met à jour les préférences de cookies d'un utilisateur
 * POST /api/gdpr/cookie-preferences
 */
router.post('/cookie-preferences', ensureAuthenticated, async (req, res) => {
  try {
    const { functional, analytics } = req.body;
    
    // Vérifier si les préférences existent déjà
    const existingPrefs = await db.query(
      'SELECT * FROM user_cookie_preferences WHERE user_id = $1',
      [req.user.id]
    );
    
    let result;
    if (existingPrefs.rows.length === 0) {
      // Insérer de nouvelles préférences
      result = await db.query(
        'INSERT INTO user_cookie_preferences (user_id, functional, analytics) VALUES ($1, $2, $3) RETURNING *',
        [req.user.id, !!functional, !!analytics]
      );
    } else {
      // Mettre à jour les préférences existantes
      result = await db.query(
        'UPDATE user_cookie_preferences SET functional = $1, analytics = $2, updated_at = NOW() WHERE user_id = $3 RETURNING *',
        [!!functional, !!analytics, req.user.id]
      );
    }
    
    const preferences = result.rows[0];
    
    res.json({
      success: true,
      message: 'Préférences de cookies mises à jour avec succès',
      preferences: {
        necessary: true, // Toujours activé
        functional: preferences.functional,
        analytics: preferences.analytics,
        updatedAt: preferences.updated_at
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences de cookies:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * Récupère les préférences de cookies d'un utilisateur
 * GET /api/gdpr/cookie-preferences
 */
router.get('/cookie-preferences', ensureAuthenticated, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM user_cookie_preferences WHERE user_id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      // Aucune préférence enregistrée, retourner les valeurs par défaut
      return res.json({
        success: true,
        preferences: {
          necessary: true,
          functional: false,
          analytics: false
        }
      });
    }
    
    const preferences = result.rows[0];
    
    res.json({
      success: true,
      preferences: {
        necessary: true, // Toujours activé
        functional: preferences.functional,
        analytics: preferences.analytics,
        updatedAt: preferences.updated_at
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences de cookies:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Routes administratives (protégées)

/**
 * Liste toutes les demandes de suppression en attente
 * GET /api/gdpr/admin/deletion-requests
 */
router.get('/admin/deletion-requests', ensureAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT dr.*, u.username, u.email 
       FROM gdpr_deletion_requests dr
       JOIN users u ON dr.user_id = u.id
       WHERE dr.status = 'pending'
       ORDER BY dr.request_date DESC`
    );
    
    res.json({
      success: true,
      requests: result.rows
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes de suppression:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * Traite une demande de suppression (approuver ou rejeter)
 * POST /api/gdpr/admin/process-deletion
 */
router.post('/admin/process-deletion', ensureAdmin, async (req, res) => {
  try {
    const { requestId, action, adminNotes } = req.body;
    
    if (!requestId || !action || (action !== 'approve' && action !== 'reject')) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres invalides'
      });
    }
    
    // Récupérer la demande
    const requestResult = await db.query(
      'SELECT * FROM gdpr_deletion_requests WHERE id = $1 AND status = $2',
      [requestId, 'pending']
    );
    
    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée ou déjà traitée'
      });
    }
    
    const deletionRequest = requestResult.rows[0];
    
    if (action === 'approve') {
      // Anonymiser les données de l'utilisateur
      await anonymizeUserData(deletionRequest.user_id);
      
      // Mettre à jour le statut de la demande
      await db.query(
        'UPDATE gdpr_deletion_requests SET status = $1, completion_date = NOW(), admin_notes = $2 WHERE id = $3',
        ['completed', adminNotes, requestId]
      );
      
      res.json({
        success: true,
        message: 'Demande de suppression traitée avec succès. Les données de l\'utilisateur ont été anonymisées.'
      });
    } else {
      // Rejeter la demande
      await db.query(
        'UPDATE gdpr_deletion_requests SET status = $1, completion_date = NOW(), admin_notes = $2 WHERE id = $3',
        ['rejected', adminNotes, requestId]
      );
      
      res.json({
        success: true,
        message: 'Demande de suppression rejetée avec succès.'
      });
    }
    
  } catch (error) {
    console.error('Erreur lors du traitement de la demande de suppression:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * Récupère des statistiques sur les demandes RGPD
 * GET /api/gdpr/admin/stats
 */
router.get('/admin/stats', ensureAdmin, async (req, res) => {
  try {
    // Statistiques des demandes de suppression
    const deletionStats = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_count,
        COUNT(*) AS total_count
       FROM gdpr_deletion_requests`
    );
    
    // Statistiques des demandes d'exportation
    const exportStats = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_count,
        COUNT(*) AS total_count
       FROM gdpr_export_requests`
    );
    
    // Statistiques des préférences de cookies
    const cookieStats = await db.query(
      `SELECT 
        COUNT(*) AS total_users,
        COUNT(*) FILTER (WHERE functional = true) AS functional_enabled,
        COUNT(*) FILTER (WHERE analytics = true) AS analytics_enabled
       FROM user_cookie_preferences`
    );
    
    res.json({
      success: true,
      stats: {
        deletionRequests: deletionStats.rows[0],
        exportRequests: exportStats.rows[0],
        cookiePreferences: cookieStats.rows[0]
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques RGPD:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Fonctions utilitaires

/**
 * Collecte toutes les données d'un utilisateur pour l'export RGPD
 * @param {number} userId ID de l'utilisateur
 * @returns {Promise<Object>} Données de l'utilisateur
 */
async function collectUserData(userId) {
  try {
    // Récupérer les données utilisateur
    const userResult = await db.query(
      'SELECT id, username, email, balance, language, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('Utilisateur non trouvé');
    }
    
    const user = userResult.rows[0];
    
    // Récupérer les transactions
    const transactionsResult = await db.query(
      'SELECT id, type, amount, status, description, created_at FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    // Récupérer les cartes de bingo
    const cardsResult = await db.query(
      'SELECT id, game_id, created_at FROM cards WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    // Récupérer les participations aux jeux
    const gamesResult = await db.query(
      `SELECT g.id, g.start_time, g.end_time, g.status, 
        (CASE WHEN g.quine_winner_ids @> ARRAY[$1] THEN true ELSE false END) AS won_quine,
        (CASE WHEN g.bingo_winner_ids @> ARRAY[$1] THEN true ELSE false END) AS won_bingo
       FROM games g
       JOIN cards c ON c.game_id = g.id
       WHERE c.user_id = $1
       GROUP BY g.id
       ORDER BY g.start_time DESC`,
      [userId]
    );
    
    // Récupérer les méthodes bancaires
    const bankingMethodsResult = await db.query(
      'SELECT id, type, is_verified, last_used, created_at FROM banking_methods WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    // Récupérer les préférences de cookies
    const cookiePrefsResult = await db.query(
      'SELECT necessary, functional, analytics, updated_at FROM user_cookie_preferences WHERE user_id = $1',
      [userId]
    );
    
    const cookiePreferences = cookiePrefsResult.rows.length > 0 
      ? cookiePrefsResult.rows[0]
      : { necessary: true, functional: false, analytics: false };
    
    // Assembler toutes les données
    return {
      personalInfo: {
        userId: user.id,
        username: user.username,
        email: user.email,
        language: user.language,
        registrationDate: user.created_at
      },
      financialInfo: {
        currentBalance: user.balance,
        transactions: transactionsResult.rows,
        bankingMethods: bankingMethodsResult.rows
      },
      gameActivity: {
        totalCards: cardsResult.rows.length,
        cards: cardsResult.rows,
        games: gamesResult.rows
      },
      preferences: {
        cookies: cookiePreferences
      }
    };
    
  } catch (error) {
    console.error('Erreur lors de la collecte des données utilisateur:', error);
    throw error;
  }
}

/**
 * Anonymise les données d'un utilisateur (droit à l'oubli)
 * @param {number} userId ID de l'utilisateur
 * @returns {Promise<void>}
 */
async function anonymizeUserData(userId) {
  try {
    // Commencer une transaction
    await db.query('BEGIN');
    
    // Anonymiser l'utilisateur
    await db.query(
      `UPDATE users 
       SET 
        username = 'deleted_user_' || $1,
        email = NULL,
        is_deleted = true,
        deletion_date = NOW()
       WHERE id = $1`,
      [userId]
    );
    
    // Anonymiser les transactions
    await db.query(
      'UPDATE transactions SET anonymized = true WHERE user_id = $1',
      [userId]
    );
    
    // Supprimer les méthodes bancaires
    await db.query(
      'DELETE FROM banking_methods WHERE user_id = $1',
      [userId]
    );
    
    // Supprimer les préférences de cookies
    await db.query(
      'DELETE FROM user_cookie_preferences WHERE user_id = $1',
      [userId]
    );
    
    // Supprimer les documents KYC
    await db.query(
      `DELETE FROM kyc_documents 
       WHERE kyc_verification_id IN (
         SELECT id FROM kyc_verifications WHERE user_id = $1
       )`,
      [userId]
    );
    
    await db.query(
      'DELETE FROM kyc_verifications WHERE user_id = $1',
      [userId]
    );
    
    // Marquer les demandes comme traitées
    await db.query(
      `UPDATE gdpr_deletion_requests 
       SET status = 'completed', completion_date = NOW() 
       WHERE user_id = $1 AND status = 'pending'`,
      [userId]
    );
    
    // Confirmer la transaction
    await db.query('COMMIT');
    
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await db.query('ROLLBACK');
    console.error('Erreur lors de l\'anonymisation des données utilisateur:', error);
    throw error;
  }
}

module.exports = router;