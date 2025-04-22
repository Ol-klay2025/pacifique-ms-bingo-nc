/**
 * MS BINGO PACIFIQUE - Serveur API
 * Version: 15 avril 2025
 * 
 * Ce fichier est un serveur API complet pour MS BINGO PACIFIQUE
 * qui expose les routes pour AML, GDPR et KYC
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Importation des routes centralisées
const apiRoutes = require('./routes');

// Création de l'application Express
const app = express();

// Configuration de base (sécurité, analyse du corps des requêtes, etc.)
app.use(helmet()); // Protection contre les vulnérabilités web courantes
app.use(cors()); // Gestion des requêtes cross-origin
app.use(express.json()); // Analyse du corps JSON
app.use(express.urlencoded({ extended: true })); // Analyse des données de formulaire

// Middleware de journalisation des requêtes API
app.use((req, res, next) => {
  const start = Date.now();
  
  // Journaliser la requête
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - User: anonymous`);
  
  // Intercepter la fin de la réponse pour journaliser le temps de traitement
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`);
  });
  
  next();
});

// Montage du router principal API
app.use('/api', apiRoutes);

// Route racine pour la santé du serveur
app.get('/health', (req, res) => {
  res.json({ 
    service: 'MS BINGO PACIFIQUE API',
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Middleware de gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Erreur serveur interne' 
      : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Port d'écoute de l'API
const PORT = process.env.API_PORT || 3001;

// Démarrage du serveur API
function startServer() {
  return app.listen(PORT, () => {
    console.log(`Serveur API MS BINGO PACIFIQUE démarré sur le port ${PORT}`);
    console.log(`Accès au serveur : http://localhost:${PORT}/health`);
    console.log(`Accès aux services :
    - AML : http://localhost:${PORT}/api/aml/health
    - GDPR : http://localhost:${PORT}/api/gdpr/consent-history/123
    - KYC : http://localhost:${PORT}/api/kyc/status/456
    - API : http://localhost:${PORT}/api/health`);
  });
}

// Démarrage du serveur si ce fichier est exécuté directement
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };