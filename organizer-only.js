/**
 * Serveur minimaliste qui sert uniquement l'interface organisateur
 * Ce serveur est conçu pour fonctionner dans l'environnement Replit
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques du dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Afficher un message de bienvenue sur la route principale
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>PACIFIQUE MS BINGO - Accès Organisateur</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
          background: linear-gradient(to bottom, #00796b, #009688);
          color: white;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        h1 {
          margin-bottom: 30px;
        }
        .btn {
          display: inline-block;
          background-color: #FE6800;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin-top: 20px;
          transition: background-color 0.3s;
        }
        .btn:hover {
          background-color: #e05a00;
        }
        .logo {
          max-width: 300px;
          margin: 0 auto 30px;
        }
      </style>
    </head>
    <body>
      <img src="/assets/logo.png" alt="PACIFIQUE MS BINGO" class="logo">
      <h1>Accès Interface Organisateur</h1>
      <p>Bienvenue dans l'accès direct à l'interface organisateur de PACIFIQUE MS BINGO.</p>
      <a href="/organizer.html" class="btn">Accéder à l'interface organisateur</a>
    </body>
    </html>
  `);
});

// Route spécifique pour servir la page organisateur
app.get('/organizer.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'organizer.html'));
});

// Route /organizer redirige vers /organizer.html
app.get('/organizer', (req, res) => {
  res.redirect('/organizer.html');
});

// API stub pour la vérification d'accès
app.get('/api/organizer/check-access', (req, res) => {
  res.json({
    username: 'organisateur',
    isAdmin: true
  });
});

// API stub pour les infos du jeu actuel
app.get('/api/organizer/current-game', (req, res) => {
  res.json({
    gameId: 25,
    drawnNumbers: [1, 7, 13, 25, 32, 46, 58, 67, 74, 82, 90],
    activePlayers: 42,
    cardsInPlay: 128,
    quineCount: 3,
    gameType: 'regular',
    jackpot: 100000,
    nextGameFunds: 12800,
    totalBetsToday: 42500,
    nextGameTime: new Date(Date.now() + 3600000).toISOString(),
    nextSpecialGameTime: new Date(Date.now() + 14400000).toISOString()
  });
});

// API stub pour les opérations organisateur
app.post('/api/organizer/draw-number', express.json(), (req, res) => {
  const availableNumbers = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 14, 15];
  const randomIndex = Math.floor(Math.random() * availableNumbers.length);
  
  res.json({
    success: true,
    drawnNumber: availableNumbers[randomIndex],
    message: 'Nouveau numéro tiré'
  });
});

// API de déconnexion (stub)
app.post('/api/logout', (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur MS BINGO (Accès organisateur uniquement) démarré sur le port ${PORT}`);
});