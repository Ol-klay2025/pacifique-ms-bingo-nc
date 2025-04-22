/**
 * Script de déploiement mis à jour pour MS BINGO PACIFIQUE
 * Version: 14 avril 2025
 * 
 * Ce script incorpore les dernières modifications:
 * 1. Image de fond Pacifique
 * 2. Suppression du compteur de 3 secondes
 * 3. Tirage automatique sans délai visuel
 * 4. Vérification améliorée des quines/bingos
 * 5. Système AML (Anti-Money Laundering) pour la traçabilité des transactions
 * 6. Interfaces de gestion des dépôts et retraits
 * 7. Tableau de bord administrateur pour la surveillance AML
 */

const express = require('express');
const session = require('express-session');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const WebSocket = require('ws');
const http = require('http');

// Import des services personnalisés
const FairnessService = require('./server/fairnessService');
const SSLConfigService = require('./server/sslConfig');
const MonitoringService = require('./server/monitoringService');
const AMLService = require('./server/amlService');

// Configuration
const PORT = process.env.PORT || 3000;
const app = express();
const scryptAsync = promisify(crypto.scrypt);

console.log('🚀 Démarrage du serveur MS BINGO PACIFIQUE pour déploiement...');
console.log('📂 Répertoire courant:', __dirname);

// Middlewares essentiels
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration des sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'ms-bingo-direct-access-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    secure: false
  }
}));

// Base de données
const db = new sqlite3.Database('msbingo.db');
app.locals.db = db; // Partager la connexion db avec les routes

// Fonctions de hachage
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${derivedKey.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  const [hashedPassword, salt] = stored.split('.');
  const suppliedDerivedKey = await scryptAsync(supplied, salt, 64);
  return crypto.timingSafeEqual(
    Buffer.from(hashedPassword, 'hex'),
    suppliedDerivedKey
  );
}

// Définir la route pour fournir index.html comme page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route pour servir play.html SANS vérification d'authentification
app.get('/play.html', (req, res) => {
  console.log('Accès direct à l\'interface de jeu');
  res.sendFile(path.join(__dirname, 'public', 'play.html'));
});

// Route pour servir la démo d'intégration
app.get('/bingo-integration-demo.html', (req, res) => {
  console.log('Accès à la démo d\'intégration');
  res.sendFile(path.join(__dirname, 'public', 'bingo-integration-demo.html'));
});

// Route pour l'interface de gestion bancaire
app.get('/banking.html', (req, res) => {
  console.log('Accès à l\'interface de gestion bancaire');
  res.sendFile(path.join(__dirname, 'public', 'banking.html'));
});

// Route pour l'interface d'administration AML
app.get('/admin-aml.html', (req, res) => {
  console.log('Accès à l\'interface d\'administration AML');
  res.sendFile(path.join(__dirname, 'public', 'admin-aml.html'));
});

// Route pour servir organizer.html SANS vérification d'authentification
app.get('/organizer.html', (req, res) => {
  console.log('Accès direct à l\'interface organisateur');
  res.sendFile(path.join(__dirname, 'public', 'organizer.html'));
});

// Authentification API simplifiée - permet l'accès direct mais garde l'authentification pour les API
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' });
    }
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        console.error('Erreur de base de données:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Identifiants incorrects' });
      }
      
      try {
        const passwordMatch = await comparePasswords(password, user.password);
        
        if (!passwordMatch) {
          return res.status(401).json({ message: 'Identifiants incorrects' });
        }
        
        // Démarrer la session
        req.session.userId = user.id;
        req.session.isAdmin = user.is_admin === 1;
        
        // Déterminer la redirection explicite avec un chemin complet
        let redirectTo = '/play.html';
        if (user.is_admin === 1) {
          redirectTo = '/organizer.html';
          console.log('Redirection admin vers:', redirectTo);
        }
        
        return res.json({
          message: 'Connexion réussie!',
          user: {
            id: user.id,
            username: user.username,
            balance: user.balance,
            isAdmin: user.is_admin === 1,
            isOrganizer: user.is_admin === 1
          },
          redirectTo: redirectTo
        });
      } catch (error) {
        console.error('Erreur de comparaison:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
    });
  } catch (error) {
    console.error('Erreur générale:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route de déconnexion
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
    res.json({ message: 'Déconnexion réussie' });
  });
});

// Middleware pour vérifier l'authentification pour les API
function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ message: 'Non autorisé' });
}

// Récupérer les infos de l'utilisateur connecté
app.get('/api/user', ensureAuthenticated, (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      balance: user.balance,
      isAdmin: user.is_admin === 1,
      isOrganizer: user.is_admin === 1
    });
  });
});

// Vérifier si l'utilisateur a accès à l'interface organisateur
app.get('/api/organizer/check-access', ensureAuthenticated, (req, res) => {
  if (req.session.isAdmin) {
    return res.json({ hasAccess: true });
  }
  res.json({ hasAccess: false });
});

// API pour obtenir des données de transactions blockchain simulées
app.get('/api/blockchain/transactions', (req, res) => {
  // Génère des données de transaction simulées pour le visualiseur
  const transactions = [];
  const count = Math.floor(Math.random() * 5) + 3; // Entre 3 et 7 transactions
  
  for (let i = 0; i < count; i++) {
    const value = Math.floor(Math.random() * 10000) + 100;
    const tx = {
      id: crypto.randomBytes(16).toString('hex'),
      value: value,
      sender: `0x${crypto.randomBytes(20).toString('hex')}`,
      receiver: `0x${crypto.randomBytes(20).toString('hex')}`,
      timestamp: Date.now() - Math.floor(Math.random() * 3600000),
      status: Math.random() > 0.3 ? 'confirmed' : 'pending'
    };
    transactions.push(tx);
  }
  
  res.json({
    transactions,
    blockHeight: 10000000 + Math.floor(Math.random() * 1000),
    networkHashrate: Math.floor(Math.random() * 1000) + 'TH/s',
    lastBlockTime: Math.floor(Math.random() * 60) + ' seconds ago'
  });
});

// API pour obtenir des statistiques de blockchain
app.get('/api/blockchain/stats', (req, res) => {
  res.json({
    totalTransactions: Math.floor(Math.random() * 10000000) + 1000000,
    confirmedTransactions: Math.floor(Math.random() * 5000000) + 500000,
    pendingTransactions: Math.floor(Math.random() * 10000) + 1000,
    totalValue: Math.floor(Math.random() * 10000000) + 1000000,
    averageTime: (Math.random() * 5 + 1).toFixed(1)
  });
});

// Fallback pour toutes les autres routes
app.get('*', (req, res) => {
  res.redirect('/');
});

// S'assurer que les tables de base de données existent
db.serialize(() => {
  // Table utilisateurs
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    balance INTEGER DEFAULT 1000,
    is_admin INTEGER DEFAULT 0,
    created TEXT
  )`);
  
  // Vérifier si l'utilisateur organisateur existe
  db.get("SELECT * FROM users WHERE username = 'organisateur'", async (err, user) => {
    if (err) {
      console.error('Erreur de vérification organisateur:', err);
      return;
    }
    
    if (!user) {
      try {
        const hashedPassword = await hashPassword('org-password-2025');
        
        db.run(
          "INSERT INTO users (username, password, email, balance, is_admin, created) VALUES (?, ?, ?, ?, ?, ?)",
          ['organisateur', hashedPassword, 'org@msbingo.com', 1000, 1, new Date().toISOString()],
          (err) => {
            if (err) {
              console.error('Erreur de création organisateur:', err);
            } else {
              console.log('✅ Utilisateur organisateur créé');
            }
          }
        );
      } catch (error) {
        console.error('Erreur de hachage:', error);
      }
    } else {
      console.log('✅ Utilisateur organisateur existe déjà');
    }
  });
});

// Initialiser les services personnalisés
const fairnessService = new FairnessService(db);
fairnessService.registerRoutes(app);

// Initialiser le service de surveillance
const monitoringService = new MonitoringService({
  logsDir: path.join(__dirname, 'logs'),
  metricsInterval: 60000, // 1 minute
  enabled: true
});
monitoringService.configureApp(app);
monitoringService.registerRoutes(app, ensureAuthenticated);

// Initialiser le service KYC
const KYCService = require('./server/kycService');
const kycService = new KYCService(db, {
  uploadsDir: path.join(__dirname, 'uploads/kyc'),
  requiredVerificationLevel: 'basic',
  autoVerifyBasicLevel: true,
  notifyAdminOnSubmission: true
});
kycService.registerRoutes(app, ensureAuthenticated);

// Initialiser le service d'auto-exclusion
const SelfExclusionService = require('./server/selfExclusionService');
const selfExclusionService = new SelfExclusionService(db, {
  logsDir: path.join(__dirname, 'logs/exclusions'),
  maxDailyLimit: 5000, // 5000 ₣ max par jour
  maxWeeklyLimit: 20000, // 20000 ₣ max par semaine
  notifyOnLimitReached: true,
  enforceCooldown: true,
  cooldownPeriod: 24 * 60 * 60 * 1000 // 24h de réflexion avant d'augmenter les limites
});
selfExclusionService.registerRoutes(app, ensureAuthenticated);

// Initialiser les routes AML (Anti-Money Laundering)
const amlRoutes = require('./server/routes/aml');
app.use('/api/aml', amlRoutes);

// Initialiser la configuration SSL
const sslConfig = new SSLConfigService({
  certsDir: path.join(__dirname, 'certs'),
  useSSL: process.env.USE_SSL === 'true',
  forceSSL: process.env.FORCE_SSL === 'true'
});
sslConfig.configureApp(app);

// Générer des certificats auto-signés pour le développement si nécessaire
if (sslConfig.config.useSSL && !sslConfig.hasCertificates()) {
  sslConfig.generateSelfSignedCerts().catch(err => {
    console.error('Erreur lors de la génération des certificats:', err);
  });
}

// Créer le serveur approprié (HTTP ou HTTPS)
let server;
if (sslConfig.config.useSSL && sslConfig.hasCertificates()) {
  server = sslConfig.createSecureServer(app);
  console.log('🔒 Serveur HTTPS créé avec SSL/TLS activé');
} else {
  server = http.createServer(app);
  console.log('⚠️ Serveur HTTP créé sans SSL/TLS (non sécurisé)');
}
server.listen(PORT, () => {
  const protocol = sslConfig.config.useSSL && sslConfig.hasCertificates() ? 'https' : 'http';
  console.log(`✅ Serveur démarré sur ${protocol}://localhost:${PORT}`);
  console.log('📝 Instructions:');
  console.log(`  - Interface joueur: ${protocol}://localhost:${PORT}/play.html`);
  console.log(`  - Interface organisateur: ${protocol}://localhost:${PORT}/organizer.html`);
  console.log(`  - Démo d'intégration: ${protocol}://localhost:${PORT}/bingo-integration-demo.html`);
  console.log(`  - Visualiseur blockchain: ${protocol}://localhost:${PORT}/blockchain-visualizer.html`);
  console.log(`  - Vérificateur d'équité: ${protocol}://localhost:${PORT}/fairness-verifier.html`);
  console.log(`  - Tableau de bord de surveillance: ${protocol}://localhost:${PORT}/monitoring-dashboard.html`);
  console.log(`  - Système KYC: ${protocol}://localhost:${PORT}/kyc.html`);
  console.log(`  - Administration KYC: ${protocol}://localhost:${PORT}/admin-kyc.html`);
  console.log(`  - Administration AML: ${protocol}://localhost:${PORT}/admin-aml.html`);
  console.log(`  - Gestion des fonds: ${protocol}://localhost:${PORT}/banking.html`);
  console.log(`  - Auto-exclusion: ${protocol}://localhost:${PORT}/self-exclusion.html`);
  console.log('  - Identifiants organisateur: organisateur / org-password-2025');
  
  // Informations supplémentaires sur les services activés
  console.log('\n📊 Services activés:');
  console.log(`  - RNG certifié: ✅ Actif`);
  console.log(`  - Vérificateur d'équité: ✅ Actif`);
  console.log(`  - SSL/TLS: ${sslConfig.config.useSSL ? '✅ Actif' : '⚠️ Inactif'}`);
  console.log(`  - Surveillance: ${monitoringService.config.enabled ? '✅ Actif' : '⚠️ Inactif'}`);
  console.log(`  - Système KYC: ✅ Actif (niveau requis: ${kycService.config.requiredVerificationLevel})`);
  console.log(`  - Auto-exclusion: ✅ Actif (limite quotidienne max: ${selfExclusionService.config.maxDailyLimit} ₣)`);
  console.log(`  - Interface Pacifique: ✅ Actif (fond tropical avec palmiers)`);
});

// Configuration WebSocket basique
const wss = new WebSocket.Server({ server, path: '/ws' });
wss.on('connection', (ws) => {
  console.log('Nouvelle connexion WebSocket');
  
  ws.on('message', (message) => {
    console.log('Message reçu:', message);
  });
});