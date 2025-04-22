/**
 * MS BINGO PACIFIQUE - Script de génération de certificat SSL
 * Version: 15 avril 2025
 * 
 * Ce script est conçu pour être exécuté une seule fois manuellement 
 * afin de générer un certificat SSL valide pour l'application.
 */

const letsEncrypt = require('./setup-letsencrypt');

// Message d'introduction
console.log('=====================================================');
console.log('MS BINGO PACIFIQUE - GÉNÉRATION DE CERTIFICAT SSL');
console.log('=====================================================');
console.log('Ce script va tenter de générer un certificat SSL valide');
console.log('via Let\'s Encrypt pour l\'URL de déploiement Replit.');
console.log('');
console.log('⚠️ IMPORTANT: Cette opération nécessite que votre application');
console.log('soit déjà déployée et accessible publiquement sur Replit.');
console.log('=====================================================');
console.log('');

async function main() {
  console.log('Vérification des certificats existants...');
  
  if (letsEncrypt.certificatsExistent()) {
    console.log('✅ Des certificats valides existent déjà dans le répertoire certs/');
    console.log('   Aucune action nécessaire.');
    console.log('');
    console.log('Si vous souhaitez renouveler ces certificats, supprimez d\'abord');
    console.log('le contenu du répertoire certs/ puis relancez ce script.');
    return;
  }
  
  console.log('🔄 Aucun certificat trouvé. Démarrage de la procédure de génération...');
  
  try {
    const success = await letsEncrypt.configurationSSL();
    
    if (success) {
      console.log('');
      console.log('✅ CERTIFICAT SSL GÉNÉRÉ AVEC SUCCÈS');
      console.log('');
      console.log('Le certificat sera automatiquement utilisé au prochain');
      console.log('démarrage de l\'application. Pour l\'utiliser immédiatement,');
      console.log('vous devez redéployer l\'application dans Replit.');
    } else {
      console.log('');
      console.log('❌ ÉCHEC DE LA GÉNÉRATION DU CERTIFICAT');
      console.log('');
      console.log('Causes possibles:');
      console.log('1. L\'application n\'est pas encore déployée sur Replit');
      console.log('2. Le domaine n\'est pas correctement configuré');
      console.log('3. Let\'s Encrypt n\'a pas pu valider votre domaine');
      console.log('');
      console.log('Solution de contournement:');
      console.log('L\'application va continuer à utiliser le certificat');
      console.log('auto-signé comme solution de repli.');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la génération du certificat:', error);
    console.log('');
    console.log('Solution de contournement:');
    console.log('L\'application va continuer à utiliser le certificat');
    console.log('auto-signé comme solution de repli.');
  }
}

// Exécuter le script
main().catch(console.error);