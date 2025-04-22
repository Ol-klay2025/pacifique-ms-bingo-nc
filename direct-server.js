/**
 * PACIFIQUE MS BINGO CONFORMITÉ - Serveur de déploiement minimaliste
 * Version: 16 avril 2025
 * 
 * Cette version est extrêmement simplifiée pour résoudre les problèmes d'accès
 * Elle n'utilise que l'essentiel d'Express pour servir les fichiers.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Servir les fichiers statiques du répertoire actuel et public
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// Journaliser toutes les requêtes
app.use((req, res, next) => {
  console.log(`📝 Requête: ${req.method} ${req.url}`);
  next();
});

// Route racine spéciale - essaie plusieurs approches
app.get('/', (req, res) => {
  console.log('🏠 Requête pour la racine /');
  
  // Essaie de servir index.html depuis plusieurs emplacements
  const rootPath = path.join(__dirname, 'index.html');
  const publicPath = path.join(__dirname, 'public', 'index.html');
  
  if (fs.existsSync(rootPath)) {
    console.log('✓ Fichier index.html trouvé à la racine');
    res.sendFile(rootPath);
  } else if (fs.existsSync(publicPath)) {
    console.log('✓ Fichier index.html trouvé dans /public');
    res.sendFile(publicPath);
  } else {
    console.log('❌ Fichier index.html non trouvé');
    res.send('<html><body><h1>PACIFIQUE MS BINGO CONFORMITÉ</h1><p>Le serveur fonctionne mais la page d\'accueil est indisponible.</p></body></html>');
  }
});

// Page d'information
app.get('/info', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  const baseUrl = `${protocol}://${host}`;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>PACIFIQUE MS BINGO - Info</title>
      <style>
        body { background-color: #003366; color: white; font-family: Arial; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; background-color: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; }
        h1 { color: #ffcc00; text-align: center; }
        a { color: #ffcc00; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>PACIFIQUE MS BINGO CONFORMITÉ</h1>
        <h2>Vérification du serveur</h2>
        <p>Le serveur minimaliste est en cours d'exécution.</p>
        <p>URL de base: ${baseUrl}</p>
        <p><a href="/">Accueil</a> | <a href="/bingo-integration-demo.html">Démo d'intégration</a></p>
      </div>
    </body>
    </html>
  `);
});

// Attraper toutes les autres routes et tenter de servir le fichier correspondant
app.use((req, res, next) => {
  console.log(`👀 Tentative d'accès à ${req.url}`);
  
  // Essayer de trouver le fichier à différents emplacements
  const urlPath = req.url.startsWith('/') ? req.url.substring(1) : req.url;
  const directPath = path.join(__dirname, urlPath);
  const publicPath = path.join(__dirname, 'public', urlPath);
  
  if (fs.existsSync(directPath)) {
    console.log(`✓ Fichier trouvé: ${directPath}`);
    res.sendFile(directPath);
  } else if (fs.existsSync(publicPath)) {
    console.log(`✓ Fichier trouvé: ${publicPath}`);
    res.sendFile(publicPath);
  } else {
    console.log(`❌ Fichier non trouvé: ${urlPath}`);
    next();
  }
});

// Page 404 par défaut
app.use((req, res) => {
  console.log(`⚠️ Page non trouvée: ${req.url}`);
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Page non trouvée</title>
      <style>
        body { background-color: #003366; color: white; font-family: Arial; padding: 20px; text-align: center; }
        .container { max-width: 600px; margin: 50px auto; background-color: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; }
        h1 { color: #ffcc00; }
        a { color: #ffcc00; text-decoration: none; }
        .button { display: inline-block; background-color: #ffcc00; color: #003366; padding: 10px 20px; border-radius: 5px; margin-top: 20px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Page non trouvée</h1>
        <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <a href="/" class="button">Retour à l'accueil</a>
      </div>
    </body>
    </html>
  `);
});

// Démarrer le serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`\n🚀 PACIFIQUE MS BINGO - Serveur minimaliste démarré sur le port ${port}`);
  console.log('Accès:');
  console.log(`- 🏠 https://bingo-master-filomenepipisegrahmichellefranckde.replit.app`);
  console.log(`- ℹ️ https://bingo-master-filomenepipisegrahmichellefranckde.replit.app/info`);
});