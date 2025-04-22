/**
 * Améliorations pour les annonces vocales MS BINGO
 * - Annonces plus précises pour les numéros
 * - Phrases spéciales pour la quine et le bingo
 * - Voix féminine en français
 * - Délai personnalisable entre les numéros
 */

// État global des annonces vocales
const speechState = {
    isActive: false,
    isPaused: false,
    queue: [],
    currentUtterance: null,
    pauseTimeout: null,
    pauseDuration: 2000, // 2 secondes entre chaque numéro
    voice: null,
};

// Configuration pour la prononciation française des numéros
const frenchNumberPronunciation = {
    1: "un",
    2: "deux",
    3: "trois",
    4: "quatre",
    5: "cinq",
    6: "six",
    7: "sept",
    8: "huit",
    9: "neuf",
    10: "dix",
    11: "onze",
    12: "douze",
    13: "treize",
    14: "quatorze",
    15: "quinze",
    16: "seize",
    17: "dix-sept",
    18: "dix-huit",
    19: "dix-neuf",
    20: "vingt",
    30: "trente",
    40: "quarante",
    50: "cinquante",
    60: "soixante",
    70: "soixante-dix",
    80: "quatre-vingts",
    90: "quatre-vingt-dix"
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser la synthèse vocale
    initSpeechSynthesis();
    
    // Vérifier les préférences de l'utilisateur
    const voiceEnabled = localStorage.getItem('voice_enabled') !== 'false';
    if (voiceEnabled) {
        speechState.isActive = true;
    }
    
    // Ajouter un bouton d'activation/désactivation des annonces vocales
    createVoiceToggleButton();
    
    // Ajouter un bouton pour déclencher manuellement la synthèse vocale (pour contourner la politique d'autoplay)
    createUserInteractionButton();
});

// Initialisation de la synthèse vocale
function initSpeechSynthesis() {
    if (!window.speechSynthesis) {
        console.warn('La synthèse vocale n\'est pas prise en charge par ce navigateur.');
        return;
    }
    
    // Charger les voix disponibles
    loadVoices();
    
    // Si les voix ne sont pas immédiatement disponibles, attendre l'événement voiceschanged
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
}

// Charger les voix disponibles et sélectionner une voix française féminine
function loadVoices() {
    const voices = window.speechSynthesis.getVoices();
    
    // Chercher une voix française féminine
    let frenchFemaleVoice = voices.find(voice => 
        voice.lang.includes('fr-FR') && voice.name.includes('female')
    );
    
    // Si aucune voix féminine française n'est trouvée, chercher une voix française
    if (!frenchFemaleVoice) {
        frenchFemaleVoice = voices.find(voice => voice.lang.includes('fr-FR'));
    }
    
    // Si aucune voix française n'est trouvée, prendre la première voix disponible
    speechState.voice = frenchFemaleVoice || voices[0];
    
    console.log('Voix sélectionnée pour les annonces:', speechState.voice ? speechState.voice.name : 'Aucune');
}

// Créer un bouton d'activation/désactivation des annonces vocales
function createVoiceToggleButton() {
    // Vérifier si le bouton existe déjà
    if (document.getElementById('voice-toggle-btn')) {
        return;
    }
    
    const button = document.createElement('button');
    button.id = 'voice-toggle-btn';
    button.className = 'voice-toggle-btn';
    button.innerHTML = `
        <i class="voice-icon ${speechState.isActive ? 'active' : 'muted'}"></i>
        <span>${speechState.isActive ? 'Annonces vocales activées' : 'Annonces vocales désactivées'}</span>
    `;
    
    button.addEventListener('click', () => {
        toggleVoice();
        button.querySelector('.voice-icon').className = `voice-icon ${speechState.isActive ? 'active' : 'muted'}`;
        button.querySelector('span').textContent = speechState.isActive ? 'Annonces vocales activées' : 'Annonces vocales désactivées';
        
        // Sauvegarder la préférence de l'utilisateur
        localStorage.setItem('voice_enabled', speechState.isActive ? 'true' : 'false');
    });
    
    // Chercher un bon emplacement pour le bouton
    const gameControls = document.querySelector('.game-controls, #game-controls');
    if (gameControls) {
        gameControls.appendChild(button);
    } else {
        // Fallback: ajouter près des options de marquage
        const markingOptions = document.getElementById('marking-options');
        if (markingOptions) {
            markingOptions.parentNode.insertBefore(button, markingOptions.nextSibling);
        } else {
            // Dernier recours: ajouter au début du corps
            const prizeDisplay = document.getElementById('prize-display');
            if (prizeDisplay) {
                prizeDisplay.parentNode.insertBefore(button, prizeDisplay.nextSibling);
            } else {
                document.body.insertBefore(button, document.body.firstChild);
            }
        }
    }
}

// Créer un bouton pour l'interaction utilisateur requise pour la synthèse vocale
function createUserInteractionButton() {
    const button = document.createElement('button');
    button.id = 'voice-interaction-btn';
    button.className = 'voice-interaction-btn';
    button.textContent = 'Activer les annonces vocales';
    
    button.addEventListener('click', () => {
        // Jouer un son vide pour activer l'audio dans le navigateur
        speakText('');
        
        // Cacher le bouton après l'interaction
        button.style.display = 'none';
        
        // Marquer comme activé
        document.body.classList.add('voice-interaction-enabled');
    });
    
    // Style pour le bouton
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '1000';
    button.style.padding = '10px 15px';
    button.style.backgroundColor = '#e53935';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '14px';
    button.style.fontWeight = 'bold';
    button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    
    document.body.appendChild(button);
}

// Activer/désactiver les annonces vocales
function toggleVoice() {
    speechState.isActive = !speechState.isActive;
    
    if (!speechState.isActive) {
        // Annuler toutes les annonces en cours
        cancelAllAnnouncements();
    }
}

// Annoncer un numéro de bingo
function announceNumber(number, column) {
    if (!speechState.isActive || !window.speechSynthesis) {
        return;
    }
    
    // Vérifier si le bouton d'interaction a été cliqué
    if (!document.body.classList.contains('voice-interaction-enabled')) {
        document.getElementById('voice-interaction-btn').style.display = 'block';
        return;
    }
    
    const columnLetter = ['B', 'I', 'N', 'G', 'O'][column - 1];
    
    // Construire le texte à annoncer
    let text = `${columnLetter} ${getNumberPronunciation(number)}`;
    
    // Ajouter à la file d'attente
    addToSpeechQueue(text);
}

// Annoncer une quine
function announceQuine() {
    if (!speechState.isActive || !window.speechSynthesis) {
        return;
    }
    
    // Vérifier si le bouton d'interaction a été cliqué
    if (!document.body.classList.contains('voice-interaction-enabled')) {
        document.getElementById('voice-interaction-btn').style.display = 'block';
        return;
    }
    
    // Annuler tout ce qui est en cours pour prioriser cette annonce
    cancelAllAnnouncements();
    
    // Annoncer la quine
    speakText('Quine annoncé!', { rate: 1, pitch: 1.2, volume: 1 });
}

// Annoncer un bingo
function announceBingo() {
    if (!speechState.isActive || !window.speechSynthesis) {
        return;
    }
    
    // Vérifier si le bouton d'interaction a été cliqué
    if (!document.body.classList.contains('voice-interaction-enabled')) {
        document.getElementById('voice-interaction-btn').style.display = 'block';
        return;
    }
    
    // Annuler tout ce qui est en cours pour prioriser cette annonce
    cancelAllAnnouncements();
    
    // Annoncer le bingo
    speakText('Bingo annoncé!', { rate: 1, pitch: 1.2, volume: 1 });
}

// Annoncer le début d'un nouveau jeu
function announceNewGame() {
    if (!speechState.isActive || !window.speechSynthesis) {
        return;
    }
    
    // Vérifier si le bouton d'interaction a été cliqué
    if (!document.body.classList.contains('voice-interaction-enabled')) {
        document.getElementById('voice-interaction-btn').style.display = 'block';
        return;
    }
    
    // Annuler tout ce qui est en cours pour prioriser cette annonce
    cancelAllAnnouncements();
    
    // Annoncer le début d'un nouveau jeu
    speakText('Nouvelle partie! Préparez vos cartes!', { rate: 1, pitch: 1, volume: 1 });
}

// Prononciation française des nombres
function getNumberPronunciation(number) {
    // Nombre direct (1-20)
    if (number <= 20) {
        return frenchNumberPronunciation[number] || number.toString();
    }
    
    // Dizaines exactes (30, 40, etc.)
    if (number % 10 === 0) {
        return frenchNumberPronunciation[number] || number.toString();
    }
    
    // Nombres composés
    const tens = Math.floor(number / 10) * 10;
    const units = number % 10;
    
    if (tens === 70) {
        // 71-79: soixante-et-onze, soixante-douze, etc.
        return `soixante-${frenchNumberPronunciation[units + 10]}`;
    } else if (tens === 90) {
        // 91-99: quatre-vingt-onze, quatre-vingt-douze, etc.
        return `quatre-vingt-${frenchNumberPronunciation[units + 10]}`;
    } else {
        // Autres nombres: vingt-et-un, trente-deux, etc.
        const connector = units === 1 && tens < 70 ? '-et-' : '-';
        return `${frenchNumberPronunciation[tens]}${connector}${frenchNumberPronunciation[units]}`;
    }
}

// Ajouter un texte à la file d'attente des annonces
function addToSpeechQueue(text, options = {}) {
    speechState.queue.push({ text, options });
    
    if (!speechState.isPaused && !speechState.currentUtterance) {
        processSpeechQueue();
    }
}

// Traiter la file d'attente des annonces
function processSpeechQueue() {
    if (speechState.queue.length === 0 || speechState.isPaused) {
        return;
    }
    
    const { text, options } = speechState.queue.shift();
    speakText(text, options);
    
    // Ajouter une pause entre les annonces
    speechState.isPaused = true;
    speechState.pauseTimeout = setTimeout(() => {
        speechState.isPaused = false;
        processSpeechQueue();
    }, speechState.pauseDuration);
}

// Prononcer un texte avec la synthèse vocale
function speakText(text, options = {}) {
    if (!window.speechSynthesis) {
        return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Appliquer les options
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    // Utiliser la voix française si disponible
    if (speechState.voice) {
        utterance.voice = speechState.voice;
    }
    utterance.lang = 'fr-FR';
    
    // Gérer la fin de l'énoncé
    utterance.onend = () => {
        speechState.currentUtterance = null;
    };
    
    // Gérer les erreurs
    utterance.onerror = (event) => {
        console.error('Erreur de synthèse vocale:', event.error);
        speechState.currentUtterance = null;
    };
    
    // Enregistrer l'énoncé courant
    speechState.currentUtterance = utterance;
    
    // Prononcer le texte
    window.speechSynthesis.speak(utterance);
}

// Annuler toutes les annonces en cours
function cancelAllAnnouncements() {
    if (!window.speechSynthesis) {
        return;
    }
    
    // Annuler la synthèse vocale en cours
    window.speechSynthesis.cancel();
    
    // Effacer la file d'attente
    speechState.queue = [];
    
    // Annuler le délai entre les annonces
    if (speechState.pauseTimeout) {
        clearTimeout(speechState.pauseTimeout);
        speechState.pauseTimeout = null;
    }
    
    // Réinitialiser l'état
    speechState.isPaused = false;
    speechState.currentUtterance = null;
}

// Définir la durée de la pause entre les annonces
function setPauseDuration(duration) {
    speechState.pauseDuration = duration;
}

// Ajouter les styles CSS nécessaires
const styleElement = document.createElement('style');
styleElement.textContent = `
    .voice-toggle-btn {
        display: flex;
        align-items: center;
        background-color: #333;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 20px;
        cursor: pointer;
        margin: 10px 0;
        transition: background-color 0.3s;
    }
    
    .voice-toggle-btn:hover {
        background-color: #444;
    }
    
    .voice-icon {
        width: 20px;
        height: 20px;
        margin-right: 8px;
        position: relative;
    }
    
    .voice-icon.active::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 8px 0 8px 12px;
        border-color: transparent transparent transparent #4CAF50;
        transform: translateY(-50%);
    }
    
    .voice-icon.muted::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 20px;
        height: 2px;
        background-color: #e53935;
        transform: translateY(-50%) rotate(45deg);
    }
    
    .voice-icon.muted::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 20px;
        height: 2px;
        background-color: #e53935;
        transform: translateY(-50%) rotate(-45deg);
    }
`;

document.head.appendChild(styleElement);

// Exposer les fonctions pour une utilisation externe
window.msBingoSpeech = {
    announceNumber,
    announceQuine,
    announceBingo,
    announceNewGame,
    toggleVoice,
    setPauseDuration,
    getState: () => ({ ...speechState })
};