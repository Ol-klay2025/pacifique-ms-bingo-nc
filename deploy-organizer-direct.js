/**
 * Script de déploiement pour l'accès direct à l'interface organisateur
 * Ce script est conçu pour être le point d'entrée principal lors du déploiement
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Préparation du déploiement d\'accès direct organisateur MS BINGO...');

// Sauvegarder l'index.js original si ce n'est pas déjà fait
const indexPath = path.join(__dirname, 'index.js');
const backupPath = path.join(__dirname, 'index.js.regular-backup');

if (!fs.existsSync(backupPath)) {
  try {
    fs.copyFileSync(indexPath, backupPath);
    console.log('✅ Sauvegarde de index.js créée: index.js.regular-backup');
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de index.js:', error);
  }
}

// Contenu du nouveau fichier index.js pour l'accès organisateur
const newIndexContent = `/**
 * MS BINGO PACIFIQUE - Point d'entrée avec accès direct organisateur
 * Version: 14 avril 2025
 * 
 * Ce fichier a été modifié pour fournir un accès direct à l'interface organisateur
 * sans authentification requise.
 */

// Charger le script d'accès direct organisateur
require("./organizer-direct-access.js");
`;

// Écrire le nouveau contenu dans index.js
try {
  fs.writeFileSync(indexPath, newIndexContent);
  console.log('✅ Fichier index.js mis à jour pour l\'accès direct organisateur');
} catch (error) {
  console.error('❌ Erreur lors de la mise à jour de index.js:', error);
}

console.log('📝 Configuration terminée! Après déploiement, les utilisateurs auront:');
console.log('1. Un accès direct à l\'interface organisateur sans authentification');
console.log('2. Une session organisateur pré-configurée');
console.log('3. Aucun problème de redirection après connexion');

// Exécuter le script d'accès direct organisateur
require('./organizer-direct-access.js');