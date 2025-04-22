/**
 * Serveur de démonstration d'intégration pour MS BINGO
 * Ce serveur sert la page de démonstration d'intégration qui montre
 * comment les modules fonctionnent ensemble
 */

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Servir les fichiers statiques
app.use(express.static('public'));

// Route principale
app.get('/', (req, res) => {
    res.redirect('/bingo-integration-demo.html');
});

// Démarrer le serveur
app.listen(port, () => {
    // Afficher un message de démarrage stylisé
    console.log(`┌─────────────────────────────────────────────────────┐`);
    console.log(`│ Serveur de démo d'intégration démarré sur le port ${port} │`);
    console.log(`│ Interface accessible à:                             │`);
    console.log(`│ http://localhost:${port}/bingo-integration-demo.html       │`);
    console.log(`└─────────────────────────────────────────────────────┘`);
});