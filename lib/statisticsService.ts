import { Game, Card, Transaction } from '../../shared/schema';
import { apiRequest } from './queryClient';

/**
 * Service responsable de l'analyse statistique des données de jeu
 */
export const statisticsService = {
  /**
   * Récupère toutes les statistiques de jeu d'un utilisateur
   */
  async getUserStatistics(userId: number) {
    const response = await apiRequest<any>('GET', `/api/statistics/user/${userId}`);
    return response.json();
  },

  /**
   * Calcule la fréquence d'apparition des numéros appelés
   * @param games Liste de jeux pour l'analyse
   * @returns Objet avec les fréquences d'apparition par numéro (1-90)
   */
  calculateNumberFrequency(games: Game[]): Record<number, number> {
    const numberCounts: Record<number, number> = {};
    
    // Initialiser tous les numéros à 0
    for (let i = 1; i <= 90; i++) {
      numberCounts[i] = 0;
    }
    
    // Compter les occurrences de chaque numéro
    games.forEach(game => {
      if (game.calledNumbers && game.calledNumbers.length > 0) {
        game.calledNumbers.forEach(num => {
          numberCounts[num]++;
        });
      }
    });
    
    return numberCounts;
  },
  
  /**
   * Calcule la fréquence d'apparition des numéros appelés en fonction de leur position
   * @param games Liste de jeux pour l'analyse
   * @param position Position dans la séquence (1 = premier numéro appelé, etc.)
   * @returns Objet avec les fréquences d'apparition par numéro pour cette position
   */
  calculateNumberFrequencyByPosition(games: Game[], position: number): Record<number, number> {
    const numberCounts: Record<number, number> = {};
    
    // Initialiser tous les numéros à 0
    for (let i = 1; i <= 90; i++) {
      numberCounts[i] = 0;
    }
    
    // Compter les occurrences de chaque numéro à la position spécifiée
    games.forEach(game => {
      if (game.calledNumbers && game.calledNumbers.length >= position) {
        const num = game.calledNumbers[position - 1];
        numberCounts[num]++;
      }
    });
    
    return numberCounts;
  },
  
  /**
   * Analyse le nombre moyen d'appels pour atteindre une quine ou un bingo
   * @param games Liste de jeux pour l'analyse
   * @returns Statistiques sur les appels moyens pour quine et bingo
   */
  calculateAverageCallsToWin(games: Game[]): { quine: number; bingo: number } {
    let quineCallsSum = 0;
    let quineGamesCount = 0;
    let bingoCallsSum = 0;
    let bingoGamesCount = 0;
    
    games.forEach(game => {
      if (game.quineNumberCount) {
        quineCallsSum += game.quineNumberCount;
        quineGamesCount++;
      }
      
      if (game.bingoNumberCount) {
        bingoCallsSum += game.bingoNumberCount;
        bingoGamesCount++;
      }
    });
    
    return {
      quine: quineGamesCount > 0 ? quineCallsSum / quineGamesCount : 0,
      bingo: bingoGamesCount > 0 ? bingoCallsSum / bingoGamesCount : 0
    };
  },
  
  /**
   * Analyse la progression des gains dans le temps
   * @param transactions Liste des transactions 
   * @returns Tableau de données formatées pour les graphiques
   */
  calculateWinningTrends(transactions: Transaction[]): Array<{ date: string; amount: number }> {
    const winningTransactions = transactions.filter(t => 
      t.type === 'win' && t.status === 'completed'
    );
    
    // Trier par date
    winningTransactions.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Formater pour les graphiques
    return winningTransactions.map(t => ({
      date: new Date(t.createdAt).toISOString().split('T')[0],
      amount: t.amount
    }));
  },
  
  /**
   * Calcule les zones chaudes et froides (numéros plus ou moins appelés)
   * @param numberFrequency Fréquence des numéros
   * @returns Listes des numéros chauds et froids
   */
  getHotColdNumbers(numberFrequency: Record<number, number>, limit: number = 10): { hot: number[]; cold: number[] } {
    const sortedEntries = Object.entries(numberFrequency)
      .map(([num, freq]) => ({ num: parseInt(num), freq }))
      .sort((a, b) => b.freq - a.freq);
    
    return {
      hot: sortedEntries.slice(0, limit).map(entry => entry.num),
      cold: sortedEntries.slice(-limit).map(entry => entry.num)
    };
  },
  
  /**
   * Analyse le taux de réussite des cartes pour un utilisateur
   * @param cards Cartes de l'utilisateur
   * @param games Liste de jeux
   * @returns Statistiques sur le taux de réussite
   */
  calculateCardSuccessRate(cards: Card[], games: Game[]): { 
    totalCards: number;
    quineWins: number;
    bingoWins: number;
    quineRate: number;
    bingoRate: number;
  } {
    const totalCards = cards.length;
    let quineWins = 0;
    let bingoWins = 0;
    
    // Créer une map de jeux pour recherche rapide
    const gamesMap = new Map<number, Game>();
    games.forEach(game => gamesMap.set(game.id, game));
    
    // Vérifier chaque carte
    cards.forEach(card => {
      const game = gamesMap.get(card.gameId);
      if (game) {
        if (game.quineWinnerId === card.userId) quineWins++;
        if (game.bingoWinnerId === card.userId) bingoWins++;
      }
    });
    
    return {
      totalCards,
      quineWins,
      bingoWins,
      quineRate: totalCards > 0 ? quineWins / totalCards : 0,
      bingoRate: totalCards > 0 ? bingoWins / totalCards : 0
    };
  },
  
  /**
   * Prédit les numéros qui ont une forte probabilité d'être appelés 
   * basé sur les modèles historiques
   * @param numberFrequency Fréquence des numéros
   * @param limit Nombre de prédictions à retourner
   * @returns Liste de numéros prédits
   */
  predictLikelyNumbers(numberFrequency: Record<number, number>, limit: number = 5): number[] {
    // Identifier les numéros qui sont dans la médiane de fréquence
    // La théorie étant que les numéros peu appelés ont plus de chances d'être appelés prochainement
    const frequencies = Object.values(numberFrequency);
    const medianFreq = this.calculateMedian(frequencies);
    
    // Trouver les numéros légèrement sous la médiane
    const candidates = Object.entries(numberFrequency)
      .map(([num, freq]) => ({ num: parseInt(num), freq }))
      .filter(entry => entry.freq < medianFreq && entry.freq > 0) // Numéros légèrement sous la médiane
      .sort((a, b) => a.freq - b.freq);
    
    // Retourner les prédictions
    return candidates.slice(0, limit).map(entry => entry.num);
  },
  
  /**
   * Analyse les patterns d'appel des numéros (numéros consécutifs, paires/impaires, etc.)
   * @param games Liste de jeux pour l'analyse
   * @returns Objet avec les statistiques des patterns
   */
  analyzeNumberPatterns(games: Game[]): {
    consecutivePatterns: { count: number; percentage: number };
    evenOddPatterns: { even: number; odd: number; percentage: { even: number; odd: number } };
    lowHighPatterns: { low: number; high: number; percentage: { low: number; high: number } };
  } {
    // Filtrer les jeux pour ne garder que ceux avec des numéros appelés
    const gamesWithNumbers = games.filter(game => 
      game.calledNumbers && game.calledNumbers.length > 0
    );
    
    if (gamesWithNumbers.length === 0) {
      return {
        consecutivePatterns: { count: 0, percentage: 0 },
        evenOddPatterns: { 
          even: 0, 
          odd: 0, 
          percentage: { even: 0, odd: 0 } 
        },
        lowHighPatterns: { 
          low: 0, 
          high: 0, 
          percentage: { low: 0, high: 0 } 
        }
      };
    }
    
    // Initialiser les compteurs de patterns
    let consecutiveCount = 0;
    let evenCount = 0;
    let oddCount = 0;
    let lowCount = 0;  // Numéros 1-45
    let highCount = 0; // Numéros 46-90
    
    // Analyser chaque jeu
    gamesWithNumbers.forEach(game => {
      const calledNumbers = game.calledNumbers || [];
      
      // Vérifier les numéros consécutifs
      for (let i = 0; i < calledNumbers.length - 1; i++) {
        if (Math.abs(calledNumbers[i] - calledNumbers[i + 1]) === 1) {
          consecutiveCount++;
        }
      }
      
      // Compter les pairs et impairs
      calledNumbers.forEach(num => {
        if (num % 2 === 0) {
          evenCount++;
        } else {
          oddCount++;
        }
        
        // Compter les bas et hauts
        if (num <= 45) {
          lowCount++;
        } else {
          highCount++;
        }
      });
    });
    
    // Calculer les totaux
    const totalNumbers = gamesWithNumbers.reduce(
      (sum, game) => sum + (game.calledNumbers?.length || 0), 0
    );
    
    // Calculer les pourcentages
    const consecutivePercentage = totalNumbers > 1 
      ? (consecutiveCount / (totalNumbers - gamesWithNumbers.length)) * 100 
      : 0;
    
    return {
      consecutivePatterns: {
        count: consecutiveCount,
        percentage: Number(consecutivePercentage.toFixed(1))
      },
      evenOddPatterns: {
        even: evenCount,
        odd: oddCount,
        percentage: {
          even: totalNumbers > 0 ? Number(((evenCount / totalNumbers) * 100).toFixed(1)) : 0,
          odd: totalNumbers > 0 ? Number(((oddCount / totalNumbers) * 100).toFixed(1)) : 0
        }
      },
      lowHighPatterns: {
        low: lowCount,
        high: highCount,
        percentage: {
          low: totalNumbers > 0 ? Number(((lowCount / totalNumbers) * 100).toFixed(1)) : 0,
          high: totalNumbers > 0 ? Number(((highCount / totalNumbers) * 100).toFixed(1)) : 0
        }
      }
    };
  },
  
  /**
   * Analyse les temps moyens entre les appels de numéros
   * @param games Liste de jeux pour l'analyse
   * @returns Objet avec les statistiques de temps
   */
  analyzeTimePatterns(games: Game[]): {
    averageGameDuration: number;
    averageTimeBetweenCalls: number;
    quineTimePercentage: number;
    bingoTimePercentage: number;
  } {
    // Filtrer les jeux terminés avec des données temporelles
    const completedGames = games.filter(game => 
      game.status === 'completed' && game.startTime && game.endTime
    );
    
    if (completedGames.length === 0) {
      return {
        averageGameDuration: 0,
        averageTimeBetweenCalls: 0,
        quineTimePercentage: 0,
        bingoTimePercentage: 0
      };
    }
    
    // Calculer les durées moyennes
    let totalDuration = 0;
    let totalQuineTime = 0;
    let totalBingoTime = 0;
    let gamesWithQuine = 0;
    let gamesWithBingo = 0;
    
    completedGames.forEach(game => {
      const startTime = new Date(game.startTime).getTime();
      const endTime = new Date(game.endTime!).getTime();
      const duration = (endTime - startTime) / 60000; // Durée en minutes
      
      totalDuration += duration;
      
      // Estimer le temps pour la quine (basé sur le nombre d'appels)
      if (game.quineNumberCount) {
        const quineTime = duration * (game.quineNumberCount / (game.calledNumbers?.length || 1));
        totalQuineTime += quineTime;
        gamesWithQuine++;
      }
      
      // Estimer le temps pour le bingo (durée totale si le bingo a été atteint)
      if (game.bingoNumberCount) {
        totalBingoTime += duration;
        gamesWithBingo++;
      }
    });
    
    const averageGameDuration = totalDuration / completedGames.length;
    const averageTimeBetweenCalls = averageGameDuration / 
      (completedGames.reduce((sum, game) => sum + (game.calledNumbers?.length || 0), 0) / completedGames.length);
    
    const averageQuineTime = gamesWithQuine > 0 ? totalQuineTime / gamesWithQuine : 0;
    const averageBingoTime = gamesWithBingo > 0 ? totalBingoTime / gamesWithBingo : 0;
    
    return {
      averageGameDuration: Number(averageGameDuration.toFixed(1)),
      averageTimeBetweenCalls: Number(averageTimeBetweenCalls.toFixed(1)),
      quineTimePercentage: averageGameDuration > 0 
        ? Number(((averageQuineTime / averageGameDuration) * 100).toFixed(1)) 
        : 0,
      bingoTimePercentage: averageGameDuration > 0 
        ? Number(((averageBingoTime / averageGameDuration) * 100).toFixed(1)) 
        : 0
    };
  },
  
  /**
   * Analyse la distribution des numéros dans les différentes dizaines (1-10, 11-20, etc.)
   * @param frequencyData Fréquences des numéros
   * @returns Objet avec les statistiques par dizaine
   */
  analyzeNumberDistribution(frequencyData: Record<number, number>): Record<string, { 
    count: number, 
    average: number,
    percentage: number
  }> {
    const distribution: Record<string, { count: number, sum: number }> = {};
    
    // Initialiser les tranches de 10
    for (let i = 0; i < 9; i++) {
      const start = i * 10 + 1;
      const end = Math.min((i + 1) * 10, 90);
      distribution[`${start}-${end}`] = { count: 0, sum: 0 };
    }
    
    // Compter les occurrences dans chaque tranche
    Object.entries(frequencyData).forEach(([numStr, freq]) => {
      const num = parseInt(numStr);
      const decile = Math.floor((num - 1) / 10);
      const start = decile * 10 + 1;
      const end = Math.min((decile + 1) * 10, 90);
      
      distribution[`${start}-${end}`].count++;
      distribution[`${start}-${end}`].sum += freq;
    });
    
    // Calculer les totaux
    const totalOccurrences = Object.values(frequencyData).reduce((sum, freq) => sum + freq, 0);
    
    // Calculer les moyennes et pourcentages
    const result: Record<string, { count: number, average: number, percentage: number }> = {};
    
    Object.entries(distribution).forEach(([range, data]) => {
      result[range] = {
        count: data.sum,
        average: data.count > 0 ? Number((data.sum / data.count).toFixed(1)) : 0,
        percentage: totalOccurrences > 0 
          ? Number(((data.sum / totalOccurrences) * 100).toFixed(1)) 
          : 0
      };
    });
    
    return result;
  },
  
  /**
   * Calcule la médiane d'un tableau de nombres
   */
  calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  },
  
  /**
   * Analyse les paires de numéros qui apparaissent souvent ensemble
   * @param games Liste de jeux pour l'analyse
   * @returns Paires de numéros les plus fréquentes
   */
  analyzeNumberPairs(games: Game[], limit: number = 10): Array<{ 
    pair: [number, number];
    count: number;
    percentage: number;
  }> {
    const pairCounts: Record<string, number> = {};
    let totalPairs = 0;
    
    // Analyser chaque jeu
    games.forEach(game => {
      const calledNumbers = game.calledNumbers || [];
      
      // Vérifier toutes les paires possibles
      for (let i = 0; i < calledNumbers.length; i++) {
        for (let j = i + 1; j < calledNumbers.length; j++) {
          const pair = [calledNumbers[i], calledNumbers[j]].sort((a, b) => a - b);
          const pairKey = `${pair[0]}-${pair[1]}`;
          
          pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1;
          totalPairs++;
        }
      }
    });
    
    // Trier et limiter les résultats
    const sortedPairs = Object.entries(pairCounts)
      .map(([pairKey, count]) => {
        const [num1, num2] = pairKey.split('-').map(n => parseInt(n));
        return {
          pair: [num1, num2] as [number, number],
          count,
          percentage: totalPairs > 0 ? (count / totalPairs) * 100 : 0
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return sortedPairs;
  }
};