/**
 * MS BINGO PACIFIQUE - Script de démarrage de l'API de conformité
 * Version: 15 avril 2025
 * 
 * Ce script lance uniquement l'API de conformité pour AML, GDPR et KYC
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const amlRoutes = require('./routes/aml');
const gdprRoutes = require('./routes/gdpr');
const kycRoutes = require('./routes/kyc');

// Création de l'app Express
const app = express();

// Middlewares de sécurité
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de journalisation des requêtes
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Routes de l'API
app.use('/api/aml', amlRoutes);
app.use('/api/gdpr', gdprRoutes);
app.use('/api/kyc', kycRoutes);

// Route racine
app.get('/', (req, res) => {
  res.json({
    name: 'MS BINGO PACIFIQUE - API de conformité',
    version: '1.0.0',
    description: 'API pour les fonctionnalités de conformité AML, GDPR et KYC',
    endpoints: [
      '/api/aml - Routes Anti-Money Laundering',
      '/api/gdpr - Routes de conformité GDPR',
      '/api/kyc - Routes de vérification d\'identité'
    ],
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ API de conformité MS BINGO PACIFIQUE démarrée sur le port ${PORT}\n`);
  console.log(`📊 Endpoints disponibles :`);
  console.log(`  - http://localhost:${PORT}/api/aml`);
  console.log(`  - http://localhost:${PORT}/api/gdpr`);
  console.log(`  - http://localhost:${PORT}/api/kyc\n`);
  console.log(`⚠️  Cette API nécessite une authentification pour la plupart des endpoints`);
  console.log(`📝 Pour les administrateurs: utilisez "ms-bingo-admin-2025" pour l'accès complet\n`);
});