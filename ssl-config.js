/**
 * MS BINGO PACIFIQUE - Configuration SSL
 * Version: 15 avril 2025
 * 
 * Ce script configure le certificat SSL pour Replit.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Répertoire pour stocker les certificats
const CERTS_DIR = path.join(__dirname, 'certs');

// Créer le répertoire s'il n'existe pas
if (!fs.existsSync(CERTS_DIR)) {
  fs.mkdirSync(CERTS_DIR, { recursive: true });
}

// Chemins des fichiers de certificat
const keyPath = path.join(CERTS_DIR, 'server.key');
const csrPath = path.join(CERTS_DIR, 'server.csr');
const certPath = path.join(CERTS_DIR, 'server.crt');

// Configuration pour le certificat
const config = {
  country: 'FR',
  state: 'Ile-de-France',
  locality: 'Paris',
  organization: 'MS BINGO PACIFIQUE',
  organizationUnit: 'IT',
  commonName: 'bingo-master-filomenepipiseg.replit.app',
  emailAddress: 'admin@example.com'
};

/**
 * Génère un certificat auto-signé si aucun n'existe encore
 */
function generateSelfSignedCertificate() {
  try {
    // Vérifier si les certificats existent déjà
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      console.log('Les certificats SSL existent déjà.');
      return;
    }

    console.log('Génération d\'un certificat auto-signé...');

    // Générer une clé privée
    execSync(`openssl genrsa -out "${keyPath}" 2048`);
    console.log('Clé privée générée.');

    // Générer une demande de signature de certificat (CSR)
    const subj = `/C=${config.country}/ST=${config.state}/L=${config.locality}/O=${config.organization}/OU=${config.organizationUnit}/CN=${config.commonName}/emailAddress=${config.emailAddress}`;
    execSync(`openssl req -new -key "${keyPath}" -out "${csrPath}" -subj "${subj}"`);
    console.log('Demande de signature de certificat (CSR) générée.');

    // Générer un certificat auto-signé
    execSync(`openssl x509 -req -days 365 -in "${csrPath}" -signkey "${keyPath}" -out "${certPath}"`);
    console.log('Certificat auto-signé généré.');

    // Définir les permissions appropriées
    fs.chmodSync(keyPath, 0o600);
    fs.chmodSync(certPath, 0o644);

    console.log('Certificat SSL auto-signé généré avec succès.');
    
    // Supprimer le CSR car il n'est plus nécessaire
    if (fs.existsSync(csrPath)) {
      fs.unlinkSync(csrPath);
    }
  } catch (error) {
    console.error('Erreur lors de la génération du certificat SSL:', error);
  }
}

/**
 * Configure un serveur HTTPS avec les certificats générés
 * @param {Object} app - Application Express
 * @param {Object} http - Module http de Node.js
 * @returns {Object} Serveur HTTPS configuré
 */
function configureHttpsServer(app, http) {
  const https = require('https');
  
  try {
    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      console.error('Certificats SSL manquants. Impossible de configurer le serveur HTTPS.');
      return http.createServer(app);
    }
    
    const options = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    
    console.log('Serveur HTTPS configuré avec les certificats SSL');
    return https.createServer(options, app);
  } catch (error) {
    console.error('Erreur lors de la configuration du serveur HTTPS:', error);
    console.log('Utilisation du serveur HTTP par défaut comme solution de repli');
    return http.createServer(app);
  }
}

// Exporter les fonctions
module.exports = {
  generateSelfSignedCertificate,
  configureHttpsServer,
  certificatePaths: {
    key: keyPath,
    cert: certPath
  }
};

// Si ce script est exécuté directement, générer le certificat
if (require.main === module) {
  generateSelfSignedCertificate();
}