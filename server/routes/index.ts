/**
 * MS BINGO PACIFIQUE - Router principal
 * Version: 15 avril 2025
 * 
 * Ce fichier regroupe les routes API de l'application
 */

import express, { Request, Response } from 'express';
import amlRoutes from './aml';

const router = express.Router();

// Enregistrement des routes spécifiques
router.use('/aml', amlRoutes);

// Si dans le futur d'autres routes sont ajoutées :
// router.use('/gdpr', gdprRoutes);
// router.use('/kyc', kycRoutes);

// Route racine pour la santé de l'API
router.get('/health', (req: Request, res: Response) => {
  res.json({
    service: 'MS BINGO PACIFIQUE API',
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export { router };
export default router;