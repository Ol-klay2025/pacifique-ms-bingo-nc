/**
 * MS BINGO PACIFIQUE - Script de déploiement ultra-simplifié
 * Version: 15 avril 2025
 * 
 * Ce script est conçu pour être extrêmement simple et robuste,
 * spécifiquement pour le déploiement sur Replit.
 */

const express = require('express');
const path = require('path');
const app = express();

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes d'accès direct
app.get('/', (req, res) => {
  res.redirect('/test.html');
});

app.get('/direct-play', (req, res) => {
  res.redirect('/play.html?direct=true');
});

app.get('/direct-organizer', (req, res) => {
  res.redirect('/organizer.html?direct=true');
});

// API de vérification
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur MS BINGO PACIFIQUE démarré sur le port ${PORT}`);
});