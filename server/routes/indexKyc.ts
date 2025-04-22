/**
 * MS BINGO PACIFIQUE - Routes API KYC (Know Your Customer)
 * Version: 15 avril 2025
 * 
 * Ce fichier gère les routes liées à la vérification d'identité des utilisateurs
 */

import express from 'express';
import { checkAuthentication, checkAuthorization } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuration de Multer pour le stockage des documents d'identité
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(__dirname, '../../uploads/kyc', req.user.id.toString());
    
    // Créer le répertoire utilisateur s'il n'existe pas
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique avec timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    const docType = req.body.document_type || 'unknown';
    
    cb(null, `${docType}-${uniqueSuffix}${fileExt}`);
  }
});

// Filtre pour les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  // Accepter uniquement jpg, jpeg, png et pdf
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Seuls les formats JPG, PNG et PDF sont acceptés'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB max
});

const router = express.Router();

// Middleware d'authentification pour toutes les routes KYC utilisateur
router.use('/user', checkAuthentication);

// Route pour obtenir le statut de vérification KYC de l'utilisateur
router.get('/user/status', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupération du statut KYC de l'utilisateur
    // Code à implémenter selon le système de stockage utilisé
    
    // Exemple de réponse simulée
    const kycStatus = {
      verification_level: 'enhanced', // none, basic, enhanced, full
      documents_submitted: {
        id_card: { status: 'approved', submitted_at: '2025-03-20T14:32:10Z' },
        proof_of_address: { status: 'pending', submitted_at: '2025-04-10T09:15:42Z' },
        selfie: { status: 'approved', submitted_at: '2025-03-20T14:35:22Z' }
      },
      missing_documents: ['bank_statement'],
      account_limits: {
        daily_deposit: 10000,
        daily_withdrawal: 5000,
        monthly_transaction_volume: 100000
      },
      next_review_date: '2025-10-15T00:00:00Z'
    };
    
    res.json({ success: true, data: kycStatus });
  } catch (error) {
    console.error('Erreur lors de la récupération du statut KYC:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Route pour soumettre un document KYC
router.post('/user/documents', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun document fourni' });
    }
    
    const userId = req.user.id;
    const { document_type } = req.body;
    
    // Validation du type de document
    const validDocTypes = ['id_card', 'passport', 'driving_license', 'proof_of_address', 'selfie', 'bank_statement'];
    if (!document_type || !validDocTypes.includes(document_type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type de document invalide',
        valid_types: validDocTypes
      });
    }
    
    // Enregistrer les informations du document dans la base de données
    // Code à implémenter selon le système de stockage utilisé
    
    res.json({ 
      success: true, 
      message: 'Document soumis avec succès',
      data: { 
        document_type,
        file_name: req.file.filename,
        file_size: req.file.size,
        upload_date: new Date(),
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la soumission du document KYC:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Routes administratives (réservées aux agents KYC)

// Middleware d'autorisation pour les routes administratives
router.use('/admin', checkAuthorization(['admin', 'kyc_agent']));

// Liste des dossiers KYC en attente
router.get('/admin/pending', async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    // Filtrage par statut
    const status = req.query.status || 'pending';
    
    // Récupération des dossiers KYC
    // Code à implémenter selon le système de stockage utilisé
    
    // Exemple de réponse simulée
    const pendingCases = [
      { 
        id: 1, 
        user_id: 123, 
        user_name: 'Jean Dupont', 
        level: 'enhanced',
        documents: [
          { type: 'id_card', status: 'pending', submitted_at: '2025-04-12T14:32:10Z' },
          { type: 'proof_of_address', status: 'pending', submitted_at: '2025-04-12T14:35:22Z' }
        ],
        priority: 'high',
        waiting_since: '2025-04-12T14:32:10Z'
      },
      { 
        id: 2, 
        user_id: 456, 
        user_name: 'Marie Martin', 
        level: 'basic',
        documents: [
          { type: 'selfie', status: 'pending', submitted_at: '2025-04-11T10:15:42Z' }
        ],
        priority: 'normal',
        waiting_since: '2025-04-11T10:15:42Z'
      }
    ];
    
    const totalCount = 42; // Nombre total de dossiers pour la pagination
    
    res.json({ 
      success: true, 
      data: pendingCases,
      pagination: {
        page,
        limit,
        total_pages: Math.ceil(totalCount / limit),
        total_items: totalCount
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des dossiers KYC en attente:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Détails d'un dossier KYC
router.get('/admin/case/:id', async (req, res) => {
  try {
    const caseId = parseInt(req.params.id);
    
    // Récupération des détails du dossier KYC
    // Code à implémenter selon le système de stockage utilisé
    
    // Exemple de réponse simulée
    const kycCase = {
      id: caseId,
      user_id: 123,
      user_details: {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        phone: '+33612345678',
        registration_date: '2025-01-15T10:22:33Z',
        country: 'FR',
        account_status: 'active'
      },
      kyc_level: {
        current: 'basic',
        requested: 'enhanced'
      },
      documents: [
        { 
          type: 'id_card', 
          status: 'pending', 
          submitted_at: '2025-04-12T14:32:10Z',
          file_path: '/uploads/kyc/123/id_card-1681301530123.jpg'
        },
        { 
          type: 'proof_of_address', 
          status: 'pending', 
          submitted_at: '2025-04-12T14:35:22Z',
          file_path: '/uploads/kyc/123/proof_of_address-1681301722456.pdf'
        }
      ],
      history: [
        { 
          action: 'document_submitted', 
          document_type: 'id_card', 
          timestamp: '2025-04-12T14:32:10Z', 
          ip_address: '192.168.1.100' 
        },
        { 
          action: 'document_submitted', 
          document_type: 'proof_of_address', 
          timestamp: '2025-04-12T14:35:22Z', 
          ip_address: '192.168.1.100' 
        }
      ],
      notes: []
    };
    
    res.json({ success: true, data: kycCase });
  } catch (error) {
    console.error(`Erreur lors de la récupération du dossier KYC ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Vérifier un document
router.post('/admin/document/:id/verify', async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const { status, notes } = req.body;
    
    // Validation du statut
    if (!['approved', 'rejected', 'additional_info_required'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }
    
    // Mise à jour du statut du document
    // Code à implémenter selon le système de stockage utilisé
    
    res.json({ 
      success: true, 
      message: `Document ${documentId} marqué comme "${status}"`,
      data: { id: documentId, status, notes, verified_by: req.user.id, verified_at: new Date() }
    });
  } catch (error) {
    console.error(`Erreur lors de la vérification du document ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Mettre à jour le niveau de vérification KYC d'un utilisateur
router.put('/admin/user/:id/level', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { level, reason } = req.body;
    
    // Validation du niveau KYC
    if (!['none', 'basic', 'enhanced', 'full'].includes(level)) {
      return res.status(400).json({ success: false, message: 'Niveau KYC invalide' });
    }
    
    // Mise à jour du niveau KYC
    // Code à implémenter selon le système de stockage utilisé
    
    res.json({ 
      success: true, 
      message: `Niveau KYC de l'utilisateur ${userId} mis à jour vers "${level}"`,
      data: { 
        user_id: userId, 
        level, 
        reason, 
        updated_by: req.user.id, 
        updated_at: new Date(),
        account_limits: {
          daily_deposit: level === 'full' ? 50000 : (level === 'enhanced' ? 10000 : 1000),
          daily_withdrawal: level === 'full' ? 50000 : (level === 'enhanced' ? 5000 : 500),
          monthly_transaction_volume: level === 'full' ? 500000 : (level === 'enhanced' ? 100000 : 10000)
        }
      }
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du niveau KYC de l'utilisateur ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

// Ajouter une note à un dossier KYC
router.post('/admin/case/:id/notes', async (req, res) => {
  try {
    const caseId = parseInt(req.params.id);
    const { content } = req.body;
    
    // Validation du contenu
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Le contenu de la note ne peut pas être vide' });
    }
    
    // Ajout de la note
    // Code à implémenter selon le système de stockage utilisé
    
    const noteId = Math.floor(Math.random() * 10000); // Simulé
    
    res.json({ 
      success: true, 
      message: 'Note ajoutée avec succès',
      data: { 
        id: noteId,
        case_id: caseId,
        content,
        created_by: req.user.id,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error(`Erreur lors de l'ajout d'une note au dossier KYC ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

export default router;