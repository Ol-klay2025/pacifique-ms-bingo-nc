/**
 * Script optimisé pour consolider tous les cartons dans une seule partie
 * Utilise l'insertion directe SQL pour des performances maximales
 */

const { Pool } = require('pg');

// Configuration de la connexion à la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Consolide tous les cartons dans une seule partie pour les tests
 */
async function fastConsolidateCards() {
  const client = await pool.connect();
  
  try {
    // Démarrer une transaction pour garantir l'intégrité des données
    await client.query('BEGIN');
    
    console.log('Création d\'une nouvelle partie pour les tests...');
    
    // 1. Créer une nouvelle partie
    const newGameResult = await client.query(`
      INSERT INTO games (
        status, start_time, called_numbers,
        quine_winner_ids, bingo_winner_ids, prize,
        is_special_game
      )
      VALUES (
        'active', NOW(), '[]'::jsonb,
        '[]'::jsonb, '[]'::jsonb, 0,
        false
      )
      RETURNING id
    `);
    
    const newGameId = newGameResult.rows[0].id;
    console.log(`Nouvelle partie de test créée avec l'ID #${newGameId}`);

    // 2. Compter le nombre de cartons existants
    const totalCardsResult = await client.query('SELECT COUNT(*) FROM cards');
    const totalCards = parseInt(totalCardsResult.rows[0].count);
    console.log(`Total de ${totalCards} cartons à consolider`);

    // 3. Insérer directement tous les cartons dans la nouvelle partie avec une seule requête
    console.log('Copie des cartons vers la nouvelle partie (opération optimisée)...');
    
    await client.query(`
      INSERT INTO cards (game_id, user_id, numbers)
      SELECT ${newGameId}, user_id, numbers
      FROM cards
      WHERE game_id != ${newGameId}
    `);
    
    // Compter le nombre de cartes copiées
    const copiedCardsResult = await client.query(`
      SELECT COUNT(*) FROM cards WHERE game_id = ${newGameId}
    `);
    
    const copiedCards = parseInt(copiedCardsResult.rows[0].count);
    console.log(`${copiedCards} cartons copiés avec succès vers la partie #${newGameId}`);
    
    // 4. Mettre à jour le prix de la partie
    await client.query(`
      UPDATE games
      SET prize = $1
      WHERE id = $2
    `, [copiedCards * 100, newGameId]);
    
    // Valider la transaction
    await client.query('COMMIT');
    
    console.log(`✅ Consolidation terminée! ${copiedCards} cartons copiés vers la partie #${newGameId}`);
    console.log(`Pour tester, utilisez la partie d'ID: ${newGameId}`);
    
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await client.query('ROLLBACK');
    console.error('Erreur lors de la consolidation des cartons:', error);
  } finally {
    // Libérer le client et fermer la connexion
    client.release();
    await pool.end();
  }
}

// Exécuter la fonction
fastConsolidateCards().then(() => {
  console.log('Script terminé.');
});