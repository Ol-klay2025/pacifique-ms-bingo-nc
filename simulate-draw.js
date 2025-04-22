/**
 * Script de simulation de tirage pour la partie #25
 * Ce script permet de simuler le tirage aléatoire de nombres pour une partie de bingo
 */

const { Pool } = require('pg');
require('dotenv').config();

// Paramètres configurables
const GAME_ID = 25;          // ID de la partie à utiliser
const DRAW_INTERVAL = 2000;  // Intervalle entre chaque tirage (ms) - 2 secondes
const DRAW_COUNT = 40;       // Nombre total de tirages à effectuer

// Fonction principale
async function simulateDraw() {
  console.log(`🎲 Simulation de tirage pour la partie #${GAME_ID}`);
  console.log(`📋 ${DRAW_COUNT} nombres seront tirés avec un intervalle de ${DRAW_INTERVAL/1000} secondes`);
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    // Vérifier que la partie existe
    const gameResult = await pool.query('SELECT * FROM games WHERE id = $1', [GAME_ID]);
    if (gameResult.rows.length === 0) {
      console.error(`❌ ERREUR: La partie #${GAME_ID} n'existe pas.`);
      process.exit(1);
    }
    
    const game = gameResult.rows[0];
    
    // Vérifier si des nombres ont déjà été tirés
    let calledNumbers = [];
    if (game.called_numbers && game.called_numbers.length > 0) {
      calledNumbers = game.called_numbers;
      console.log(`ℹ️ La partie a déjà ${calledNumbers.length} nombres tirés: ${calledNumbers.join(', ')}`);
      
      // Demander confirmation pour réinitialiser
      if (calledNumbers.length > 0) {
        console.log('⚠️ Réinitialisation des nombres tirés...');
        await pool.query('UPDATE games SET called_numbers = $1 WHERE id = $2', [[], GAME_ID]);
        calledNumbers = [];
      }
    }
    
    // Générer tous les nombres possibles (1-90)
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    
    // Fonction pour tirer un nouveau nombre aléatoire
    function drawNumber() {
      const availableNumbers = allNumbers.filter(num => !calledNumbers.includes(num));
      if (availableNumbers.length === 0) {
        console.log('⚠️ Tous les nombres ont été tirés.');
        return null;
      }
      
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      return availableNumbers[randomIndex];
    }
    
    // Simuler le tirage des nombres
    console.log('\n🎯 Début du tirage...');
    
    let count = 0;
    const drawInterval = setInterval(async () => {
      const drawnNumber = drawNumber();
      
      if (drawnNumber === null || count >= DRAW_COUNT) {
        clearInterval(drawInterval);
        console.log('\n✅ Simulation terminée.');
        await pool.end();
        process.exit(0);
        return;
      }
      
      calledNumbers.push(drawnNumber);
      count++;
      
      console.log(`Tirage #${count}: ${drawnNumber} 🎲`);
      
      // Mettre à jour la partie dans la base de données
      await pool.query(
        'UPDATE games SET called_numbers = $1 WHERE id = $2',
        [calledNumbers, GAME_ID]
      );
      
      // Si c'est le dernier tirage, terminer
      if (count >= DRAW_COUNT) {
        clearInterval(drawInterval);
        console.log('\n✅ Simulation terminée.');
        console.log(`Nombres tirés: ${calledNumbers.join(', ')}`);
        
        // Vérifier les gagnants potentiels
        console.log('\n🔍 Recherche de gagnants potentiels...');
        const query = `
          SELECT c.id, c.user_id, u.username, c.numbers
          FROM cards c
          JOIN users u ON c.user_id = u.id
          WHERE c.game_id = $1
        `;
        
        const cardsResult = await pool.query(query, [GAME_ID]);
        let potentialQuines = 0;
        let potentialBingos = 0;
        
        cardsResult.rows.forEach(card => {
          const numbers = card.numbers;
          
          // Vérifier les quines (lignes complètes)
          const rows = [numbers.slice(0, 5), numbers.slice(5, 10), numbers.slice(10, 15)];
          let hasQuine = false;
          
          rows.forEach(row => {
            const rowComplete = row.every(num => calledNumbers.includes(num));
            if (rowComplete) {
              hasQuine = true;
              potentialQuines++;
            }
          });
          
          // Vérifier les bingos (carton complet)
          const bingoComplete = numbers.every(num => calledNumbers.includes(num));
          if (bingoComplete) {
            potentialBingos++;
            console.log(`  👑 Potentiel BINGO pour ${card.username}, Carte #${card.id}`);
          } else if (hasQuine) {
            console.log(`  👍 Potentielle QUINE pour ${card.username}, Carte #${card.id}`);
          }
        });
        
        console.log(`\n📊 Potentiels gagnants:  ${potentialQuines} quines, ${potentialBingos} bingos`);
        console.log('Lancez le serveur pour tester la validation automatique de ces gains !');
        
        await pool.end();
        process.exit(0);
      }
    }, DRAW_INTERVAL);
    
  } catch (error) {
    console.error('❌ Erreur lors de la simulation:', error);
    process.exit(1);
  }
}

// Exécuter la simulation
simulateDraw();