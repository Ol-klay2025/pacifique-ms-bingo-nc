/**
 * Service de gestion des défis quotidiens pour PACIFIQUE MS BINGO
 * 
 * Ce service fournit les fonctionnalités pour :
 * - Créer et gérer des défis quotidiens personnalisés
 * - Attribuer des défis aux utilisateurs en fonction de leur niveau
 * - Vérifier la progression et la complétion des défis
 * - Distribuer les récompenses
 */

import { db } from '../db';
import { 
  dailyChallenges, 
  userChallenges, 
  type DailyChallenge,
  type InsertDailyChallenge,
  type UserChallenge,
  type InsertUserChallenge 
} from '@shared/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

/**
 * Pattern types disponibles pour les défis
 */
export const PATTERN_TYPES = {
  LINE: 'line', // Ligne horizontale, verticale ou diagonale
  DIAGONAL: 'diagonal', // Les deux diagonales
  CORNERS: 'corners', // Les quatre coins
  FULL: 'full', // Carte complète (bingo)
  SPECIFIC: 'specific' // Motif spécifique (défini par requiredPattern)
};

/**
 * Niveaux de difficulté disponibles pour les défis
 */
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
  MASTER: 'master'
};

/**
 * Status possibles pour les défis utilisateur
 */
export const CHALLENGE_STATUS = {
  PENDING: 'pending', // Pas encore commencé
  IN_PROGRESS: 'in_progress', // En cours
  COMPLETED: 'completed', // Terminé avec succès
  FAILED: 'failed', // Échoué
  EXPIRED: 'expired' // Expiré (date dépassée)
};

/**
 * Crée un nouveau défi quotidien dans la base de données
 * 
 * @param challenge Les données du défi à créer
 * @returns Le défi créé
 */
export async function createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge> {
  const [newChallenge] = await db.insert(dailyChallenges).values(challenge).returning();
  return newChallenge;
}

/**
 * Récupère les défis actifs pour la date actuelle
 * 
 * @returns Liste des défis actifs aujourd'hui
 */
export async function getActiveDailyChallenges(): Promise<DailyChallenge[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return db.select()
    .from(dailyChallenges)
    .where(
      and(
        lte(dailyChallenges.activeDate, today),
        gte(dailyChallenges.expirationDate, today)
      )
    );
}

/**
 * Récupère les défis recommandés pour un utilisateur spécifique en fonction de son niveau de difficulté
 * 
 * @param userId ID de l'utilisateur
 * @param difficultyLevel Niveau de difficulté recommandé pour l'utilisateur
 * @returns Liste des défis recommandés
 */
export async function getRecommendedChallenges(userId: number, difficultyLevel: string): Promise<DailyChallenge[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Récupérer les défis adaptés au niveau de l'utilisateur (et un niveau au-dessus/en-dessous)
  const challenges = await db.select()
    .from(dailyChallenges)
    .where(
      and(
        lte(dailyChallenges.activeDate, today),
        gte(dailyChallenges.expirationDate, today)
      )
    );

  // Filtre pour les défis adaptés au niveau et les trier par pertinence
  // Les défis du même niveau ont priorité, suivis des niveaux adjacents
  return filterChallengesByLevel(challenges, difficultyLevel);
}

/**
 * Fonction utilitaire pour filtrer et trier les défis par niveau de difficulté
 */
function filterChallengesByLevel(challenges: DailyChallenge[], userLevel: string): DailyChallenge[] {
  const levelOrder = [
    DIFFICULTY_LEVELS.BEGINNER,
    DIFFICULTY_LEVELS.INTERMEDIATE, 
    DIFFICULTY_LEVELS.ADVANCED,
    DIFFICULTY_LEVELS.EXPERT,
    DIFFICULTY_LEVELS.MASTER
  ];
  
  const userLevelIndex = levelOrder.indexOf(userLevel);
  
  // Trier les défis par proximité avec le niveau de l'utilisateur
  return challenges.sort((a, b) => {
    const aLevelIndex = levelOrder.indexOf(a.difficultyLevel);
    const bLevelIndex = levelOrder.indexOf(b.difficultyLevel);
    
    const aDiff = Math.abs(aLevelIndex - userLevelIndex);
    const bDiff = Math.abs(bLevelIndex - userLevelIndex);
    
    return aDiff - bDiff;
  });
}

/**
 * Assigne un défi à un utilisateur
 * 
 * @param userId ID de l'utilisateur
 * @param challengeId ID du défi
 * @returns Le défi utilisateur créé
 */
export async function assignChallengeToUser(
  userChallenge: InsertUserChallenge
): Promise<UserChallenge> {
  const [newUserChallenge] = await db.insert(userChallenges)
    .values(userChallenge)
    .returning();
  
  return newUserChallenge;
}

/**
 * Récupère tous les défis d'un utilisateur
 * 
 * @param userId ID de l'utilisateur
 * @returns Liste des défis de l'utilisateur
 */
export async function getUserChallenges(userId: number): Promise<UserChallenge[]> {
  return db.select()
    .from(userChallenges)
    .where(eq(userChallenges.userId, userId));
}

/**
 * Récupère les défis actifs d'un utilisateur (non expirés et non complétés)
 * 
 * @param userId ID de l'utilisateur
 * @returns Liste des défis actifs
 */
export async function getActiveUserChallenges(userId: number): Promise<(UserChallenge & { challenge: DailyChallenge })[]> {
  // Requête jointe pour récupérer les informations du défi avec le défi utilisateur
  const result = await db.select({
    userChallenge: userChallenges,
    challenge: dailyChallenges
  })
  .from(userChallenges)
  .innerJoin(dailyChallenges, eq(userChallenges.challengeId, dailyChallenges.id))
  .where(
    and(
      eq(userChallenges.userId, userId),
      eq(userChallenges.status, CHALLENGE_STATUS.IN_PROGRESS)
    )
  );

  // Transformer les résultats dans le format attendu
  return result.map(item => ({
    ...item.userChallenge,
    challenge: item.challenge
  }));
}

/**
 * Met à jour la progression d'un défi utilisateur
 * 
 * @param userChallengeId ID du défi utilisateur
 * @param status Nouveau statut
 * @param progress Progression mise à jour
 * @returns Le défi utilisateur mis à jour
 */
export async function updateUserChallengeProgress(
  userChallengeId: number,
  status: string,
  progress?: { pattern: number[][], completed: boolean[] }
): Promise<UserChallenge> {
  const updateData: any = { status };
  
  if (progress) {
    updateData.progress = progress;
  }
  
  if (status === CHALLENGE_STATUS.COMPLETED) {
    updateData.completedAt = new Date();
  }
  
  const [updatedChallenge] = await db.update(userChallenges)
    .set(updateData)
    .where(eq(userChallenges.id, userChallengeId))
    .returning();
  
  return updatedChallenge;
}

/**
 * Valide si un défi est complété en comparant les nombres appelés avec le motif requis
 * 
 * @param userChallengeId ID du défi utilisateur
 * @param cardNumbers Grille de nombres de la carte
 * @param calledNumbers Nombres appelés dans la partie
 * @returns Vrai si le défi est complété
 */
export async function validateChallengeCompletion(
  userChallengeId: number,
  cardNumbers: number[][],
  calledNumbers: number[]
): Promise<boolean> {
  // Récupérer le défi utilisateur et le défi associé
  const result = await db.select({
    userChallenge: userChallenges,
    challenge: dailyChallenges
  })
  .from(userChallenges)
  .innerJoin(dailyChallenges, eq(userChallenges.challengeId, dailyChallenges.id))
  .where(eq(userChallenges.id, userChallengeId));
  
  if (result.length === 0) {
    return false;
  }
  
  const { userChallenge, challenge } = result[0];
  
  // Vérifier si le nombre maximum d'appels est respecté
  if (challenge.maxNumberCalls !== null && calledNumbers.length > challenge.maxNumberCalls) {
    return false;
  }
  
  // Créer une carte de validation avec les nombres appelés
  const validationCard = createValidationCard(cardNumbers, calledNumbers);
  
  // Vérifier si le motif requis est complété
  switch (challenge.requiredPatternType) {
    case PATTERN_TYPES.LINE:
      return hasCompletedLine(validationCard);
    case PATTERN_TYPES.DIAGONAL:
      return hasCompletedDiagonals(validationCard);
    case PATTERN_TYPES.CORNERS:
      return hasCompletedCorners(validationCard);
    case PATTERN_TYPES.FULL:
      return isCardComplete(validationCard);
    case PATTERN_TYPES.SPECIFIC:
      return hasCompletedSpecificPattern(validationCard, challenge.requiredPattern);
    default:
      return false;
  }
}

/**
 * Crée une carte de validation avec des booléens indiquant les nombres marqués
 */
function createValidationCard(cardNumbers: number[][], calledNumbers: number[]): boolean[][] {
  const calledSet = new Set(calledNumbers);
  const validationCard: boolean[][] = [];
  
  for (let i = 0; i < cardNumbers.length; i++) {
    validationCard[i] = [];
    for (let j = 0; j < cardNumbers[i].length; j++) {
      validationCard[i][j] = calledSet.has(cardNumbers[i][j]);
    }
  }
  
  return validationCard;
}

/**
 * Vérifie si au moins une ligne (horizontale, verticale ou diagonale) est complète
 */
function hasCompletedLine(card: boolean[][]): boolean {
  // Vérifier les lignes horizontales
  for (let i = 0; i < card.length; i++) {
    if (card[i].every(cell => cell)) {
      return true;
    }
  }
  
  // Vérifier les colonnes
  for (let j = 0; j < card[0].length; j++) {
    let columnComplete = true;
    for (let i = 0; i < card.length; i++) {
      if (!card[i][j]) {
        columnComplete = false;
        break;
      }
    }
    if (columnComplete) {
      return true;
    }
  }
  
  // Vérifier diagonale principale
  let diagonalComplete = true;
  for (let i = 0; i < card.length; i++) {
    if (!card[i][i]) {
      diagonalComplete = false;
      break;
    }
  }
  if (diagonalComplete) {
    return true;
  }
  
  // Vérifier autre diagonale
  diagonalComplete = true;
  for (let i = 0; i < card.length; i++) {
    if (!card[i][card.length - 1 - i]) {
      diagonalComplete = false;
      break;
    }
  }
  
  return diagonalComplete;
}

/**
 * Vérifie si les deux diagonales sont complètes
 */
function hasCompletedDiagonals(card: boolean[][]): boolean {
  // Vérifier diagonale principale
  let diagonal1Complete = true;
  for (let i = 0; i < card.length; i++) {
    if (!card[i][i]) {
      diagonal1Complete = false;
      break;
    }
  }
  
  // Vérifier autre diagonale
  let diagonal2Complete = true;
  for (let i = 0; i < card.length; i++) {
    if (!card[i][card.length - 1 - i]) {
      diagonal2Complete = false;
      break;
    }
  }
  
  return diagonal1Complete && diagonal2Complete;
}

/**
 * Vérifie si les quatre coins sont marqués
 */
function hasCompletedCorners(card: boolean[][]): boolean {
  return card[0][0] && card[0][card[0].length - 1] && 
         card[card.length - 1][0] && card[card.length - 1][card[0].length - 1];
}

/**
 * Vérifie si toute la carte est complète
 */
function isCardComplete(card: boolean[][]): boolean {
  for (let i = 0; i < card.length; i++) {
    for (let j = 0; j < card[i].length; j++) {
      if (!card[i][j]) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Vérifie si un motif spécifique est complété
 */
function hasCompletedSpecificPattern(card: boolean[][], pattern?: number[][]): boolean {
  if (!pattern) return false;
  
  for (let i = 0; i < pattern.length; i++) {
    for (let j = 0; j < pattern[i].length; j++) {
      // Si le motif exige une cellule marquée à cette position (1) mais qu'elle n'est pas marquée
      if (pattern[i][j] === 1 && !card[i][j]) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Met à jour les défis utilisateur expirés
 */
export async function updateExpiredChallenges(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Récupérer les défis expirés
  const expiredChallenges = await db.select({
    userChallenge: userChallenges,
    challenge: dailyChallenges
  })
  .from(userChallenges)
  .innerJoin(dailyChallenges, eq(userChallenges.challengeId, dailyChallenges.id))
  .where(
    and(
      lte(dailyChallenges.expirationDate, today),
      and(
        eq(userChallenges.status, CHALLENGE_STATUS.PENDING),
        eq(userChallenges.status, CHALLENGE_STATUS.IN_PROGRESS)
      )
    )
  );
  
  if (expiredChallenges.length === 0) {
    return 0;
  }
  
  // Mettre à jour les défis expirés
  await db.update(userChallenges)
    .set({ status: CHALLENGE_STATUS.EXPIRED })
    .where(
      sql`${userChallenges.id} IN (${expiredChallenges.map(ec => ec.userChallenge.id).join(',')})`
    );
  
  return expiredChallenges.length;
}