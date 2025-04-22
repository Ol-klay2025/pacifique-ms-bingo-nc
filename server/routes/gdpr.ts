/**
 * MS BINGO PACIFIQUE - Routes API GDPR (Règlement Général sur la Protection des Données)
 * Version: 15 avril 2025
 * 
 * Ce fichier gère les routes liées à la conformité GDPR et à la protection des données
 */

import express from 'express';
import { checkAuthentication, checkAuthorization } from '../middleware/auth';

const router = express.Router();

// Middleware d'authentification pour toutes les routes GDPR
router.use(checkAuthentication);

// Récupérer les données personnelles d'un utilisateur (droit d'accès)
router.get('/personal-data', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupération des données personnelles
    // Code à implémenter selon le système de stockage utilisé
    
    // Exemple de réponse simulée
    const personalData = {
      profile: {
        id: userId,
        email: req.user.email,
        name: req.user.name,
        phone: req.user.phone,
        created_at: req.user.created_at
      },
      game_history: {
        games_played: 147,
        cards_purchased: 523,
        wins: 12,
        total_spent: 52300,
        total_won: 72500
      },
      payment_methods: [
        { type: 'card', last_four: '1234', expires: '12/25' },
        { type: 'wallet', provider: 'PayPal', email: 'user@example.com' }
      ],
      login_history: [
        { datetime: '2025-04-12T14:32:10Z', ip: '192.168.1.100', device: 'iPhone 14' },
        { datetime: '2025-04-11T19:15:42Z', ip: '192.168.1.100', device: 'MacBook Pro' }
      ]
    };
    
    res.json({ success: true, data: personalData });
  } catch (error) {
    console.error('Erreur lors de la récupération des données personnelles:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Télécharger les données personnelles au format JSON (droit à la portabilité)
router.get('/download-data', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupération et formatage des données personnelles
    // Code à implémenter selon le système de stockage utilisé
    
    // Exemple de données simulées
    const personalData = {
      profile: {
        id: userId,
        email: req.user.email,
        name: req.user.name,
        phone: req.user.phone,
        created_at: req.user.created_at
      },
      game_history: [
        { datetime: '2025-04-12T14:32:10Z', game_id: 1234, cards: 5, result: 'quine', amount_won: 500 },
        { datetime: '2025-04-11T19:15:42Z', game_id: 1233, cards: 3, result: 'loss', amount_won: 0 }
      ],
      transactions: [
        { datetime: '2025-04-10T10:25:33Z', type: 'deposit', amount: 1000, method: 'card' },
        { datetime: '2025-04-12T15:40:22Z', type: 'withdrawal', amount: 1200, method: 'bank_transfer' }
      ]
    };
    
    // Définir les headers pour le téléchargement
    res.setHeader('Content-Disposition', `attachment; filename="ms-bingo-data-${userId}.json"`);
    res.setHeader('Content-Type', 'application/json');
    
    // Envoi des données
    res.json(personalData);
  } catch (error) {
    console.error('Erreur lors de la préparation des données à télécharger:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Demande de suppression de compte (droit à l'oubli)
router.post('/request-deletion', async (req, res) => {
  try {
    const userId = req.user.id;
    const { reason, password } = req.body;
    
    // Vérification du mot de passe
    // Code à implémenter pour vérifier l'authenticité de la demande
    
    // Création d'une requête de suppression
    // Code à implémenter selon le système de stockage utilisé
    
    res.json({ 
      success: true, 
      message: 'Demande de suppression enregistrée. Un email de confirmation vous a été envoyé.',
      data: { request_id: Math.floor(Math.random() * 10000), processing_time: '14 jours' }
    });
  } catch (error) {
    console.error('Erreur lors de la demande de suppression de compte:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Mise à jour des préférences de confidentialité
router.put('/privacy-preferences', async (req, res) => {
  try {
    const userId = req.user.id;
    const { marketing_emails, game_notifications, third_party_sharing } = req.body;
    
    // Validation des données
    if (typeof marketing_emails !== 'boolean' || 
        typeof game_notifications !== 'boolean' || 
        typeof third_party_sharing !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: 'Format de données incorrect. Toutes les préférences doivent être des booléens.' 
      });
    }
    
    // Mise à jour des préférences
    // Code à implémenter selon le système de stockage utilisé
    
    res.json({ 
      success: true, 
      message: 'Préférences de confidentialité mises à jour',
      data: { marketing_emails, game_notifications, third_party_sharing }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences de confidentialité:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Routes administratives (réservées aux admins)

// Liste des demandes de suppression de compte
router.get('/deletion-requests', checkAuthorization(['admin', 'data_officer']), async (req, res) => {
  try {
    // Récupération des demandes de suppression
    // Code à implémenter selon le système de stockage utilisé
    
    // Exemple de réponse simulée
    const requests = [
      { id: 1, user_id: 123, reason: 'Plus d\'utilisation', requested_at: new Date(), status: 'pending' },
      { id: 2, user_id: 456, reason: 'Raisons personnelles', requested_at: new Date(), status: 'processing' }
    ];
    
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes de suppression:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Traiter une demande de suppression
router.post('/process-deletion/:id', checkAuthorization(['admin', 'data_officer']), async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const { action, notes } = req.body;
    
    // Validation des données
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action invalide' });
    }
    
    // Traitement de la demande
    // Code à implémenter selon le système de stockage utilisé
    
    if (action === 'approve') {
      // Logique pour supprimer les données de l'utilisateur
      // Anonymisation des données qui doivent être conservées légalement
      
      res.json({ 
        success: true, 
        message: `Demande de suppression ${requestId} approuvée. Les données de l'utilisateur ont été anonymisées.` 
      });
    } else {
      // Logique pour rejeter la demande
      
      res.json({ 
        success: true, 
        message: `Demande de suppression ${requestId} rejetée. Un email a été envoyé à l'utilisateur.` 
      });
    }
  } catch (error) {
    console.error(`Erreur lors du traitement de la demande de suppression ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

export default router;