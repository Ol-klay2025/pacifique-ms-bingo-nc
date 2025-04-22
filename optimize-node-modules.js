/**
 * Script d'optimisation des node_modules pour MS BINGO PACIFIQUE
 * Ce script supprime les fichiers non essentiels des node_modules comme les fichiers de test, les exemples, etc.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patterns à rechercher et supprimer
const PATTERNS_TO_REMOVE = [
  // Extensions de fichiers de test et documentation
  '**/*.test.js', 
  '**/*.spec.js',
  '**/*.mdx',
  '**/test/',
  '**/tests/',
  '**/docs/',
  '**/examples/',
  '**/typedoc/',
  '**/website/',
  '**/__tests__/',
  '**/.git*/',

  // Fichiers de logs de compilation
  '**/*.log',
  '**/.turbo/',
  
  // Fichiers TypeScript sources (déjà compilés en JS)
  '**/*.ts',
  '!**/*.d.ts',
  
  // Fichiers de configuration divers
  '**/.editorconfig',
  '**/.eslintrc*',
  '**/.jshintrc',
  '**/.npmignore',
  '**/.prettierrc*',
  '**/tsconfig.json',
  '**/webpack.config.js',
  '**/rollup.config.js',
  '**/jest.config.js',
  '**/karma.conf.js',
  '**/CHANGELOG.md',
  
  // Fichiers d'exemples et de démos
  '**/demo/',
  '**/demo*/',
  
  // Fichiers minifiés avec leurs sources (garder seulement les versions minifiées)
  '**/dist/**/*.js.map',
  '**/dist/**/*.js.LICENSE.txt',
  
  // Dossiers de développement
  '**/scripts/',
  '**/src/',
  '!**/dist/src/',
  '**/tools/',
  '**/benchmark/',
];

// Fonction pour formater la taille en KB, MB, GB
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
  else return (bytes / 1073741824).toFixed(2) + " GB";
}

// Variables globales pour le suivi
let totalFilesRemoved = 0;
let totalBytesFreed = 0;

/**
 * Fonction principale d'optimisation des node_modules
 */
async function optimizeNodeModules() {
  console.log('🧹 Début de l\'optimisation des node_modules...');
  
  // Vérifier si le dossier node_modules existe
  if (!fs.existsSync('./node_modules')) {
    console.error('❌ Le dossier node_modules n\'existe pas!');
    return;
  }
  
  // Taille initiale de node_modules
  const initialSize = Number(execSync('du -sb ./node_modules | cut -f1', { encoding: 'utf8' }).trim());
  console.log(`📊 Taille initiale de node_modules: ${formatBytes(initialSize)}`);
  
  // Supprimer les fichiers par pattern
  console.log('\n🔍 Suppression des fichiers non essentiels...');
  
  for (const pattern of PATTERNS_TO_REMOVE) {
    try {
      const exclude = pattern.startsWith('!');
      const actualPattern = exclude ? pattern.substring(1) : pattern;
      
      // Utiliser find pour localiser les fichiers correspondant au pattern
      const findCommand = `find ./node_modules -path "${actualPattern}" ${exclude ? '-prune -o' : ''}`;
      
      const files = execSync(findCommand, { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(file => file && file !== './node_modules');
      
      if (files.length > 0) {
        console.log(`   🔍 Traitement du pattern: ${pattern}`);
        
        let patternFilesRemoved = 0;
        let patternBytesFreed = 0;
        
        for (const file of files) {
          try {
            // Vérifier si c'est un fichier ou un dossier
            const stats = fs.statSync(file);
            
            if (stats.isDirectory()) {
              // Calculer la taille du dossier avant suppression
              const dirSize = Number(execSync(`du -sb "${file}" | cut -f1`, { encoding: 'utf8' }).trim());
              
              // Supprimer le dossier de manière récursive
              execSync(`rm -rf "${file}"`);
              
              patternFilesRemoved++;
              patternBytesFreed += dirSize;
              totalBytesFreed += dirSize;
              
              if (patternFilesRemoved % 50 === 0) {
                console.log(`      🗑️ ${patternFilesRemoved} éléments supprimés...`);
              }
            } else {
              // Calculer la taille du fichier
              const fileSize = stats.size;
              
              // Supprimer le fichier
              fs.unlinkSync(file);
              
              patternFilesRemoved++;
              patternBytesFreed += fileSize;
              totalBytesFreed += fileSize;
              
              if (patternFilesRemoved % 100 === 0) {
                console.log(`      🗑️ ${patternFilesRemoved} éléments supprimés...`);
              }
            }
          } catch (err) {
            // Ignorer les erreurs individuelles et continuer
            continue;
          }
        }
        
        totalFilesRemoved += patternFilesRemoved;
        console.log(`      ✅ ${patternFilesRemoved} éléments supprimés (${formatBytes(patternBytesFreed)})`);
      }
    } catch (err) {
      console.error(`   ❌ Erreur lors du traitement du pattern ${pattern}: ${err.message}`);
    }
  }
  
  // Taille finale de node_modules
  const finalSize = Number(execSync('du -sb ./node_modules | cut -f1', { encoding: 'utf8' }).trim());
  const savedSize = initialSize - finalSize;
  
  console.log('\n✨ Optimisation terminée !');
  console.log(`   📄 Éléments supprimés: ${totalFilesRemoved}`);
  console.log(`   💾 Espace libéré: ${formatBytes(totalBytesFreed)}`);
  console.log(`   📊 Taille initiale: ${formatBytes(initialSize)}`);
  console.log(`   📊 Taille finale: ${formatBytes(finalSize)}`);
  console.log(`   📊 Réduction: ${(savedSize / initialSize * 100).toFixed(2)}%`);
  
  console.log('\n🚀 node_modules optimisé !');
}

// Exécuter le script d'optimisation
optimizeNodeModules();