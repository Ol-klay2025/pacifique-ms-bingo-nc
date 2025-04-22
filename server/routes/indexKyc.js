/**
 * Intégration des routes KYC pour MS Bingo
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jimp = require('jimp');
const jsQR = require('jsqr');
const sharp = require('sharp');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Configurer le dossier de stockage pour les documents KYC
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'kyc');

// S'assurer que le dossier existe
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`Dossier KYC créé: ${UPLOAD_DIR}`);
  }
} catch (err) {
  console.error('Erreur lors de la création du dossier KYC:', err);
}

// Configuration du stockage pour multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const userId = req.session.userId || 'unknown';
    const documentType = req.body.documentType || 'document';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${userId}-${documentType}-${uniqueSuffix}${ext}`);
  }
});

// Configuration de multer avec validation de fichier
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Accepter uniquement les images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont acceptées'));
    }
  }
});

// Middleware pour vérifier l'authentification
function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Non autorisé' });
}

// Middleware pour vérifier les droits d'administrateur
function ensureAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Non autorisé' });
  }

  req.app.locals.db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err || !user || user.is_admin !== 1) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    next();
  });
}

// Créer les tables KYC si elles n'existent pas
function setupKycTables(db) {
  // Table des vérifications KYC
  db.run(`CREATE TABLE IF NOT EXISTS kyc_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    verification_level TEXT NOT NULL DEFAULT 'basic',
    rejection_reason TEXT,
    reviewed_by INTEGER,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table kyc_verifications:', err);
    } else {
      console.log('Table kyc_verifications vérifiée/créée avec succès');
    }
  });

  // Table des documents KYC
  db.run(`CREATE TABLE IF NOT EXISTS kyc_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kyc_verification_id INTEGER NOT NULL,
    document_type TEXT NOT NULL,
    document_number TEXT,
    document_country TEXT,
    document_expiry_date TIMESTAMP,
    document_path TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kyc_verification_id) REFERENCES kyc_verifications(id)
  )`, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table kyc_documents:', err);
    } else {
      console.log('Table kyc_documents vérifiée/créée avec succès');
    }
  });

  // Table des logs KYC
  db.run(`CREATE TABLE IF NOT EXISTS kyc_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kyc_verification_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    performed_by INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kyc_verification_id) REFERENCES kyc_verifications(id)
  )`, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table kyc_logs:', err);
    } else {
      console.log('Table kyc_logs vérifiée/créée avec succès');
    }
  });
}

// Initialiser le module KYC
function initKyc(app) {
  // Initialiser les tables
  setupKycTables(app.locals.db);
  
  // Ajouter le router à l'application
  app.use('/api/kyc', router);
  
  console.log('Module KYC initialisé avec succès');
}

/**
 * Route pour initier une nouvelle demande de vérification KYC
 */
router.post('/request', ensureAuthenticated, (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  
  // Vérifier si l'utilisateur a déjà une demande en cours
  db.get('SELECT * FROM kyc_verifications WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, verification) => {
    if (err) {
      console.error('Erreur lors de la vérification des demandes KYC existantes:', err);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
    
    // Si demande en cours et pas rejetée, retourner l'existante
    if (verification && verification.status !== 'rejected') {
      return res.status(200).json({ success: true, verification });
    }
    
    // Créer une nouvelle demande
    db.run('INSERT INTO kyc_verifications (user_id, status, verification_level, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [userId, 'pending', 'basic', new Date().toISOString(), new Date().toISOString()], 
      function(err) {
        if (err) {
          console.error('Erreur lors de la création de la vérification KYC:', err);
          return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        
        const verificationId = this.lastID;
        
        // Enregistrer cette action dans les logs
        db.run('INSERT INTO kyc_logs (kyc_verification_id, action, details, performed_by, created_at) VALUES (?, ?, ?, ?, ?)',
          [verificationId, 'verification_request', JSON.stringify({ message: 'Nouvelle demande de vérification KYC créée' }), userId, new Date().toISOString()],
          (err) => {
            if (err) {
              console.error('Erreur lors de la création du log KYC:', err);
            }
          }
        );
        
        // Récupérer la vérification créée
        db.get('SELECT * FROM kyc_verifications WHERE id = ?', [verificationId], (err, newVerification) => {
          if (err) {
            console.error('Erreur lors de la récupération de la vérification KYC:', err);
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
          }
          
          res.status(201).json({ success: true, verification: newVerification });
        });
      }
    );
  });
});

/**
 * Route pour envoyer un document
 */
router.post('/upload-document', 
  ensureAuthenticated,
  upload.single('document'),
  [
    body('documentType').isIn([
      'identity_card', 
      'passport', 
      'driver_license', 
      'proof_of_address', 
      'selfie'
    ]).withMessage('Type de document invalide'),
    body('kycVerificationId').isInt().withMessage('ID de vérification invalide'),
    body('documentNumber').optional(),
    body('documentCountry').optional().isLength({ min: 2, max: 2 }).withMessage('Le code pays doit contenir 2 caractères'),
    body('documentExpiryDate').optional().isISO8601().withMessage('Date d\'expiration invalide')
  ],
  (req, res) => {
    // Valider les paramètres
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    // Vérifier qu'un fichier a été envoyé
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier envoyé' });
    }
    
    const db = req.app.locals.db;
    const { kycVerificationId, documentType, documentNumber, documentCountry, documentExpiryDate } = req.body;
    
    // Traiter l'image
    const processImage = async () => {
      try {
        const outputPath = req.file.path.replace(/\.[^/.]+$/, '_processed.jpg');
        
        await sharp(req.file.path)
          .resize(1000, 1000, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 85 })
          .toFile(outputPath);
        
        return outputPath;
      } catch (error) {
        console.error('Erreur lors du traitement de l\'image:', error);
        throw error;
      }
    };
    
    // Analyser le document
    const analyzeDocument = async (filePath) => {
      try {
        const results = { qrCodes: [] };
        
        // Lire l'image avec Jimp pour la détection QR
        const image = await jimp.read(filePath);
        const { width, height } = image.bitmap;
        
        // Obtenir les données brutes de l'image pour jsQR
        const imageData = new Uint8ClampedArray(width * height * 4);
        
        let pos = 0;
        image.scan(0, 0, width, height, function(x, y, idx) {
          imageData[pos++] = this.bitmap.data[idx + 0]; // R
          imageData[pos++] = this.bitmap.data[idx + 1]; // G
          imageData[pos++] = this.bitmap.data[idx + 2]; // B
          imageData[pos++] = this.bitmap.data[idx + 3]; // A
        });
        
        // Détecter les codes QR
        const qrCode = jsQR(imageData, width, height);
        if (qrCode) {
          results.qrCodes.push({
            data: qrCode.data,
            location: qrCode.location
          });
        }
        
        return results;
      } catch (error) {
        console.error('Erreur lors de l\'analyse du document:', error);
        return { error: 'Erreur lors de l\'analyse du document' };
      }
    };
    
    // Traiter l'image et ajouter le document à la base de données
    processImage()
      .then(processedImagePath => {
        // Analyser le document
        return analyzeDocument(processedImagePath)
          .then(analysisResult => {
            // Enregistrer le document dans la base de données
            db.run(`INSERT INTO kyc_documents 
              (kyc_verification_id, document_type, document_number, document_country, document_expiry_date, document_path, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                kycVerificationId,
                documentType,
                documentNumber || null,
                documentCountry || null,
                documentExpiryDate ? new Date(documentExpiryDate).toISOString() : null,
                req.file.path,
                new Date().toISOString()
              ],
              function(err) {
                if (err) {
                  console.error('Erreur lors de l\'ajout du document KYC:', err);
                  return res.status(500).json({ success: false, message: 'Erreur serveur' });
                }
                
                const documentId = this.lastID;
                
                // Mettre à jour le statut de la vérification
                db.run('UPDATE kyc_verifications SET status = ?, updated_at = ? WHERE id = ?',
                  ['pending', new Date().toISOString(), kycVerificationId],
                  (err) => {
                    if (err) {
                      console.error('Erreur lors de la mise à jour du statut KYC:', err);
                    }
                  }
                );
                
                // Récupérer l'utilisateur pour le log
                db.get('SELECT user_id FROM kyc_verifications WHERE id = ?', [kycVerificationId], (err, verification) => {
                  if (!err && verification) {
                    // Enregistrer cette action dans les logs
                    db.run('INSERT INTO kyc_logs (kyc_verification_id, action, details, performed_by, created_at) VALUES (?, ?, ?, ?, ?)',
                      [
                        kycVerificationId,
                        'document_upload',
                        JSON.stringify({ documentType, documentId }),
                        verification.user_id,
                        new Date().toISOString()
                      ],
                      (err) => {
                        if (err) {
                          console.error('Erreur lors de la création du log KYC:', err);
                        }
                      }
                    );
                  }
                });
                
                // Récupérer le document créé
                db.get('SELECT * FROM kyc_documents WHERE id = ?', [documentId], (err, document) => {
                  if (err) {
                    console.error('Erreur lors de la récupération du document KYC:', err);
                    return res.status(500).json({ success: false, message: 'Erreur serveur' });
                  }
                  
                  res.status(201).json({ 
                    success: true, 
                    document,
                    analysis: analysisResult
                  });
                });
              }
            );
          });
      })
      .catch(error => {
        console.error('Erreur lors du traitement de l\'image:', error);
        res.status(500).json({ success: false, message: 'Erreur lors du traitement de l\'image' });
      });
  }
);

/**
 * Route pour récupérer l'état de vérification KYC d'un utilisateur
 */
router.get('/status', ensureAuthenticated, (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  
  db.get('SELECT * FROM kyc_verifications WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, verification) => {
    if (err) {
      console.error('Erreur lors de la récupération du statut KYC:', err);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
    
    if (!verification) {
      return res.json({
        success: true,
        status: 'not_started',
        message: 'Vérification KYC non commencée'
      });
    }
    
    // Récupérer les documents associés
    db.all('SELECT * FROM kyc_documents WHERE kyc_verification_id = ?', [verification.id], (err, documents) => {
      if (err) {
        console.error('Erreur lors de la récupération des documents KYC:', err);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
      }
      
      // Générer un message explicatif
      let message;
      switch (verification.status) {
        case 'pending':
          message = 'Votre vérification est en cours d\'examen. Nous vous informerons lorsqu\'elle sera terminée.';
          break;
        case 'approved':
          message = 'Votre identité a été vérifiée avec succès.';
          break;
        case 'rejected':
          message = `Votre vérification a été rejetée. Raison: ${verification.rejection_reason || 'Non spécifiée'}`;
          break;
        default:
          message = 'Statut inconnu';
      }
      
      res.json({
        success: true,
        verification,
        documents,
        status: verification.status,
        message
      });
    });
  });
});

/**
 * Route pour les administrateurs - Approuver/Rejeter une vérification KYC
 */
router.post('/review/:verificationId', 
  ensureAuthenticated,
  ensureAdmin,
  [
    body('status').isIn(['approved', 'rejected']).withMessage('Statut invalide'),
    body('rejectionReason').optional()
  ],
  (req, res) => {
    // Valider les paramètres
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const db = req.app.locals.db;
    const verificationId = parseInt(req.params.verificationId);
    const { status, rejectionReason } = req.body;
    
    // Mettre à jour le statut de la vérification
    db.run('UPDATE kyc_verifications SET status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ? WHERE id = ?',
      [
        status,
        rejectionReason || null,
        req.session.userId,
        new Date().toISOString(),
        new Date().toISOString(),
        verificationId
      ],
      function(err) {
        if (err) {
          console.error('Erreur lors de la mise à jour du statut KYC:', err);
          return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        
        // Vérifier si la mise à jour a affecté des lignes
        if (this.changes === 0) {
          return res.status(404).json({ success: false, message: 'Vérification KYC non trouvée' });
        }
        
        // Enregistrer cette action dans les logs
        db.run('INSERT INTO kyc_logs (kyc_verification_id, action, details, performed_by, created_at) VALUES (?, ?, ?, ?, ?)',
          [
            verificationId,
            'status_change',
            JSON.stringify({ 
              previousStatus: 'pending', 
              newStatus: status,
              rejectionReason
            }),
            req.session.userId,
            new Date().toISOString()
          ],
          (err) => {
            if (err) {
              console.error('Erreur lors de la création du log KYC:', err);
            }
          }
        );
        
        // Récupérer la vérification mise à jour
        db.get('SELECT * FROM kyc_verifications WHERE id = ?', [verificationId], (err, verification) => {
          if (err) {
            console.error('Erreur lors de la récupération de la vérification KYC:', err);
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
          }
          
          res.json({ success: true, verification });
        });
      }
    );
  }
);

/**
 * Route pour les administrateurs - Lister toutes les vérifications KYC en attente
 */
router.get('/admin/pending', ensureAuthenticated, ensureAdmin, (req, res) => {
  const db = req.app.locals.db;
  
  db.all(`
    SELECT kv.*, u.username as user_username 
    FROM kyc_verifications kv
    JOIN users u ON kv.user_id = u.id
    WHERE kv.status = 'pending'
    ORDER BY kv.created_at ASC
  `, [], (err, verifications) => {
    if (err) {
      console.error('Erreur lors de la récupération des vérifications KYC:', err);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
    
    res.json({ success: true, verifications });
  });
});

module.exports = { router, initKyc };