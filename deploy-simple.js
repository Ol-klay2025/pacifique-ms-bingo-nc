/**
 * MS BINGO PACIFIQUE - Script de déploiement simplifié
 * Version: 15 avril 2025
 * 
 * Ce script est une version minimaliste pour le déploiement sur Replit.
 * Il sert de fallback en cas d'échec des autres scripts de déploiement.
 */

const express = require('express');
const path = require('path');
const http = require('http');

// Créer l'application Express
const app = express();

// Servir les fichiers statiques depuis le répertoire public
app.use(express.static(path.join(__dirname, 'public')));

// Route principale redirige vers la démo d'intégration
app.get('/', (req, res) => {
  res.redirect('/bingo-integration-demo.html');
});

// Route d'information
app.get('/deployment-info', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>MS BINGO PACIFIQUE - Informations de déploiement</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #0099cc; }
          .info { background: #f5f5f5; padding: 20px; border-radius: 5px; }
          .highlight { color: #0099cc; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>MS BINGO PACIFIQUE - Informations de déploiement</h1>
        <div class="info">
          <p><span class="highlight">Version:</span> 15 avril 2025 (Démo d'intégration - Version simplifiée)</p>
          <p><span class="highlight">État:</span> Actif - Mode minimal</p>
          <p><span class="highlight">Améliorations vocales:</span> Actives</p>
          <ul>
            <li>Prononciation optimisée pour les numéros 74 et 84</li>
            <li>Synchronisation améliorée des annonces vocales</li>
          </ul>
          <p>Ce déploiement utilise le script simplifié qui sert de secours en cas d'échec des autres scripts.</p>
          <p><a href="/bingo-integration-demo.html">Accéder à la démo d'intégration</a></p>
        </div>
      </body>
    </html>
  `);
});

// Démarrer le serveur HTTP
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`
======================================================================
       MS BINGO PACIFIQUE - DÉPLOIEMENT SIMPLIFIÉ ACTIVÉ       
======================================================================

🌐 Serveur démarré sur le port ${PORT}
🎮 Démo d'intégration: http://localhost:${PORT}/bingo-integration-demo.html
ℹ️ Information: http://localhost:${PORT}/deployment-info

📅 Version déployée: 15 avril 2025 (Mode simplifié)
======================================================================

✓ Améliorations vocales actives:
  - Prononciation optimisée pour les numéros 74 et 84
  - Synchronisation améliorée des annonces vocales
  
⏳ En attente de connexions...
  `);
  
  // Vérifier l'URL de Replit une fois par minute
  const checkReplitUrl = setInterval(() => {
    const host = server.address().address;
    if (host !== '::' && host !== '0.0.0.0') {
      console.log(`
======================================================================
       MS BINGO PACIFIQUE - URL D'ACCÈS DÉTECTÉE        
======================================================================

🌐 URL détectée: ${host}
📋 Accès à la démo: ${host}/bingo-integration-demo.html
======================================================================
      `);
      
      // Arrêter la vérification après avoir détecté l'URL
      clearInterval(checkReplitUrl);
    }
  }, 60000);
});