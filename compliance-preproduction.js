/**
 * MS BINGO PACIFIQUE - Environnement de pré-production pour la conformité
 * Version: 15 avril 2025
 * 
 * Ce script démarre un environnement complet intégrant l'API de conformité
 * et l'interface d'administration pour les tests de pré-production.
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http');
const session = require('express-session');
const jwt = require('jsonwebtoken');

// Services de conformité
const amlService = require('./server/amlService');
const kycService = require('./server/kycService');
const dataAccessService = require('./server/dataAccessService');

// Configuration de base
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ms-bingo-compliance-secret-key-2025';
const SESSION_SECRET = process.env.SESSION_SECRET || 'ms-bingo-compliance-session-2025';

// Création de l'application Express
const app = express();

// Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "wss:", "ws:"]
    }
  }
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration de la session
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Middleware d'authentification
function authenticateJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token d\'authentification requis' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }
}

// Routes d'authentification
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Vérification des identifiants (version simplifiée pour la pré-production)
  // En production, utiliser bcrypt et vérifier dans la base de données
  if (username === 'admin' && password === 'PacificSecure2025!') {
    const token = jwt.sign(
      { id: 1, username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return res.json({
      success: true,
      token,
      user: {
        id: 1,
        username,
        role: 'admin',
        permissions: ['aml.view', 'aml.manage', 'kyc.view', 'kyc.manage', 'gdpr.export']
      }
    });
  }
  
  res.status(401).json({ success: false, message: 'Identifiants invalides' });
});

// Routes de l'API AML
app.get('/api/aml/health', (req, res) => {
  res.json({ status: 'ok', message: 'Service AML opérationnel' });
});

app.get('/api/aml/alerts', authenticateJWT, (req, res) => {
  const { page = 1, limit = 10, risk, status, search } = req.query;
  
  // Simuler la récupération des alertes depuis le service
  const alerts = amlService.getAlerts({
    page: parseInt(page),
    limit: parseInt(limit),
    risk,
    status,
    search
  });
  
  res.json(alerts);
});

app.get('/api/aml/alert/:alertId', authenticateJWT, (req, res) => {
  const alertId = req.params.alertId;
  
  const alert = amlService.getAlertById(alertId);
  
  if (!alert) {
    return res.status(404).json({ message: 'Alerte non trouvée' });
  }
  
  res.json(alert);
});

app.post('/api/aml/alert/:alertId/update', authenticateJWT, (req, res) => {
  const alertId = req.params.alertId;
  const { status, notes } = req.body;
  
  const updated = amlService.updateAlertStatus(alertId, status, notes, req.user.username);
  
  if (!updated) {
    return res.status(404).json({ message: 'Alerte non trouvée' });
  }
  
  res.json({ success: true, message: 'Statut de l\'alerte mis à jour' });
});

app.get('/api/aml/dashboard', authenticateJWT, (req, res) => {
  // Simuler la récupération des métriques pour le tableau de bord
  const metrics = amlService.getDashboardMetrics();
  
  res.json(metrics);
});

// Routes de l'API KYC
app.get('/api/kyc/users', authenticateJWT, (req, res) => {
  const { page = 1, limit = 10, level, status, search } = req.query;
  
  // Simuler la récupération des utilisateurs depuis le service
  const users = kycService.getUsers({
    page: parseInt(page),
    limit: parseInt(limit),
    level,
    status,
    search
  });
  
  res.json(users);
});

app.get('/api/kyc/user/:userId', authenticateJWT, (req, res) => {
  const userId = req.params.userId;
  
  const user = kycService.getUserById(userId);
  
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
  
  res.json(user);
});

app.post('/api/kyc/user/:userId/update', authenticateJWT, (req, res) => {
  const userId = req.params.userId;
  const { status, level, notes } = req.body;
  
  const updated = kycService.updateUserStatus(userId, status, level, notes, req.user.username);
  
  if (!updated) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
  
  res.json({ success: true, message: 'Statut de l\'utilisateur mis à jour' });
});

app.get('/api/kyc/dashboard', authenticateJWT, (req, res) => {
  // Simuler la récupération des métriques pour le tableau de bord
  const metrics = kycService.getDashboardMetrics();
  
  res.json(metrics);
});

// Routes de l'API GDPR
app.post('/api/gdpr/export', authenticateJWT, (req, res) => {
  const { userId, format, categories } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'ID utilisateur requis' });
  }
  
  // Simuler la création d'un export
  const exportId = dataAccessService.createExport(userId, format, categories, req.user.username);
  
  res.status(202).json({
    success: true,
    message: 'Demande d\'export créée',
    exportId
  });
});

app.get('/api/gdpr/exports', authenticateJWT, (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  // Simuler la récupération des exports depuis le service
  const exports = dataAccessService.getExports({
    page: parseInt(page),
    limit: parseInt(limit),
    status
  });
  
  res.json(exports);
});

app.get('/api/gdpr/export/:exportId', authenticateJWT, (req, res) => {
  const exportId = req.params.exportId;
  
  const exportData = dataAccessService.getExportById(exportId);
  
  if (!exportData) {
    return res.status(404).json({ message: 'Export non trouvé' });
  }
  
  res.json(exportData);
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Serveur HTTP
const httpServer = createServer(app);

// Démarrage du serveur
httpServer.listen(PORT, () => {
  console.log(`[MS BINGO COMPLIANCE] Environnement de pré-production démarré sur le port ${PORT}`);
  console.log(`[MS BINGO COMPLIANCE] Interface d'administration accessible sur http://localhost:${PORT}`);
  console.log('[MS BINGO COMPLIANCE] Identifiants de test: admin / PacificSecure2025!');
});

// Gestion de l'arrêt propre
process.on('SIGTERM', () => {
  console.log('[MS BINGO COMPLIANCE] Arrêt du serveur...');
  httpServer.close(() => {
    console.log('[MS BINGO COMPLIANCE] Serveur arrêté');
    process.exit(0);
  });
});

module.exports = app;