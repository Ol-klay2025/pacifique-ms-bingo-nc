/**
 * MS BINGO PACIFIQUE - Configuration Let's Encrypt pour Replit
 * Version: 15 avril 2025
 * 
 * Ce script configure un certificat SSL valide via Let's Encrypt pour Replit
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');

// Répertoire pour stocker les certificats
const CERTS_DIR = path.join(__dirname, 'certs');
if (!fs.existsSync(CERTS_DIR)) {
  fs.mkdirSync(CERTS_DIR, { recursive: true });
}

// Domaine Replit
const REPLIT_DOMAIN = process.env.REPLIT_DOMAIN || 'bingo-master-filomenepipiseg.replit.app';

// Chemin pour les certificats Let's Encrypt
const CERT_PATH = path.join(CERTS_DIR, 'fullchain.pem');
const KEY_PATH = path.join(CERTS_DIR, 'privkey.pem');

/**
 * Vérifie si les certificats valides existent déjà
 */
function certificatsExistent() {
  return fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH);
}

/**
 * Télécharge certbot (client Let's Encrypt) si nécessaire
 */
function installerCertbot() {
  return new Promise((resolve, reject) => {
    console.log('Installation de Certbot...');
    
    exec('pip install certbot certbot-nginx', (error, stdout, stderr) => {
      if (error) {
        console.error(`Erreur lors de l'installation de Certbot: ${error.message}`);
        return reject(error);
      }
      
      console.log('Certbot installé avec succès.');
      resolve();
    });
  });
}

/**
 * Demande un certificat SSL via Let's Encrypt
 */
function demanderCertificat() {
  return new Promise((resolve, reject) => {
    console.log(`Demande de certificat pour ${REPLIT_DOMAIN}...`);
    
    // Utilisation de certbot en mode certonly avec le plugin webroot
    const cmd = `certbot certonly --webroot -w ./public -d ${REPLIT_DOMAIN} --email admin@example.com --agree-tos --non-interactive`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erreur lors de la demande de certificat: ${error.message}`);
        return reject(error);
      }
      
      console.log('Certificat obtenu avec succès.');
      resolve();
    });
  });
}

/**
 * Configure un serveur HTTPS avec les certificats Let's Encrypt
 */
function configurerServeurHTTPS(app) {
  try {
    if (!certificatsExistent()) {
      console.error('Certificats non trouvés. Impossible de configurer HTTPS.');
      return null;
    }
    
    const options = {
      cert: fs.readFileSync(CERT_PATH),
      key: fs.readFileSync(KEY_PATH)
    };
    
    return https.createServer(options, app);
  } catch (error) {
    console.error('Erreur lors de la configuration du serveur HTTPS:', error);
    return null;
  }
}

/**
 * Démarre un serveur temporaire pour le défi Let's Encrypt
 */
async function demarrerServeurDefi() {
  const app = express();
  
  // Servir les fichiers statiques pour le défi Let's Encrypt
  app.use('/.well-known', express.static(path.join(__dirname, 'public', '.well-known')));
  
  // Créer le répertoire .well-known s'il n'existe pas
  const wellKnownDir = path.join(__dirname, 'public', '.well-known', 'acme-challenge');
  if (!fs.existsSync(wellKnownDir)) {
    fs.mkdirSync(wellKnownDir, { recursive: true });
  }
  
  return new Promise((resolve) => {
    const server = app.listen(3000, () => {
      console.log('Serveur de défi Let\'s Encrypt démarré sur le port 3000');
      resolve(server);
    });
  });
}

/**
 * Processus complet d'obtention et configuration d'un certificat SSL
 */
async function configurationSSL() {
  try {
    if (certificatsExistent()) {
      console.log('Certificats valides trouvés. Aucune action nécessaire.');
      return true;
    }
    
    // Étape 1: Installer certbot
    await installerCertbot();
    
    // Étape 2: Démarrer le serveur de défi
    const serveurDefi = await demarrerServeurDefi();
    
    // Étape 3: Demander le certificat
    try {
      await demanderCertificat();
    } finally {
      // Arrêter le serveur de défi quoi qu'il arrive
      serveurDefi.close();
    }
    
    // Étape 4: Vérifier que les certificats ont été générés
    if (certificatsExistent()) {
      console.log('Configuration SSL terminée avec succès.');
      return true;
    } else {
      console.error('La configuration SSL a échoué. Certificats non trouvés.');
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la configuration SSL:', error);
    return false;
  }
}

// Exporter les fonctions utiles
module.exports = {
  configurationSSL,
  certificatsExistent,
  configurerServeurHTTPS,
  CERT_PATH,
  KEY_PATH
};

// Si exécuté directement, lancer la configuration
if (require.main === module) {
  configurationSSL()
    .then(success => {
      if (success) {
        console.log('✅ Configuration SSL réussie. Certificats Let\'s Encrypt installés.');
      } else {
        console.log('❌ La configuration SSL a échoué.');
      }
    })
    .catch(error => {
      console.error('Erreur fatale:', error);
    });
}