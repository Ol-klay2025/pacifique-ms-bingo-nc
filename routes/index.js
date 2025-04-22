/**
 * MS BINGO PACIFIQUE - Router principal
 * Version: 15 avril 2025
 * 
 * Ce fichier centralise toutes les routes API de l'application
 * pour la conformité réglementaire (AML, KYC, GDPR)
 */

const express = require('express');
const router = express.Router();

// Importation des différents routers
const amlRouter = require('./aml');
const gdprRouter = require('./gdpr');
const kycRouter = require('./kyc');

// Enregistrement des routes spécifiques
router.use('/aml', amlRouter);
router.use('/gdpr', gdprRouter);
router.use('/kyc', kycRouter);

// Route racine pour la santé de l'API
router.get('/health', (req, res) => {
  res.json({
    service: 'MS BINGO PACIFIQUE API',
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Informations sur les versions des modules
router.get('/versions', (req, res) => {
  res.json({
    api: '1.0.0',
    aml: '1.0.0',
    gdpr: '1.0.0',
    kyc: '1.0.0'
  });
});

module.exports = router;