import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Connexion à la base de données PostgreSQL
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/pacifique-msbingo';

// Client pour les migrations (avec timeout plus long)
const migrationClient = postgres(connectionString, { max: 1, idle_timeout: 60 });

// Client pour les requêtes normales
const queryClient = postgres(connectionString);

// Créer l'instance drizzle
export const db = drizzle(queryClient, { schema });

// Fonction pour exécuter les migrations
export async function runMigrations() {
  try {
    console.log('Exécution des migrations...');
    await migrate(drizzle(migrationClient), { migrationsFolder: 'drizzle' });
    console.log('Migrations terminées avec succès.');
  } catch (error) {
    console.error('Erreur lors des migrations:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

// Fonction pour initialiser la base de données avec les valeurs par défaut
export async function initializeDatabase() {
  try {
    console.log('Initialisation de la base de données...');
    
    // Vérifier si des paramètres système existent déjà
    const existingSettings = await db.query.systemSettings.findMany();
    
    if (existingSettings.length === 0) {
      // Créer les paramètres système par défaut
      await db.insert(schema.systemSettings).values({
        regularGamePrice: 100, // 1€
        specialGamePrice: 250, // 2.5€
        bingoPercentage: 50,
        quinePercentage: 20,
        jackpotPercentage: 10,
        platformPercentage: 20,
        minimumWithdrawal: 1000, // 10€
        targetRegisteredUsers: 1000,
        updatedAt: new Date()
      });
      
      console.log('Paramètres système créés.');
    } else {
      console.log('Les paramètres système existent déjà.');
    }
    
    // Vérifier si un jackpot existe déjà
    const existingJackpot = await db.query.jackpot.findMany();
    
    if (existingJackpot.length === 0) {
      // Créer le jackpot initial
      await db.insert(schema.jackpot).values({
        amount: 0,
        lastUpdated: new Date()
      });
      
      console.log('Jackpot initial créé.');
    } else {
      console.log('Le jackpot existe déjà.');
    }
    
    // Vérifier si un portefeuille organisateur existe déjà
    const existingWallet = await db.query.organizerWallet.findMany();
    
    if (existingWallet.length === 0) {
      // Créer le portefeuille organisateur initial
      const securityHash = Buffer.from(Math.random().toString()).toString('base64');
      await db.insert(schema.organizerWallet).values({
        balance: 0,
        lastUpdated: new Date(),
        securityHash
      });
      
      console.log('Portefeuille organisateur créé.');
    } else {
      console.log('Le portefeuille organisateur existe déjà.');
    }
    
    console.log('Initialisation de la base de données terminée.');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}