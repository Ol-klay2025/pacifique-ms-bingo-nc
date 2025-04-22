/**
 * Routes API pour le système Anti-Money Laundering (AML)
 */

const express = require('express');
const router = express.Router();
const amlService = require('../amlService');

// Middleware pour vérifier l'authentification admin
function ensureAdmin(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentification requise' });
    }
    
    // Vérifier si l'utilisateur a le rôle admin
    if (!req.user.roles || !req.user.roles.includes('admin')) {
        return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    next();
}

// Middleware pour vérifier l'authentification utilisateur
function ensureAuthenticated(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentification requise' });
    }
    
    next();
}

/**
 * Routes accessibles uniquement aux administrateurs
 */

// Récupérer les données du tableau de bord AML
router.get('/dashboard', ensureAdmin, (req, res) => {
    try {
        const dashboardData = amlService.getDashboardState();
        res.json(dashboardData);
    } catch (error) {
        console.error('Erreur lors de la récupération des données du tableau de bord:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Récupérer toutes les alertes
router.get('/alerts', ensureAdmin, (req, res) => {
    try {
        // Paramètres de pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        
        // Filtres
        const status = req.query.status;
        const severity = req.query.severity;
        
        // Récupérer les alertes
        let alerts = amlService.alerts;
        
        // Appliquer les filtres
        if (status) {
            alerts = alerts.filter(alert => alert.status === status.toUpperCase());
        }
        
        if (severity) {
            alerts = alerts.filter(alert => alert.severity === severity.toUpperCase());
        }
        
        // Calculer la pagination
        const totalAlerts = alerts.length;
        const totalPages = Math.ceil(totalAlerts / limit);
        
        // Extraire la page demandée
        const paginatedAlerts = alerts.slice(offset, offset + limit);
        
        res.json({
            alerts: paginatedAlerts,
            pagination: {
                total: totalAlerts,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des alertes:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Récupérer une alerte spécifique
router.get('/alerts/:id', ensureAdmin, (req, res) => {
    try {
        const alertId = req.params.id;
        const alert = amlService.alerts.find(a => a.id === alertId);
        
        if (!alert) {
            return res.status(404).json({ error: 'Alerte non trouvée' });
        }
        
        res.json(alert);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'alerte:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Résoudre une alerte
router.post('/alerts/:id/resolve', ensureAdmin, (req, res) => {
    try {
        const alertId = req.params.id;
        const { notes } = req.body;
        
        const success = amlService.updateAlertStatus(alertId, 'RESOLVED', notes);
        
        if (!success) {
            return res.status(404).json({ error: 'Alerte non trouvée' });
        }
        
        res.json({ success: true, message: 'Alerte résolue avec succès' });
    } catch (error) {
        console.error('Erreur lors de la résolution de l\'alerte:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Escalader une alerte
router.post('/alerts/:id/escalate', ensureAdmin, (req, res) => {
    try {
        const alertId = req.params.id;
        const { notes } = req.body;
        
        const success = amlService.updateAlertStatus(alertId, 'ESCALATED', notes);
        
        if (!success) {
            return res.status(404).json({ error: 'Alerte non trouvée' });
        }
        
        res.json({ success: true, message: 'Alerte escaladée avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'escalade de l\'alerte:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Récupérer les transactions d'un utilisateur
router.get('/users/:userId/transactions', ensureAdmin, (req, res) => {
    try {
        const userId = req.params.userId;
        const transactions = amlService.getUserTransactionHistory(userId);
        
        res.json(transactions);
    } catch (error) {
        console.error('Erreur lors de la récupération des transactions:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Marquer un utilisateur
router.post('/users/:userId/flag', ensureAdmin, (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Logique de marquage (à implémenter dans amlService)
        // Pour l'exemple, on considère que ça fonctionne toujours
        
        res.json({ success: true, message: 'Utilisateur marqué avec succès' });
    } catch (error) {
        console.error('Erreur lors du marquage de l\'utilisateur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir les statistiques AML
router.get('/statistics', ensureAdmin, (req, res) => {
    try {
        const statistics = amlService.getAMLStatistics();
        res.json(statistics);
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * Routes accessibles aux utilisateurs authentifiés
 */

// Enregistrer une transaction (dépôt, retrait, etc.)
router.post('/transactions', ensureAuthenticated, (req, res) => {
    try {
        const { type, method, amount } = req.body;
        
        // Vérifications de base
        if (!type || !method || !amount) {
            return res.status(400).json({ error: 'Données manquantes' });
        }
        
        // Créer l'objet transaction
        const transaction = {
            userId: req.user.id,
            userInfo: {
                username: req.user.username,
                email: req.user.email || 'inconnu'
            },
            amount: parseFloat(amount),
            type,
            method,
            timestamp: Date.now(),
            status: 'completed',
            metadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'] || 'unknown',
                // On pourrait ajouter la géolocalisation via un service tiers
                geoLocation: 'unknown'
            }
        };
        
        // Enregistrer la transaction
        const transactionId = amlService.recordTransaction(transaction);
        
        res.json({ success: true, transactionId });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la transaction:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir l'historique des transactions de l'utilisateur connecté
router.get('/my-transactions', ensureAuthenticated, (req, res) => {
    try {
        // Paramètres de pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        // Récupérer les transactions de l'utilisateur
        const transactions = amlService.getUserTransactionHistory(req.user.id);
        
        // Calculer la pagination
        const totalTransactions = transactions.length;
        const totalPages = Math.ceil(totalTransactions / limit);
        
        // Trier par date décroissante
        const sortedTransactions = transactions.sort((a, b) => b.timestamp - a.timestamp);
        
        // Extraire la page demandée
        const paginatedTransactions = sortedTransactions.slice(offset, offset + limit);
        
        res.json({
            transactions: paginatedTransactions,
            pagination: {
                total: totalTransactions,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des transactions:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Vérifier le niveau de KYC requis pour l'utilisateur connecté
router.get('/required-kyc-level', ensureAuthenticated, (req, res) => {
    try {
        // Récupérer le niveau de KYC requis
        const requiredLevel = amlService.checkRequiredKYCLevel(req.user.id);
        
        res.json({ requiredLevel });
    } catch (error) {
        console.error('Erreur lors de la vérification du niveau KYC:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Exporter le routeur
module.exports = router;