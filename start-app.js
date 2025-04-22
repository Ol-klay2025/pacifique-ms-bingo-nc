const { spawn } = require('child_process');
const path = require('path');

// Définir les variables d'environnement nécessaires
process.env.PORT = process.env.PORT || '8888';  // Port pour le serveur backend (différent de 3000/8080 qui sont déjà utilisés)
process.env.CLIENT_PORT = process.env.CLIENT_PORT || '3002';  // Port pour le client Vite
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'ms-bingo-dev-secret-key';
process.env.SKIP_MIGRATIONS = 'true';  // Désactiver les migrations pour le moment

console.log('Démarrage de l\'application MS Bingo...');

// Démarre le serveur ultra-simple pour commencer
// Cela nous permet d'avoir au moins un serveur qui fonctionne
console.log('Démarrage du serveur ultra-simple (port:', process.env.PORT, ')...');
const server = spawn('node', ['ultra-simple-server.js'], {
  stdio: 'inherit',
  env: process.env
});

// Attendre un peu avant de démarrer le frontend pour laisser le serveur s'initialiser
setTimeout(() => {
  console.log('Démarrage du serveur frontend (client Vite, port:', process.env.CLIENT_PORT, ')...');
  // Démarre le serveur frontend
  const frontend = spawn('node', ['client-dev.js'], {
    stdio: 'inherit',
    env: process.env
  });

  frontend.on('close', (code) => {
    console.log(`Le serveur frontend s'est fermé avec le code ${code}`);
    // Si le frontend se ferme, on arrête aussi le backend
    server.kill('SIGINT');
  });

  frontend.on('error', (err) => {
    console.error('Erreur lors du démarrage du frontend:', err);
  });

  // Gestion des signaux pour arrêter aussi le frontend
  process.on('SIGINT', () => {
    console.log('Arrêt de l\'application...');
    frontend.kill('SIGINT');
    server.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Application terminée.');
    frontend.kill('SIGTERM');
    server.kill('SIGTERM');
    process.exit(0);
  });
}, 2000);

server.on('close', (code) => {
  console.log(`Le serveur s'est fermé avec le code ${code}`);
  process.exit(code);
});

server.on('error', (err) => {
  console.error('Erreur lors du démarrage du serveur:', err);
});