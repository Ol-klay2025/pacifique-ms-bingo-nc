/**
 * MS BINGO - Module d'analyse statistique
 * 
 * Ce module offre des fonctionnalités avancées pour analyser les habitudes de jeu:
 * - Suivi des numéros les plus/moins fréquemment tirés
 * - Analyse des temps moyens entre les tirages
 * - Suivi des performances des joueurs (taux de victoire, temps de réaction)
 * - Visualisation des données avec des graphiques
 * - Recommandations basées sur les tendances historiques
 */

class StatisticsAnalyzer {
  constructor() {
    // Données persistantes (stockées dans localStorage)
    this.data = {
      // Statistiques des numéros tirés (fréquence par colonne)
      numbers: {
        B: Array(15).fill(0), // B1-B15
        I: Array(15).fill(0), // I16-I30
        N: Array(15).fill(0), // N31-N45
        G: Array(15).fill(0), // G46-G60
        O: Array(15).fill(0)  // O61-O75
      },
      
      // Historique des dernières parties
      gameHistory: [],
      
      // Performance du joueur
      playerStats: {
        gamesPlayed: 0,
        gamesWon: 0,
        quinesAchieved: 0,
        bingosAchieved: 0,
        avgTimeToQuine: 0,
        avgTimeToBingo: 0,
        totalWinnings: 0
      },
      
      // Tendances des tirages
      drawingPatterns: {
        avgTimeBetweenDraws: 0,
        consecutiveColumns: {}, // Suivi des séquences de tirages consécutifs dans la même colonne
        hotNumbers: [],         // Numéros tirés fréquemment récemment
        coldNumbers: []         // Numéros rarement tirés récemment
      },
      
      // Jackpot et gains
      jackpotHistory: [],
      
      // Statistiques globales du jeu
      globalStats: {
        totalGamesPlayed: 0,
        averagePlayersPerGame: 0,
        mostActiveTimes: {
          dayOfWeek: [0, 0, 0, 0, 0, 0, 0], // Dimanche à Samedi
          hourOfDay: Array(24).fill(0)      // 0-23h
        }
      }
    };
    
    // Charger les données existantes
    this.loadData();
    
    // Variables de session
    this.currentGameStartTime = null;
    this.currentGameDrawnNumbers = [];
    this.quineTime = null;
    this.bingoTime = null;
    this.isRecording = false;
    
    // Configurer les événements
    this.setupEventListeners();
  }
  
  /**
   * Charge les données sauvegardées
   */
  loadData() {
    try {
      const savedData = localStorage.getItem('msBingoStats');
      if (savedData) {
        this.data = JSON.parse(savedData);
        console.log('MS BINGO: Statistiques chargées');
      } else {
        console.log('MS BINGO: Aucune statistique sauvegardée trouvée');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  }
  
  /**
   * Sauvegarde les données
   */
  saveData() {
    try {
      localStorage.setItem('msBingoStats', JSON.stringify(this.data));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des statistiques:', error);
    }
  }
  
  /**
   * Configure les écouteurs d'événements
   */
  setupEventListeners() {
    // Démarrage d'une partie
    document.addEventListener('gameStarted', () => {
      if (!this.isRecording) return;
      
      this.currentGameStartTime = Date.now();
      this.currentGameDrawnNumbers = [];
      this.quineTime = null;
      this.bingoTime = null;
      
      // Mettre à jour les statistiques globales
      this.data.globalStats.totalGamesPlayed++;
      
      // Mettre à jour l'activité par jour et heure
      const now = new Date();
      this.data.globalStats.mostActiveTimes.dayOfWeek[now.getDay()]++;
      this.data.globalStats.mostActiveTimes.hourOfDay[now.getHours()]++;
      
      console.log('MS BINGO Stats: Nouvelle partie commencée');
    });
    
    // Tirage d'un numéro
    document.addEventListener('numberDrawn', (e) => {
      if (!this.isRecording) return;
      
      const { number, column } = e.detail;
      this.recordDrawnNumber(number, column);
    });
    
    // Quine réalisée
    document.addEventListener('quine-achieved', (e) => {
      if (!this.isRecording || !this.currentGameStartTime) return;
      
      this.quineTime = Date.now() - this.currentGameStartTime;
      this.data.playerStats.quinesAchieved++;
      
      // Mettre à jour le temps moyen pour obtenir une quine
      this.updateAverageTime('quine', this.quineTime);
      
      console.log('MS BINGO Stats: Quine réalisée en', this.formatTime(this.quineTime));
    });
    
    // Bingo réalisé
    document.addEventListener('bingo-achieved', (e) => {
      if (!this.isRecording || !this.currentGameStartTime) return;
      
      this.bingoTime = Date.now() - this.currentGameStartTime;
      this.data.playerStats.bingosAchieved++;
      this.data.playerStats.gamesWon++;
      
      // Mettre à jour le temps moyen pour obtenir un bingo
      this.updateAverageTime('bingo', this.bingoTime);
      
      // Enregistrer l'historique de la partie
      this.recordGameHistory();
      
      console.log('MS BINGO Stats: Bingo réalisé en', this.formatTime(this.bingoTime));
    });
    
    // Fin de partie (qu'il y ait victoire ou non)
    document.addEventListener('gameEnded', () => {
      if (!this.isRecording) return;
      
      // Incrémenter le nombre de parties jouées
      this.data.playerStats.gamesPlayed++;
      
      // Si la partie s'est terminée sans bingo pour ce joueur, enregistrer quand même les données
      if (!this.bingoTime) {
        this.recordGameHistory(false);
      }
      
      // Sauvegarde des données
      this.saveData();
      
      console.log('MS BINGO Stats: Partie terminée et statistiques sauvegardées');
    });
    
    // Gains du joueur
    document.addEventListener('winningsUpdated', (e) => {
      if (!this.isRecording) return;
      
      const { amount, type } = e.detail; // type peut être 'quine', 'bingo' ou 'jackpot'
      this.data.playerStats.totalWinnings += amount;
      
      if (type === 'jackpot') {
        this.data.jackpotHistory.push({
          amount,
          date: new Date().toISOString(),
          drawCount: this.currentGameDrawnNumbers.length
        });
      }
      
      console.log(`MS BINGO Stats: Gain de ${amount/100}€ (${type})`);
    });
  }
  
  /**
   * Démarre l'enregistrement des statistiques
   */
  startRecording() {
    this.isRecording = true;
    console.log('MS BINGO Stats: Enregistrement des statistiques démarré');
  }
  
  /**
   * Arrête l'enregistrement des statistiques
   */
  stopRecording() {
    this.isRecording = false;
    console.log('MS BINGO Stats: Enregistrement des statistiques arrêté');
  }
  
  /**
   * Enregistre un numéro tiré
   * @param {number} number Le numéro tiré
   * @param {number} columnIndex L'index de la colonne (1-5 pour B-I-N-G-O)
   */
  recordDrawnNumber(number, columnIndex) {
    if (!this.currentGameDrawnNumbers.includes(number)) {
      this.currentGameDrawnNumbers.push(number);
      
      // Déterminer la colonne
      const columnLetter = ['B', 'I', 'N', 'G', 'O'][columnIndex - 1];
      const indexInColumn = number - (15 * (columnIndex - 1) + 1);
      
      // Incrémenter la fréquence du numéro
      if (this.data.numbers[columnLetter] && indexInColumn >= 0 && indexInColumn < 15) {
        this.data.numbers[columnLetter][indexInColumn]++;
      }
      
      // Analyser les tendances des tirages
      this.analyzeDrawingPatterns(number, columnLetter);
    }
  }
  
  /**
   * Analyse les tendances des tirages
   * @param {number} number Le numéro tiré
   * @param {string} column La colonne (B, I, N, G, O)
   */
  analyzeDrawingPatterns(number, column) {
    // Suivre les colonnes consécutives
    const lastDrawPattern = this.data.drawingPatterns.lastColumn || '';
    if (lastDrawPattern === column) {
      const consecutiveCount = (this.data.drawingPatterns.consecutiveColumns[column] || 0) + 1;
      this.data.drawingPatterns.consecutiveColumns[column] = consecutiveCount;
    } else {
      this.data.drawingPatterns.consecutiveColumns[column] = 1;
    }
    this.data.drawingPatterns.lastColumn = column;
    
    // Mettre à jour la liste des numéros "chauds" et "froids"
    this.updateHotColdNumbers();
  }
  
  /**
   * Met à jour les listes des numéros "chauds" et "froids"
   */
  updateHotColdNumbers() {
    const allFrequencies = [];
    
    // Collecter toutes les fréquences
    for (const column in this.data.numbers) {
      this.data.numbers[column].forEach((frequency, index) => {
        const actualNumber = this.getActualNumberFromColumnAndIndex(column, index);
        allFrequencies.push({ number: actualNumber, frequency });
      });
    }
    
    // Trier par fréquence
    allFrequencies.sort((a, b) => b.frequency - a.frequency);
    
    // Les 10 numéros les plus tirés
    this.data.drawingPatterns.hotNumbers = allFrequencies.slice(0, 10).map(item => item.number);
    
    // Les 10 numéros les moins tirés
    this.data.drawingPatterns.coldNumbers = allFrequencies.slice(-10).map(item => item.number);
  }
  
  /**
   * Convertit une colonne et un index en numéro réel
   * @param {string} column La colonne (B, I, N, G, O)
   * @param {number} index L'index dans la colonne (0-14)
   * @returns {number} Le numéro réel
   */
  getActualNumberFromColumnAndIndex(column, index) {
    const columnIndex = 'BINGO'.indexOf(column);
    return (columnIndex * 15) + index + 1;
  }
  
  /**
   * Met à jour le temps moyen pour une quine ou un bingo
   * @param {string} type 'quine' ou 'bingo'
   * @param {number} time Le temps en millisecondes
   */
  updateAverageTime(type, time) {
    const statsKey = type === 'quine' ? 'avgTimeToQuine' : 'avgTimeToBingo';
    const countKey = type === 'quine' ? 'quinesAchieved' : 'bingosAchieved';
    
    // Calculer la nouvelle moyenne
    const count = this.data.playerStats[countKey];
    const currentAvg = this.data.playerStats[statsKey];
    
    if (count === 1) {
      // Première fois
      this.data.playerStats[statsKey] = time;
    } else {
      // Mise à jour de la moyenne
      const newAvg = ((currentAvg * (count - 1)) + time) / count;
      this.data.playerStats[statsKey] = newAvg;
    }
  }
  
  /**
   * Enregistre les données de la partie actuelle dans l'historique
   * @param {boolean} won Indique si la partie a été gagnée
   */
  recordGameHistory(won = true) {
    // Limiter l'historique aux 50 dernières parties
    if (this.data.gameHistory.length >= 50) {
      this.data.gameHistory.shift(); // Supprimer la plus ancienne
    }
    
    this.data.gameHistory.push({
      date: new Date().toISOString(),
      duration: this.bingoTime || (Date.now() - this.currentGameStartTime),
      quineTime: this.quineTime,
      numbersDrawn: this.currentGameDrawnNumbers.length,
      won: won
    });
  }
  
  /**
   * Obtient les statistiques pour l'affichage
   * @returns {Object} Les statistiques formatées
   */
  getDisplayStats() {
    // Calculer des statistiques dérivées
    const winRate = this.data.playerStats.gamesPlayed > 0 
      ? (this.data.playerStats.gamesWon / this.data.playerStats.gamesPlayed * 100).toFixed(1) 
      : 0;
    
    const quineRate = this.data.playerStats.gamesPlayed > 0 
      ? (this.data.playerStats.quinesAchieved / this.data.playerStats.gamesPlayed * 100).toFixed(1) 
      : 0;
    
    // Trouver le jour le plus actif
    const mostActiveDay = this.data.globalStats.mostActiveTimes.dayOfWeek.indexOf(
      Math.max(...this.data.globalStats.mostActiveTimes.dayOfWeek)
    );
    
    // Trouver l'heure la plus active
    const mostActiveHour = this.data.globalStats.mostActiveTimes.hourOfDay.indexOf(
      Math.max(...this.data.globalStats.mostActiveTimes.hourOfDay)
    );
    
    // Formater les temps moyens
    const avgQuineTime = this.formatTime(this.data.playerStats.avgTimeToQuine);
    const avgBingoTime = this.formatTime(this.data.playerStats.avgTimeToBingo);
    
    return {
      player: {
        gamesPlayed: this.data.playerStats.gamesPlayed,
        gamesWon: this.data.playerStats.gamesWon,
        winRate: `${winRate}%`,
        quinesAchieved: this.data.playerStats.quinesAchieved,
        quineRate: `${quineRate}%`,
        avgTimeToQuine: avgQuineTime,
        avgTimeToBingo: avgBingoTime,
        totalWinnings: (this.data.playerStats.totalWinnings / 100).toFixed(2) + '€'
      },
      numbers: {
        mostDrawn: this.getTopNumbers(10),
        leastDrawn: this.getBottomNumbers(10),
        hotNumbers: this.data.drawingPatterns.hotNumbers,
        coldNumbers: this.data.drawingPatterns.coldNumbers
      },
      patterns: {
        mostFrequentColumn: this.getMostFrequentColumn(),
        leastFrequentColumn: this.getLeastFrequentColumn(),
        mostConsecutiveDraws: this.getMostConsecutiveDraws()
      },
      activity: {
        mostActiveDay: this.getDayName(mostActiveDay),
        mostActiveHour: `${mostActiveHour}:00`,
        recentGames: this.getRecentGames(5)
      }
    };
  }
  
  /**
   * Obtient les numéros les plus fréquemment tirés
   * @param {number} count Nombre de numéros à retourner
   * @returns {Array} Les numéros les plus fréquents avec leur fréquence
   */
  getTopNumbers(count = 10) {
    const allNumbers = this.getAllNumbersWithFrequency();
    allNumbers.sort((a, b) => b.frequency - a.frequency);
    return allNumbers.slice(0, count);
  }
  
  /**
   * Obtient les numéros les moins fréquemment tirés
   * @param {number} count Nombre de numéros à retourner
   * @returns {Array} Les numéros les moins fréquents avec leur fréquence
   */
  getBottomNumbers(count = 10) {
    const allNumbers = this.getAllNumbersWithFrequency();
    allNumbers.sort((a, b) => a.frequency - b.frequency);
    return allNumbers.slice(0, count);
  }
  
  /**
   * Collecte tous les numéros avec leur fréquence
   * @returns {Array} Tous les numéros avec leur fréquence
   */
  getAllNumbersWithFrequency() {
    const result = [];
    const columns = ['B', 'I', 'N', 'G', 'O'];
    
    columns.forEach((column, colIndex) => {
      this.data.numbers[column].forEach((frequency, index) => {
        const number = (colIndex * 15) + index + 1;
        result.push({
          number,
          column,
          frequency
        });
      });
    });
    
    return result;
  }
  
  /**
   * Obtient la colonne la plus fréquemment tirée
   * @returns {Object} La colonne et sa fréquence
   */
  getMostFrequentColumn() {
    const columns = ['B', 'I', 'N', 'G', 'O'];
    const columnTotals = columns.map(column => {
      return {
        column,
        total: this.data.numbers[column].reduce((sum, freq) => sum + freq, 0)
      };
    });
    
    columnTotals.sort((a, b) => b.total - a.total);
    return columnTotals[0];
  }
  
  /**
   * Obtient la colonne la moins fréquemment tirée
   * @returns {Object} La colonne et sa fréquence
   */
  getLeastFrequentColumn() {
    const columns = ['B', 'I', 'N', 'G', 'O'];
    const columnTotals = columns.map(column => {
      return {
        column,
        total: this.data.numbers[column].reduce((sum, freq) => sum + freq, 0)
      };
    });
    
    columnTotals.sort((a, b) => a.total - b.total);
    return columnTotals[0];
  }
  
  /**
   * Obtient le nombre maximum de tirages consécutifs dans une même colonne
   * @returns {Object} La colonne et le nombre de tirages consécutifs
   */
  getMostConsecutiveDraws() {
    const columns = ['B', 'I', 'N', 'G', 'O'];
    let maxColumn = '';
    let maxCount = 0;
    
    columns.forEach(column => {
      const count = this.data.drawingPatterns.consecutiveColumns[column] || 0;
      if (count > maxCount) {
        maxCount = count;
        maxColumn = column;
      }
    });
    
    return { column: maxColumn, count: maxCount };
  }
  
  /**
   * Obtient les parties récentes
   * @param {number} count Nombre de parties à retourner
   * @returns {Array} Les parties récentes
   */
  getRecentGames(count = 5) {
    return this.data.gameHistory
      .slice(-count)
      .map(game => {
        return {
          date: new Date(game.date).toLocaleDateString(),
          duration: this.formatTime(game.duration),
          quineTime: game.quineTime ? this.formatTime(game.quineTime) : 'N/A',
          numbersDrawn: game.numbersDrawn,
          won: game.won
        };
      })
      .reverse(); // Plus récent en premier
  }
  
  /**
   * Convertit un index de jour en nom de jour
   * @param {number} dayIndex Index du jour (0-6)
   * @returns {string} Nom du jour
   */
  getDayName(dayIndex) {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[dayIndex];
  }
  
  /**
   * Formate un temps en millisecondes en chaîne lisible
   * @param {number} ms Temps en millisecondes
   * @returns {string} Temps formaté
   */
  formatTime(ms) {
    if (!ms) return '0:00';
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Génère des recommandations basées sur les statistiques
   * @returns {Object} Recommandations pour le joueur
   */
  generateRecommendations() {
    const recommendations = {
      cards: [],
      timing: '',
      strategy: ''
    };
    
    // Recommandations sur les cartes
    if (this.data.drawingPatterns.hotNumbers.length > 0) {
      recommendations.cards.push({
        type: 'hot',
        message: 'Essayez des cartes contenant ces numéros fréquemment tirés:',
        numbers: this.data.drawingPatterns.hotNumbers.slice(0, 5)
      });
    }
    
    if (this.data.drawingPatterns.coldNumbers.length > 0) {
      recommendations.cards.push({
        type: 'cold',
        message: 'Ces numéros sont rarement tirés, mais pourraient être "dus":',
        numbers: this.data.drawingPatterns.coldNumbers.slice(0, 5)
      });
    }
    
    // Recommandations sur le moment de jeu
    const mostActiveDay = this.data.globalStats.mostActiveTimes.dayOfWeek.indexOf(
      Math.max(...this.data.globalStats.mostActiveTimes.dayOfWeek)
    );
    
    const mostActiveHour = this.data.globalStats.mostActiveTimes.hourOfDay.indexOf(
      Math.max(...this.data.globalStats.mostActiveTimes.hourOfDay)
    );
    
    if (mostActiveDay >= 0 && mostActiveHour >= 0) {
      recommendations.timing = `Vos parties les plus actives sont ${this.getDayName(mostActiveDay)} à ${mostActiveHour}h. `;
      
      // Ajouter une recommandation supplémentaire
      if (this.data.playerStats.gamesWon > 0) {
        const recentWinningGames = this.data.gameHistory
          .filter(game => game.won)
          .slice(-5);
        
        if (recentWinningGames.length > 0) {
          const winningDays = recentWinningGames.map(game => new Date(game.date).getDay());
          const mostCommonWinningDay = this.getMostCommonValue(winningDays);
          
          if (mostCommonWinningDay !== null) {
            recommendations.timing += `Vous avez tendance à gagner plus souvent ${this.getDayName(mostCommonWinningDay)}.`;
          }
        }
      }
    }
    
    // Recommandations stratégiques
    const quineRate = this.data.playerStats.gamesPlayed > 0 
      ? (this.data.playerStats.quinesAchieved / this.data.playerStats.gamesPlayed) 
      : 0;
    
    const winRate = this.data.playerStats.gamesPlayed > 0 
      ? (this.data.playerStats.gamesWon / this.data.playerStats.gamesPlayed) 
      : 0;
    
    if (quineRate > 0.5 && winRate < 0.2) {
      recommendations.strategy = "Vous obtenez souvent des quines mais peu de bingos. Essayez de jouer avec plus de cartes pour augmenter vos chances de bingo.";
    } else if (quineRate < 0.2) {
      recommendations.strategy = "Vous pourriez améliorer votre taux de quines en choisissant des cartes avec une meilleure répartition des numéros entre les colonnes.";
    } else if (winRate > 0.3) {
      recommendations.strategy = "Excellent taux de victoire! Continuez avec votre stratégie actuelle qui semble bien fonctionner.";
    }
    
    return recommendations;
  }
  
  /**
   * Trouve la valeur la plus fréquente dans un tableau
   * @param {Array} arr Le tableau à analyser
   * @returns {*} La valeur la plus fréquente, ou null si le tableau est vide
   */
  getMostCommonValue(arr) {
    if (!arr.length) return null;
    
    const counts = {};
    let maxCount = 0;
    let maxValue = null;
    
    for (const value of arr) {
      counts[value] = (counts[value] || 0) + 1;
      if (counts[value] > maxCount) {
        maxCount = counts[value];
        maxValue = value;
      }
    }
    
    return maxValue;
  }
  
  /**
   * Réinitialise toutes les statistiques
   */
  resetAllStats() {
    // Créer une nouvelle instance vide
    this.data = {
      numbers: {
        B: Array(15).fill(0),
        I: Array(15).fill(0),
        N: Array(15).fill(0),
        G: Array(15).fill(0),
        O: Array(15).fill(0)
      },
      gameHistory: [],
      playerStats: {
        gamesPlayed: 0,
        gamesWon: 0,
        quinesAchieved: 0,
        bingosAchieved: 0,
        avgTimeToQuine: 0,
        avgTimeToBingo: 0,
        totalWinnings: 0
      },
      drawingPatterns: {
        avgTimeBetweenDraws: 0,
        consecutiveColumns: {},
        hotNumbers: [],
        coldNumbers: []
      },
      jackpotHistory: [],
      globalStats: {
        totalGamesPlayed: 0,
        averagePlayersPerGame: 0,
        mostActiveTimes: {
          dayOfWeek: [0, 0, 0, 0, 0, 0, 0],
          hourOfDay: Array(24).fill(0)
        }
      }
    };
    
    // Sauvegarder les données réinitialisées
    this.saveData();
    console.log('MS BINGO Stats: Statistiques réinitialisées');
  }
}

// Créer l'instance et l'exposer globalement
window.msBingoStats = new StatisticsAnalyzer();
window.msBingoStats.startRecording();

console.log('MS BINGO: Module d\'analyse statistique chargé');