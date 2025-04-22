/**
 * Script pour exporter les fichiers essentiels du projet
 * Ce script copie les fichiers clés nécessaires au fonctionnement du projet
 */

const fs = require('fs');
const path = require('path');

// Liste des fichiers essentiels à copier
const essentialFiles = [
  'server/db.ts',
  'server/routes.ts',
  'server/auth.ts',
  'server/index.ts',
  'shared/schema.ts',
  'api-server.js',
  'index.js',
  'package.json',
  'deploy-config.json'
];

// Dossier de destination pour les fichiers exportés
const outputDir = './export';

// Créer le dossier de destination s'il n'existe pas
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Fonction pour créer les dossiers parents d'un fichier
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// Fonction principale
function exportEssentialFiles() {
  console.log('Exportation des fichiers essentiels...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of essentialFiles) {
    try {
      if (fs.existsSync(file)) {
        const destPath = path.join(outputDir, file);
        ensureDirectoryExistence(destPath);
        
        // Copier le fichier
        fs.copyFileSync(file, destPath);
        console.log(`✓ Copié: ${file}`);
        successCount++;
      } else {
        console.warn(`! Fichier non trouvé: ${file}`);
        errorCount++;
      }
    } catch (err) {
      console.error(`X Erreur lors de la copie de ${file}:`, err);
      errorCount++;
    }
  }
  
  console.log(`\nExportation terminée: ${successCount} fichiers copiés, ${errorCount} erreurs`);
  console.log(`Les fichiers ont été exportés dans le dossier: ${outputDir}`);
}

// Exécuter la fonction principale
exportEssentialFiles();