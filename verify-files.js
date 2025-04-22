/**
 * Script de vérification des fichiers pour MS BINGO
 * Ce script vérifie que tous les fichiers nécessaires sont présents et correctement configurés
 */

const fs = require('fs');
const path = require('path');

console.log('📢 Vérification des fichiers MS BINGO...');
console.log('---------------------------------------------------');

// Liste des fichiers à vérifier
const filesToCheck = [
  'public/customization.html',
  'public/play.html',
  'public/index.html',
  'server.js',
  'deploy-server.js',
  'deploy-fix-routes.js'
];

// Vérifier chaque fichier
filesToCheck.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  console.log(`\n🔍 Vérification de ${filePath}...`);
  
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ Le fichier existe (${stats.size} octets)`);
    console.log(`📅 Dernière modification: ${stats.mtime}`);
    
    // Vérifications spécifiques pour certains fichiers
    if (filePath === 'public/customization.html') {
      const content = fs.readFileSync(fullPath, 'utf8');
      console.log(`👀 Le fichier commence par: ${content.substring(0, 50)}...`);
      
      // Vérifier si le fichier contient certains éléments essentiels
      if (content.includes('<title>MS BINGO - Personnalisation</title>')) {
        console.log('✅ Le titre de la page est correct');
      } else {
        console.log('❌ Le titre de la page est incorrect ou manquant');
      }
      
      if (content.includes('theme-tropical') && content.includes('theme-ocean')) {
        console.log('✅ Les thèmes sont présents dans le fichier');
      } else {
        console.log('❌ Les thèmes sont manquants ou incorrects');
      }
    }
    
    if (filePath === 'server.js' || filePath === 'deploy-server.js') {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Vérifier si la route de personnalisation est présente
      if (content.includes('app.get(\'/customization\'')) {
        console.log('✅ La route de personnalisation est présente');
      } else {
        console.log('❌ La route de personnalisation est manquante');
      }
    }
  } else {
    console.log('❌ Le fichier n\'existe pas');
  }
});

console.log('\n---------------------------------------------------');
console.log('📊 Vérification terminée !');
console.log('---------------------------------------------------');