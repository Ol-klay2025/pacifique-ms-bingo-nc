/**
 * Solution directe pour l'accès à l'interface organisateur MS BINGO
 * Ce script résout le problème spécifique de redirection des comptes organisateurs
 */

const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

// Configuration
const PORT = process.env.PORT || 3020;
const app = express();

console.log('🚀 Démarrage du serveur d\'accès direct organisateur MS BINGO...');

// Middlewares essentiels
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration des sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'ms-bingo-organizer-access-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    secure: false
  }
}));

// Créer la session organisateur automatiquement pour toutes les requêtes
app.use((req, res, next) => {
  // Initialiser la session avec les données organisateur
  if (!req.session.userId) {
    console.log('📝 Création automatique de la session organisateur');
    
    req.session.userId = 2;
    req.session.isAdmin = true;
    req.session.username = 'organisateur';
    req.session.balance = 5000;
    
    console.log('🔐 Session organisateur créée avec ID:', req.session.id);
  }
  
  next();
});

// Route pour vérifier l'authentification
app.get('/api/check-auth', (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: 2,
      username: 'organisateur',
      balance: 5000,
      isAdmin: true,
      isOrganizer: true
    }
  });
});

// Route pour récupérer l'utilisateur connecté
app.get('/api/user', (req, res) => {
  res.json({
    id: 2,
    username: 'organisateur',
    balance: 5000,
    isAdmin: true,
    isOrganizer: true
  });
});

// Créer un serveur HTTP avec WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/bingo' });

// Gestion des connexions WebSocket
wss.on('connection', (ws) => {
  console.log('🔌 Nouvelle connexion WebSocket organisateur');
  
  ws.on('message', (message) => {
    console.log('📨 Message reçu du client organisateur');
    
    // Diffuser le message à tous les clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

// Redirection de toutes les autres routes vers la page organisateur
app.get('*', (req, res, next) => {
  // Si c'est une requête vers un fichier statique existant, on la traite normalement
  if (req.path.includes('.')) {
    return next();
  }
  
  // Pour les chemins spécifiques, on redirige vers la démo d'intégration
  if (req.path === '/' || req.path === '/login' || req.path === '/index.html' || req.path === '/login.html') {
    console.log('👉 Redirection vers bingo-integration-demo.html');
    return res.redirect('/bingo-integration-demo.html');
  }
  
  next();
});

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`✅ Serveur d'accès organisateur démarré sur le port ${PORT}`);
  console.log(`🎮 Interface organisateur: http://localhost:${PORT}/organizer.html`);
  console.log(`💡 Aucune authentification requise - accès automatique avec compte organisateur`);
});

// En cas d'erreur, logguer et arrêter proprement
process.on('uncaughtException', (err) => {
  console.error('❌ Erreur non gérée:', err);
  server.close(() => {
    process.exit(1);
  });
});