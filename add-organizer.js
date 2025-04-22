/**
 * Script pour ajouter un organisateur à MS BINGO
 */

const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Chemin de la base de données
const dbPath = path.join(__dirname, 'msbingo.db');

// Vérifier si la base de données existe
if (!fs.existsSync(dbPath)) {
  console.error(`❌ Base de données introuvable: ${dbPath}`);
  process.exit(1);
}

/**
 * Hache un mot de passe avec un sel aléatoire
 * @param {string} password Mot de passe à hacher
 * @returns {Promise<string>} Chaîne contenant le hachage et le sel
 */
async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    try {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.scryptSync(password, salt, 64).toString('hex');
      resolve(`${hash}.${salt}`);
    } catch (error) {
      reject(error);
    }
  });
}

async function main() {
  // Connexion à la base de données
  const db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
      console.error(`❌ Erreur de connexion à la base de données: ${err.message}`);
      process.exit(1);
    }
    
    try {
      console.log('🔍 Vérification de la structure de la base de données...');
      
      // Vérifier si la table users existe
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", async (err, table) => {
        if (err) {
          console.error(`❌ Erreur lors de la vérification des tables: ${err.message}`);
          db.close();
          process.exit(1);
        }
        
        if (!table) {
          console.log('⚠️ La table users n\'existe pas, création...');
          
          // Créer la table users
          db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            balance INTEGER DEFAULT 1000,
            isAdmin INTEGER DEFAULT 0,
            isOrganizer INTEGER DEFAULT 0,
            created TEXT,
            lastLogin TEXT
          )`, async (err) => {
            if (err) {
              console.error(`❌ Erreur lors de la création de la table users: ${err.message}`);
              db.close();
              process.exit(1);
            }
            
            console.log('✅ Table users créée avec succès');
            await addOrganizer(db);
          });
        } else {
          console.log('✅ Table users trouvée');
          await addOrganizer(db);
        }
      });
    } catch (error) {
      console.error(`❌ Erreur: ${error.message}`);
      db.close();
      process.exit(1);
    }
  });
}

async function addOrganizer(db) {
  // Vérifier si l'organisateur existe déjà
  db.get("SELECT * FROM users WHERE username = 'organisateur'", async (err, user) => {
    if (err) {
      console.error(`❌ Erreur lors de la vérification de l'utilisateur organisateur: ${err.message}`);
      db.close();
      process.exit(1);
    }
    
    if (user) {
      console.log('🔄 L\'utilisateur organisateur existe déjà, mise à jour des privilèges...');
      
      // Mettre à jour les privilèges
      db.run("UPDATE users SET isOrganizer = 1 WHERE username = 'organisateur'", (err) => {
        if (err) {
          console.error(`❌ Erreur lors de la mise à jour des privilèges: ${err.message}`);
        } else {
          console.log('✅ Privilèges mis à jour avec succès');
        }
        
        // Réinitialiser le mot de passe
        resetOrganizerPassword(db);
      });
    } else {
      console.log('➕ Création d\'un nouvel utilisateur organisateur...');
      
      // Hacher le mot de passe
      const hashedPassword = await hashPassword('org-password-2025');
      
      // Insérer le nouvel utilisateur
      db.run(
        "INSERT INTO users (username, password, email, balance, isAdmin, isOrganizer, created) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ['organisateur', hashedPassword, 'org@msbingo.com', 1000, 0, 1, new Date().toISOString()],
        (err) => {
          if (err) {
            console.error(`❌ Erreur lors de la création de l'utilisateur organisateur: ${err.message}`);
          } else {
            console.log('✅ Utilisateur organisateur créé avec succès');
          }
          
          db.close();
          process.exit(0);
        }
      );
    }
  });
}

async function resetOrganizerPassword(db) {
  // Hacher le nouveau mot de passe
  const hashedPassword = await hashPassword('org-password-2025');
  
  // Mettre à jour le mot de passe
  db.run("UPDATE users SET password = ? WHERE username = 'organisateur'", [hashedPassword], (err) => {
    if (err) {
      console.error(`❌ Erreur lors de la réinitialisation du mot de passe: ${err.message}`);
    } else {
      console.log('✅ Mot de passe réinitialisé avec succès');
    }
    
    db.close();
    process.exit(0);
  });
}

// Exécuter le script
main();