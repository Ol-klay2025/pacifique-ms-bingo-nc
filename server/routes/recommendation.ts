/**
 * Routes pour le système de recommandation de niveau de difficulté adaptatif
 */

import { Router } from 'express';
import { recommendationEngine } from '../recommendationEngine';
import { ensureAuthenticated } from '../auth';
import { DifficultyLevel, RecommendationEngine } from '../recommendationEngine';
import { IStorage } from '../storage';
import { UserDifficultyRecommendation } from '../../shared/schema';

const router = Router();

/**
 * Récupère la recommandation de difficulté pour l'utilisateur connecté
 * GET /api/recommendations/user
 */
router.get('/user', ensureAuthenticated, async (req, res) => {
  try {
    // @ts-ignore - L'utilisateur est bien disponible grâce au middleware ensureAuthenticated
    const userId = req.user.id;
    const recommendation = await recommendationEngine.generateRecommendation(userId);
    res.json({
      recommendedLevel: recommendation.recommendedLevel,
      recommendedCardCount: recommendation.recommendedCardCount,
      confidence: recommendation.confidence,
      factors: recommendation.factors,
      timestamp: recommendation.timestamp,
      previousLevel: recommendation.previousLevel || null,
      description: {
        level: RecommendationEngine.getDifficultyDescription(recommendation.recommendedLevel),
        cardCount: `${recommendation.recommendedCardCount} carte${recommendation.recommendedCardCount > 1 ? 's' : ''}`
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération de la recommandation:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la génération de la recommandation' });
  }
});

/**
 * Récupère l'historique des recommandations de difficulté pour l'utilisateur connecté
 * GET /api/recommendations/history
 */
router.get('/history', ensureAuthenticated, async (req, res) => {
  try {
    // @ts-ignore - L'utilisateur est bien disponible grâce au middleware ensureAuthenticated
    const userId = req.user.id;
    const storage = req.app.get('storage') as IStorage;
    const recommendations = await storage.getUserDifficultyRecommendationsByUserId(userId);
    
    // Formater les données pour l'affichage
    const formattedRecommendations = recommendations.map((rec: UserDifficultyRecommendation) => ({
      id: rec.id,
      recommendedLevel: rec.recommendedLevel,
      recommendedCardCount: rec.recommendedCardCount,
      confidence: rec.confidence,
      timestamp: rec.createdAt,
      description: RecommendationEngine.getDifficultyDescription(rec.recommendedLevel as DifficultyLevel)
    }));
    
    res.json(formattedRecommendations);
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'historique des recommandations:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la récupération de l\'historique' });
  }
});

/**
 * Récupère les informations sur tous les niveaux de difficulté disponibles
 * GET /api/recommendations/levels
 */
router.get('/levels', (_req, res) => {
  try {
    const levels = Object.values(DifficultyLevel).map(level => ({
      id: level,
      name: level.charAt(0).toUpperCase() + level.slice(1),
      description: RecommendationEngine.getDifficultyDescription(level as DifficultyLevel)
    }));
    
    res.json(levels);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des niveaux de difficulté:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la récupération des niveaux' });
  }
});

export default router;