/**
 * Script de démarrage pour visualiseur de transactions blockchain MS BINGO
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Route par défaut pour rediriger vers le visualiseur blockchain
app.get('/', (req, res) => {
  res.redirect('/blockchain-visualizer.html');
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur de démo du visualiseur blockchain démarré sur http://0.0.0.0:${PORT}`);
  console.log(`🔗 Accès au visualiseur: http://0.0.0.0:${PORT}/blockchain-visualizer.html`);
});