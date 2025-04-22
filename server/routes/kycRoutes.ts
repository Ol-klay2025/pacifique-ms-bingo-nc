import { Router } from 'express';
import { body, param } from 'express-validator';
import * as kycService from '../services/kycService';
import { validateRequest } from '../middleware/validateRequest';
import { ensureAuthenticated } from '../middleware/auth';

const router = Router();

/**
 * Middleware pour vérifier si l'utilisateur a le rôle d'admin
 */
function ensureAdmin(req: any, res: any, next: any) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Accès non autorisé. Rôle d\'administrateur requis.' });
}

/**
 * Route pour initier une nouvelle demande de vérification KYC
 */
router.post('/request', 
  ensureAuthenticated,
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const verification = await kycService.createKycVerification(userId);
      res.status(201).json({ 
        success: true, 
        verification 
      });
    } catch (error: any) {
      console.error('Erreur lors de la création de la vérification KYC:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

/**
 * Route pour envoyer un document
 */
router.post('/upload-document',
  ensureAuthenticated,
  kycService.upload.single('document'),
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
  validateRequest,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'Aucun fichier envoyé' 
        });
      }

      const { kycVerificationId, documentType, documentNumber, documentCountry, documentExpiryDate } = req.body;
      
      // Traiter l'image
      const processedImagePath = await kycService.processImage(req.file.path);
      
      // Analyser le document pour extraire des informations
      const analysisResult = await kycService.analyzeDocument(processedImagePath);
      
      // Enregistrer le document dans la base de données
      const document = await kycService.addKycDocument(
        parseInt(kycVerificationId),
        documentType,
        req.file.path,
        {
          documentNumber,
          documentCountry,
          documentExpiryDate: documentExpiryDate ? new Date(documentExpiryDate) : undefined
        }
      );
      
      res.status(201).json({ 
        success: true, 
        document,
        analysis: analysisResult
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du document:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

/**
 * Route pour récupérer l'état de vérification KYC d'un utilisateur
 */
router.get('/status',
  ensureAuthenticated,
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const status = await kycService.getUserKycStatus(userId);
      res.json({ success: true, ...status });
    } catch (error: any) {
      console.error('Erreur lors de la récupération du statut KYC:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

/**
 * Route pour les administrateurs - Approuver/Rejeter une vérification KYC
 */
router.post('/review/:verificationId',
  ensureAuthenticated,
  ensureAdmin,
  [
    param('verificationId').isInt().withMessage('ID de vérification invalide'),
    body('status').isIn(['approved', 'rejected']).withMessage('Statut invalide'),
    body('rejectionReason').optional()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const verificationId = parseInt(req.params.verificationId);
      const { status, rejectionReason } = req.body;
      
      const verification = await kycService.updateVerificationStatus(
        verificationId, 
        status, 
        {
          reviewedBy: req.user!.id,
          rejectionReason
        }
      );
      
      res.json({ 
        success: true, 
        verification 
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut KYC:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

/**
 * Route pour les administrateurs - Lister toutes les vérifications KYC en attente
 */
router.get('/admin/pending',
  ensureAuthenticated,
  ensureAdmin,
  async (req, res) => {
    try {
      // À implémenter: récupérer toutes les vérifications en attente
      res.json({ 
        success: true, 
        message: 'Cette fonctionnalité sera implémentée prochainement' 
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des vérifications KYC:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

export default router;