/**
 * MS BINGO PACIFIQUE - Middleware d'authentification et d'autorisation
 * Version: 15 avril 2025
 * 
 * Ce fichier contient les middlewares pour gérer l'authentification et les autorisations
 */

import { Request, Response, NextFunction } from 'express';

// Interface utilisateur étendue pour Express
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      name: string;
      roles: string[];
      verified: boolean;
      kyc_level: string;
    }
    
    interface Request {
      user?: User;
      isAuthenticated(): boolean;
    }
  }
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export function checkAuthentication(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({
    success: false,
    message: 'Authentification requise',
    error_code: 'auth_required'
  });
}

/**
 * Vérifie si l'utilisateur possède les rôles nécessaires
 * @param roles Liste des rôles autorisés
 */
export function checkAuthorization(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Vérifier d'abord l'authentification
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        error_code: 'auth_required'
      });
    }
    
    // Si l'utilisateur a le rôle admin, autoriser toujours
    if (req.user && req.user.roles && req.user.roles.includes('admin')) {
      return next();
    }
    
    // Vérifier les rôles spécifiques
    if (req.user && req.user.roles && req.user.roles.some(role => roles.includes(role))) {
      return next();
    }
    
    // Accès refusé
    res.status(403).json({
      success: false,
      message: 'Accès refusé. Rôle requis: ' + roles.join(', '),
      error_code: 'insufficient_permissions'
    });
  };
}

/**
 * Vérifie le niveau de KYC de l'utilisateur
 * @param level Niveau KYC minimum requis ('basic', 'enhanced', 'full')
 */
export function checkKycLevel(level: 'basic' | 'enhanced' | 'full') {
  return (req: Request, res: Response, next: NextFunction) => {
    // Vérifier d'abord l'authentification
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        error_code: 'auth_required'
      });
    }
    
    // Définir la hiérarchie des niveaux KYC
    const kycLevels = {
      'none': 0,
      'basic': 1,
      'enhanced': 2,
      'full': 3
    };
    
    // Niveau KYC actuel de l'utilisateur
    const userKycLevel = req.user?.kyc_level || 'none';
    
    // Vérifier si le niveau KYC est suffisant
    if (kycLevels[userKycLevel] >= kycLevels[level]) {
      return next();
    }
    
    // Niveau KYC insuffisant
    res.status(403).json({
      success: false,
      message: `Niveau de vérification d'identité insuffisant. Niveau requis: ${level}`,
      error_code: 'insufficient_kyc_level',
      required_level: level,
      current_level: userKycLevel
    });
  };
}

/**
 * Middleware pour journaliser les requêtes API
 */
export function apiLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  // Journaliser la requête
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - User: ${req.user?.id || 'anonymous'}`);
  
  // Intercepter la fin de la réponse pour journaliser le temps de traitement
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`);
  });
  
  next();
}