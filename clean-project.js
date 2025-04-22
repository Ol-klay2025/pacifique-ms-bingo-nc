/**
 * Script de nettoyage pour MS BINGO PACIFIQUE
 * Ce script supprime les fichiers et dossiers non essentiels pour libérer de l'espace
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fichiers essentiels à préserver
const ESSENTIAL_FILES = [
    'index.js',
    'organizer-direct-access.js',
    'package.json',
    'package-lock.json',
    'deployments.json',
    'generated-icon.png',
    '.replit',
    '.gitignore',
    'msbingo.db' // Base de données SQLite si utilisée
];

// Scripts de déploiement à conserver
const DEPLOY_SCRIPTS_TO_KEEP = [
    'deploy.js',
    'deploy-updated.js',
    'deploy-organizer-direct.js'
];

// Fichiers README à conserver pour la documentation
const README_FILES = [
    'DEPLOY.md',
    'BLOCKCHAIN-VISUALIZER-README.md',
    'KYC-README.md',
    'KYC-AND-SELF-EXCLUSION-README.md',
    'DIRECT-ACCESS-README.md',
    'INSCRIPTION-README.md',
    'AUTH-FIX-README.md'
];

// Liste des fichiers à supprimer
let filesRemoved = 0;
let bytesFreed = 0;

// Fonction pour formatter la taille en KB, MB, GB
function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
    else return (bytes / 1073741824).toFixed(2) + " GB";
}

// Fonction principale de nettoyage
function cleanProject() {
    console.log('🧹 Démarrage du nettoyage MS BINGO PACIFIQUE...');

    // 1. Supprimer les scripts serveur dupliqués
    console.log('\n📦 Suppression des scripts serveur dupliqués...');
    const serverScripts = findFiles('.', '*server*.js').filter(file => {
        const basename = path.basename(file);
        return !ESSENTIAL_FILES.includes(basename) && !DEPLOY_SCRIPTS_TO_KEEP.includes(basename);
    });
    
    removeFiles(serverScripts);

    // 2. Supprimer les scripts de déploiement redondants
    console.log('\n📦 Suppression des scripts de déploiement redondants...');
    const deployScripts = findFiles('.', '*deploy*.js').filter(file => {
        const basename = path.basename(file);
        return !DEPLOY_SCRIPTS_TO_KEEP.includes(basename);
    });
    
    removeFiles(deployScripts);

    // 3. Supprimer les dossiers vides (sauf ceux potentiellement utilisés)
    console.log('\n📦 Suppression des dossiers vides...');
    const emptyDirs = ['data', 'certs'].filter(dir => {
        if (!fs.existsSync(dir)) return false;
        return fs.readdirSync(dir).length === 0;
    });
    
    for (const dir of emptyDirs) {
        try {
            fs.rmdirSync(dir);
            console.log(`   ✅ Supprimé dossier vide: ${dir}`);
        } catch (err) {
            console.error(`   ❌ Erreur lors de la suppression du dossier ${dir}: ${err.message}`);
        }
    }

    // 4. Supprimer les fichiers temporaires et journaux
    console.log('\n📦 Suppression des fichiers temporaires et journaux...');
    const tempFiles = findFiles('.', '*.log')
        .concat(findFiles('.', '*.pid'))
        .concat(findFiles('.', '*.tmp'))
        .filter(file => !file.includes('node_modules'));
    
    removeFiles(tempFiles);

    // 5. Supprimer les scripts de correction redondants
    console.log('\n📦 Suppression des scripts de correction redondants...');
    const fixScripts = findFiles('.', '*fix*.js').filter(file => {
        const basename = path.basename(file);
        return basename !== 'direct-login-fix.js' && basename !== 'direct-fix.js';
    });
    
    removeFiles(fixScripts);

    // 6. Supprimer les scripts de test redondants
    console.log('\n📦 Suppression des scripts de test...');
    const testScripts = findFiles('.', '*test*.js');
    
    removeFiles(testScripts);

    // Résumé
    console.log('\n✨ Nettoyage terminé !');
    console.log(`   📄 Fichiers supprimés: ${filesRemoved}`);
    console.log(`   💾 Espace libéré: ${formatBytes(bytesFreed)}`);
    console.log('\nLes fichiers essentiels ont été préservés:');
    console.log(`   - ${ESSENTIAL_FILES.join('\n   - ')}`);
    console.log('\nScripts de déploiement conservés:');
    console.log(`   - ${DEPLOY_SCRIPTS_TO_KEEP.join('\n   - ')}`);
    console.log('\nDocumentation README conservée:');
    console.log(`   - ${README_FILES.join('\n   - ')}`);

    console.log('\n🚀 Votre projet est maintenant optimisé !');
}

// Fonction pour trouver des fichiers avec un motif glob
function findFiles(dir, pattern) {
    try {
        const result = execSync(`find ${dir} -type f -name "${pattern}" -not -path "*/node_modules/*" -not -path "*/public/*" -not -path "*/client/*"`, { encoding: 'utf8' });
        return result.trim().split('\n').filter(line => line.length > 0);
    } catch (err) {
        console.error(`Erreur lors de la recherche de fichiers: ${err.message}`);
        return [];
    }
}

// Fonction pour supprimer une liste de fichiers
function removeFiles(files) {
    for (const file of files) {
        try {
            const basename = path.basename(file);
            
            // Ne pas supprimer les fichiers essentiels
            if (ESSENTIAL_FILES.includes(basename)) continue;
            if (README_FILES.includes(basename)) continue;
            if (DEPLOY_SCRIPTS_TO_KEEP.includes(basename)) continue;
            
            // Obtenir la taille du fichier avant de le supprimer
            const stats = fs.statSync(file);
            bytesFreed += stats.size;
            
            // Supprimer le fichier
            fs.unlinkSync(file);
            filesRemoved++;
            console.log(`   ✅ Supprimé: ${file} (${formatBytes(stats.size)})`);
        } catch (err) {
            console.error(`   ❌ Erreur lors de la suppression de ${file}: ${err.message}`);
        }
    }
}

// Exécuter le script de nettoyage
cleanProject();