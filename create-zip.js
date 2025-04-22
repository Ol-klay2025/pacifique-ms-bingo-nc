/**
 * Script pour générer une archive ZIP du projet
 * Ce script exclut node_modules et d'autres fichiers inutiles
 */
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Vous devrez d'abord installer archiver
// Exécutez dans le terminal: npm install archiver

// Nom du fichier ZIP à créer
const OUTPUT_FILE = 'pmb.zip';

// Dossiers et fichiers à exclure
const EXCLUDES = [
  'node_modules',
  '.git',
  '.local',
  '.cache',
  '.config',
  'logs',
  OUTPUT_FILE,
  'create-zip.js'
];

// Créer un stream vers le fichier de sortie
const output = fs.createWriteStream(path.join(__dirname, OUTPUT_FILE));
const archive = archiver('zip', {
  zlib: { level: 9 } // Niveau de compression maximum
});

// Gestion des événements
output.on('close', () => {
  console.log(`Archive créée: ${OUTPUT_FILE}`);
  console.log(`Taille: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
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

// Préparer l'archive
archive.pipe(output);

// Fonction pour vérifier si un chemin doit être exclu
function shouldExclude(filePath) {
  return EXCLUDES.some(exclude => 
    filePath.includes('/' + exclude + '/') || 
    filePath === exclude ||
    filePath.endsWith('/' + exclude)
  );
}

// Fonction récursive pour ajouter des fichiers à l'archive
function addDirectoryToArchive(dirPath, parentPath = '') {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const archivePath = path.join(parentPath, entry.name);
    
    if (shouldExclude(fullPath)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      addDirectoryToArchive(fullPath, archivePath);
    } else {
      console.log(`Ajout: ${archivePath}`);
      archive.file(fullPath, { name: archivePath });
    }
  }
}

// Ajouter tous les fichiers du projet au ZIP
console.log('Début de la création de l\'archive...');
addDirectoryToArchive(__dirname);

// Finaliser l'archive
archive.finalize();