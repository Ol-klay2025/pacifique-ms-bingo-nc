/**
 * Moteur de recommandation de niveau de difficulté adaptatif pour PACIFIQUE MS BINGO
 * 
 * Ce moteur analyse les performances passées du joueur pour lui recommander 
 * un niveau de difficulté et un nombre de cartes optimal pour son expérience.
 */

import { storage } from './storage';
import { User, Game, Card } from '../shared/schema';

// Types de difficulté disponibles
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

// Facteurs d'influence pour la recommandation
export enum FactorType {
  WIN_RATE = 'win_rate',          // Taux de victoire global
  GAME_COUNT = 'game_count',      // Nombre de parties jouées
  RECENT_PERFORMANCE = 'recent',  // Performance récente (10 dernières parties)
  CARD_EFFICIENCY = 'efficiency', // Efficacité (victoires/cartes)
  SESSION_FREQUENCY = 'frequency' // Fréquence des sessions de jeu
}

// Structure de recommandation
export interface DifficultyRecommendation {
  userId: number;
  recommendedLevel: DifficultyLevel;
  recommendedCardCount: number;
  confidence: number; // 0-1, niveau de confiance dans la recommandation
  factors: {
    [key in FactorType]?: {
      score: number;      // 0-1, contribution à la recommandation
      description: string; // Description textuelle du facteur
    };
  };
  timestamp: Date;
  previousLevel?: DifficultyLevel;
}

/**
 * Classe principale du moteur de recommandation
 */
export class RecommendationEngine {
  
  // Seuils de difficulté (nombre de points requis pour chaque niveau)
  private static readonly DIFFICULTY_THRESHOLDS = {
    [DifficultyLevel.BEGINNER]: 0,
    [DifficultyLevel.EASY]: 0.2,
    [DifficultyLevel.MEDIUM]: 0.4,
    [DifficultyLevel.HARD]: 0.6,
    [DifficultyLevel.EXPERT]: 0.8
  };
  
  // Recommandation de cartes par niveau de difficulté
  private static readonly CARD_RECOMMENDATIONS = {
    [DifficultyLevel.BEGINNER]: { min: 1, max: 2 },
    [DifficultyLevel.EASY]: { min: 1, max: 3 },
    [DifficultyLevel.MEDIUM]: { min: 2, max: 4 },
    [DifficultyLevel.HARD]: { min: 3, max: 6 },
    [DifficultyLevel.EXPERT]: { min: 4, max: 6 }
  };
  
  // Poids des différents facteurs dans le calcul global
  private static readonly FACTOR_WEIGHTS = {
    [FactorType.WIN_RATE]: 0.3,
    [FactorType.GAME_COUNT]: 0.2,
    [FactorType.RECENT_PERFORMANCE]: 0.25,
    [FactorType.CARD_EFFICIENCY]: 0.15,
    [FactorType.SESSION_FREQUENCY]: 0.1
  };
  
  /**
   * Génère une recommandation de difficulté pour un utilisateur
   * @param userId Identifiant de l'utilisateur
   * @returns Promesse contenant la recommandation de difficulté
   */
  public async generateRecommendation(userId: number): Promise<DifficultyRecommendation> {
    // Récupérer les données nécessaires pour l'analyse
    const user = await storage.getUserById(userId);
    if (!user) {
      throw new Error(`Utilisateur avec ID ${userId} non trouvé`);
    }
    
    // Collecter les données d'historique de jeu
    const userGames = await this.getUserGameHistory(userId);
    const userCards = await this.getUserCardHistory(userId);
    
    // Calculer les différents facteurs
    const factors: Partial<Record<FactorType, { score: number; description: string }>> = {};
    
    // 1. Taux de victoire
    factors[FactorType.WIN_RATE] = this.calculateWinRate(userId, userGames);
    
    // 2. Nombre de parties jouées
    factors[FactorType.GAME_COUNT] = this.calculateGameCountFactor(userGames);
    
    // 3. Performance récente
    factors[FactorType.RECENT_PERFORMANCE] = this.calculateRecentPerformance(userGames, userId);
    
    // 4. Efficacité par carte
    factors[FactorType.CARD_EFFICIENCY] = this.calculateCardEfficiency(userGames, userCards, userId);
    
    // 5. Fréquence des sessions
    factors[FactorType.SESSION_FREQUENCY] = this.calculateSessionFrequency(userGames);
    
    // Calculer le score global et la difficulté recommandée
    const { recommendedLevel } = this.calculateOverallScore(factors);
    
    // Calculer le nombre de cartes recommandé
    const recommendedCardCount = this.calculateRecommendedCardCount(recommendedLevel, user);
    
    // Obtenir la recommandation précédente si elle existe
    const previousRecommendation = await this.getPreviousRecommendation(userId);
    
    // Calculer la confiance dans la recommandation
    const confidence = this.calculateConfidence(factors, userGames.length);
    
    // Créer la nouvelle recommandation
    const recommendation: DifficultyRecommendation = {
      userId,
      recommendedLevel,
      recommendedCardCount,
      confidence,
      factors,
      timestamp: new Date(),
      previousLevel: previousRecommendation?.recommendedLevel
    };
    
    // Sauvegarder la recommandation (si implémenté)
    await this.saveRecommendation(recommendation);
    
    return recommendation;
  }
  
  /**
   * Récupère l'historique des parties d'un utilisateur
   */
  private async getUserGameHistory(userId: number): Promise<Game[]> {
    // Récupérer toutes les cartes de l'utilisateur
    const userCards = await storage.getCardsByUserId(userId);
    
    // Extraire les IDs de jeu uniques
    const gameIds = [...new Set(userCards.map(card => card.gameId))];
    
    // Récupérer les détails de chaque jeu
    const games: Game[] = [];
    for (const gameId of gameIds) {
      const game = await storage.getGameById(gameId);
      if (game) {
        games.push(game);
      }
    }
    
    // Trier par date (du plus récent au plus ancien)
    return games.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }
  
  /**
   * Récupère l'historique des cartes d'un utilisateur
   */
  private async getUserCardHistory(userId: number): Promise<Card[]> {
    return await storage.getCardsByUserId(userId);
  }
  
  /**
   * Calcule le facteur de taux de victoire
   */
  private calculateWinRate(userId: number, userGames: Game[]): { score: number; description: string } {
    if (userGames.length === 0) {
      return { score: 0, description: "Aucune partie jouée" };
    }
    
    let bingoWins = 0;
    let quineWins = 0;
    let jackpotWins = 0;
    
    // Compter les différents types de victoires
    for (const game of userGames) {
      // Dans la nouvelle structure, les gagnants sont stockés dans des tableaux
      if (game.bingoWinnerIds && game.bingoWinnerIds.includes(userId)) {
        bingoWins++;
        if (game.jackpotWon) {
          jackpotWins++;
        }
      }
      if (game.quineWinnerIds && game.quineWinnerIds.includes(userId)) {
        quineWins++;
      }
    }
    
    // Calculer le taux de victoire global (pondéré)
    const totalGames = userGames.length;
    const bingoRate = bingoWins / totalGames;
    const quineRate = quineWins / totalGames;
    const jackpotRate = jackpotWins / totalGames;
    
    // Score pondéré: bingo = 1x, quine = 0.5x, jackpot = 3x
    const weightedScore = (bingoRate + (quineRate * 0.5) + (jackpotRate * 3)) / 4.5;
    
    // Ajuster le score entre 0 et 1
    const score = Math.min(1, Math.max(0, weightedScore * 2));
    
    // Créer une description textuelle
    let description;
    if (score < 0.2) {
      description = "Taux de victoire très faible";
    } else if (score < 0.4) {
      description = "Taux de victoire faible";
    } else if (score < 0.6) {
      description = "Taux de victoire modéré";
    } else if (score < 0.8) {
      description = "Bon taux de victoire";
    } else {
      description = "Excellent taux de victoire";
    }
    
    return { score, description };
  }
  
  /**
   * Calcule le facteur lié au nombre de parties jouées
   */
  private calculateGameCountFactor(userGames: Game[]): { score: number; description: string } {
    const gameCount = userGames.length;
    
    // Échelle logarithmique: 0 parties = 0, 10 parties = 0.5, 100 parties = 1
    const score = Math.min(1, Math.log10(gameCount + 1) / 2);
    
    let description;
    if (gameCount === 0) {
      description = "Aucune partie jouée";
    } else if (gameCount < 5) {
      description = "Débutant (moins de 5 parties)";
    } else if (gameCount < 20) {
      description = "Novice (moins de 20 parties)";
    } else if (gameCount < 50) {
      description = "Joueur régulier";
    } else if (gameCount < 100) {
      description = "Joueur expérimenté";
    } else {
      description = "Joueur expert";
    }
    
    return { score, description };
  }
  
  /**
   * Calcule le facteur lié aux performances récentes
   * @param userGames Liste des jeux auxquels l'utilisateur a participé
   * @param userId ID de l'utilisateur pour lequel calculer la performance
   */
  private calculateRecentPerformance(userGames: Game[], userId: number): { score: number; description: string } {
    const recentGames = userGames.slice(0, 10); // 10 dernières parties
    
    if (recentGames.length === 0) {
      return { score: 0, description: "Aucune partie récente" };
    }
    
    // Calculer l'évolution des résultats
    // Une victoire récente a plus de poids qu'une victoire ancienne
    let weightedScore = 0;
    let totalWeight = 0;
    
    recentGames.forEach((game, index) => {
      const weight = recentGames.length - index; // Plus récent = plus de poids
      totalWeight += weight;
      
      // Calcul du score pour ce jeu
      let gameScore = 0;
      if (game.status === 'completed') {
        // Nous utilisons l'ID utilisateur passé en paramètre
        const isJackpotWinner = game.jackpotWon && game.bingoWinnerIds && game.bingoWinnerIds.includes(userId);
        const isBingoWinner = game.bingoWinnerIds && game.bingoWinnerIds.includes(userId);
        const isQuineWinner = game.quineWinnerIds && game.quineWinnerIds.includes(userId);
        
        if (isJackpotWinner) gameScore = 1.0; // Jackpot
        else if (isBingoWinner) gameScore = 0.7; // Bingo
        else if (isQuineWinner) gameScore = 0.4; // Quine
        else gameScore = 0.1; // Participation
      }
      
      weightedScore += gameScore * weight;
    });
    
    const score = Math.min(1, Math.max(0, weightedScore / totalWeight));
    
    let description;
    if (score < 0.2) {
      description = "Performance récente faible";
    } else if (score < 0.4) {
      description = "Performance récente en dessous de la moyenne";
    } else if (score < 0.6) {
      description = "Performance récente moyenne";
    } else if (score < 0.8) {
      description = "Bonne performance récente";
    } else {
      description = "Excellente performance récente";
    }
    
    return { score, description };
  }
  
  /**
   * Calcule l'efficacité par carte (victoires/cartes)
   * @param userGames Liste des jeux auxquels l'utilisateur a participé
   * @param userCards Liste des cartes utilisées par l'utilisateur
   * @param userId ID de l'utilisateur pour lequel calculer l'efficacité
   */
  private calculateCardEfficiency(userGames: Game[], userCards: Card[], userId: number): { score: number; description: string } {
    if (userGames.length === 0 || userCards.length === 0) {
      return { score: 0, description: "Données insuffisantes" };
    }
    
    // Calculer le nombre moyen de cartes par partie
    const uniqueGameIds = new Set(userCards.map(card => card.gameId));
    const avgCardsPerGame = userCards.length / uniqueGameIds.size;
    
    // Calculer le nombre total de victoires (bingo + quine)
    const totalWins = userGames.filter(g => 
      (g.bingoWinnerIds && g.bingoWinnerIds.includes(userId)) || 
      (g.quineWinnerIds && g.quineWinnerIds.includes(userId))
    ).length;
    
    // Calculer le ratio victoires/parties
    const winRatio = totalWins / userGames.length;
    
    // Calculer l'efficacité: ratio victoires/parties divisé par cartes moyennes
    // Plus le ratio est élevé avec moins de cartes, plus l'efficacité est grande
    const efficiency = winRatio / Math.sqrt(avgCardsPerGame);
    
    // Normaliser le score entre 0 et 1
    const score = Math.min(1, Math.max(0, efficiency * 2));
    
    let description;
    if (score < 0.2) {
      description = "Faible efficacité par carte";
    } else if (score < 0.4) {
      description = "Efficacité par carte en dessous de la moyenne";
    } else if (score < 0.6) {
      description = "Efficacité par carte moyenne";
    } else if (score < 0.8) {
      description = "Bonne efficacité par carte";
    } else {
      description = "Excellente efficacité par carte";
    }
    
    return { score, description };
  }
  
  /**
   * Calcule la fréquence des sessions de jeu
   */
  private calculateSessionFrequency(userGames: Game[]): { score: number; description: string } {
    if (userGames.length <= 1) {
      return { score: 0, description: "Trop peu de parties pour évaluer" };
    }
    
    // Extraire les dates des jeux
    const gameDates = userGames.map(game => new Date(game.startTime).getTime());
    
    // Calculer l'intervalle moyen entre les parties (en jours)
    let totalInterval = 0;
    for (let i = 0; i < gameDates.length - 1; i++) {
      totalInterval += Math.abs(gameDates[i] - gameDates[i+1]);
    }
    
    const avgIntervalMs = totalInterval / (gameDates.length - 1);
    const avgIntervalDays = avgIntervalMs / (1000 * 60 * 60 * 24);
    
    // Plus l'intervalle est petit, plus le score est élevé
    // Score maximal pour un jeu quotidien ou plus fréquent
    const score = Math.min(1, Math.max(0, 1 - (avgIntervalDays / 14)));
    
    let description;
    if (score < 0.2) {
      description = "Joueur très occasionnel";
    } else if (score < 0.4) {
      description = "Joueur occasionnel";
    } else if (score < 0.6) {
      description = "Joueur régulier";
    } else if (score < 0.8) {
      description = "Joueur fréquent";
    } else {
      description = "Joueur très fréquent";
    }
    
    return { score, description };
  }
  
  /**
   * Calcule le score global et détermine le niveau recommandé
   */
  private calculateOverallScore(factors: Partial<Record<FactorType, { score: number; description: string }>>): {
    recommendedLevel: DifficultyLevel;
  } {
    let weightedSum = 0;
    let totalWeight = 0;
    
    // Calculer la somme pondérée des facteurs
    for (const factor in factors) {
      const factorType = factor as FactorType;
      const weight = RecommendationEngine.FACTOR_WEIGHTS[factorType] || 0;
      const score = factors[factorType]?.score || 0;
      
      weightedSum += weight * score;
      totalWeight += weight;
    }
    
    // Calculer le score global normalisé
    const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    // Déterminer le niveau recommandé
    let recommendedLevel = DifficultyLevel.BEGINNER;
    
    if (overallScore >= RecommendationEngine.DIFFICULTY_THRESHOLDS[DifficultyLevel.EXPERT]) {
      recommendedLevel = DifficultyLevel.EXPERT;
    } else if (overallScore >= RecommendationEngine.DIFFICULTY_THRESHOLDS[DifficultyLevel.HARD]) {
      recommendedLevel = DifficultyLevel.HARD;
    } else if (overallScore >= RecommendationEngine.DIFFICULTY_THRESHOLDS[DifficultyLevel.MEDIUM]) {
      recommendedLevel = DifficultyLevel.MEDIUM;
    } else if (overallScore >= RecommendationEngine.DIFFICULTY_THRESHOLDS[DifficultyLevel.EASY]) {
      recommendedLevel = DifficultyLevel.EASY;
    }
    
    return { recommendedLevel };
  }
  
  /**
   * Calcule le nombre recommandé de cartes basé sur le niveau de difficulté
   */
  private calculateRecommendedCardCount(level: DifficultyLevel, user: User): number {
    const { min, max } = RecommendationEngine.CARD_RECOMMENDATIONS[level];
    
    // Ajuster en fonction du solde (plus de solde = plus de cartes)
    const balanceFactor = Math.min(1, user.balance / 5000); // Max à 50€
    
    return Math.round(min + balanceFactor * (max - min));
  }
  
  /**
   * Calcule le niveau de confiance de la recommandation
   */
  private calculateConfidence(
    factors: Partial<Record<FactorType, { score: number; description: string }>>,
    gameCount: number
  ): number {
    // Plus l'utilisateur a joué de parties, plus la confiance est élevée
    const experienceFactor = Math.min(1, gameCount / 50); // Max à 50 parties
    
    // Plus les facteurs sont nombreux, plus la confiance est élevée
    const factorCoverage = Object.keys(factors).length / Object.keys(FactorType).length;
    
    // Calculer la confiance globale
    return Math.min(1, Math.max(0, (experienceFactor * 0.7) + (factorCoverage * 0.3)));
  }
  
  /**
   * Récupère la dernière recommandation de l'utilisateur depuis la base de données
   */
  private async getPreviousRecommendation(userId: number): Promise<DifficultyRecommendation | null> {
    try {
      // Récupérer la dernière recommandation depuis le stockage
      const previousRecommendation = await storage.getLatestUserDifficultyRecommendation(userId);
      
      if (!previousRecommendation) {
        return null;
      }
      
      // Convertir la structure de la base de données en structure DifficultyRecommendation
      return {
        userId: previousRecommendation.userId,
        recommendedLevel: previousRecommendation.recommendedLevel as DifficultyLevel,
        recommendedCardCount: previousRecommendation.recommendedCardCount,
        confidence: previousRecommendation.confidence,
        factors: previousRecommendation.factorsAnalysis,
        timestamp: new Date(previousRecommendation.createdAt),
        previousLevel: previousRecommendation.previousLevel as DifficultyLevel || undefined
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la recommandation précédente:', error);
      return null;
    }
  }
  
  /**
   * Sauvegarde une recommandation dans l'historique de la base de données
   */
  private async saveRecommendation(recommendation: DifficultyRecommendation): Promise<void> {
    try {
      // Sauvegarder la recommandation dans le stockage
      await storage.createUserDifficultyRecommendation({
        userId: recommendation.userId,
        recommendedLevel: recommendation.recommendedLevel,
        recommendedCardCount: recommendation.recommendedCardCount,
        confidence: recommendation.confidence,
        factorsAnalysis: recommendation.factors,
        previousLevel: recommendation.previousLevel || null
      });
      
      console.log(`Recommandation générée pour l'utilisateur ${recommendation.userId}: ${recommendation.recommendedLevel}`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la recommandation:', error);
      // Ne pas relancer l'erreur, cela empêcherait la génération de la recommandation
    }
  }
  
  /**
   * Convertit un niveau de difficulté en texte descriptif
   */
  public static getDifficultyDescription(level: DifficultyLevel): string {
    switch (level) {
      case DifficultyLevel.BEGINNER:
        return "Débutant - Pour les nouveaux joueurs qui découvrent le bingo";
      case DifficultyLevel.EASY:
        return "Facile - Pour les joueurs qui se familiarisent avec les règles";
      case DifficultyLevel.MEDIUM:
        return "Intermédiaire - Pour les joueurs ayant une bonne compréhension du jeu";
      case DifficultyLevel.HARD:
        return "Difficile - Pour les joueurs expérimentés cherchant un défi";
      case DifficultyLevel.EXPERT:
        return "Expert - Pour les joueurs maîtrisant toutes les subtilités du bingo";
      default:
        return "Niveau inconnu";
    }
  }
}

// Exporter une instance unique du moteur
export const recommendationEngine = new RecommendationEngine();