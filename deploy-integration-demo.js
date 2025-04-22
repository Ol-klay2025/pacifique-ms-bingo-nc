/**
 * Script de déploiement spécifique pour la démo d'intégration PACIFIQUE MS BINGO CONFORMITÉ
 * Version: 16 avril 2025
 * 
 * Ce script lance uniquement l'interface de démonstration d'intégration
 * Nom du projet: PacifiqueMSBingoConformite
 * URL de déploiement: https://pacifiquemsbingoconformite.replit.app
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Servir les fichiers statiques
app.use(express.static('public'));

// Route principale - servir index.html directement
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route pour la démo d'intégration
app.get('/bingo-integration-demo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bingo-integration-demo.html'));
});

// URL info pour suivre les connexions
app.get('/deployment-info', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const baseUrl = `${protocol}://${host}`;

    res.send(`
        <html>
            <head>
                <title>MS BINGO - Informations de Déploiement</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background-color: #003366;
                        color: white;
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        background-color: rgba(0, 51, 102, 0.7);
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
                    }
                    h1 {
                        color: #ffcc00;
                        text-align: center;
                        margin-top: 0;
                    }
                    .url-box {
                        background-color: rgba(0, 0, 0, 0.3);
                        padding: 15px;
                        border-radius: 5px;
                        margin: 10px 0;
                        word-break: break-all;
                    }
                    .highlight {
                        color: #ffcc00;
                        font-weight: bold;
                    }
                    .date {
                        text-align: center;
                        margin-top: 30px;
                        font-style: italic;
                        opacity: 0.8;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>PACIFIQUE MS BINGO CONFORMITÉ - Informations de Déploiement</h1>
                    
                    <h2>URLs d'accès direct :</h2>
                    
                    <p><strong>URL de base détectée :</strong></p>
                    <div class="url-box">${baseUrl}</div>
                    
                    <p><strong>Démo d'intégration :</strong></p>
                    <div class="url-box">${baseUrl}/bingo-integration-demo</div>
                    
                    <div class="date">Version déployée : 16 avril 2025</div>
                </div>
            </body>
        </html>
    `);
});

// Démarrer le serveur
console.log("Démarrage du serveur de démo d'intégration...");

// Détecter l'adresse URL complète
let baseUrl = "URL pas encore détectée";

app.listen(port, '0.0.0.0', () => {
    // Charger la configuration de déploiement pour obtenir le nom du projet
    let projectName = "PacifiqueMSBingoConformite";
    try {
        const deployConfig = require('./deploy-config.json');
        projectName = deployConfig.projectName || "PacifiqueMSBingoConformite";
    } catch (error) {
        console.warn("⚠️ Impossible de charger deploy-config.json, utilisation du nom par défaut");
    }
    
    // Utiliser l'URL de déploiement réelle
    const appUrl = `https://bingo-master-filomenepipisegrahmichellefranckde.replit.app`;
    
    // Informations détaillées pour aider au déploiement
    console.log("\n");
    console.log("====== PACIFIQUE MS BINGO CONFORMITÉ - URLS D'ACCÈS DIRECTS ======");
    console.log(`🌐 Application déployée sur: ${appUrl}`);
    console.log(`🎮 Démo d'intégration: ${appUrl}/bingo-integration-demo`);
    console.log(`ℹ️ Information de déploiement: ${appUrl}/deployment-info`);
    console.log("============================================================\n");
    
    // Attendre une connexion pour confirmer l'URL
    console.log(`\n✓ Serveur de démo d'intégration PACIFIQUE MS BINGO CONFORMITÉ démarré sur le port ${port}`);

    console.log("\n======================================================================");
    console.log("           PACIFIQUE MS BINGO CONFORMITÉ - DÉMO D'INTÉGRATION           ");
    console.log("======================================================================\n");

    console.log(`🌐 Démo d'intégration:   ${appUrl}/bingo-integration-demo  ← Accès direct à la démo`);
    console.log(`ℹ️ Information:    ${appUrl}/deployment-info`);
    console.log("\n📅 Version déployée: 16 avril 2025");
    console.log("======================================================================\n");

    console.log("⏳ En attente de la première connexion pour confirmer l'URL complète...");
});

// Middleware pour détecter l'URL complète
app.use((req, res, next) => {
    // Capturer l'adresse URL si elle n'est pas encore définie
    if (baseUrl === "URL pas encore détectée") {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.get('host');
        baseUrl = `${protocol}://${host}`;
        
        // Afficher l'URL détectée
        console.log("\n======================================================================");
        console.log("       PACIFIQUE MS BINGO CONFORMITÉ - URL D'ACCÈS RÉEL DÉTECTÉE        ");
        console.log("======================================================================\n");
        
        console.log(`🌐 URL détectée:                ${baseUrl}  ← Accès direct à la démo`);
        console.log(`📋 Information complète:         ${baseUrl}/deployment-info`);
        console.log("======================================================================\n");
        
        // Sauvegarder les URLs dans un fichier pour référence
        const urlsString = `
PACIFIQUE MS BINGO CONFORMITÉ - URLS D'ACCÈS
================================
🌐 URL réelle:                ${baseUrl}/bingo-integration-demo
📋 Information complète:         ${baseUrl}/deployment-info
`;
        fs.appendFileSync('urls-acces.txt', urlsString);
        console.log("✓ URLs enregistrées dans le fichier urls-acces.txt");
    }
    
    next();
});