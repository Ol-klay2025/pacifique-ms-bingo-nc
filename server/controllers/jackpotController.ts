import { storage } from '../storage';
import { Transaction } from '../../shared/schema';

/**
 * Contrôleur centralisant la gestion du jackpot
 */
export class JackpotController {
  /**
   * Minimum de numéros pour gagner le jackpot
   * Le jackpot est gagné si un bingo est complété en moins de ce nombre
   */
  static readonly JACKPOT_THRESHOLD = 40;

  /**
   * Pourcentage du prix total de chaque jeu qui est ajouté au jackpot
   */
  static readonly JACKPOT_CONTRIBUTION_PERCENTAGE = 0.1; // 10%

  /**
   * Montant minimum du jackpot (valeur en centimes)
   */
  static readonly MINIMUM_JACKPOT = 5000; // 50€

  /**
   * Obtient le montant actuel du jackpot
   */
  static async getCurrentJackpot() {
    const jackpot = await storage.getJackpot();
    return jackpot.amount;
  }

  /**
   * Vérifie si un gain de jackpot est possible pour un jeu
   * @param game Jeu en cours
   * @param callCount Nombre d'appels de numéros au moment du bingo
   */
  static isJackpotWinnable(callCount: number): boolean {
    return callCount < this.JACKPOT_THRESHOLD;
  }

  /**
   * Ajoute un montant au jackpot
   * @param amount Montant à ajouter (en centimes)
   */
  static async contributeToJackpot(amount: number) {
    const jackpot = await storage.getJackpot();
    const newAmount = jackpot.amount + amount;
    await storage.updateJackpot(newAmount);
    return newAmount;
  }

  /**
   * Réinitialise le jackpot après une victoire
   * @returns Le nouveau montant du jackpot (valeur minimale)
   */
  static async resetJackpot() {
    await storage.updateJackpot(this.MINIMUM_JACKPOT);
    return this.MINIMUM_JACKPOT;
  }

  /**
   * Ajoute la contribution de jackpot depuis un jeu
   * @param gameId ID du jeu
   * @param prizePool Cagnotte totale du jeu
   */
  static async contributeFromGame(gameId: number, prizePool: number) {
    const contributionAmount = Math.floor(prizePool * this.JACKPOT_CONTRIBUTION_PERCENTAGE);
    const newJackpot = await this.contributeToJackpot(contributionAmount);
    
    // Créer une transaction pour le système
    await storage.createTransaction({
      userId: 0, // 0 = système
      type: 'system',
      amount: contributionAmount,
      status: 'completed',
      description: `Contribution au jackpot depuis le jeu #${gameId} (${contributionAmount} centimes)`
    });
    
    return newJackpot;
  }

  /**
   * Attribue le jackpot à un gagnant
   * @param gameId ID du jeu
   * @param userId ID de l'utilisateur gagnant
   * @param jackpotAmount Montant du jackpot gagné
   */
  static async awardJackpotToWinner(gameId: number, userId: number, jackpotAmount: number) {
    // Mettre à jour le solde de l'utilisateur
    const user = await storage.getUserById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    await storage.updateUserBalance(userId, user.balance + jackpotAmount);
    
    // Créer une transaction pour la victoire
    await storage.createTransaction({
      userId,
      type: 'jackpot',
      amount: jackpotAmount,
      status: 'completed',
      description: `Jackpot gagné au jeu #${gameId} (${jackpotAmount} centimes)`
    });
    
    // Réinitialiser le jackpot au montant minimum
    await this.resetJackpot();
    
    return {
      userId,
      jackpotAmount,
      newJackpot: this.MINIMUM_JACKPOT
    };
  }

  /**
   * Obtient l'historique des jackpots gagnés
   * @param limit Nombre maximum de transactions à récupérer
   */
  static async getJackpotHistory(limit: number = 10): Promise<Transaction[]> {
    return await storage.getJackpotHistory(limit);
  }
}