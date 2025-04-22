/**
 * Script de démarrage pour MS BINGO
 * Ce script est conçu pour démarrer l'application avec une configuration robuste
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('📡 Démarrage de PACIFIQUE MS BINGO...');

// Définir les chemins importants
const mainScript = path.join(__dirname, 'server.js');
const deployScript = path.join(__dirname, 'replit-deploy.js');

// Vérifier si nous sommes en environnement de déploiement (Replit)
const isDeployment = process.env.REPL_ID && process.env.REPL_OWNER;

// Sélectionner le script approprié
const scriptToRun = isDeployment ? deployScript : mainScript;

// Lancer le serveur
console.log(`🚀 Lancement du script: ${path.basename(scriptToRun)}`);

const server = exec(`node ${scriptToRun}`, {
  env: { ...process.env, PORT: process.env.PORT || 3000 }
}, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Erreur d'exécution: ${error}`);
    return;
  }
  console.log(`✅ Serveur arrêté`);
});

server.stdout.on('data', (data) => {
  console.log(data.toString().trim());
});

server.stderr.on('data', (data) => {
  console.error(`🔴 ${data.toString().trim()}`);
});

console.log('⏳ Serveur en cours de démarrage...');

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('🛑 Signal d\'arrêt reçu, fermeture du serveur...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Signal de terminaison reçu, fermeture du serveur...');
  server.kill();
  process.exit(0);
});