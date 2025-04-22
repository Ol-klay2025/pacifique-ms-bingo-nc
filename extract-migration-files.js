/**
 * Script d'extraction des fichiers essentiels pour la migration du projet MS BINGO PACIFIQUE
 * Version: 16 avril 2025
 * 
 * Ce script identifie et copie tous les fichiers nécessaires pour recréer le projet
 * sur un nouveau Replit, en excluant les fichiers temporaires, logs, et node_modules.
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Configuration du script
const CONFIG = {
  outputZip: 'ms-bingo-migration.zip',
  outputDir: './migration-files',
  excludeDirs: [
    'node_modules', 
    '.git', 
    'logs', 
    'tmp', 
    'dist',
    'export', 
    'data'
  ],
  excludeExtensions: [
    '.log', 
    '.tmp', 
    '.map', 
    '.lock'
  ],
  excludePatterns: [
    'package-lock.json',
    '.DS_Store',
    '.replit',
    'Thumbs.db'
  ],
  includeDirs: [
    'public',
    'server',
    'shared',
    'client/src',
    'routes'
  ],
  mustIncludeFiles: [
    'package.json',
    'deploy-config.json',
    'index.js',
    'serveur.js',
    'api-server.js',
    'interface-jeu-bingo.html',
    'bingo-integration-demo.html',
    'server/db.ts',
    'server/routes.ts',
    'server/auth.ts',
    'server/index.ts',
    'shared/schema.ts'
  ]
};

// Variables pour les statistiques
let stats = {
  scannedFiles: 0,
  includedFiles: 0,
  totalSize: 0,
  startTime: Date.now()
};

/**
 * Crée un dossier récursivement s'il n'existe pas
 */
function ensureDirectoryExists(dirPath) {
  if (fs.existsSync(dirPath)) return;
  
  // Créer les dossiers récursivement
  fs.mkdirSync(dirPath, { recursive: true });
  console.log(`Dossier créé: ${dirPath}`);
}

/**
 * Convertit une taille en octets en format lisible
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' octets';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' Ko';
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' Mo';
  else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' Go';
}

/**
 * Vérifie si un fichier doit être exclu en fonction de son chemin
 */
function shouldExclude(filePath) {
  const relativePath = filePath.replace(/\\/g, '/');
  
  // Vérifier les dossiers exclus
  if (CONFIG.excludeDirs.some(dir => 
    relativePath.includes(`/${dir}/`) || relativePath === dir || relativePath.startsWith(`${dir}/`)
  )) return true;
  
  // Vérifier les extensions exclues
  const ext = path.extname(filePath).toLowerCase();
  if (CONFIG.excludeExtensions.includes(ext)) return true;
  
  // Vérifier les motifs exclus
  const fileName = path.basename(filePath);
  if (CONFIG.excludePatterns.some(pattern => fileName.includes(pattern))) return true;
  
  return false;
}

/**
 * Vérifie si un fichier doit être inclus en fonction de son chemin
 */
function shouldInclude(filePath) {
  const relativePath = filePath.replace(/\\/g, '/');
  
  // Les fichiers essentiels doivent toujours être inclus
  if (CONFIG.mustIncludeFiles.includes(relativePath) || 
      CONFIG.mustIncludeFiles.some(f => relativePath.endsWith(f))) {
    return true;
  }
  
  // Inclure les fichiers dans les dossiers spécifiés
  if (CONFIG.includeDirs.some(dir => 
    relativePath.startsWith(`${dir}/`) || relativePath === dir
  )) return true;
  
  // Inclure certaines extensions spécifiques à la racine
  const ext = path.extname(filePath).toLowerCase();
  const isRootFile = !relativePath.includes('/');
  if (isRootFile && ['.js', '.ts', '.json', '.html'].includes(ext)) {
    return true;
  }
  
  return false;
}

/**
 * Explore récursivement un dossier et collecte les fichiers qui correspondent aux critères
 */
function collectFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const relativePath = filePath.replace(/\\/g, '/'); // Normaliser le chemin
    stats.scannedFiles++;
    
    if (shouldExclude(relativePath)) {
      continue;
    }
    
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      collectFiles(filePath, fileList);
    } else if (shouldInclude(relativePath) || CONFIG.mustIncludeFiles.includes(file)) {
      fileList.push({
        path: relativePath,
        size: stat.size
      });
      stats.includedFiles++;
      stats.totalSize += stat.size;
    }
  }
  
  return fileList;
}

/**
 * Copie les fichiers vers le dossier de destination
 */
function copyFilesToDir(files) {
  console.log(`\nCopie de ${files.length} fichiers vers ${CONFIG.outputDir}...`);
  
  for (const file of files) {
    const destPath = path.join(CONFIG.outputDir, file.path);
    ensureDirectoryExists(path.dirname(destPath));
    
    fs.copyFileSync(file.path, destPath);
    process.stdout.write('.');
  }
  
  console.log('\nCopie terminée!');
}

/**
 * Crée une archive ZIP des fichiers
 */
async function createZipArchive(files) {
  console.log(`\nCréation de l'archive ${CONFIG.outputZip}...`);
  
  const output = fs.createWriteStream(CONFIG.outputZip);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Compression maximale
  });
  
  // Gérer les événements de l'archive
  output.on('close', () => {
    const zipSize = formatSize(archive.pointer());
    console.log(`Archive créée avec succès: ${CONFIG.outputZip} (${zipSize})`);
  });
  
  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn(`Avertissement: ${err.message}`);
    } else {
      throw err;
    }
  });
  
  archive.on('error', (err) => {
    throw err;
  });
  
  // Lier l'archive au flux de sortie
  archive.pipe(output);
  
  // Ajouter les fichiers à l'archive
  for (const file of files) {
    archive.file(file.path, { name: file.path });
    process.stdout.write('.');
  }
  
  // Finaliser l'archive
  console.log('\nFinalisation de l\'archive...');
  await archive.finalize();
}

/**
 * Affiche un résumé des fichiers extraits par type
 */
function printSummaryByType(files) {
  const fileTypes = {};
  
  // Grouper les fichiers par extension
  for (const file of files) {
    const ext = path.extname(file.path).toLowerCase() || '(sans extension)';
    if (!fileTypes[ext]) {
      fileTypes[ext] = {
        count: 0,
        size: 0
      };
    }
    fileTypes[ext].count++;
    fileTypes[ext].size += file.size;
  }
  
  // Afficher le résumé
  console.log('\n✅ Résumé par type de fichier:');
  console.log('─────────────────────────────────────────────');
  console.log('Type        | Nombre | Taille  ');
  console.log('─────────────────────────────────────────────');
  
  Object.keys(fileTypes).sort().forEach(ext => {
    const type = fileTypes[ext];
    console.log(`${ext.padEnd(11)} | ${String(type.count).padEnd(6)} | ${formatSize(type.size)}`);
  });
  
  console.log('─────────────────────────────────────────────');
}

/**
 * Fonction principale d'extraction
 */
async function extractMigrationFiles() {
  console.log('MS BINGO PACIFIQUE - Extraction des fichiers pour migration');
  console.log('==========================================================');
  
  try {
    // Vérifier si le dossier de sortie existe et le créer si nécessaire
    ensureDirectoryExists(CONFIG.outputDir);
    
    console.log('Analyse des fichiers du projet...');
    const files = collectFiles('.');
    
    if (files.length === 0) {
      console.error('Aucun fichier trouvé à migrer!');
      return;
    }
    
    // Copier les fichiers vers le dossier de sortie
    copyFilesToDir(files);
    
    // Créer une archive ZIP
    await createZipArchive(files);
    
    // Afficher le résumé
    const elapsedTime = ((Date.now() - stats.startTime) / 1000).toFixed(2);
    console.log('\n📊 Statistiques d\'extraction:');
    console.log(`- Fichiers analysés: ${stats.scannedFiles}`);
    console.log(`- Fichiers inclus: ${stats.includedFiles}`);
    console.log(`- Taille totale: ${formatSize(stats.totalSize)}`);
    console.log(`- Temps d'exécution: ${elapsedTime} secondes`);
    
    // Afficher le résumé par type de fichier
    printSummaryByType(files);
    
    console.log('\n🚀 Extraction terminée avec succès!');
    console.log(`- Dossier: ${CONFIG.outputDir}`);
    console.log(`- Archive: ${CONFIG.outputZip}`);
    console.log('\nVous pouvez maintenant utiliser ces fichiers pour recréer votre projet sur un nouveau Replit.');
  } catch (error) {
    console.error('Erreur lors de l\'extraction:', error);
  }
}

// Exécuter la fonction principale
extractMigrationFiles().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});