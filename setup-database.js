/**
 * Script pour initialiser la base de données MS BINGO
 * Ce script crée les tables dans la base de données PostgreSQL
 */

require('dotenv').config();
const { Client } = require('pg');

async function createTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Création des tables selon le schéma
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT,
        password_hash TEXT NOT NULL,
        balance INTEGER NOT NULL DEFAULT 0,
        language TEXT NOT NULL DEFAULT 'en',
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        subscription_status TEXT,
        subscription_end_date TIMESTAMP,
        card_theme JSONB,
        app_theme JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'scheduled',
        called_numbers JSONB NOT NULL DEFAULT '[]',
        quine_winner_ids JSONB,
        quine_card_ids JSONB,
        quine_number_count INTEGER,
        bingo_winner_ids JSONB,
        bingo_card_ids JSONB,
        bingo_number_count INTEGER,
        jackpot_won BOOLEAN NOT NULL DEFAULT FALSE,
        prize INTEGER NOT NULL DEFAULT 0,
        quine_price INTEGER,
        bingo_price INTEGER,
        jackpot_amount INTEGER,
        is_special_game BOOLEAN NOT NULL DEFAULT FALSE,
        verification_hash TEXT,
        blockchain_tx_hash TEXT
      );

      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        game_id INTEGER NOT NULL REFERENCES games(id),
        numbers JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        description TEXT,
        stripe_payment_intent_id TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS jackpot (
        id SERIAL PRIMARY KEY,
        amount INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS organizer_wallet (
        id SERIAL PRIMARY KEY,
        balance INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
        security_hash TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_difficulty_recommendations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        recommended_level TEXT NOT NULL,
        recommended_card_count INTEGER NOT NULL,
        confidence REAL NOT NULL,
        factors_analysis JSONB NOT NULL,
        previous_level TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Tables créées avec succès');

    // Vérifions si nous avons besoin d'initialiser le jackpot
    const { rows } = await client.query('SELECT COUNT(*) FROM jackpot');
    if (parseInt(rows[0].count) === 0) {
      await client.query('INSERT INTO jackpot (amount) VALUES (0)');
      console.log('Jackpot initialisé');
    }

  } catch (error) {
    console.error('Erreur lors de la création des tables:', error);
    throw error;
  } finally {
    await client.end();
    console.log('Déconnecté de la base de données');
  }
}

// Exécuter le script
createTables()
  .then(() => {
    console.log('Base de données initialisée avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Échec de l\'initialisation de la base de données:', error);
    process.exit(1);
  });