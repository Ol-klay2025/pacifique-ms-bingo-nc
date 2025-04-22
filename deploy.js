/**
 * Script de déploiement simplifié pour MS BINGO
 * Ce script est conçu pour fonctionner correctement dans l'environnement Replit
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Route principale - rediriger vers l'index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes de base pour l'authentification et le jeu
app.get('/play', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'play.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

app.get('/organizer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'organizer.html'));
});

app.get('/game-management.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game-management.html'));
});

app.get('/game-session.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game-session.html'));
});

// Message pour indiquer que ce serveur est pour le déploiement
app.get('/api/status', (req, res) => {
  res.json({
    status: 'active',
    message: 'Serveur de déploiement MS BINGO actif',
    version: 'Avril 2025',
    mode: 'Déploiement'
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log('=================================================');
  console.log(`🚀 MS BINGO - Serveur de déploiement démarré sur le port ${port}`);
  console.log('=================================================');
  console.log('Version: Avril 2025');
  console.log('Mode: Déploiement');
  console.log('=================================================');
});