/**
 * Script d'optimisation des ressources pour MS BINGO PACIFIQUE
 * Ce script détecte et supprime les fichiers d'images dupliqués
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Configuration
const IMAGE_DIRS = ['public/images', 'public/img', 'public/assets'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];

// Variables globales
let totalSizeBefore = 0;
let totalSizeAfter = 0;
let filesRemoved = 0;
let duplicatesFound = 0;

// Fonction pour calculer le hash MD5 d'un fichier
function calculateFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

// Fonction pour formater la taille en KB, MB, GB
function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
    else return (bytes / 1073741824).toFixed(2) + " GB";
}

// Fonction pour mettre à jour les chemins d'images dans les fichiers HTML, CSS et JS
function updateImagePaths(oldPath, newPath) {
    const oldRelativePath = oldPath.replace(/^public\//, '');
    const newRelativePath = newPath.replace(/^public\//, '');
    
    try {
        // Chercher dans les fichiers HTML
        const htmlFiles = execSync(`find public -name "*.html"`, { encoding: 'utf8' })
            .trim()
            .split('\n')
            .filter(file => file.length > 0);

        // Chercher dans les fichiers CSS
        const cssFiles = execSync(`find public -name "*.css"`, { encoding: 'utf8' })
            .trim()
            .split('\n')
            .filter(file => file.length > 0);

        // Chercher dans les fichiers JS
        const jsFiles = execSync(`find public -name "*.js"`, { encoding: 'utf8' })
            .trim()
            .split('\n')
            .filter(file => file.length > 0);

        const allFiles = [...htmlFiles, ...cssFiles, ...jsFiles];
        let updated = false;

        for (const file of allFiles) {
            let content = fs.readFileSync(file, 'utf8');
            
            // Vérifier plusieurs formats de chemins possibles
            const patterns = [
                `"${oldRelativePath}"`,
                `'${oldRelativePath}'`,
                `"/${oldRelativePath}"`,
                `'/${oldRelativePath}'`,
                `url("${oldRelativePath}")`,
                `url('${oldRelativePath}')`,
                `url(${oldRelativePath})`,
                `url("/${oldRelativePath}")`,
                `url('/${oldRelativePath}')`,
                `url(/${oldRelativePath})`
            ];
            
            let contentChanged = false;
            
            for (const pattern of patterns) {
                // Ne pas remplacer si le chemin n'existe pas
                if (!content.includes(pattern)) continue;
                
                // Construire le chemin de remplacement correspondant
                let replacement = pattern
                    .replace(oldRelativePath, newRelativePath)
                    .replace(`/${oldRelativePath}`, `/${newRelativePath}`);
                
                // Remplacer dans le contenu
                if (content.includes(pattern)) {
                    content = content.split(pattern).join(replacement);
                    contentChanged = true;
                    updated = true;
                }
            }
            
            // Sauvegarder le fichier s'il a été modifié
            if (contentChanged) {
                fs.writeFileSync(file, content);
                console.log(`   📝 Mis à jour les références dans: ${file}`);
            }
        }
        
        return updated;
    } catch (err) {
        console.error(`   ❌ Erreur lors de la mise à jour des chemins d'images: ${err.message}`);
        return false;
    }
}

// Fonction principale d'optimisation
async function optimizeAssets() {
    console.log('🧹 Démarrage de l\'optimisation des ressources MS BINGO PACIFIQUE...');
    
    // 1. Collecter tous les fichiers d'images
    console.log('\n🔍 Collecte des fichiers d\'images...');
    const imageFiles = [];
    
    for (const dir of IMAGE_DIRS) {
        if (!fs.existsSync(dir)) continue;
        
        const files = fs.readdirSync(dir)
            .filter(file => IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase()))
            .map(file => path.join(dir, file));
        
        imageFiles.push(...files);
    }
    
    console.log(`   📸 Trouvé ${imageFiles.length} fichiers d'images`);
    
    // 2. Détecter les doublons basés sur les hashes MD5
    console.log('\n🔍 Détection des doublons...');
    const fileHashes = {};
    const duplicates = [];
    
    for (const file of imageFiles) {
        try {
            const stats = fs.statSync(file);
            totalSizeBefore += stats.size;
            
            const hash = calculateFileHash(file);
            
            if (hash in fileHashes) {
                duplicates.push({
                    original: fileHashes[hash],
                    duplicate: file,
                    size: stats.size
                });
                duplicatesFound++;
            } else {
                fileHashes[hash] = file;
            }
        } catch (err) {
            console.error(`   ❌ Erreur lors du traitement de ${file}: ${err.message}`);
        }
    }
    
    console.log(`   🔄 Détecté ${duplicates.length} fichiers dupliqués`);
    
    // 3. Traiter les duplications
    if (duplicates.length > 0) {
        console.log('\n🧹 Suppression des doublons...');
        
        for (const dup of duplicates) {
            try {
                // Vérifier si les fichiers référencés dans le HTML/CSS pointent vers le duplicata
                console.log(`   🔄 Traitement du doublon: ${dup.duplicate}`);
                console.log(`      Original: ${dup.original}`);
                
                // Mettre à jour les chemins si nécessaire avant de supprimer
                const pathsUpdated = updateImagePaths(dup.duplicate, dup.original);
                
                if (pathsUpdated) {
                    console.log('      ✅ Chemins mis à jour dans les fichiers');
                } else {
                    console.log('      ℹ️ Aucun chemin à mettre à jour dans les fichiers');
                }
                
                // Supprimer le fichier dupliqué
                fs.unlinkSync(dup.duplicate);
                totalSizeAfter += dup.size;
                filesRemoved++;
                
                console.log(`      ✅ Fichier dupliqué supprimé (${formatBytes(dup.size)})`);
            } catch (err) {
                console.error(`   ❌ Erreur lors de la suppression de ${dup.duplicate}: ${err.message}`);
            }
        }
    }
    
    // Résumé
    console.log('\n✨ Optimisation terminée !');
    console.log(`   📊 Images analysées: ${imageFiles.length}`);
    console.log(`   🔄 Doublons détectés: ${duplicatesFound}`);
    console.log(`   📄 Fichiers supprimés: ${filesRemoved}`);
    console.log(`   💾 Espace libéré: ${formatBytes(totalSizeAfter)}`);
    
    console.log('\n🚀 Ressources optimisées !');
}

// Exécuter le script d'optimisation
optimizeAssets();