/**
 * Script pour ajouter les tables de jeu à la base de données MS BINGO
 */
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const { open } = require('sqlite');
const path = require('path');

async function main() {
  try {
    console.log('Ajout des tables de jeu à la base de données MS BINGO...');
    
    // Ouvrir la connexion à la base de données
    const DB_PATH = path.join(__dirname, 'msbingo.db');
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });
    
    console.log(`Base de données connectée: ${DB_PATH}`);

    // Création de la table games (jeux)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        type TEXT NOT NULL DEFAULT 'regular',
        price INTEGER NOT NULL DEFAULT 100,
        jackpot_eligible INTEGER NOT NULL DEFAULT 1,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        drawn_numbers TEXT,
        current_number INTEGER,
        winner_id INTEGER,
        winning_card_id INTEGER,
        quine_winner_id INTEGER,
        quine_card_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "games" créée');

    // Création de la table game_cards (cartes de jeu)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS game_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        game_id INTEGER NOT NULL,
        numbers TEXT NOT NULL,
        marked_numbers TEXT,
        price INTEGER NOT NULL DEFAULT 100,
        special INTEGER NOT NULL DEFAULT 0,
        purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (game_id) REFERENCES games(id)
      )
    `);
    console.log('Table "game_cards" créée');

    // Création de la table jackpot
    await db.exec(`
      CREATE TABLE IF NOT EXISTS jackpot (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount INTEGER NOT NULL DEFAULT 100000,
        last_win_date TIMESTAMP,
        last_winner_id INTEGER,
        min_draw_count INTEGER NOT NULL DEFAULT 40,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "jackpot" créée');

    // Ajouter un jackpot initial s'il n'existe pas
    const jackpotExists = await db.get('SELECT COUNT(*) as count FROM jackpot');
    if (jackpotExists.count === 0) {
      await db.run(`
        INSERT INTO jackpot (amount, min_draw_count) 
        VALUES (100000, 40)
      `);
      console.log('Jackpot initial créé');
    }

    // Création de la table game_schedule (horaires des jeux)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS game_schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hour INTEGER NOT NULL,
        minute INTEGER NOT NULL DEFAULT 0,
        type TEXT NOT NULL DEFAULT 'regular',
        active INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "game_schedule" créée');

    // Ajouter l'horaire par défaut si aucun n'existe
    const scheduleExists = await db.get('SELECT COUNT(*) as count FROM game_schedule');
    if (scheduleExists.count === 0) {
      // Ajouter les horaires réguliers (chaque heure)
      for (let hour = 10; hour <= 23; hour++) {
        await db.run(`
          INSERT INTO game_schedule (hour, minute, type) 
          VALUES (?, 0, 'regular')
        `, [hour]);
      }
      
      // Ajouter les horaires de 0h à 3h du matin
      for (let hour = 0; hour <= 3; hour++) {
        await db.run(`
          INSERT INTO game_schedule (hour, minute, type) 
          VALUES (?, 0, 'regular')
        `, [hour]);
      }
      
      // Ajouter les horaires des jeux spéciaux (toutes les 4 heures)
      for (let hour = 10; hour <= 22; hour += 4) {
        await db.run(`
          INSERT INTO game_schedule (hour, minute, type) 
          VALUES (?, 0, 'special')
        `, [hour]);
      }
      
      // Ajouter le jeu spécial à 2h du matin
      await db.run(`
        INSERT INTO game_schedule (hour, minute, type) 
        VALUES (2, 0, 'special')
      `);
      
      console.log('Horaires des jeux créés');
    }

    // Ajouter trois jeux pour exemple
    const gamesExist = await db.get('SELECT COUNT(*) as count FROM games');
    if (gamesExist.count === 0) {
      // Jeu terminé (pour l'historique)
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 2);
      const pastEndDate = new Date(pastDate);
      pastEndDate.setMinutes(pastEndDate.getMinutes() + 15);
      
      await db.run(`
        INSERT INTO games (
          name, status, type, price, start_time, end_time, 
          drawn_numbers, current_number
        ) VALUES (
          'Partie régulière #123', 'completed', 'regular', 100, 
          ?, ?, 
          '1,24,37,45,62,78,90', 90
        )
      `, [pastDate.toISOString(), pastEndDate.toISOString()]);
      
      // Jeu en cours
      const now = new Date();
      await db.run(`
        INSERT INTO games (
          name, status, type, price, start_time,
          drawn_numbers, current_number
        ) VALUES (
          'Partie régulière #124', 'active', 'regular', 100, 
          ?,
          '12,34,56', 56
        )
      `, [now.toISOString()]);
      
      // Prochain jeu
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);
      futureDate.setMinutes(0);
      futureDate.setSeconds(0);
      
      await db.run(`
        INSERT INTO games (
          name, status, type, price, start_time
        ) VALUES (
          'Partie spéciale #25', 'pending', 'special', 300, 
          ?
        )
      `, [futureDate.toISOString()]);
      
      console.log('Jeux d\'exemple créés');
    }

    console.log('Toutes les tables de jeu ont été créées avec succès !');
    await db.close();
    
  } catch (error) {
    console.error('Erreur lors de la création des tables:', error);
  }
}

main().catch(console.error);