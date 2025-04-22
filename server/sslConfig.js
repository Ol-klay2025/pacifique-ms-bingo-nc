/**
 * Configuration SSL/TLS pour MS BINGO
 * Version: Avril 2025
 * 
 * Ce module fournit les outils nécessaires pour configurer
 * la sécurité des connexions avec SSL/TLS.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Service de configuration SSL/TLS
 */
class SSLConfigService {
  constructor(options = {}) {
    this.config = {
      certsDir: options.certsDir || path.join(__dirname, '../certs'),
      useSSL: options.useSSL !== undefined ? options.useSSL : process.env.NODE_ENV === 'production',
      forceSSL: options.forceSSL !== undefined ? options.forceSSL : false,
      ...options
    };

    // Créer le répertoire des certificats s'il n'existe pas
    if (!fs.existsSync(this.config.certsDir)) {
      fs.mkdirSync(this.config.certsDir, { recursive: true });
    }
  }

  /**
   * Vérifie si les certificats SSL sont disponibles
   * @returns {boolean} Vrai si les certificats sont disponibles
   */
  hasCertificates() {
    const keyPath = path.join(this.config.certsDir, 'private-key.pem');
    const certPath = path.join(this.config.certsDir, 'certificate.pem');
    
    return fs.existsSync(keyPath) && fs.existsSync(certPath);
  }

  /**
   * Génère des certificats auto-signés pour le développement
   * @returns {Promise<boolean>} Vrai si la génération a réussi
   */
  async generateSelfSignedCerts() {
    if (this.hasCertificates()) {
      console.log('Les certificats SSL existent déjà.');
      return true;
    }

    try {
      // Dans une implémentation réelle, utiliser OpenSSL ou une bibliothèque 
      // comme node-forge pour générer des certificats auto-signés
      
      console.log('Génération de certificats auto-signés...');
      
      // Simulation de la génération de certificats
      // Note: Ceci est une SIMULATION, ne génère pas de vrais certificats!
      const keyContent = '-----BEGIN PRIVATE KEY-----\nSIMULATED_KEY_CONTENT\n-----END PRIVATE KEY-----';
      const certContent = '-----BEGIN CERTIFICATE-----\nSIMULATED_CERTIFICATE_CONTENT\n-----END CERTIFICATE-----';
      
      const keyPath = path.join(this.config.certsDir, 'private-key.pem');
      const certPath = path.join(this.config.certsDir, 'certificate.pem');
      
      fs.writeFileSync(keyPath, keyContent);
      fs.writeFileSync(certPath, certContent);
      
      console.log('Certificats auto-signés générés pour le développement.');
      console.log('ATTENTION: Ces certificats sont simulés et ne doivent pas être utilisés en production!');
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la génération des certificats:', error);
      return false;
    }
  }

  /**
   * Crée un serveur HTTPS avec les certificats configurés
   * @param {Express} app - Application Express
   * @returns {https.Server|null} Serveur HTTPS ou null si SSL non configuré
   */
  createSecureServer(app) {
    if (!this.config.useSSL) {
      console.log('SSL non activé. Utilisez HTTP pour le serveur.');
      return null;
    }

    if (!this.hasCertificates()) {
      console.error('Certificats SSL manquants. Impossible de créer un serveur HTTPS.');
      return null;
    }

    try {
      const keyPath = path.join(this.config.certsDir, 'private-key.pem');
      const certPath = path.join(this.config.certsDir, 'certificate.pem');
      
      const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      
      return https.createServer(options, app);
    } catch (error) {
      console.error('Erreur lors de la création du serveur HTTPS:', error);
      return null;
    }
  }

  /**
   * Middleware pour forcer les redirections HTTP vers HTTPS
   * @returns {Function} Middleware Express
   */
  forceSSLMiddleware() {
    return (req, res, next) => {
      if (this.config.forceSSL && !req.secure && req.get('x-forwarded-proto') !== 'https') {
        return res.redirect(`https://${req.get('host')}${req.url}`);
      }
      next();
    };
  }

  /**
   * Configure l'application avec les paramètres SSL
   * @param {Express} app - Application Express
   */
  configureApp(app) {
    // Ajouter le middleware HSTS pour renforcer HTTPS
    app.use((req, res, next) => {
      if (this.config.useSSL) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      }
      next();
    });
    
    // Ajouter le middleware de redirection vers HTTPS si nécessaire
    if (this.config.forceSSL) {
      app.use(this.forceSSLMiddleware());
    }
  }

  /**
   * Instructions d'installation de certificats SSL valides
   * @returns {string} Instructions en format texte
   */
  getProductionCertificateInstructions() {
    return `
    === Instructions pour installer des certificats SSL en production ===
    
    1. Obtenir des certificats SSL
       - Utilisez Let's Encrypt (certbot) pour des certificats gratuits et automatisés
       - OU achetez des certificats auprès d'une autorité de certification (CA) comme DigiCert, GlobalSign, etc.
    
    2. Installer les certificats
       - Placez votre clé privée dans: ${path.join(this.config.certsDir, 'private-key.pem')}
       - Placez votre certificat dans: ${path.join(this.config.certsDir, 'certificate.pem')}
       - Assurez-vous que les permissions sont correctement définies (600 pour la clé privée)
    
    3. Configuration dans MS BINGO
       - Définissez useSSL=true dans les options de SSLConfigService
       - Définissez forceSSL=true pour forcer les redirections HTTPS
       - Redémarrez l'application pour appliquer les changements
    
    IMPORTANT: Ne partagez jamais votre clé privée et sécurisez l'accès au serveur!
    `;
  }
}

module.exports = SSLConfigService;