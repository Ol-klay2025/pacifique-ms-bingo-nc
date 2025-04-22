/**
 * PACIFIQUE MS BINGO CONFORMITÉ - Serveur de déploiement ultra-simplifié
 * Version: 16 avril 2025
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Afficher tous les fichiers clés pour le débogage
console.log('Fichiers disponibles dans public/:', fs.readdirSync('./public').join(', '));

// Middleware pour journaliser toutes les requêtes
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Servir les fichiers statiques du répertoire public
app.use(express.static(path.join(__dirname, 'public')));

// Route pour la racine - index.html
app.get('/', (req, res) => {
  console.log('🏠 Requête pour la page d\'accueil');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route pour accéder directement à la démo d'intégration
app.get('/bingo-demo', (req, res) => {
  console.log('🎮 Requête pour la démo d\'intégration');
  res.sendFile(path.join(__dirname, 'public', 'bingo-integration-demo.html'));
});

// Route alternative pour accéder à la démo d'intégration (sans extension .html)
app.get('/bingo-integration-demo', (req, res) => {
  console.log('🎮 Requête pour la démo d\'intégration (chemin alternatif)');
  res.sendFile(path.join(__dirname, 'public', 'bingo-integration-demo.html'));
});

// Route pour accéder à la documentation
app.get('/info', (req, res) => {
  console.log('ℹ️ Requête pour les informations de déploiement');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  const baseUrl = `${protocol}://${host}`;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PACIFIQUE MS BINGO - Informations</title>
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
        h1 { color: #ffcc00; text-align: center; }
        .url-box {
          background-color: rgba(0, 0, 0, 0.3);
          padding: 15px;
          border-radius: 5px;
          margin: 10px 0;
          word-break: break-all;
        }
        .button {
          display: inline-block;
          background-color: #ffcc00;
          color: #003366;
          padding: 10px 15px;
          margin: 10px 0;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>PACIFIQUE MS BINGO CONFORMITÉ</h1>
        <h2>URLs d'accès :</h2>
        
        <p><strong>URL principale :</strong></p>
        <div class="url-box">${baseUrl}</div>
        <a href="${baseUrl}" class="button">Accéder à l'accueil</a>
        
        <p><strong>Démo d'intégration :</strong></p>
        <div class="url-box">${baseUrl}/bingo-demo</div>
        <a href="${baseUrl}/bingo-demo" class="button">Accéder à la démo</a>
        
        <p><strong>Accès direct bingo-integration-demo.html :</strong></p>
        <div class="url-box">${baseUrl}/bingo-integration-demo.html</div>
        <a href="${baseUrl}/bingo-integration-demo.html" class="button">Accès direct</a>
        
        <p><strong>Version:</strong> 16 avril 2025</p>
      </div>
    </body>
    </html>
  `);
});

// Attraper toutes les autres routes et rediriger vers la page d'accueil
app.use((req, res) => {
  console.log(`⚠️ Route non trouvée: ${req.originalUrl} - Redirection vers la page d'accueil`);
  res.redirect('/');
});

// Démarrer le serveur
app.listen(port, '0.0.0.0', () => {
  console.log('\n==================================================================');
  console.log('   🌟 PACIFIQUE MS BINGO CONFORMITÉ - SERVEUR ULTRA-SIMPLIFIÉ 🌟');
  console.log('==================================================================\n');
  
  console.log(`✓ Serveur démarré sur le port ${port}`);
  console.log(`🌐 URL principal: https://bingo-master-filomenepipisegrahmichellefranckde.replit.app`);
  console.log(`🎮 Démo: https://bingo-master-filomenepipisegrahmichellefranckde.replit.app/bingo-demo`);
  console.log(`ℹ️ Info: https://bingo-master-filomenepipisegrahmichellefranckde.replit.app/info`);
  console.log('\n==================================================================\n');
});