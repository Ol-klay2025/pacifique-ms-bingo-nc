/**
 * Serveur de démonstration des boules de bingo 3D pour MS BINGO
 */

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Servir les fichiers statiques du dossier public
app.use(express.static('public'));

// Route par défaut
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bingo-ball-demo.html'));
});

// Démarrer le serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`┌──────────────────────────────────────────────────┐`);
  console.log(`│ Serveur de démo Bingo démarré sur le port ${port.toString().padEnd(10)} │`);
  console.log(`│ Interface accessible à:                          │`);
  console.log(`│ http://localhost:${port}/bingo-ball-demo.html${' '.repeat(19-port.toString().length)}│`);
  console.log(`└──────────────────────────────────────────────────┘`);
});