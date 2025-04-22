/**
 * Script de vérification pour la partie #25 (cartes consolidées)
 * Ce script vérifie que la partie existe et affiche des statistiques détaillées
 */

const { Pool } = require('pg');
require('dotenv').config();

async function checkGame25() {
  console.log('🔍 Vérification de la partie #25...');
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    // Vérification de l'existence de la partie
    const gameResult = await pool.query('SELECT * FROM games WHERE id = 25');
    if (gameResult.rows.length === 0) {
      console.error('❌ ERREUR: La partie #25 n\'existe pas dans la base de données.');
      console.error('📝 Veuillez exécuter le script fast-consolidate-cards.js pour créer cette partie.');
      process.exit(1);
    }
    
    const game = gameResult.rows[0];
    console.log('✅ Partie #25 trouvée:');
    console.log('  - Status:', game.status);
    console.log('  - Prix total:', game.prize, 'XPF');
    console.log('  - Prix de la quine:', game.quine_price || '15% du total', 'XPF');
    console.log('  - Prix du bingo:', game.bingo_price || '50% du total', 'XPF');
    console.log('  - Montant du jackpot:', game.jackpot_amount || '5% du total', 'XPF');
    console.log('  - Partie spéciale:', game.is_special_game ? 'Oui' : 'Non');
    console.log('  - Nombres tirés:', game.called_numbers ? game.called_numbers.length : 0);
    
    // Vérification du nombre de cartons
    const cardResult = await pool.query('SELECT COUNT(*) FROM cards WHERE game_id = 25');
    const cardCount = parseInt(cardResult.rows[0].count);
    console.log(`✅ ${cardCount} cartons trouvés dans la partie #25`);
    
    // Vérification de la répartition par utilisateur
    const userDistribution = await pool.query(`
      SELECT u.username, COUNT(c.id) AS card_count 
      FROM cards c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.game_id = 25 
      GROUP BY u.username 
      ORDER BY card_count DESC
    `);
    
    console.log('\n📊 Répartition des cartons par utilisateur:');
    userDistribution.rows.forEach(row => {
      console.log(`  - ${row.username}: ${row.card_count} cartons`);
    });
    
    // Estimation des prix
    const totalPrize = game.prize || cardCount * 100;
    const quinePrize = game.quine_price || Math.floor(totalPrize * 0.15);
    const bingoPrize = game.bingo_price || Math.floor(totalPrize * 0.5);
    const jackpotAmount = game.jackpot_amount || Math.floor(totalPrize * 0.05);
    const platformFee = totalPrize - quinePrize - bingoPrize - jackpotAmount;
    
    console.log('\n💰 Estimation des prix:');
    console.log(`  - Prix total de la partie: ${totalPrize} XPF`);
    console.log(`  - Prix de la quine (15%): ${quinePrize} XPF`);
    console.log(`  - Prix du bingo (50%): ${bingoPrize} XPF`);
    console.log(`  - Montant du jackpot (5%): ${jackpotAmount} XPF`);
    console.log(`  - Commission plateforme (30%): ${platformFee} XPF`);
    
    console.log('\n✅ Vérification terminée. La partie #25 est prête pour les tests.');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    process.exit(1);
  }
}

// Exécuter la vérification
checkGame25();