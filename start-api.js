/**
 * MS BINGO PACIFIQUE - Script de démarrage du serveur API
 * Version: 15 avril 2025
 * 
 * Ce script démarre le serveur API avec les configurations nécessaires
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Chemin vers le fichier API compilé
const apiPath = path.join(__dirname, 'server', 'api.js');

// Vérifier si le fichier API existe
if (!fs.existsSync(apiPath)) {
  console.error('Erreur: Le fichier server/api.js n\'existe pas.');
  console.log('Compilation du code TypeScript...');
  
  // Compiler les fichiers TypeScript
  const tsc = spawn('npx', ['tsc'], { stdio: 'inherit' });
  
  tsc.on('close', (code) => {
    if (code !== 0) {
      console.error(`Échec de la compilation avec le code de sortie ${code}`);
      process.exit(1);
    }
    
    console.log('Compilation terminée, démarrage du serveur API...');
    startApiServer();
  });
} else {
  startApiServer();
}

function startApiServer() {
  // Variables d'environnement pour le serveur API
  const env = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_PORT: process.env.API_PORT || 3001,
  };
  
  // Démarrer le serveur API
  console.log(`Démarrage du serveur API sur le port ${env.API_PORT}...`);
  
  const apiServer = spawn('node', [apiPath], {
    env,
    stdio: 'inherit'
  });
  
  // Gestion des événements du serveur API
  apiServer.on('error', (err) => {
    console.error('Erreur lors du démarrage du serveur API:', err);
  });
  
  apiServer.on('close', (code) => {
    console.log(`Le serveur API s'est arrêté avec le code de sortie ${code}`);
  });
  
  // Gestion de l'arrêt propre du serveur
  process.on('SIGINT', () => {
    console.log('Signal SIGINT reçu, arrêt du serveur API...');
    apiServer.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('Signal SIGTERM reçu, arrêt du serveur API...');
    apiServer.kill('SIGTERM');
  });
}