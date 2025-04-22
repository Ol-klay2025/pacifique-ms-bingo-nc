/**
 * PACIFIQUE MS BINGO - Serveur ultra-minimaliste pour l'interface de jeu
 * Version: 16 avril 2025
 */

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Servir les fichiers statiques
app.use(express.static(__dirname));

// Route principale
app.get('/', (req, res) => {
  console.log('Requête pour la page principale');
  res.sendFile(path.join(__dirname, 'interface-jeu-bingo.html'));
});

// Démarrer le serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`\n=============================================================`);
  console.log(` 🎮 PACIFIQUE MS BINGO - Interface de jeu`);
  console.log(` 🎲 Serveur démarré sur le port ${port}`);
  console.log(` 🌐 Accès: http://localhost:${port}`);
  console.log(`=============================================================\n`);
});