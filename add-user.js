/**
 * Script pour ajouter un utilisateur de test à MS BINGO
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const { open } = require('sqlite');

// Convertir les fonctions de crypto en promesses
const scryptAsync = promisify(crypto.scrypt);

/**
 * Hache un mot de passe avec un sel aléatoire
 * @param {string} password Mot de passe à hacher
 * @returns {Promise<string>} Chaîne contenant le hachage et le sel
 */
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  try {
    // Connecter à la base de données
    const DB_PATH = path.join(__dirname, 'msbingo.db');
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });
    
    console.log('Base de données connectée:', DB_PATH);
    
    // Créer un nouvel utilisateur
    const newUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: await hashPassword('testpassword'),
      balance: 1000, // Solde initial de 1000 fr
      language: 'fr',
      is_admin: 0
    };
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [newUser.username]);
    
    if (existingUser) {
      console.log(`L'utilisateur '${newUser.username}' existe déjà`);
    } else {
      // Insérer le nouvel utilisateur
      const result = await db.run(`
        INSERT INTO users (username, email, password, balance, language, is_admin)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        newUser.username,
        newUser.email,
        newUser.password,
        newUser.balance,
        newUser.language,
        newUser.is_admin
      ]);
      
      console.log(`Nouvel utilisateur créé avec ID: ${result.lastID}`);
      
      // Créer des préférences utilisateur par défaut
      await db.run(`
        INSERT INTO user_preferences (
          user_id, theme_id, card_animation_enabled, sound_enabled, 
          voice_enabled, auto_mark_numbers, card_size
        ) VALUES (?, 1, 1, 1, 1, 1, 'medium')
      `, [result.lastID]);
      
      console.log('Préférences utilisateur créées avec succès');
      
      // Assigner des défis quotidiens à l'utilisateur
      const today = new Date().toISOString().split('T')[0];
      
      // Sélectionner 3 défis aléatoires
      const challenges = await db.all(`
        SELECT id FROM daily_challenges 
        ORDER BY RANDOM() 
        LIMIT 3
      `);
      
      for (const challenge of challenges) {
        await db.run(`
          INSERT INTO user_challenges (
            user_id, challenge_id, assigned_date, progress, completed
          ) VALUES (?, ?, ?, 0, 0)
        `, [result.lastID, challenge.id, today]);
      }
      
      console.log('Défis quotidiens assignés avec succès');
      
      console.log('\nCompte utilisateur créé avec succès !');
      console.log('Nom d\'utilisateur: testuser');
      console.log('Mot de passe: testpassword');
      console.log('Solde initial: 1000 fr');
    }
    
    // Fermer la connexion à la base de données
    await db.close();
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

main();