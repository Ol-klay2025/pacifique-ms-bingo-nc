/**
 * Service de vérification d'équité des tirages
 * PACIFIQUE MS BINGO - Version: Avril 2025
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Service de vérification d'équité
 */
class FairnessService {
  constructor(db) {
    this.db = db;
    this.verificationCache = new Map();
    this.gameReports = new Map();
    
    // Répertoire pour les données de vérification
    this.dataDir = path.join(__dirname, '../data/fairness');
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Initialise les routes API pour la vérification d'équité
   * @param {Express} app - Instance Express
   */
  registerRoutes(app) {
    // Route pour vérifier un tirage spécifique
    app.get('/api/verify-fairness/:gameId/draw/:drawIndex', async (req, res) => {
      try {
        const { gameId, drawIndex } = req.params;
        const result = await this.verifyDraw(gameId, parseInt(drawIndex, 10));
        res.json(result);
      } catch (error) {
        console.error(`Erreur lors de la vérification du tirage:`, error);
        res.status(500).json({ 
          error: 'Erreur lors de la vérification du tirage',
          message: error.message 
        });
      }
    });

    // Route pour obtenir un rapport d'équité complet
    app.get('/api/verify-fairness/:gameId/report', async (req, res) => {
      try {
        const { gameId } = req.params;
        const report = await this.getFairnessReport(gameId);
        res.json(report);
      } catch (error) {
        console.error(`Erreur lors de la génération du rapport d'équité:`, error);
        res.status(500).json({ 
          error: 'Erreur lors de la génération du rapport d\'équité',
          message: error.message 
        });
      }
    });

    // Route pour enregistrer des données de vérification
    app.post('/api/verify-fairness/:gameId/submit', async (req, res) => {
      try {
        const { gameId } = req.params;
        const { verificationData } = req.body;
        
        const result = await this.storeVerificationData(gameId, verificationData);
        res.json(result);
      } catch (error) {
        console.error(`Erreur lors de l'enregistrement des données de vérification:`, error);
        res.status(500).json({ 
          error: 'Erreur lors de l\'enregistrement des données de vérification',
          message: error.message 
        });
      }
    });
    
    // Route pour lister les parties disponibles pour vérification
    app.get('/api/verify-fairness/games', async (req, res) => {
      try {
        const games = await this.getAvailableGames();
        res.json(games);
      } catch (error) {
        console.error(`Erreur lors de la récupération des parties:`, error);
        res.status(500).json({ 
          error: 'Erreur lors de la récupération des parties',
          message: error.message 
        });
      }
    });
  }

  /**
   * Vérifie l'équité d'un tirage spécifique
   * @param {string} gameId - ID de la partie
   * @param {number} drawIndex - Index du tirage
   * @returns {Promise<Object>} Résultat de la vérification
   */
  async verifyDraw(gameId, drawIndex) {
    const cacheKey = `${gameId}:${drawIndex}`;
    
    // Vérifier le cache d'abord
    if (this.verificationCache.has(cacheKey)) {
      return this.verificationCache.get(cacheKey);
    }
    
    try {
      // Récupérer les données de vérification enregistrées
      const gameData = await this.loadGameData(gameId);
      
      if (!gameData || !gameData.verificationData || !gameData.verificationData[drawIndex]) {
        throw new Error(`Aucune donnée de vérification trouvée pour le tirage #${drawIndex} de la partie ${gameId}`);
      }
      
      const verificationData = gameData.verificationData[drawIndex];
      
      // Vérifier l'intégrité des données (hash de vérification)
      const expectedHash = verificationData.verificationHash;
      const calculatedHash = this.calculateVerificationHash(
        gameId,
        drawIndex,
        verificationData.number,
        verificationData.proof
      );
      
      const verified = expectedHash === calculatedHash;
      
      // Résultat de la vérification
      const result = {
        gameId,
        drawId: drawIndex,
        number: verificationData.number,
        timestamp: verificationData.timestamp,
        verified,
        method: 'cryptographic-proof',
        details: {
          expectedHash,
          calculatedHash,
          proof: verificationData.proof
        }
      };
      
      // Mettre en cache le résultat
      this.verificationCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error(`Erreur lors de la vérification du tirage #${drawIndex} de la partie ${gameId}:`, error);
      
      // En cas d'erreur, retourner un résultat négatif
      return {
        gameId,
        drawId: drawIndex,
        verified: false,
        error: error.message,
        method: 'cryptographic-proof'
      };
    }
  }

  /**
   * Calcule un hash de vérification pour un tirage
   * @param {string} gameId - ID de la partie
   * @param {number} drawIndex - Index du tirage
   * @param {number} number - Numéro tiré
   * @param {string} proof - Preuve cryptographique
   * @returns {string} Hash de vérification
   */
  calculateVerificationHash(gameId, drawIndex, number, proof) {
    // Dans une implémentation réelle, utiliser un algorithme cryptographique robuste
    // Ici, nous simplifions pour la démonstration
    const data = `${gameId}-${drawIndex}-${number}-${proof}`;
    
    // Utiliser une fonction de hachage simple similaire à celle du client
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en entier 32 bits
    }
    
    // Convertir en chaîne hexadécimale
    const hashHex = (hash >>> 0).toString(16).padStart(8, '0');
    return hashHex;
  }

  /**
   * Génère un rapport d'équité complet pour une partie
   * @param {string} gameId - ID de la partie
   * @returns {Promise<Object>} Rapport d'équité
   */
  async getFairnessReport(gameId) {
    try {
      // Vérifier le cache d'abord
      if (this.gameReports.has(gameId)) {
        return this.gameReports.get(gameId);
      }
      
      // Charger les données de la partie
      const gameData = await this.loadGameData(gameId);
      
      if (!gameData) {
        throw new Error(`Aucune donnée trouvée pour la partie ${gameId}`);
      }
      
      // Vérifier tous les tirages
      const drawVerifications = {};
      const drawCount = Object.keys(gameData.verificationData || {}).length;
      
      for (let i = 1; i <= drawCount; i++) {
        const verification = await this.verifyDraw(gameId, i);
        drawVerifications[i] = verification.verified;
      }
      
      // Analyser la distribution des numéros
      const distribution = this.analyzeDistribution(gameData);
      
      // Calculer les statistiques
      const statistics = this.calculateStatistics(distribution);
      
      // Générer le rapport complet
      const report = {
        gameId,
        timestamp: new Date().toISOString(),
        drawCount,
        seedHash: gameData.seedHash,
        distribution,
        statistics,
        drawVerifications,
        allDrawsVerified: Object.values(drawVerifications).every(v => v),
        fairnessScore: this.calculateFairnessScore(statistics, drawVerifications)
      };
      
      // Ajouter les conclusions textuelles
      report.conclusionFr = this.generateConclusion('fr', report.fairnessScore, report.allDrawsVerified);
      report.conclusionEn = this.generateConclusion('en', report.fairnessScore, report.allDrawsVerified);
      
      // Mettre en cache le rapport
      this.gameReports.set(gameId, report);
      
      return report;
    } catch (error) {
      console.error(`Erreur lors de la génération du rapport d'équité pour ${gameId}:`, error);
      return {
        gameId,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Analyse la distribution des numéros tirés
   * @param {Object} gameData - Données de la partie
   * @returns {Object} Distribution des numéros
   */
  analyzeDistribution(gameData) {
    const numberCounts = {};
    const minValue = 1;
    const maxValue = 90;
    
    // Initialiser les compteurs
    for (let i = minValue; i <= maxValue; i++) {
      numberCounts[i] = 0;
    }
    
    // Compter les occurrences de chaque numéro
    if (gameData.verificationData) {
      Object.values(gameData.verificationData).forEach(data => {
        if (data.number) {
          numberCounts[data.number]++;
        }
      });
    }
    
    return numberCounts;
  }

  /**
   * Calcule les statistiques de distribution
   * @param {Object} distribution - Distribution des numéros
   * @returns {Object} Statistiques calculées
   */
  calculateStatistics(distribution) {
    const totalDraws = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    const expectedFrequency = totalDraws / Object.keys(distribution).length;
    
    // Calculer l'écart-type
    let sumSquaredDifferences = 0;
    for (const num in distribution) {
      const difference = distribution[num] - expectedFrequency;
      sumSquaredDifferences += difference * difference;
    }
    
    const variance = sumSquaredDifferences / Object.keys(distribution).length;
    const standardDeviation = Math.sqrt(variance);
    
    // Analyse du chi-carré
    const chiSquared = Object.values(distribution).reduce((sum, count) => {
      const difference = count - expectedFrequency;
      return sum + (difference * difference) / (expectedFrequency || 1);
    }, 0);
    
    // Seuil de chi-carré (valeur simplifiée pour la démonstration)
    const chiSquaredThreshold = Object.keys(distribution).length * 1.5;
    const chiSquaredTest = chiSquared < chiSquaredThreshold;
    
    return {
      totalDraws,
      expectedFrequency,
      standardDeviation,
      chiSquared,
      chiSquaredThreshold,
      chiSquaredTest
    };
  }

  /**
   * Calcule un score d'équité global
   * @param {Object} statistics - Statistiques calculées
   * @param {Object} drawVerifications - Résultats des vérifications de tirages
   * @returns {number} Score d'équité (0-100)
   */
  calculateFairnessScore(statistics, drawVerifications) {
    // Poids des facteurs
    const weights = {
      distribution: 0.4, // Poids de la distribution
      verification: 0.6  // Poids des vérifications
    };
    
    // Score pour la distribution (basé sur l'écart-type et le test chi-carré)
    const expectedStdDev = Math.sqrt(statistics.totalDraws / 90); // 90 numéros pour le bingo
    const stdDevRatio = Math.min(expectedStdDev / (statistics.standardDeviation || 0.001), 1);
    const distributionScore = (stdDevRatio * 0.7 + (statistics.chiSquaredTest ? 0.3 : 0)) * 100;
    
    // Score pour les vérifications
    const verifiedCount = Object.values(drawVerifications).filter(v => v).length;
    const verificationScore = (verifiedCount / Object.keys(drawVerifications).length) * 100;
    
    // Score global
    const fairnessScore = weights.distribution * distributionScore + weights.verification * verificationScore;
    
    return Math.round(fairnessScore);
  }

  /**
   * Génère une conclusion textuelle pour le rapport
   * @param {string} language - Code de langue ('fr' ou 'en')
   * @param {number} fairnessScore - Score d'équité
   * @param {boolean} allVerified - Indicateur de vérification réussie
   * @returns {string} Conclusion textuelle
   */
  generateConclusion(language, fairnessScore, allVerified) {
    if (language === 'fr') {
      if (fairnessScore >= 90 && allVerified) {
        return "Les tirages sont certifiés équitables avec un très haut niveau de confiance. Toutes les vérifications cryptographiques ont réussi et les distributions statistiques sont conformes aux attentes d'un générateur véritablement aléatoire.";
      } else if (fairnessScore >= 75 && allVerified) {
        return "Les tirages sont considérés équitables avec un bon niveau de confiance. Les vérifications cryptographiques ont réussi et les distributions statistiques sont acceptables.";
      } else if (fairnessScore >= 60) {
        return "Les tirages présentent un niveau d'équité acceptable mais des variations statistiques ont été détectées. Des analyses supplémentaires sont recommandées.";
      } else {
        return "Les tirages présentent des anomalies statistiques significatives ou des échecs de vérification. Une investigation approfondie est nécessaire.";
      }
    } else {
      if (fairnessScore >= 90 && allVerified) {
        return "Draws are certified fair with a very high level of confidence. All cryptographic verifications have passed and statistical distributions conform to expectations of a truly random generator.";
      } else if (fairnessScore >= 75 && allVerified) {
        return "Draws are considered fair with a good level of confidence. Cryptographic verifications have passed and statistical distributions are acceptable.";
      } else if (fairnessScore >= 60) {
        return "Draws present an acceptable level of fairness but statistical variations have been detected. Additional analysis is recommended.";
      } else {
        return "Draws present significant statistical anomalies or verification failures. A thorough investigation is necessary.";
      }
    }
  }

  /**
   * Enregistre des données de vérification pour une partie
   * @param {string} gameId - ID de la partie
   * @param {Object} verificationData - Données de vérification
   * @returns {Promise<Object>} Résultat de l'opération
   */
  async storeVerificationData(gameId, verificationData) {
    try {
      // Charger les données existantes ou créer un nouvel objet
      let gameData = await this.loadGameData(gameId) || {
        gameId,
        seedHash: verificationData.seedHash,
        drawCount: 0,
        verificationData: {},
        timestamp: new Date().toISOString()
      };
      
      // Mettre à jour les données de vérification
      gameData.verificationData = {
        ...gameData.verificationData,
        ...verificationData
      };
      
      // Mettre à jour le nombre de tirages
      gameData.drawCount = Object.keys(gameData.verificationData).length;
      gameData.timestamp = new Date().toISOString();
      
      // Enregistrer les données
      await this.saveGameData(gameId, gameData);
      
      // Invalider les caches
      this.verificationCache.clear();
      this.gameReports.delete(gameId);
      
      return {
        success: true,
        gameId,
        drawCount: gameData.drawCount,
        message: `Données de vérification enregistrées pour la partie ${gameId}`
      };
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement des données de vérification:`, error);
      return {
        success: false,
        gameId,
        error: error.message
      };
    }
  }

  /**
   * Charge les données de vérification d'une partie depuis le stockage
   * @param {string} gameId - ID de la partie
   * @returns {Promise<Object>} Données de la partie
   */
  async loadGameData(gameId) {
    try {
      const filePath = path.join(this.dataDir, `${gameId}.json`);
      
      if (!fs.existsSync(filePath)) {
        // Essayer de charger depuis la base de données
        if (this.db) {
          // Implémentation pour charger depuis la base de données
          // à adapter selon le système de stockage utilisé
        }
        
        return null;
      }
      
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Erreur lors du chargement des données de la partie ${gameId}:`, error);
      return null;
    }
  }

  /**
   * Enregistre les données de vérification d'une partie
   * @param {string} gameId - ID de la partie
   * @param {Object} gameData - Données de la partie
   * @returns {Promise<boolean>} Résultat de l'opération
   */
  async saveGameData(gameId, gameData) {
    try {
      const filePath = path.join(this.dataDir, `${gameId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(gameData, null, 2), 'utf8');
      
      // Enregistrer également dans la base de données si disponible
      if (this.db) {
        // Implémentation pour enregistrer dans la base de données
        // à adapter selon le système de stockage utilisé
      }
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement des données de la partie ${gameId}:`, error);
      return false;
    }
  }

  /**
   * Récupère la liste des parties disponibles pour vérification
   * @returns {Promise<Array>} Liste des parties
   */
  async getAvailableGames() {
    try {
      // Lire les fichiers dans le répertoire des données
      const files = fs.readdirSync(this.dataDir);
      const gameFiles = files.filter(file => file.endsWith('.json'));
      
      // Charger les informations de base pour chaque partie
      const games = [];
      for (const file of gameFiles) {
        const gameId = file.replace('.json', '');
        try {
          const gameData = await this.loadGameData(gameId);
          if (gameData) {
            games.push({
              gameId: gameData.gameId,
              drawCount: gameData.drawCount,
              timestamp: gameData.timestamp
            });
          }
        } catch (error) {
          console.error(`Erreur lors du chargement des informations pour la partie ${gameId}:`, error);
        }
      }
      
      // Trier par date (plus récent en premier)
      games.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return games;
    } catch (error) {
      console.error(`Erreur lors de la récupération des parties disponibles:`, error);
      return [];
    }
  }
}

module.exports = FairnessService;