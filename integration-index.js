/**
 * Point d'entrée pour le déploiement de la démo d'intégration MS BINGO
 * Ce fichier est conçu pour être utilisé comme point d'entrée principal
 * dans le déploiement Replit.
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

// Route pour la démo d'intégration
app.get('/bingo-integration-demo.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bingo-integration-demo.html'));
});

// Démarrer le serveur
const server = app.listen(port, () => {
    console.log(`Serveur de démo d'intégration démarré sur le port ${port}`);
});

// Gestion de la fermeture propre
process.on('SIGTERM', () => {
    console.log('SIGTERM reçu, fermeture du serveur...');
    server.close(() => {
        console.log('Serveur fermé');
        process.exit(0);
    });
});