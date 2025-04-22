/**
 * PACIFIQUE MS BINGO - Système de validation automatique des quines et bingos
 * 
 * Ce module implémente:
 * 1. Validation automatique des quines (lignes complètes)
 * 2. Validation automatique des bingos (carton complet) 
 * 3. Vérification des conditions du jackpot
 * 4. Détection de fraude ou d'erreurs de réclamation
 * 5. Système de logging des vérifications pour audit
 */

const { checkQuine, checkBingo, checkJackpot } = require('./bingoUtils');

// Constantes pour les messages d'erreur
const ERROR_TYPES = {
  INVALID_CARD: 'INVALID_CARD',
  INVALID_GAME: 'INVALID_GAME',
  NOT_A_QUINE: 'NOT_A_QUINE',
  NOT_A_BINGO: 'NOT_A_BINGO',
  ALREADY_CLAIMED: 'ALREADY_CLAIMED',
  GAME_NOT_ACTIVE: 'GAME_NOT_ACTIVE'
};

/**
 * Valide une réclamation de quine
 * @param {Object} game - Objet du jeu en cours
 * @param {Object} card - Carte de bingo réclamée
 * @param {Object} user - Utilisateur qui réclame
 * @returns {Object} Résultat de la validation avec détails
 */
function validateQuine(game, card, user) {
  // Vérification 1: Jeu actif
  if (game.status !== 'active') {
    return createErrorResult(ERROR_TYPES.GAME_NOT_ACTIVE, 'Le jeu n\'est pas en cours');
  }

  // Vérification 2: Carte appartient à l'utilisateur
  if (card.userId !== user.id) {
    return createErrorResult(ERROR_TYPES.INVALID_CARD, 'Cette carte n\'appartient pas à cet utilisateur');
  }

  // Vérification 3: Carte associée au jeu en cours
  if (card.gameId !== game.id) {
    return createErrorResult(ERROR_TYPES.INVALID_CARD, 'Cette carte n\'est pas valide pour ce jeu');
  }

  // Vérification 4: Quine pas déjà revendiquée pour cette carte
  if (game.quineWinnerIds && game.quineWinnerIds.includes(user.id) && 
      game.quineCardIds && game.quineCardIds.includes(card.id)) {
    return createErrorResult(ERROR_TYPES.ALREADY_CLAIMED, 'Une quine a déjà été revendiquée pour cette carte');
  }

  // Vérification 5: Validation technique de la quine
  const quineResult = checkQuine(card.numbers, game.calledNumbers);
  
  if (!quineResult) {
    return createErrorResult(ERROR_TYPES.NOT_A_QUINE, 'Aucune quine valide trouvée sur cette carte');
  }

  // Succès: Quine validée
  return {
    success: true,
    type: 'quine',
    userId: user.id,
    cardId: card.id,
    row: quineResult.row,
    lineNumbers: quineResult.numbers,
    callCount: quineResult.drawnCount,
    timestamp: new Date()
  };
}

/**
 * Valide une réclamation de bingo
 * @param {Object} game - Objet du jeu en cours
 * @param {Object} card - Carte de bingo réclamée
 * @param {Object} user - Utilisateur qui réclame
 * @returns {Object} Résultat de la validation avec détails
 */
function validateBingo(game, card, user) {
  // Vérification 1: Jeu actif
  if (game.status !== 'active') {
    return createErrorResult(ERROR_TYPES.GAME_NOT_ACTIVE, 'Le jeu n\'est pas en cours');
  }

  // Vérification 2: Carte appartient à l'utilisateur
  if (card.userId !== user.id) {
    return createErrorResult(ERROR_TYPES.INVALID_CARD, 'Cette carte n\'appartient pas à cet utilisateur');
  }

  // Vérification 3: Carte associée au jeu en cours
  if (card.gameId !== game.id) {
    return createErrorResult(ERROR_TYPES.INVALID_CARD, 'Cette carte n\'est pas valide pour ce jeu');
  }

  // Vérification 4: Bingo pas déjà revendiqué pour cette carte
  if (game.bingoWinnerIds && game.bingoWinnerIds.includes(user.id) && 
      game.bingoCardIds && game.bingoCardIds.includes(card.id)) {
    return createErrorResult(ERROR_TYPES.ALREADY_CLAIMED, 'Un bingo a déjà été revendiqué pour cette carte');
  }

  // Vérification 5: Validation technique du bingo
  const bingoResult = checkBingo(card.numbers, game.calledNumbers);
  
  if (!bingoResult) {
    return createErrorResult(ERROR_TYPES.NOT_A_BINGO, 'Aucun bingo valide trouvé sur cette carte');
  }

  // Vérification 6: Vérification du jackpot
  const isJackpotWon = checkJackpot(card.numbers, game.calledNumbers);

  // Succès: Bingo validé
  return {
    success: true,
    type: 'bingo',
    userId: user.id,
    cardId: card.id,
    cardNumbers: bingoResult.numbers,
    callCount: bingoResult.drawnCount,
    jackpotWon: isJackpotWon,
    timestamp: new Date()
  };
}

/**
 * Crée un résultat d'erreur standard
 * @param {string} errorType Type d'erreur 
 * @param {string} message Message d'erreur explicatif
 * @returns {Object} Objet d'erreur standardisé
 */
function createErrorResult(errorType, message) {
  return {
    success: false,
    errorType: errorType,
    message: message,
    timestamp: new Date()
  };
}

/**
 * Vérifie automatiquement toutes les cartes en jeu pour détecter les quines et bingos
 * après chaque tirage de numéro
 * @param {Object} game - Jeu en cours
 * @param {Array} cards - Toutes les cartes en jeu
 * @returns {Object} Résultats des détections automatiques
 */
function autoCheckAllCards(game, cards) {
  if (!game || !game.calledNumbers || !cards || !Array.isArray(cards)) {
    return { quines: [], bingos: [] };
  }

  const results = {
    quines: [],
    bingos: []
  };

  // Vérifier chaque carte en jeu
  for (const card of cards) {
    // On ne vérifie que les cartes qui n'ont pas déjà gagné une quine/bingo
    const cardHasQuine = game.quineCardIds && game.quineCardIds.includes(card.id);
    const cardHasBingo = game.bingoCardIds && game.bingoCardIds.includes(card.id);

    // Vérification des bingos (priorité plus élevée)
    if (!cardHasBingo) {
      const bingoResult = checkBingo(card.numbers, game.calledNumbers);
      if (bingoResult) {
        const isJackpotWon = checkJackpot(card.numbers, game.calledNumbers);
        results.bingos.push({
          userId: card.userId,
          cardId: card.id,
          cardNumbers: bingoResult.numbers,
          callCount: bingoResult.drawnCount,
          jackpotWon: isJackpotWon,
          timestamp: new Date()
        });
      }
    }

    // Vérification des quines (seulement si pas déjà détectée)
    if (!cardHasQuine && !cardHasBingo && results.bingos.findIndex(b => b.cardId === card.id) === -1) {
      const quineResult = checkQuine(card.numbers, game.calledNumbers);
      if (quineResult) {
        results.quines.push({
          userId: card.userId,
          cardId: card.id,
          row: quineResult.row,
          lineNumbers: quineResult.numbers,
          callCount: quineResult.drawnCount,
          timestamp: new Date()
        });
      }
    }
  }

  // Logging des résultats pour l'audit
  if (results.quines.length > 0 || results.bingos.length > 0) {
    console.log(`Détection automatique - Jeu #${game.id}: ${results.quines.length} quines, ${results.bingos.length} bingos`);
  }

  return results;
}

/**
 * Vérifie la validité d'une carte et compare avec les numéros tirés pour détecter tout signe de fraude
 * @param {Array<Array<number|null>>} cardNumbers - Numéros de la carte
 * @returns {boolean} Vrai si la carte semble valide
 */
function isCardValid(cardNumbers) {
  // Vérification 1: Format correct (3 lignes x 9 colonnes)
  if (!Array.isArray(cardNumbers) || cardNumbers.length !== 3) {
    return false;
  }

  for (const row of cardNumbers) {
    if (!Array.isArray(row) || row.length !== 9) {
      return false;
    }
  }

  // Vérification 2: 15 numéros au total (5 par ligne)
  const allNumbers = cardNumbers.flat().filter(n => n !== null);
  if (allNumbers.length !== 15) {
    return false;
  }

  // Vérification 3: Chaque ligne a 5 numéros
  for (const row of cardNumbers) {
    const rowNumbers = row.filter(n => n !== null);
    if (rowNumbers.length !== 5) {
      return false;
    }
  }

  // Vérification 4: Numéros dans les bonnes colonnes
  for (let col = 0; col < 9; col++) {
    const minValue = col * 10 + 1;
    const maxValue = col === 8 ? 90 : (col + 1) * 10;
    
    for (let row = 0; row < 3; row++) {
      const num = cardNumbers[row][col];
      if (num !== null && (num < minValue || num > maxValue)) {
        return false;
      }
    }
  }

  return true;
}

module.exports = {
  validateQuine,
  validateBingo,
  autoCheckAllCards,
  isCardValid,
  ERROR_TYPES
};