/**
 * Routes pour la gestion des défis quotidiens
 */
import { Router, Request, Response } from 'express';
import { 
  createDailyChallenge,
  getActiveDailyChallenges, 
  getRecommendedChallenges,
  assignChallengeToUser,
  getUserChallenges,
  getActiveUserChallenges,
  updateUserChallengeProgress,
  validateChallengeCompletion,
  CHALLENGE_STATUS
} from '../services/challengeService';
import { ensureAuthenticated, ensureAdmin } from '../auth';
import { cardNumbers } from '../utils/bingoUtils';
import { 
  insertDailyChallengeSchema, 
  insertUserChallengeSchema,
  dailyChallenges,
  userChallenges
} from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * Récupère tous les défis quotidiens actifs
 * GET /api/challenges/daily
 */
router.get('/daily', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const challenges = await getActiveDailyChallenges();
    res.json(challenges);
  } catch (error) {
    console.error('Erreur lors de la récupération des défis quotidiens:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des défis quotidiens' });
  }
});

/**
 * Récupère les défis recommandés pour l'utilisateur
 * GET /api/challenges/recommended
 */
router.get('/recommended', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // Récupérer la dernière recommandation de niveau de difficulté de l'utilisateur
    const [userRecommendation] = await db.query.userDifficultyRecommendations.findMany({
      where: eq(userChallenges.userId, req.user.id),
      orderBy: (userDifficultyRecommendations, { desc }) => [desc(userDifficultyRecommendations.createdAt)],
      limit: 1
    });

    // Niveau par défaut si aucune recommandation n'est trouvée
    const difficultyLevel = userRecommendation?.recommendedLevel || 'beginner';
    
    const challenges = await getRecommendedChallenges(req.user.id, difficultyLevel);
    res.json(challenges);
  } catch (error) {
    console.error('Erreur lors de la récupération des défis recommandés:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des défis recommandés' });
  }
});

/**
 * Récupère les défis de l'utilisateur
 * GET /api/challenges/user
 */
router.get('/user', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    
    const userChallengesList = await getUserChallenges(req.user.id);
    
    // Pour chaque défi utilisateur, récupérer les détails du défi
    const challengesWithDetails = await Promise.all(
      userChallengesList.map(async (userChallenge) => {
        const [challenge] = await db.select()
          .from(dailyChallenges)
          .where(eq(dailyChallenges.id, userChallenge.challengeId));
        
        return {
          ...userChallenge,
          challenge
        };
      })
    );
    
    res.json(challengesWithDetails);
  } catch (error) {
    console.error('Erreur lors de la récupération des défis utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des défis utilisateur' });
  }
});

/**
 * Récupère les défis actifs de l'utilisateur
 * GET /api/challenges/user/active
 */
router.get('/user/active', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    
    const activeChallenges = await getActiveUserChallenges(req.user.id);
    res.json(activeChallenges);
  } catch (error) {
    console.error('Erreur lors de la récupération des défis actifs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des défis actifs' });
  }
});

/**
 * Accepte un défi et l'assigne à l'utilisateur
 * POST /api/challenges/accept/:challengeId
 */
router.post('/accept/:challengeId', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    
    const challengeId = parseInt(req.params.challengeId);
    
    // Vérifier si le défi existe
    const [challenge] = await db.select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.id, challengeId));
    
    if (!challenge) {
      return res.status(404).json({ error: 'Défi non trouvé' });
    }
    
    // Vérifier si l'utilisateur a déjà accepté ce défi
    const existingChallenges = await db.select()
      .from(userChallenges)
      .where(
        eq(userChallenges.userId, req.user.id),
        eq(userChallenges.challengeId, challengeId)
      );
    
    if (existingChallenges.length > 0) {
      return res.status(400).json({ error: 'Vous avez déjà accepté ce défi' });
    }
    
    // Créer le défi utilisateur
    const newUserChallenge = await assignChallengeToUser({
      userId: req.user.id,
      challengeId,
      status: CHALLENGE_STATUS.PENDING,
      progress: { pattern: [], completed: [] },
      rewardClaimed: false
    });
    
    res.status(201).json(newUserChallenge);
  } catch (error) {
    console.error('Erreur lors de l\'acceptation du défi:', error);
    res.status(500).json({ error: 'Erreur lors de l\'acceptation du défi' });
  }
});

/**
 * Sélectionne une carte pour un défi
 * POST /api/challenges/:userChallengeId/select-card/:cardId
 */
router.post('/:userChallengeId/select-card/:cardId', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    
    const userChallengeId = parseInt(req.params.userChallengeId);
    const cardId = parseInt(req.params.cardId);
    
    // Vérifier si le défi utilisateur existe et appartient à l'utilisateur
    const [userChallenge] = await db.select()
      .from(userChallenges)
      .where(
        eq(userChallenges.id, userChallengeId),
        eq(userChallenges.userId, req.user.id)
      );
    
    if (!userChallenge) {
      return res.status(404).json({ error: 'Défi utilisateur non trouvé' });
    }
    
    // Mettre à jour le défi utilisateur avec la carte sélectionnée et le statut en cours
    const [updatedUserChallenge] = await db.update(userChallenges)
      .set({
        cardId,
        status: CHALLENGE_STATUS.IN_PROGRESS
      })
      .where(eq(userChallenges.id, userChallengeId))
      .returning();
    
    res.json(updatedUserChallenge);
  } catch (error) {
    console.error('Erreur lors de la sélection de la carte:', error);
    res.status(500).json({ error: 'Erreur lors de la sélection de la carte' });
  }
});

/**
 * Met à jour la progression d'un défi utilisateur
 * POST /api/challenges/:userChallengeId/update-progress
 */
router.post('/:userChallengeId/update-progress', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    
    const userChallengeId = parseInt(req.params.userChallengeId);
    const { status, progress } = req.body;
    
    // Vérifier si le défi utilisateur existe et appartient à l'utilisateur
    const [userChallenge] = await db.select()
      .from(userChallenges)
      .where(
        eq(userChallenges.id, userChallengeId),
        eq(userChallenges.userId, req.user.id)
      );
    
    if (!userChallenge) {
      return res.status(404).json({ error: 'Défi utilisateur non trouvé' });
    }
    
    // Mettre à jour la progression
    const updatedUserChallenge = await updateUserChallengeProgress(
      userChallengeId,
      status,
      progress
    );
    
    res.json(updatedUserChallenge);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la progression' });
  }
});

/**
 * Vérifie la complétion d'un défi
 * POST /api/challenges/:userChallengeId/validate
 */
router.post('/:userChallengeId/validate', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    
    const userChallengeId = parseInt(req.params.userChallengeId);
    const { cardNumbers, calledNumbers } = req.body;
    
    // Vérifier si le défi utilisateur existe et appartient à l'utilisateur
    const [userChallenge] = await db.select()
      .from(userChallenges)
      .where(
        eq(userChallenges.id, userChallengeId),
        eq(userChallenges.userId, req.user.id)
      );
    
    if (!userChallenge) {
      return res.status(404).json({ error: 'Défi utilisateur non trouvé' });
    }
    
    // Valider la complétion du défi
    const isCompleted = await validateChallengeCompletion(
      userChallengeId,
      cardNumbers,
      calledNumbers
    );
    
    if (isCompleted) {
      // Mettre à jour le statut du défi comme complété
      const updatedUserChallenge = await updateUserChallengeProgress(
        userChallengeId,
        CHALLENGE_STATUS.COMPLETED
      );
      
      // Ajouter des crédits à l'utilisateur si le défi est complété
      const [challenge] = await db.select()
        .from(dailyChallenges)
        .where(eq(dailyChallenges.id, userChallenge.challengeId));
      
      // Mise à jour du solde utilisateur
      if (challenge) {
        await db.update(userChallenges)
          .set({ rewardClaimed: true })
          .where(eq(userChallenges.id, userChallengeId));
        
        // Ajouter la récompense au solde de l'utilisateur
        await db.update(userChallenges)
          .set({ balance: sql`balance + ${challenge.rewardAmount}` })
          .where(eq(userChallenges.id, req.user.id));
      }
      
      res.json({ 
        success: true, 
        message: 'Défi complété avec succès!',
        reward: challenge?.rewardAmount || 0,
        challenge: updatedUserChallenge
      });
    } else {
      res.json({ 
        success: false, 
        message: 'Le défi n\'est pas encore complété.'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la validation du défi:', error);
    res.status(500).json({ error: 'Erreur lors de la validation du défi' });
  }
});

/**
 * Crée un nouveau défi quotidien (admin uniquement)
 * POST /api/challenges/create
 */
router.post('/create', ensureAdmin, async (req: Request, res: Response) => {
  try {
    // Valider les données du défi avec Zod
    const validatedData = insertDailyChallengeSchema.parse(req.body);
    
    // Créer le défi
    const newChallenge = await createDailyChallenge(validatedData);
    
    res.status(201).json(newChallenge);
  } catch (error: any) {
    console.error('Erreur lors de la création du défi:', error);
    
    if (error.errors) {
      // Erreur de validation Zod
      return res.status(400).json({ error: 'Données de défi invalides', details: error.errors });
    }
    
    res.status(500).json({ error: 'Erreur lors de la création du défi' });
  }
});

/**
 * Met à jour un défi quotidien (admin uniquement)
 * PUT /api/challenges/:challengeId
 */
router.put('/:challengeId', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const challengeId = parseInt(req.params.challengeId);
    
    // Vérifier si le défi existe
    const [challenge] = await db.select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.id, challengeId));
    
    if (!challenge) {
      return res.status(404).json({ error: 'Défi non trouvé' });
    }
    
    // Valider les données du défi avec Zod
    const validatedData = insertDailyChallengeSchema.partial().parse(req.body);
    
    // Mettre à jour le défi
    const [updatedChallenge] = await db.update(dailyChallenges)
      .set(validatedData)
      .where(eq(dailyChallenges.id, challengeId))
      .returning();
    
    res.json(updatedChallenge);
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du défi:', error);
    
    if (error.errors) {
      // Erreur de validation Zod
      return res.status(400).json({ error: 'Données de défi invalides', details: error.errors });
    }
    
    res.status(500).json({ error: 'Erreur lors de la mise à jour du défi' });
  }
});

/**
 * Supprime un défi quotidien (admin uniquement)
 * DELETE /api/challenges/:challengeId
 */
router.delete('/:challengeId', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const challengeId = parseInt(req.params.challengeId);
    
    // Vérifier si le défi existe
    const [challenge] = await db.select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.id, challengeId));
    
    if (!challenge) {
      return res.status(404).json({ error: 'Défi non trouvé' });
    }
    
    // Supprimer le défi
    await db.delete(dailyChallenges)
      .where(eq(dailyChallenges.id, challengeId));
    
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression du défi:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du défi' });
  }
});

export default router;