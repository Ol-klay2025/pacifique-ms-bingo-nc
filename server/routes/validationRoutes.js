/**
 * PACIFIQUE MS BINGO - Routes de validation automatique
 * 
 * Ce module fournit les routes API pour la validation automatique des quines et bingos
 */

const express = require('express');
const router = express.Router();
const { validateQuine, validateBingo, autoCheckAllCards } = require('../utils/bingoValidator');
const { ensureAuthenticated } = require('../auth');

/**
 * Route pour valider une réclamation de quine
 * @route POST /api/validate/quine
 * @group Validation - Opérations de validation des gains
 * @param {number} gameId.body.required - ID du jeu
 * @param {number} cardId.body.required - ID de la carte
 * @returns {Object} 200 - Résultat de la validation
 * @returns {Error} 400 - Données invalides
 * @returns {Error} 401 - Non authentifié
 */
router.post('/quine', ensureAuthenticated, async (req, res) => {
  try {
    const { gameId, cardId } = req.body;
    
    if (!gameId || !cardId) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    // Récupérer le jeu
    const game = await db.query('SELECT * FROM games WHERE id = $1', [gameId]);
    if (!game.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }
    
    // Récupérer la carte
    const card = await db.query('SELECT * FROM cards WHERE id = $1', [cardId]);
    if (!card.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Carte non trouvée'
      });
    }
    
    // Valider la quine
    const validationResult = validateQuine(game.rows[0], card.rows[0], req.user);
    
    // En cas de succès, mettre à jour la base de données
    if (validationResult.success) {
      console.log(`✅ Quine validée pour utilisateur ${req.user.id}, carte ${cardId}`);
      
      // Mettre à jour le jeu avec la quine validée
      await db.query(`
        UPDATE games 
        SET quine_winner_ids = array_append(quine_winner_ids, $1),
            quine_card_ids = array_append(quine_card_ids, $2),
            quine_number_count = COALESCE(quine_number_count, $3)
        WHERE id = $4
      `, [req.user.id, cardId, validationResult.callCount, gameId]);
      
      // Calculer les gains pour la quine (15% du prize pool)
      const gameData = await db.query('SELECT * FROM games WHERE id = $1', [gameId]);
      if (gameData.rows.length) {
        const totalPrize = gameData.rows[0].prize || 0;
        const quineWinnerIds = gameData.rows[0].quine_winner_ids || [];
        
        // S'il y a un prize pool et des gagnants
        if (totalPrize > 0 && quineWinnerIds.length > 0) {
          const quinePrize = Math.floor(totalPrize * 0.15);
          const winAmount = Math.floor(quinePrize / quineWinnerIds.length);
          
          // Ajouter les gains à l'utilisateur
          await db.query(`
            UPDATE users 
            SET balance = balance + $1
            WHERE id = $2
          `, [winAmount, req.user.id]);
          
          // Enregistrer la transaction
          await db.query(`
            INSERT INTO transactions (user_id, type, amount, status, description)
            VALUES ($1, 'win', $2, 'completed', $3)
          `, [req.user.id, winAmount, `Gain de quine - Partie #${gameId}`]);
          
          // Ajouter les infos sur les gains
          validationResult.winAmount = winAmount;
        }
      }
    }
    
    // Retourner le résultat de la validation
    res.json(validationResult);
  } catch (error) {
    console.error('❌ Erreur lors de la validation de quine:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la validation'
    });
  }
});

/**
 * Route pour valider une réclamation de bingo
 * @route POST /api/validate/bingo
 * @group Validation - Opérations de validation des gains
 * @param {number} gameId.body.required - ID du jeu
 * @param {number} cardId.body.required - ID de la carte
 * @returns {Object} 200 - Résultat de la validation
 * @returns {Error} 400 - Données invalides
 * @returns {Error} 401 - Non authentifié
 */
router.post('/bingo', ensureAuthenticated, async (req, res) => {
  try {
    const { gameId, cardId } = req.body;
    
    if (!gameId || !cardId) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    // Récupérer le jeu
    const game = await db.query('SELECT * FROM games WHERE id = $1', [gameId]);
    if (!game.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }
    
    // Récupérer la carte
    const card = await db.query('SELECT * FROM cards WHERE id = $1', [cardId]);
    if (!card.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Carte non trouvée'
      });
    }
    
    // Valider le bingo
    const validationResult = validateBingo(game.rows[0], card.rows[0], req.user);
    
    // En cas de succès, mettre à jour la base de données
    if (validationResult.success) {
      console.log(`✅ Bingo validé pour utilisateur ${req.user.id}, carte ${cardId}`);
      
      // Mettre à jour le jeu avec le bingo validé
      await db.query(`
        UPDATE games 
        SET bingo_winner_ids = array_append(bingo_winner_ids, $1),
            bingo_card_ids = array_append(bingo_card_ids, $2),
            bingo_number_count = COALESCE(bingo_number_count, $3),
            jackpot_won = $4
        WHERE id = $5
      `, [req.user.id, cardId, validationResult.callCount, validationResult.jackpotWon, gameId]);
      
      // Calculer les gains pour le bingo (50% du prize pool + jackpot si gagné)
      const gameData = await db.query('SELECT * FROM games WHERE id = $1', [gameId]);
      let jackpotAmount = 0;
      
      // Récupérer le montant du jackpot si gagné
      if (validationResult.jackpotWon) {
        const jackpotData = await db.query('SELECT amount FROM jackpot LIMIT 1');
        if (jackpotData.rows.length) {
          jackpotAmount = jackpotData.rows[0].amount;
          
          // Réinitialiser le jackpot
          await db.query('UPDATE jackpot SET amount = 0, last_updated = NOW()');
        }
      }
      
      if (gameData.rows.length) {
        const totalPrize = gameData.rows[0].prize || 0;
        const bingoWinnerIds = gameData.rows[0].bingo_winner_ids || [];
        
        // S'il y a un prize pool et des gagnants
        if ((totalPrize > 0 || jackpotAmount > 0) && bingoWinnerIds.length > 0) {
          const bingoPrize = Math.floor(totalPrize * 0.5);
          const prizePerWinner = Math.floor(bingoPrize / bingoWinnerIds.length);
          const jackpotPerWinner = validationResult.jackpotWon ? Math.floor(jackpotAmount / bingoWinnerIds.length) : 0;
          const totalWinAmount = prizePerWinner + jackpotPerWinner;
          
          // Ajouter les gains à l'utilisateur
          await db.query(`
            UPDATE users 
            SET balance = balance + $1
            WHERE id = $2
          `, [totalWinAmount, req.user.id]);
          
          // Description plus détaillée si jackpot gagné
          const description = validationResult.jackpotWon 
            ? `Gain de bingo (${prizePerWinner}) + JACKPOT (${jackpotPerWinner}) - Partie #${gameId}`
            : `Gain de bingo - Partie #${gameId}`;
          
          // Enregistrer la transaction
          await db.query(`
            INSERT INTO transactions (user_id, type, amount, status, description)
            VALUES ($1, 'win', $2, 'completed', $3)
          `, [req.user.id, totalWinAmount, description]);
          
          // Ajouter les infos sur les gains
          validationResult.winAmount = totalWinAmount;
          validationResult.prizeAmount = prizePerWinner;
          validationResult.jackpotAmount = jackpotPerWinner;
        }
      }
      
      // Si c'est un bingo validé, on termine la partie
      await db.query(`
        UPDATE games 
        SET status = 'completed', end_time = NOW()
        WHERE id = $1 AND status = 'active'
      `, [gameId]);
    }
    
    // Retourner le résultat de la validation
    res.json(validationResult);
  } catch (error) {
    console.error('❌ Erreur lors de la validation de bingo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la validation'
    });
  }
});

/**
 * Route pour la vérification automatique de toutes les cartes en jeu
 * @route POST /api/validate/auto-check
 * @group Validation - Opérations de validation des gains
 * @param {number} gameId.body.required - ID du jeu
 * @returns {Object} 200 - Résultats des détections automatiques
 * @returns {Error} 400 - Données invalides
 * @returns {Error} 401 - Non authentifié
 */
router.post('/auto-check', ensureAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.body;
    
    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: 'ID de jeu manquant'
      });
    }
    
    // Vérifier si l'utilisateur est un organisateur ou admin
    if (!req.user.is_admin && !req.user.is_organizer) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    // Récupérer le jeu
    const game = await db.query('SELECT * FROM games WHERE id = $1', [gameId]);
    if (!game.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Jeu non trouvé'
      });
    }
    
    // Récupérer toutes les cartes pour ce jeu
    const cards = await db.query(`
      SELECT c.*, u.username as username
      FROM cards c
      JOIN users u ON c.user_id = u.id
      WHERE c.game_id = $1
    `, [gameId]);
    
    // Exécuter la vérification automatique
    const checkResults = autoCheckAllCards(game.rows[0], cards.rows);
    
    // Retourner les résultats
    res.json({
      success: true,
      ...checkResults
    });
  } catch (error) {
    console.error('❌ Erreur lors de la vérification automatique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la vérification automatique'
    });
  }
});

module.exports = router;