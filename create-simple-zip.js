/**
 * Script pour générer une archive ZIP simplifiée du projet
 * Ce script est conçu pour être plus compatible et facile à utiliser
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Liste des fichiers et dossiers essentiels à inclure
const essentialFiles = [
  'server/**/*',
  'client/src/**/*',
  'shared/**/*',
  'public/**/*',
  'routes/**/*',
  'api-server.js',
  'index.js',
  'package.json',
  'deploy-config.json'
];

// Fonction principale
async function createSimpleZip() {
  console.log('Création de l\'archive ZIP en cours...');
  
  const outputZip = fs.createWriteStream('pacifique-ms-bingo-v2.zip');
  const archive = archiver('zip', {
    zlib: { level: 6 } // Niveau de compression moyen pour être plus rapide
  });

  // Écouter les événements
  outputZip.on('close', () => {
    const sizeInMB = (archive.pointer() / (1024 * 1024)).toFixed(2);
    console.log(`Archive créée avec succès: pacifique-ms-bingo-v2.zip (${sizeInMB} MB)`);
  });

  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('Avertissement:', err);
    } else {
      throw err;
    }
  });

  archive.on('error', (err) => {
    throw err;
  });

  // Lier l'archive au flux de sortie
  archive.pipe(outputZip);

  // Ajouter les fichiers essentiels par pattern
  for (const pattern of essentialFiles) {
    try {
      console.log(`Ajout des fichiers correspondant à: ${pattern}`);
      archive.glob(pattern);
    } catch (err) {
      console.error(`Erreur lors de l'ajout de ${pattern}:`, err);
    }
  }

  // Ajouter quelques fichiers individuels importants
  const importantFiles = [
    'server/db.ts',
    'server/routes.ts',
    'server/auth.ts',
    'shared/schema.ts'
  ];

  for (const file of importantFiles) {
    if (fs.existsSync(file)) {
      console.log(`Ajout du fichier: ${file}`);
      archive.file(file, { name: file });
    }
  }

  console.log('Finalisation de l\'archive...');
  // Finaliser l'archive
  await archive.finalize();
}

// Exécuter la fonction principale
createSimpleZip().catch(err => {
  console.error('Erreur lors de la création de l\'archive:', err);
});