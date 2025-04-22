/**
 * MS BINGO PACIFIQUE - Serveur API principal
 * Version: 15 avril 2025
 * 
 * Ce fichier est le point d'entrée du serveur API de MS BINGO PACIFIQUE
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes';
import { apiLogger } from './middleware/auth';

// Création de l'application Express
const app = express();

// Configuration de base (sécurité, analyse du corps des requêtes, etc.)
app.use(helmet()); // Protection contre les vulnérabilités web courantes
app.use(cors()); // Gestion des requêtes cross-origin
app.use(express.json()); // Analyse du corps JSON
app.use(express.urlencoded({ extended: true })); // Analyse des données de formulaire

// Middleware de journalisation des requêtes API
app.use(apiLogger);

// Montage des routes API avec un préfixe
app.use('/api', apiRoutes);

// Route racine pour la santé du serveur
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    service: 'MS BINGO PACIFIQUE API',
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de gestion des erreurs 404
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ 
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Middleware de gestion des erreurs globales
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Erreur serveur:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Erreur serveur interne' 
      : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Port d'écoute de l'API
const PORT = process.env.API_PORT || 3001;

// Exportation du serveur configuré pour qu'il puisse être démarré dans un autre fichier
export function startApiServer() {
  return app.listen(PORT, () => {
    console.log(`Serveur API MS BINGO PACIFIQUE démarré sur le port ${PORT}`);
  });
}

// Démarrage direct si ce fichier est exécuté directement
if (require.main === module) {
  startApiServer();
}

export default app;