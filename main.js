// Fichier de démarrage minimal pour le déploiement
const express = require('express');
const path = require('path');
const { createServer } = require('http');
const fs = require('fs');

// Détection du mode production/développement
const isProduction = process.env.NODE_ENV === 'production';

// Afficher les variables d'environnement (sans les secrets)
console.log('Environnement de démarrage:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- SESSION_SECRET configuré:', !!process.env.SESSION_SECRET);
console.log('- STRIPE_SECRET_KEY configuré:', !!process.env.STRIPE_SECRET_KEY);
console.log('- VITE_STRIPE_PUBLIC_KEY configuré:', !!process.env.VITE_STRIPE_PUBLIC_KEY);

// Vérification des répertoires statiques
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  console.log('AVERTISSEMENT: Le répertoire public/ n\'existe pas');
  fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
}

// Vérification de l'existence du fichier index.html
if (!fs.existsSync(path.join(__dirname, 'public', 'index.html'))) {
  console.log('AVERTISSEMENT: Le fichier public/index.html n\'existe pas. Création d\'un fichier de secours...');
  const htmlContent = `<!DOCTYPE html>
  <html lang="fr">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MS BINGO - Serveur en ligne</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #1a1a2e;
              color: white;
              text-align: center;
          }
          h1 { color: #e94560; }
      </style>
  </head>
  <body>
      <div>
          <h1>MS BINGO - Serveur en ligne</h1>
          <p>Le serveur fonctionne correctement.</p>
          <p>État: En attente du build client</p>
      </div>
  </body>
  </html>`;
  fs.writeFileSync(path.join(__dirname, 'public', 'index.html'), htmlContent);
}

// Initialize Express
const app = express();

// Parse JSON request bodies
app.use(express.json());

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage(),
  });
});

// Tous les autres routes servent le main index.html pour le client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create HTTP server
const httpServer = createServer(app);

// Define port - use PORT from environment or 3000 as fallback
const PORT = parseInt(process.env.PORT || '3000', 10);

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MS BINGO Serveur démarré avec succès!`);
  console.log(`📡 Adresse: http://0.0.0.0:${PORT}`);
  console.log(`🔒 Mode: ${isProduction ? 'Production' : 'Développement'}`);
  console.log(`⏰ Démarré à: ${new Date().toISOString()}`);
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('❌ Erreur non interceptée:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', promise, 'raison:', reason);
});