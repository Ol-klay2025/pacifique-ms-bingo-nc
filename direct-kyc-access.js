/**
 * Script d'accès direct à l'interface KYC de MS BINGO
 * Ce script contourne le problème de redirection en lançant un serveur dédié
 * pour l'accès à l'interface administrateur KYC
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();

// Créer l'application Express
const app = express();
const port = process.env.PORT || 3000;

// Configuration du répertoire d'uploads
const uploadDir = path.resolve(__dirname, 'uploads');
const kycUploadsDir = path.join(uploadDir, 'kyc');
// Créer les répertoires s'ils n'existent pas
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(kycUploadsDir)) {
  fs.mkdirSync(kycUploadsDir);
}

// Configuration de multer pour les uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, kycUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Conserver l'extension d'origine
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// Configurer le middleware pour les fichiers statiques
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurer le middleware de session
app.use(session({
  secret: 'ms-bingo-kyc-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 heures
}));

// Initialiser la base de données pour KYC
const dbPath = path.resolve(__dirname, 'data', 'kyc-test.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de la connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à la base de données KYC');
  
  // Créer les tables nécessaires pour KYC
  db.serialize(() => {
    // Table utilisateurs
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      email_verified INTEGER DEFAULT 0,
      created_at TEXT
    )`);
    
    // Table documents KYC
    db.run(`CREATE TABLE IF NOT EXISTS kyc_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      document_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      document_number TEXT,
      expiry_date TEXT,
      country TEXT,
      original_filename TEXT,
      file_size INTEGER,
      mime_type TEXT,
      status TEXT DEFAULT 'pending',
      upload_date TEXT NOT NULL,
      review_date TEXT,
      reviewed_by INTEGER,
      rejection_reason TEXT
    )`);
    
    // Table niveaux de vérification
    db.run(`CREATE TABLE IF NOT EXISTS kyc_verification_levels (
      user_id INTEGER PRIMARY KEY,
      level TEXT NOT NULL,
      last_updated TEXT NOT NULL
    )`);
    
    // Vérifier si l'utilisateur de test existe déjà
    db.get(`SELECT id FROM users WHERE username = 'joueur-test'`, (err, row) => {
      if (err) {
        console.error('Erreur lors de la vérification de l\'utilisateur de test:', err);
        return;
      }
      
      if (!row) {
        // Créer un utilisateur de test
        const now = new Date().toISOString();
        db.run(`INSERT INTO users (username, email, email_verified, created_at) VALUES (?, ?, ?, ?)`,
          ['joueur-test', 'test@example.com', 1, now],
          function(err) {
            if (err) {
              console.error('Erreur lors de la création de l\'utilisateur de test:', err);
              return;
            }
            console.log('Utilisateur de test créé avec ID:', this.lastID);
            
            // Définir le niveau de vérification initial
            db.run(`INSERT INTO kyc_verification_levels (user_id, level, last_updated) VALUES (?, ?, ?)`,
              [this.lastID, 'basic', now],
              (err) => {
                if (err) {
                  console.error('Erreur lors de la définition du niveau de vérification:', err);
                }
              }
            );
          }
        );
      } else {
        console.log('Utilisateur de test existant avec ID:', row.id);
      }
    });
  });
});

// Middleware d'authentification pour la démo
const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Non authentifié' });
};

// Route pour créer automatiquement une session utilisateur pour les tests
app.get('/api/kyc/auto-login', (req, res) => {
  // Récupérer l'utilisateur de test
  db.get(`SELECT * FROM users WHERE username = 'joueur-test'`, (err, user) => {
    if (err || !user) {
      console.error('Erreur lors de la récupération de l\'utilisateur de test:', err);
      return res.status(500).json({ success: false, message: 'Erreur lors de la connexion automatique' });
    }
    
    // Créer une session pour l'utilisateur
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.isAuthenticated = true;
    
    console.log('Session créée pour l\'utilisateur:', user.username, 'avec ID:', user.id);
    
    res.json({
      success: true,
      message: 'Connecté automatiquement en tant que ' + user.username,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  });
});

// Route pour obtenir le statut de la session
app.get('/api/kyc/session-status', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({
      authenticated: true,
      userId: req.session.userId,
      username: req.session.username
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

// Configuration des routes API simulées pour l'interface KYC
app.get('/api/organizer/check-access', (req, res) => {
  // Toujours accorder l'accès pour la démo
  res.json({ hasAccess: true });
});

// Route pour les documents en attente de vérification
app.get('/api/kyc/admin/pending', (req, res) => {
  // Pour la démo, on utilise toujours des données simulées
  res.json({
    documents: simulateDocuments()
  });
});

// Route pour les statistiques du tableau de bord
app.get('/api/kyc/admin/stats', (req, res) => {
  // Dans une implémentation réelle, on récupérerait les statistiques depuis la base de données
  // Pour la démo, on utilise des données simulées
  res.json({
    pendingCount: 3,
    approvedCount: 24,
    rejectedCount: 8,
    processingTime: 8,
    highRiskCount: 5,
    mediumRiskCount: 12,
    duplicateCount: 3,
    multiDocCount: 8,
    recentDocuments: simulateRecentDocuments()
  });
});

// Route pour les documents signalés
app.get('/api/kyc/admin/flagged', (req, res) => {
  // Dans une implémentation réelle, on récupérerait les documents signalés depuis la base de données
  // Pour la démo, on utilise des données simulées
  res.json({
    documents: simulateFlaggedDocuments()
  });
});

// Route pour l'historique des vérifications
app.get('/api/kyc/admin/history', (req, res) => {
  // Dans une implémentation réelle, on récupérerait l'historique depuis la base de données
  // Pour la démo, on utilise des données simulées
  res.json({
    entries: simulateHistoryData()
  });
});

// Route pour la vérification d'un document
app.post('/api/kyc/admin/review', (req, res) => {
  const { documentId, action, reason, note } = req.body;
  
  console.log(`Document ${documentId} ${action} with reason: ${reason || 'none'} and note: ${note || 'none'}`);
  
  // Dans une implémentation réelle, on mettrait à jour la base de données
  // Pour la démo, on retourne simplement un succès
  res.json({
    success: true,
    message: `Document ${documentId} ${action} successfully`
  });
});

// Route pour ajouter une note
app.post('/api/kyc/admin/note', (req, res) => {
  const { documentId, note } = req.body;
  
  console.log(`Note added to document ${documentId}: ${note}`);
  
  // Dans une implémentation réelle, on mettrait à jour la base de données
  // Pour la démo, on retourne simplement un succès
  res.json({
    success: true,
    message: 'Note added successfully'
  });
});

// Route pour uploader un document KYC
app.post('/api/kyc/upload', ensureAuthenticated, upload.single('document'), async (req, res) => {
  try {
    console.log('Test KYC Upload: Nouvelle soumission de document:', req.body);
    
    if (!req.file) {
      console.error('Test KYC Upload: Aucun fichier téléchargé');
      return res.status(400).json({ success: false, message: 'Aucun fichier téléchargé' });
    }

    // Vérifier l'utilisateur
    if (!req.session || !req.session.userId) {
      console.error('Test KYC Upload: Utilisateur non connecté');
      return res.status(401).json({ success: false, message: 'Vous devez être connecté pour soumettre des documents' });
    }

    const { documentType, documentNumber, expiryDate, country } = req.body;
    const userId = req.session.userId;
    
    console.log('Document reçu pour utilisateur:', userId, documentType, req.file.originalname);
    
    // Enregistrer le document dans la base de données
    const now = new Date().toISOString();
    const relativePath = path.relative(kycUploadsDir, req.file.path);
    
    db.run(
      `INSERT INTO kyc_documents (
        user_id, document_type, file_path, document_number, expiry_date, 
        country, original_filename, file_size, mime_type, upload_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, documentType, relativePath, documentNumber || null, 
        expiryDate || null, country || null, 
        req.file.originalname, req.file.size, req.file.mimetype, now
      ],
      function(err) {
        if (err) {
          console.error('Test KYC Upload: Erreur lors de l\'enregistrement du document:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'enregistrement du document', 
            error: err.message 
          });
        }
        
        const documentId = this.lastID;
        console.log('Test KYC Upload: Document enregistré avec succès, ID:', documentId);
        
        // Mettre à jour le niveau de vérification
        recalculateVerificationLevel(userId)
          .then(level => {
            console.log('Test KYC Upload: Niveau de vérification mis à jour:', level);
            
            // Répondre avec succès
            res.status(201).json({
              success: true,
              document: {
                id: documentId,
                type: documentType,
                status: 'pending',
                uploadDate: now
              },
              verificationLevel: level
            });
          })
          .catch(err => {
            console.error('Test KYC Upload: Erreur lors de la mise à jour du niveau de vérification:', err);
            
            // Même en cas d'erreur de mise à jour du niveau, on considère l'upload comme réussi
            res.status(201).json({
              success: true,
              document: {
                id: documentId,
                type: documentType,
                status: 'pending',
                uploadDate: now
              }
            });
          });
      }
    );
  } catch (error) {
    console.error('Test KYC Upload: Erreur générale:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du téléchargement du document', error: error.message });
  }
});

// Route pour obtenir le statut de vérification KYC
app.get('/api/kyc/status', ensureAuthenticated, (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Récupérer le niveau de vérification
    db.get(
      `SELECT level, last_updated FROM kyc_verification_levels WHERE user_id = ?`,
      [userId],
      (err, row) => {
        if (err) {
          console.error('Test KYC: Erreur lors de la récupération du niveau:', err);
          return res.status(500).json({ message: 'Erreur lors de la récupération du statut KYC', error: err.message });
        }
        
        const level = row ? row.level : 'none';
        const lastUpdated = row ? row.last_updated : null;
        
        // Récupérer les documents
        db.all(
          `SELECT id, document_type, status, upload_date, review_date, rejection_reason
           FROM kyc_documents 
           WHERE user_id = ? 
           ORDER BY upload_date DESC`,
          [userId],
          (err, rows) => {
            if (err) {
              console.error('Test KYC: Erreur lors de la récupération des documents:', err);
              return res.status(500).json({ message: 'Erreur lors de la récupération des documents', error: err.message });
            }
            
            // Transformer les noms de colonnes en camelCase et grouper par type
            const documents = {};
            for (const doc of rows) {
              if (!documents[doc.document_type]) {
                documents[doc.document_type] = {
                  status: doc.status,
                  uploadDate: doc.upload_date,
                  reviewDate: doc.review_date,
                  rejectionReason: doc.rejection_reason
                };
              }
            }
            
            // Déterminer si l'utilisateur peut jouer
            const reqLevel = 'basic'; // Niveau requis simulé
            const canPlay = level !== 'none'; // Simplification pour le test
            
            res.json({
              userId,
              verificationLevel: level,
              lastUpdated: lastUpdated,
              canPlay,
              documents: documents,
              missingDocuments: getMissingDocuments(level, documents),
              requiredLevel: reqLevel
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Test KYC: Erreur de statut:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du statut KYC', error: error.message });
  }
});

// Route pour obtenir la liste des documents d'un utilisateur
app.get('/api/kyc/documents', ensureAuthenticated, (req, res) => {
  try {
    const userId = req.session.userId;
    
    db.all(
      `SELECT id, document_type as documentType, status, upload_date as uploadDate, 
              review_date as reviewDate, rejection_reason as rejectionReason
       FROM kyc_documents 
       WHERE user_id = ? 
       ORDER BY upload_date DESC`,
      [userId],
      (err, rows) => {
        if (err) {
          console.error('Test KYC Documents: Erreur de récupération:', err);
          return res.status(500).json({ message: 'Erreur lors de la récupération des documents', error: err.message });
        }
        
        res.json({ documents: rows });
      }
    );
  } catch (error) {
    console.error('Test KYC Documents: Erreur générale:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des documents', error: error.message });
  }
});

// Fonction utilitaire pour recalculer le niveau de vérification
function recalculateVerificationLevel(userId) {
  return new Promise((resolve, reject) => {
    // Récupérer tous les documents approuvés de l'utilisateur
    db.all(
      `SELECT document_type FROM kyc_documents 
       WHERE user_id = ? AND status = 'approved'`,
      [userId],
      (err, rows) => {
        if (err) return reject(err);
        
        const documents = rows.map(row => row.document_type);
        
        // Déterminer le niveau de vérification
        let level = 'none';
        
        // Vérifier si l'email est vérifié (on suppose que oui pour les tests)
        const emailVerified = true;
        
        if (emailVerified) {
          level = 'basic';
          
          // Vérifier les pièces d'identité
          const hasIdentity = documents.some(type => 
            ['identity_card', 'passport', 'driving_license'].includes(type)
          );
          
          if (hasIdentity) {
            level = 'enhanced';
            
            // Vérifier preuve d'adresse et selfie
            const hasAddressProof = documents.includes('residence_proof');
            const hasSelfie = documents.includes('selfie');
            
            if (hasAddressProof && hasSelfie) {
              level = 'full';
            }
          }
        }
        
        // Mettre à jour le niveau de vérification dans la base de données
        const now = new Date().toISOString();
        
        db.run(
          `INSERT OR REPLACE INTO kyc_verification_levels (user_id, level, last_updated)
           VALUES (?, ?, ?)`,
          [userId, level, now],
          function(err) {
            if (err) return reject(err);
            resolve(level);
          }
        );
      }
    );
  });
}

// Fonction utilitaire pour déterminer les documents manquants
function getMissingDocuments(currentLevel, documentStatus) {
  const missing = [];
  const levels = { none: 0, basic: 1, enhanced: 2, full: 3 };
  
  // Pour le niveau enhanced
  if (levels[currentLevel] < levels.enhanced) {
    const hasIdentity = ['identity_card', 'passport', 'driving_license'].some(
      type => documentStatus[type] && documentStatus[type].status === 'approved'
    );
    
    if (!hasIdentity) {
      missing.push('identity');
    }
  }
  
  // Pour le niveau full
  if (levels[currentLevel] < levels.full) {
    if (!documentStatus.residence_proof || documentStatus.residence_proof.status !== 'approved') {
      missing.push('residence_proof');
    }
    
    if (!documentStatus.selfie || documentStatus.selfie.status !== 'approved') {
      missing.push('selfie');
    }
  }
  
  return missing;
}

// Redirection pour accéder à la page KYC avec login automatique
app.get('/kyc-test', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test KYC - MS BINGO</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
      .btn { background: #4CAF50; color: white; border: none; padding: 10px 20px; cursor: pointer; margin: 10px 0; }
      .btn:hover { background: #45a049; }
      .status { margin-top: 20px; padding: 15px; border: 1px solid #ddd; }
      .success { color: green; }
      .error { color: red; }
    </style>
  </head>
  <body>
    <h1>Page de test KYC - MS BINGO</h1>
    <p>Cette page permet de tester la fonctionnalité KYC sans avoir à se connecter manuellement.</p>
    
    <button id="loginBtn" class="btn">Auto-login pour tester KYC</button>
    <div id="status" class="status">Statut: En attente d'action</div>
    
    <div id="loggedIn" style="display:none;">
      <a href="/kyc.html" class="btn">Accéder à l'interface KYC</a>
      <p>Vous êtes automatiquement connecté en tant qu'utilisateur de test. Vous pouvez maintenant accéder à l'interface KYC.</p>
    </div>
    
    <script>
      const loginBtn = document.getElementById('loginBtn');
      const status = document.getElementById('status');
      const loggedIn = document.getElementById('loggedIn');
      
      // Vérifier si déjà connecté
      fetch('/api/kyc/session-status')
        .then(res => res.json())
        .then(data => {
          if (data.authenticated) {
            status.innerHTML = '<p class="success">Statut: Déjà connecté en tant que ' + data.username + '</p>';
            loggedIn.style.display = 'block';
            loginBtn.disabled = true;
          }
        })
        .catch(err => {
          status.innerHTML = '<p class="error">Erreur: ' + err.message + '</p>';
        });
      
      // Auto-login
      loginBtn.addEventListener('click', () => {
        status.innerHTML = '<p>Connexion en cours...</p>';
        
        fetch('/api/kyc/auto-login')
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              status.innerHTML = '<p class="success">Succès: ' + data.message + '</p>';
              loggedIn.style.display = 'block';
              loginBtn.disabled = true;
            } else {
              status.innerHTML = '<p class="error">Erreur: ' + data.message + '</p>';
            }
          })
          .catch(err => {
            status.innerHTML = '<p class="error">Erreur: ' + err.message + '</p>';
          });
      });
    </script>
  </body>
  </html>
  `);
});

// Gérer toutes les autres requêtes en servant index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-kyc.html'));
});

// Démarrer le serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`Serveur d'accès direct à l'interface KYC démarré sur le port ${port}`);
  console.log(`Accédez à http://localhost:${port}/admin-kyc.html`);
});

// Fonctions utilitaires pour simuler des données

/**
 * Simule des documents pour la démonstration
 */
function simulateDocuments() {
  return [
    {
      id: 1,
      userId: 101,
      username: 'joueur1',
      email: 'joueur1@example.com',
      userRegistrationDate: '2024-02-15',
      userCountry: 'France',
      userDocumentCount: 2,
      userLastLogin: new Date().toISOString(),
      userIp: '192.168.1.1',
      userStatus: 'Actif',
      documentType: 'identity_card',
      documentNumber: 'ID12345678',
      expiryDate: '2028-05-15',
      country: 'FR',
      filePath: 'identity_card/id_101.jpg',
      fileFormat: 'JPEG',
      fileSize: '2.3 MB',
      originalFilename: 'id_card.jpg',
      uploadDate: new Date().toISOString(),
      riskLevel: 'low'
    },
    {
      id: 2,
      userId: 102,
      username: 'joueur2',
      email: 'joueur2@example.com',
      userRegistrationDate: '2024-01-08',
      userCountry: 'Nouvelle-Calédonie',
      userDocumentCount: 1,
      userLastLogin: new Date().toISOString(),
      userIp: '203.45.16.78',
      userStatus: 'Actif',
      documentType: 'passport',
      documentNumber: 'P987654321',
      expiryDate: '2027-08-22',
      country: 'NC',
      filePath: 'passport/passport_102.jpg',
      fileFormat: 'JPEG',
      fileSize: '1.8 MB',
      originalFilename: 'passport.jpg',
      uploadDate: new Date().toISOString(),
      riskLevel: 'medium'
    },
    {
      id: 3,
      userId: 103,
      username: 'joueur3',
      email: 'joueur3@example.com',
      userRegistrationDate: '2023-11-20',
      userCountry: 'Polynésie Française',
      userDocumentCount: 3,
      userLastLogin: new Date().toISOString(),
      userIp: '211.78.45.92',
      userStatus: 'Actif',
      documentType: 'residence_proof',
      documentNumber: '',
      expiryDate: '',
      country: 'PF',
      filePath: 'residence_proof/proof_103.pdf',
      fileFormat: 'PDF',
      fileSize: '0.9 MB',
      originalFilename: 'facture_electricite.pdf',
      uploadDate: new Date().toISOString(),
      riskLevel: 'high'
    }
  ];
}

/**
 * Simule des documents signalés pour la démonstration
 */
function simulateFlaggedDocuments() {
  return [
    {
      id: 4,
      userId: 104,
      username: 'joueur4',
      email: 'joueur4@example.com',
      userRegistrationDate: '2024-03-10',
      userCountry: 'France',
      userDocumentCount: 1,
      userLastLogin: new Date().toISOString(),
      userIp: '172.16.254.1',
      userStatus: 'Actif',
      documentType: 'identity_card',
      documentNumber: 'ID987654321',
      expiryDate: '2025-04-15',
      country: 'FR',
      filePath: 'identity_card/id_104.jpg',
      fileFormat: 'JPEG',
      fileSize: '2.1 MB',
      originalFilename: 'id_card.jpg',
      uploadDate: '2024-04-01T14:30:00Z',
      flagDate: '2024-04-02T09:15:00Z',
      flagReason: 'Informations incohérentes avec le profil',
      flaggedBy: 'admin-2',
      riskLevel: 'high'
    },
    {
      id: 5,
      userId: 105,
      username: 'joueur5',
      email: 'joueur5@example.com',
      userRegistrationDate: '2024-02-22',
      userCountry: 'Wallis-et-Futuna',
      userDocumentCount: 2,
      userLastLogin: new Date().toISOString(),
      userIp: '198.51.100.42',
      userStatus: 'Actif',
      documentType: 'passport',
      documentNumber: 'P123456789',
      expiryDate: '2029-01-30',
      country: 'WF',
      filePath: 'passport/passport_105.jpg',
      fileFormat: 'JPEG',
      fileSize: '1.7 MB',
      originalFilename: 'passport.jpg',
      uploadDate: '2024-03-15T10:45:00Z',
      flagDate: '2024-03-15T16:20:00Z',
      flagReason: 'Document potentiellement modifié',
      flaggedBy: 'système',
      riskLevel: 'high'
    }
  ];
}

/**
 * Simule des documents récemment traités pour la démonstration
 */
function simulateRecentDocuments() {
  return [
    {
      id: 9,
      username: 'joueur9',
      documentType: 'identity_card',
      uploadDate: '2024-04-09T14:30:00Z',
      processedBy: 'admin-1',
      processDate: '2024-04-10T09:15:00Z',
      status: 'approved'
    },
    {
      id: 10,
      username: 'joueur10',
      documentType: 'passport',
      uploadDate: '2024-04-08T11:20:00Z',
      processedBy: 'admin-2',
      processDate: '2024-04-09T16:45:00Z',
      status: 'rejected'
    },
    {
      id: 11,
      username: 'joueur11',
      documentType: 'residence_proof',
      uploadDate: '2024-04-08T09:10:00Z',
      processedBy: 'admin-1',
      processDate: '2024-04-09T10:30:00Z',
      status: 'approved'
    }
  ];
}

/**
 * Simule des données d'historique pour la démonstration
 */
function simulateHistoryData() {
  return [
    {
      id: 1,
      date: '2024-04-10T14:30:00Z',
      admin: 'admin-1',
      action: 'approved',
      username: 'joueur6',
      documentId: 6,
      documentType: 'identity_card',
      details: 'Document validé'
    },
    {
      id: 2,
      date: '2024-04-10T11:45:00Z',
      admin: 'admin-2',
      action: 'rejected',
      username: 'joueur7',
      documentId: 7,
      documentType: 'residence_proof',
      details: 'Document expiré'
    },
    {
      id: 3,
      date: '2024-04-09T16:20:00Z',
      admin: 'admin-1',
      action: 'flagged',
      username: 'joueur5',
      documentId: 5,
      documentType: 'passport',
      details: 'Document potentiellement modifié'
    },
    {
      id: 4,
      date: '2024-04-09T09:10:00Z',
      admin: 'admin-2',
      action: 'commented',
      username: 'joueur4',
      documentId: 4,
      documentType: 'identity_card',
      details: 'Informations incohérentes avec le profil'
    },
    {
      id: 5,
      date: '2024-04-08T15:30:00Z',
      admin: 'admin-1',
      action: 'approved',
      username: 'joueur8',
      documentId: 8,
      documentType: 'driving_license',
      details: 'Document validé'
    }
  ];
}