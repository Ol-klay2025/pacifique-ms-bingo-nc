/**
 * Module de Vérification d'Équité des Tirages
 * PACIFIQUE MS BINGO - Version: Avril 2025
 * 
 * Ce module permet de vérifier l'équité des tirages de bingo
 * en analysant les distributions, en validant les preuves cryptographiques
 * et en générant des rapports d'audit.
 */

class FairnessVerifier {
  constructor(options = {}) {
    this.config = {
      rngInstance: options.rngInstance || null,
      gameId: options.gameId || null,
      apiEndpoint: options.apiEndpoint || '/api/verify-fairness',
      autoVerify: options.autoVerify !== undefined ? options.autoVerify : true,
      logResults: options.logResults !== undefined ? options.logResults : true,
      ...options
    };

    // Indicateurs d'état
    this.isInitialized = false;
    this.verificationResults = {};
    this.latestReport = null;

    // Si un RNG est fourni, l'utiliser directement
    if (this.config.rngInstance && this.config.rngInstance instanceof CertifiedRandomNumberGenerator) {
      this.rng = this.config.rngInstance;
      this.isInitialized = true;
    }
  }

  /**
   * Initialise le vérificateur avec un générateur de nombres aléatoires
   * @param {CertifiedRandomNumberGenerator} rngInstance - Instance du RNG
   * @returns {boolean} Vrai si l'initialisation a réussi
   */
  initialize(rngInstance) {
    if (!(rngInstance instanceof CertifiedRandomNumberGenerator)) {
      console.error('L\'instance fournie n\'est pas un CertifiedRandomNumberGenerator valide');
      return false;
    }

    this.rng = rngInstance;
    this.isInitialized = true;
    
    if (this.config.logResults) {
      console.log(`Vérificateur d'équité initialisé pour la partie ${this.rng.gameId}`);
    }

    return true;
  }

  /**
   * Vérifie l'équité d'un tirage spécifique
   * @param {number} drawIndex - Index du tirage à vérifier
   * @returns {Promise<Object>} Résultat de la vérification
   */
  async verifyDraw(drawIndex) {
    if (!this.isInitialized) {
      throw new Error('Le vérificateur n\'est pas initialisé avec un RNG');
    }

    try {
      // Vérification locale (via RNG)
      const localVerification = this.rng.verifyDraw(drawIndex);
      
      // Vérification distante via API (dans une implémentation réelle)
      let remoteVerification = null;
      try {
        if (this.config.gameId) {
          const response = await fetch(`${this.config.apiEndpoint}/${this.config.gameId}/draw/${drawIndex}`);
          if (response.ok) {
            remoteVerification = await response.json();
          }
        }
      } catch (error) {
        console.warn(`Impossible de vérifier le tirage #${drawIndex} via l'API: ${error.message}`);
      }

      // Résultat combiné (local + distant si disponible)
      const result = {
        drawId: drawIndex,
        timestamp: new Date().toISOString(),
        localVerification: {
          verified: localVerification,
          method: 'cryptographic-proof',
          details: this.rng.drawVerificationData[drawIndex] || null
        },
        remoteVerification: remoteVerification ? {
          verified: remoteVerification.verified,
          method: remoteVerification.method,
          details: remoteVerification.details
        } : null,
        verified: localVerification && (remoteVerification ? remoteVerification.verified : true)
      };

      // Stocker le résultat
      this.verificationResults[drawIndex] = result;

      if (this.config.logResults) {
        console.log(`Vérification du tirage #${drawIndex}: ${result.verified ? 'Réussie' : 'Échouée'}`);
      }

      return result;
    } catch (error) {
      console.error(`Erreur lors de la vérification du tirage #${drawIndex}:`, error);
      return {
        drawId: drawIndex,
        timestamp: new Date().toISOString(),
        error: error.message,
        verified: false
      };
    }
  }

  /**
   * Vérifie tous les tirages disponibles
   * @returns {Promise<Object>} Résultats des vérifications
   */
  async verifyAllDraws() {
    if (!this.isInitialized) {
      throw new Error('Le vérificateur n\'est pas initialisé avec un RNG');
    }

    const results = {};
    const drawCount = this.rng.draws.length;

    if (drawCount === 0) {
      return { verified: true, message: 'Aucun tirage à vérifier', results: {} };
    }

    for (let i = 1; i <= drawCount; i++) {
      results[i] = await this.verifyDraw(i);
    }

    const allVerified = Object.values(results).every(r => r.verified);

    if (this.config.logResults) {
      console.log(`Vérification de tous les tirages (${drawCount}): ${allVerified ? 'Réussie' : 'Échouée'}`);
    }

    return {
      verified: allVerified,
      drawCount,
      timestamp: new Date().toISOString(),
      results
    };
  }

  /**
   * Génère un rapport d'équité complet
   * @returns {Promise<Object>} Rapport d'équité
   */
  async generateFairnessReport() {
    if (!this.isInitialized) {
      throw new Error('Le vérificateur n\'est pas initialisé avec un RNG');
    }

    try {
      // Vérifier tous les tirages si l'option est activée
      if (this.config.autoVerify) {
        await this.verifyAllDraws();
      }

      // Obtenir le rapport d'équité du RNG
      const rngReport = this.rng.generateFairnessReport();

      // Statistiques supplémentaires et analyses
      const drawSequence = this.rng.draws.map(d => d.number);
      
      // Analyse des tendances (runs test simplifié)
      const runsAnalysis = this._analyzeRuns(drawSequence);
      
      // Analyse de séquence (recherche de motifs)
      const sequenceAnalysis = this._analyzeSequence(drawSequence);
      
      // Compilation du rapport complet
      const report = {
        gameId: this.rng.gameId,
        timestamp: new Date().toISOString(),
        drawCount: this.rng.draws.length,
        fairnessScore: rngReport.fairnessScore,
        distribution: rngReport.distribution,
        statistics: {
          ...rngReport.statistics,
          runsTest: runsAnalysis.runsTest,
          patternDetection: sequenceAnalysis.patternDetected
        },
        additionalAnalysis: {
          runs: runsAnalysis,
          sequence: sequenceAnalysis
        },
        allDrawsVerified: rngReport.allDrawsVerified,
        verificationDetails: this.verificationResults,
        conclusionFr: this._generateConclusion('fr', rngReport.fairnessScore, rngReport.allDrawsVerified),
        conclusionEn: this._generateConclusion('en', rngReport.fairnessScore, rngReport.allDrawsVerified)
      };

      // Stocker pour référence future
      this.latestReport = report;

      if (this.config.logResults) {
        console.log(`Rapport d'équité généré. Score: ${report.fairnessScore}/100`);
      }

      return report;
    } catch (error) {
      console.error('Erreur lors de la génération du rapport d\'équité:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analyse les séquences (runs) dans les tirages
   * @param {number[]} sequence - Séquence de nombres
   * @returns {Object} Résultats de l'analyse
   * @private
   */
  _analyzeRuns(sequence) {
    if (!sequence || sequence.length < 2) {
      return { runsTest: false, message: 'Séquence trop courte pour analyse' };
    }

    // Médiane pour définir les valeurs "hautes" et "basses"
    const sorted = [...sequence].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    // Convertir la séquence en série binaire (au-dessus/en dessous de la médiane)
    const binarySequence = sequence.map(n => n > median ? 1 : 0);
    
    // Compter les "runs" (séquences consécutives de 0 ou 1)
    let runCount = 1;
    for (let i = 1; i < binarySequence.length; i++) {
      if (binarySequence[i] !== binarySequence[i-1]) {
        runCount++;
      }
    }
    
    // Compter les 0 et 1
    const countZeros = binarySequence.filter(b => b === 0).length;
    const countOnes = binarySequence.filter(b => b === 1).length;
    
    // Calcul de la valeur attendue et de l'écart-type pour le test des runs
    const expectedRuns = 1 + (2 * countZeros * countOnes) / (countZeros + countOnes);
    const stdDev = Math.sqrt((2 * countZeros * countOnes * (2 * countZeros * countOnes - countZeros - countOnes)) / 
                              ((countZeros + countOnes) * (countZeros + countOnes) * (countZeros + countOnes - 1)));
    
    // Valeur Z (statistique normalisée)
    const zScore = (runCount - expectedRuns) / (stdDev || 1);
    
    // Le test est considéré comme réussi si |Z| < 1.96 (niveau de confiance de 95%)
    const runsTest = Math.abs(zScore) < 1.96;
    
    return {
      runCount,
      expectedRuns,
      zScore,
      runsTest,
      conclusion: runsTest ? 
        'La séquence semble aléatoire selon le test des runs' : 
        'La séquence présente des motifs non aléatoires selon le test des runs'
    };
  }

  /**
   * Analyse la séquence pour détecter des motifs répétitifs
   * @param {number[]} sequence - Séquence de nombres
   * @returns {Object} Résultats de l'analyse
   * @private
   */
  _analyzeSequence(sequence) {
    if (!sequence || sequence.length < 10) {
      return { patternDetected: false, message: 'Séquence trop courte pour analyse' };
    }
    
    // Détecter les répétitions d'un même nombre
    const repeats = {};
    let maxRepeat = 0;
    let currentNum = sequence[0];
    let currentStreak = 1;
    
    for (let i = 1; i < sequence.length; i++) {
      if (sequence[i] === currentNum) {
        currentStreak++;
      } else {
        if (currentStreak > 1) {
          repeats[currentNum] = (repeats[currentNum] || 0) + 1;
          maxRepeat = Math.max(maxRepeat, currentStreak);
        }
        currentNum = sequence[i];
        currentStreak = 1;
      }
    }
    
    // Détecter les séquences courtes qui se répètent
    const patterns = {};
    const significantPatterns = [];
    
    // Chercher des motifs de longueur 2 à 5
    for (let patternLength = 2; patternLength <= 5; patternLength++) {
      if (sequence.length < patternLength * 2) continue;
      
      for (let i = 0; i <= sequence.length - patternLength * 2; i++) {
        const pattern = sequence.slice(i, i + patternLength).join('-');
        
        // Chercher ce motif dans le reste de la séquence
        for (let j = i + patternLength; j <= sequence.length - patternLength; j++) {
          const testPattern = sequence.slice(j, j + patternLength).join('-');
          if (pattern === testPattern) {
            patterns[pattern] = (patterns[pattern] || 0) + 1;
            
            // Si un motif apparaît plusieurs fois, le considérer comme significatif
            if (patterns[pattern] >= 2 && !significantPatterns.includes(pattern)) {
              significantPatterns.push(pattern);
            }
          }
        }
      }
    }
    
    // Analyser les résultats
    const patternDetected = significantPatterns.length > 0 || maxRepeat > 3;
    
    return {
      patternDetected,
      maxConsecutiveRepeats: maxRepeat,
      significantPatterns,
      patternCount: significantPatterns.length,
      conclusion: patternDetected ? 
        'Des motifs répétitifs ont été détectés dans la séquence' : 
        'Aucun motif répétitif significatif détecté'
    };
  }

  /**
   * Génère une conclusion textuelle pour le rapport
   * @param {string} language - Code de langue ('fr' ou 'en')
   * @param {number} fairnessScore - Score d'équité
   * @param {boolean} allVerified - Indicateur de vérification réussie
   * @returns {string} Conclusion textuelle
   * @private
   */
  _generateConclusion(language, fairnessScore, allVerified) {
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
   * Génère une représentation visuelle HTML du rapport d'équité
   * @returns {string} Représentation HTML
   */
  generateVisualReport() {
    if (!this.latestReport) {
      return '<div class="fairness-report error">Aucun rapport disponible. Générez d\'abord un rapport d\'équité.</div>';
    }

    const report = this.latestReport;
    const fairnessClass = report.fairnessScore >= 90 ? 'excellent' : 
                         (report.fairnessScore >= 75 ? 'good' : 
                         (report.fairnessScore >= 60 ? 'acceptable' : 'poor'));

    return `
      <div class="fairness-report ${fairnessClass}">
        <h2>Rapport d'Équité des Tirages</h2>
        <div class="game-info">
          <p><strong>ID de la partie:</strong> ${report.gameId}</p>
          <p><strong>Nombre de tirages:</strong> ${report.drawCount}</p>
          <p><strong>Date du rapport:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="fairness-score">
          <div class="score-label">Score d'équité</div>
          <div class="score-value ${fairnessClass}">${report.fairnessScore}/100</div>
          <div class="score-bar">
            <div class="score-fill ${fairnessClass}" style="width: ${report.fairnessScore}%"></div>
          </div>
        </div>
        
        <div class="verification-status">
          <div class="status-icon ${report.allDrawsVerified ? 'verified' : 'failed'}">
            ${report.allDrawsVerified ? '✓' : '✗'}
          </div>
          <div class="status-text">
            ${report.allDrawsVerified ? 
              'Tous les tirages vérifiés avec succès' : 
              'Certains tirages n\'ont pas pu être vérifiés'}
          </div>
        </div>
        
        <div class="conclusion">
          <h3>Conclusion</h3>
          <p>${report.conclusionFr}</p>
          <p class="english">${report.conclusionEn}</p>
        </div>
        
        <div class="statistical-tests">
          <h3>Tests Statistiques</h3>
          <ul>
            <li class="${report.statistics.chiSquaredTest ? 'passed' : 'failed'}">
              <span class="test-icon">${report.statistics.chiSquaredTest ? '✓' : '✗'}</span>
              <span class="test-name">Test du Chi-carré: </span>
              <span class="test-value">${report.statistics.chiSquared.toFixed(2)}</span>
              <span class="test-threshold">(Seuil: ${report.statistics.chiSquaredThreshold.toFixed(2)})</span>
            </li>
            <li class="${report.statistics.runsTest ? 'passed' : 'failed'}">
              <span class="test-icon">${report.statistics.runsTest ? '✓' : '✗'}</span>
              <span class="test-name">Test des Runs: </span>
              <span class="test-value">Z = ${report.additionalAnalysis.runs.zScore.toFixed(2)}</span>
            </li>
            <li class="${!report.statistics.patternDetection ? 'passed' : 'failed'}">
              <span class="test-icon">${!report.statistics.patternDetection ? '✓' : '✗'}</span>
              <span class="test-name">Détection de Motifs: </span>
              <span class="test-value">${report.additionalAnalysis.sequence.patternCount} motifs détectés</span>
            </li>
          </ul>
        </div>
        
        <div class="actions">
          <button class="download-report">Télécharger le rapport complet</button>
          <button class="verify-again">Vérifier à nouveau</button>
        </div>
      </div>
    `;
  }

  /**
   * Exporte le rapport d'équité au format JSON
   * @returns {string} Chaîne JSON
   */
  exportReportJSON() {
    if (!this.latestReport) {
      throw new Error('Aucun rapport disponible');
    }
    
    return JSON.stringify(this.latestReport, null, 2);
  }
}

// Exposer pour utilisation comme module
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { FairnessVerifier };
} else {
  // Exposer pour une utilisation dans le navigateur
  if (typeof window !== 'undefined') {
    window.FairnessVerifier = FairnessVerifier;
  }
}