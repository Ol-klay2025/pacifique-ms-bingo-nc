/**
 * Script pour vérifier la structure de la base de données
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin de la base de données
const dbPath = path.join(__dirname, 'msbingo.db');

// Connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(`❌ Erreur de connexion à la base de données: ${err.message}`);
    process.exit(1);
  }
  
  console.log('✅ Connexion à la base de données établie');
  
  // Liste des tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error(`❌ Erreur lors de la liste des tables: ${err.message}`);
      db.close();
      process.exit(1);
    }
    
    console.log('📊 Tables trouvées:');
    tables.forEach(table => {
      console.log(` - ${table.name}`);
    });
    
    // Structure de la table users
    db.all("PRAGMA table_info(users)", (err, columns) => {
      if (err) {
        console.error(`❌ Erreur lors de la lecture de la structure users: ${err.message}`);
        db.close();
        process.exit(1);
      }
      
      console.log('\n📋 Structure de la table users:');
      columns.forEach(column => {
        console.log(` - ${column.name} (${column.type})`);
      });
      
      // Liste des utilisateurs
      db.all("SELECT * FROM users", (err, users) => {
        if (err) {
          console.error(`❌ Erreur lors de la lecture des utilisateurs: ${err.message}`);
        } else {
          console.log('\n👥 Utilisateurs enregistrés:');
          users.forEach(user => {
            // Masquer les mots de passe
            const userInfo = { ...user };
            if (userInfo.password) {
              userInfo.password = '********';
            }
            console.log(JSON.stringify(userInfo, null, 2));
          });
        }
        
        db.close();
      });
    });
  });
});