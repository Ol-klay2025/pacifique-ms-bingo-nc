/**
 * MS BINGO - Système d'animations de célébration
 * Ce fichier gère les animations et effets spéciaux joués lors des victoires
 * Les animations sont personnalisées en fonction de la région du joueur
 */

// Configurations des célébrations par région
const celebrationConfigs = {
    // Nouvelle-Calédonie
    'nc': {
        colors: ['#002654', '#ffffff', '#ce1126'], // Couleurs du drapeau français
        effects: {
            quine: {
                emoji: '🦎', // Gecko emblématique
                sound: 'nc-quine.mp3',
                message: "Quine ! Félicitations !"
            },
            bingo: {
                emoji: '🌴', // Palmier
                sound: 'nc-bingo.mp3',
                message: "Bingo ! Bravo !"
            },
            jackpot: {
                emoji: '💎', // Nickel (ressource minière importante)
                sound: 'nc-jackpot.mp3',
                message: "JACKPOT ! INCROYABLE !"
            }
        }
    },
    
    // Polynésie française
    'pf': {
        colors: ['#ce1126', '#ffffff', '#3a75c4'], // Couleurs du drapeau tahitien
        effects: {
            quine: {
                emoji: '🌺', // Hibiscus
                sound: 'pf-quine.mp3',
                message: "Quine ! Maeva !"
            },
            bingo: {
                emoji: '🐚', // Coquillage
                sound: 'pf-bingo.mp3',
                message: "Bingo ! Ia ora na !"
            },
            jackpot: {
                emoji: '🏄‍♂️', // Surfeur
                sound: 'pf-jackpot.mp3',
                message: "JACKPOT ! MANUIA !"
            }
        }
    },
    
    // Wallis et Futuna
    'wf': {
        colors: ['#ce1126', '#ffffff', '#002654'], // Couleurs du drapeau français
        effects: {
            quine: {
                emoji: '🐢', // Tortue
                sound: 'wf-quine.mp3',
                message: "Quine ! Mālō !"
            },
            bingo: {
                emoji: '🥥', // Noix de coco
                sound: 'wf-bingo.mp3',
                message: "Bingo ! Kua kamu !"
            },
            jackpot: {
                emoji: '👑', // Couronne traditionnelle
                sound: 'wf-jackpot.mp3',
                message: "JACKPOT ! FAKAFIEFIA !"
            }
        }
    },
    
    // Vanuatu
    'vu': {
        colors: ['#009543', '#ce1126', '#000000', '#ffce00'], // Couleurs du drapeau vanuatais
        effects: {
            quine: {
                emoji: '🏹', // Arc traditionnel
                sound: 'vu-quine.mp3',
                message: "Quine ! Tankiu !"
            },
            bingo: {
                emoji: '🌋', // Volcan
                sound: 'vu-bingo.mp3',
                message: "Bingo ! Olgeta i win !"
            },
            jackpot: {
                emoji: '🪘', // Tambour traditionnel
                sound: 'vu-jackpot.mp3',
                message: "JACKPOT ! BIGFALA WIN !"
            }
        }
    },
    
    // Fidji
    'fj': {
        colors: ['#68bfe5', '#ce1126', '#ffffff'], // Couleurs du drapeau fidjien
        effects: {
            quine: {
                emoji: '🐠', // Poisson tropical
                sound: 'fj-quine.mp3',
                message: "Quine ! Vinaka !"
            },
            bingo: {
                emoji: '🎭', // Masque traditionnel
                sound: 'fj-bingo.mp3',
                message: "Bingo ! Bula !"
            },
            jackpot: {
                emoji: '🏉', // Rugby (sport national)
                sound: 'fj-jackpot.mp3',
                message: "JACKPOT ! VAKACAUCAUTAKA !"
            }
        }
    },
    
    // Configuration par défaut (Pacifique général)
    'default': {
        colors: ['#0099cc', '#66cc99', '#ffcc33'], // Bleu océan, vert tropical, jaune soleil
        effects: {
            quine: {
                emoji: '🐬', // Dauphin
                sound: 'default-quine.mp3',
                message: "Quine ! Félicitations !"
            },
            bingo: {
                emoji: '🏝️', // Île tropicale
                sound: 'default-bingo.mp3',
                message: "Bingo ! Bravo !"
            },
            jackpot: {
                emoji: '🌈', // Arc-en-ciel
                sound: 'default-jackpot.mp3',
                message: "JACKPOT ! EXTRAORDINAIRE !"
            }
        }
    }
};

// État du système d'animation
let animationState = {
    soundEnabled: true,
    lastPlayedSound: null,
    activeAnimations: [],
};

/**
 * Initialise le système d'animation
 */
function initCelebrationSystem() {
    // Attacher les écouteurs d'événements
    setupEventListeners();
    
    // Exposer l'API globale pour les animations
    window.triggerWinAnimation = function(winType, region) {
        // Types valides: 'quine', 'bingo', 'jackpot'
        if (!['quine', 'bingo', 'jackpot'].includes(winType)) {
            console.error('Type de victoire invalide :', winType);
            return;
        }
        
        // Utiliser la région fournie ou la région par défaut
        const regionCode = region || localStorage.getItem('userRegion') || 'default';
        
        // Créer un événement personnalisé pour déclencher l'animation
        const eventName = `bingo:${winType}`;
        const celebrationEvent = new CustomEvent(eventName, {
            detail: { region: regionCode }
        });
        
        // Dispatcher l'événement
        document.dispatchEvent(celebrationEvent);
    };
}

/**
 * Configure les écouteurs d'événements pour déclencher les célébrations
 */
function setupEventListeners() {
    // Écouteur pour les victoires de type quine
    document.addEventListener('bingo:quine', handleQuineWin);
    
    // Écouteur pour les victoires de type bingo
    document.addEventListener('bingo:bingo', handleBingoWin);
    
    // Écouteur pour les victoires de type jackpot
    document.addEventListener('bingo:jackpot', handleJackpotWin);
    
    // Écouter les changements de préférences
    window.addEventListener('storage', function(e) {
        if (e.key === 'msBingoPreferences') {
            const preferences = JSON.parse(e.newValue || '{}');
            animationState.soundEnabled = preferences.markingSound !== false;
        }
    });
    
    // Charger les préférences initiales
    const savedPreferences = localStorage.getItem('msBingoPreferences');
    if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        animationState.soundEnabled = preferences.markingSound !== false;
    }
}

/**
 * Gère une victoire de type quine
 * @param {Event} event L'événement de victoire
 */
function handleQuineWin(event) {
    const region = event.detail.region || 'default';
    playCelebrationAnimation(region, 'quine');
}

/**
 * Gère une victoire de type bingo
 * @param {Event} event L'événement de victoire
 */
function handleBingoWin(event) {
    const region = event.detail.region || 'default';
    playCelebrationAnimation(region, 'bingo');
}

/**
 * Gère une victoire de type jackpot
 * @param {Event} event L'événement de victoire
 */
function handleJackpotWin(event) {
    const region = event.detail.region || 'default';
    playCelebrationAnimation(region, 'bingo', true);
    
    // Jackpot est une version améliorée du bingo avec des effets supplémentaires
    setTimeout(() => {
        playCelebrationAnimation(region, 'jackpot');
    }, 1000);
}

/**
 * Joue l'animation de célébration
 * @param {string} region Code de la région
 * @param {string} winType Type de victoire (quine/bingo/jackpot)
 * @param {boolean} isJackpot Si c'est un jackpot (animation spéciale)
 */
function playCelebrationAnimation(region, winType, isJackpot = false) {
    // Obtenir la configuration de la région (ou utiliser la configuration par défaut)
    const config = celebrationConfigs[region] || celebrationConfigs['default'];
    const effect = config.effects[winType];
    
    // Afficher un message de victoire
    displayWinMessage(effect.message, isJackpot);
    
    // Lancer des confettis avec les couleurs de la région
    launchConfetti(config.colors, isJackpot ? 8000 : 3000);
    
    // Jouer un son de victoire
    playWinSound(winType, isJackpot);
    
    // Ajouter des éléments flottants (emojis)
    addFloatingElements(effect.emoji, isJackpot ? 30 : 10);
    
    // Effets spéciaux selon la région
    playSpecialEffect(winType, isJackpot);
}

/**
 * Lance des confettis avec les couleurs spécifiées
 * @param {Array} colors Tableau de couleurs 
 * @param {number} duration Durée en millisecondes
 */
function launchConfetti(colors, duration) {
    // Vérifier si la bibliothèque canvas-confetti est disponible
    if (typeof confetti === 'undefined') {
        console.error('La bibliothèque canvas-confetti n\'est pas chargée');
        return;
    }
    
    // Configuration des confettis
    const confettiConfig = {
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors,
        disableForReducedMotion: true
    };
    
    // Lancer les confettis en continu pendant la durée spécifiée
    const end = Date.now() + duration;
    
    (function frame() {
        confetti(confettiConfig);
        
        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

/**
 * Affiche un message de victoire sur l'écran
 * @param {string} message Le message à afficher
 * @param {boolean} isJackpot Si c'est un jackpot (style différent)
 */
function displayWinMessage(message, isJackpot) {
    // Créer un élément pour le message
    const messageEl = document.createElement('div');
    messageEl.className = 'win-message';
    messageEl.textContent = message;
    
    if (isJackpot) {
        messageEl.classList.add('jackpot-message');
    }
    
    // Ajouter des styles CSS pour l'animation
    messageEl.style.position = 'fixed';
    messageEl.style.top = '50%';
    messageEl.style.left = '50%';
    messageEl.style.transform = 'translate(-50%, -50%)';
    messageEl.style.fontSize = isJackpot ? '3em' : '2em';
    messageEl.style.fontWeight = 'bold';
    messageEl.style.color = isJackpot ? '#FFD700' : '#fff';
    messageEl.style.textShadow = isJackpot 
        ? '0 0 10px #FF4500, 0 0 20px #FF4500, 0 0 30px #FF4500'
        : '0 0 5px #000, 0 0 10px #000';
    messageEl.style.zIndex = '9999';
    messageEl.style.padding = '20px';
    messageEl.style.borderRadius = '10px';
    messageEl.style.background = isJackpot 
        ? 'rgba(255, 69, 0, 0.7)'
        : 'rgba(0, 153, 204, 0.7)';
    messageEl.style.animation = 'messageAnimation 2s forwards';
    
    // Ajouter l'élément au corps du document
    document.body.appendChild(messageEl);
    
    // Supprimer l'élément après l'animation
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

/**
 * Joue un son de victoire
 * @param {string} winType Type de victoire
 * @param {boolean} isJackpot Si c'est un jackpot
 */
function playWinSound(winType, isJackpot) {
    // Vérifier si le son est activé dans les préférences
    if (!animationState.soundEnabled) {
        return;
    }
    
    // Déterminer le son à jouer
    let soundFile = '';
    
    switch (winType) {
        case 'quine':
            soundFile = '/sounds/quine.mp3';
            break;
        case 'bingo':
            soundFile = isJackpot ? '/sounds/bingo_special.mp3' : '/sounds/bingo.mp3';
            break;
        case 'jackpot':
            soundFile = '/sounds/jackpot.mp3';
            break;
    }
    
    // Pour l'instant, simulons juste le son avec un console.log
    console.log(`Jouer le son: ${soundFile}`);
    
    // Jouer le son (implémentation future)
    // const audio = new Audio(soundFile);
    // audio.play();
}

/**
 * Joue un effet spécial selon la région
 * @param {string} effectType Type d'effet
 * @param {boolean} isJackpot Si c'est un jackpot
 */
function playSpecialEffect(effectType, isJackpot) {
    // Emplacement pour des effets spéciaux supplémentaires
    // Cette fonction peut être étendue avec des animations WebGL, CSS, etc.
    
    // Exemples d'effets additionnels
    if (isJackpot) {
        // Effet d'écran qui scintille pour le jackpot
        addScreenFlash();
    }
}

/**
 * Ajoute des éléments flottants à l'animation
 * @param {string} emoji Emoji à utiliser
 * @param {number} count Nombre d'éléments
 */
function addFloatingElements(emoji, count) {
    // Ajouter des styles CSS pour les animations
    if (!document.getElementById('floating-animation-styles')) {
        addAnimationStyles();
    }
    
    // Créer les éléments flottants
    for (let i = 0; i < count; i++) {
        const floatingEl = document.createElement('div');
        floatingEl.className = 'floating-element';
        floatingEl.textContent = emoji;
        
        // Positionner aléatoirement sur l'écran
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 2;
        const randomDuration = 3 + Math.random() * 4;
        
        floatingEl.style.left = `${randomX}vw`;
        floatingEl.style.animationDelay = `${randomDelay}s`;
        floatingEl.style.animationDuration = `${randomDuration}s`;
        
        // Ajouter au document
        document.body.appendChild(floatingEl);
        
        // Supprimer après l'animation
        setTimeout(() => {
            floatingEl.remove();
        }, (randomDelay + randomDuration) * 1000);
    }
}

/**
 * Ajoute un flash d'écran pour le jackpot
 */
function addScreenFlash() {
    const flashElement = document.createElement('div');
    flashElement.className = 'screen-flash';
    flashElement.style.position = 'fixed';
    flashElement.style.top = '0';
    flashElement.style.left = '0';
    flashElement.style.width = '100vw';
    flashElement.style.height = '100vh';
    flashElement.style.backgroundColor = '#fff';
    flashElement.style.opacity = '0';
    flashElement.style.zIndex = '9998';
    flashElement.style.pointerEvents = 'none';
    flashElement.style.animation = 'screen-flash 0.5s ease-out 3';
    
    document.body.appendChild(flashElement);
    
    setTimeout(() => {
        flashElement.remove();
    }, 2000);
}

/**
 * Ajoute les styles CSS nécessaires pour les animations
 */
function addAnimationStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'floating-animation-styles';
    
    styleSheet.textContent = `
        @keyframes floatUp {
            0% {
                transform: translateY(100vh) scale(0.5);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-20vh) scale(1.5) rotate(20deg);
                opacity: 0;
            }
        }
        
        @keyframes messageAnimation {
            0% {
                transform: translate(-50%, -50%) scale(0.5);
                opacity: 0;
            }
            20% {
                transform: translate(-50%, -50%) scale(1.2);
                opacity: 1;
            }
            80% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0;
            }
        }
        
        @keyframes screen-flash {
            0% {
                opacity: 0;
            }
            50% {
                opacity: 0.8;
            }
            100% {
                opacity: 0;
            }
        }
        
        .floating-element {
            position: fixed;
            bottom: -20px;
            font-size: 24px;
            animation: floatUp linear forwards;
            z-index: 9990;
            pointer-events: none;
        }
        
        .win-message {
            animation: messageAnimation 2s forwards;
        }
        
        .jackpot-message {
            animation: messageAnimation 3s forwards;
            font-size: 3em !important;
        }
    `;
    
    document.head.appendChild(styleSheet);
}

// Initialiser le système d'animation au chargement du document
document.addEventListener('DOMContentLoaded', initCelebrationSystem);