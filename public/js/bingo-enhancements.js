/**
 * Améliorations pour MS BINGO
 * - Affichage des cartons gagnants
 * - Annonces améliorées pour quine et bingo
 * - Option de marquage automatique ou manuel
 * - Affichage des montants à gagner
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les confettis
    initConfetti();
    
    // Initialiser l'affichage des montants
    initPrizeDisplay();
    
    // Initialiser l'option de marquage automatique/manuel
    initMarkingOptions();
    
    // Écouter les événements de victoire
    listenForWinEvents();
});

// ========== AFFICHAGE DES CARTONS GAGNANTS ==========

function showWinningCard(cardData, winType) {
    // Si nous avons l'animation de chargement, l'utiliser pour une transition
    if (window.bingoLoader) {
        window.showBingoLoader();
        window.bingoLoader.loadingText.textContent = winType === 'quine' ? "Vérification de la quine..." : "Vérification du bingo...";
        
        // Animation rapide avec effet sniper ciblé
        let progress = 0;
        const winInterval = setInterval(() => {
            progress += 25;
            window.updateLoaderProgress(progress);
            
            if (progress >= 100) {
                clearInterval(winInterval);
                // Continuer avec l'affichage du carton après un court délai
                setTimeout(() => {
                    displayWinningCardOverlay(cardData, winType);
                }, 300);
            }
        }, 250);
    } else {
        // Afficher directement si l'animation n'est pas disponible
        displayWinningCardOverlay(cardData, winType);
    }
}

function displayWinningCardOverlay(cardData, winType) {
    // Créer un overlay pour afficher le carton gagnant
    const overlay = document.createElement('div');
    overlay.className = 'winning-card-overlay';
    overlay.innerHTML = `
        <div class="winning-card-container">
            <div class="winning-card-header">
                <h2>${winType === 'quine' ? 'QUINE ANNONCÉ!' : 'BINGO ANNONCÉ!'}</h2>
                <span class="close-btn">&times;</span>
            </div>
            <div class="winning-card-content">
                <div class="winning-card" id="displayed-winning-card"></div>
                <div class="winner-info">
                    <p>Joueur: <strong>${cardData.playerName || 'Anonyme'}</strong></p>
                    <p>Gain: <strong>${formatMoney(winType === 'quine' ? getCurrentQuinePrize() : getCurrentBingoPrize())}</strong></p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Générer visuellement la carte dans le conteneur
    renderBingoCard(cardData, 'displayed-winning-card');
    
    // Activer les confettis
    startConfetti();
    
    // Fermer l'overlay après 10 secondes
    setTimeout(() => {
        closeWinningCardDisplay();
    }, 10000);
    
    // Gérer la fermeture manuelle
    overlay.querySelector('.close-btn').addEventListener('click', closeWinningCardDisplay);
}

function closeWinningCardDisplay() {
    const overlay = document.querySelector('.winning-card-overlay');
    if (overlay) {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
            stopConfetti();
        }, 500);
    }
}

function renderBingoCard(cardData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    // Créer l'en-tête BINGO
    const header = document.createElement('div');
    header.className = 'bingo-card-header';
    const letters = ['B', 'I', 'N', 'G', 'O'];
    
    letters.forEach(letter => {
        const cell = document.createElement('div');
        cell.className = 'header-cell';
        cell.textContent = letter;
        header.appendChild(cell);
    });
    
    container.appendChild(header);
    
    // Créer les rangées de la carte
    const rows = cardData.numbers || generateMockBingoCard();
    
    rows.forEach(row => {
        const rowElement = document.createElement('div');
        rowElement.className = 'bingo-card-row';
        
        row.forEach((number, colIndex) => {
            const cell = document.createElement('div');
            cell.className = 'bingo-card-cell';
            
            if (number === 0) {
                cell.classList.add('free-space');
                if (colIndex === 2 && rows.indexOf(row) === 1) {
                    cell.textContent = 'FREE';
                }
            } else {
                cell.textContent = number;
                
                // Marquer les numéros qui ont formé la victoire
                if (cardData.winningNumbers && cardData.winningNumbers.includes(number)) {
                    cell.classList.add('winning-number');
                }
                
                // Marquer les numéros qui ont été tirés
                if (cardData.markedNumbers && cardData.markedNumbers.includes(number)) {
                    cell.classList.add('marked');
                }
            }
            
            rowElement.appendChild(cell);
        });
        
        container.appendChild(rowElement);
    });
}

function generateMockBingoCard() {
    // Générer une carte fictive si les vraies données ne sont pas disponibles
    const card = [];
    
    for (let i = 0; i < 5; i++) {
        const row = [];
        for (let j = 0; j < 5; j++) {
            if (i === 2 && j === 2) {
                row.push(0); // Case gratuite au centre
            } else {
                const min = j * 15 + 1;
                const max = (j + 1) * 15;
                row.push(Math.floor(Math.random() * (max - min + 1)) + min);
            }
        }
        card.push(row);
    }
    
    return card;
}

// ========== CONFETTIS ==========

let confettiCanvas;
let confettiContext;
let confettiAnimationId;
let confettiParticles = [];

function initConfetti() {
    // Créer le canvas pour les confettis
    confettiCanvas = document.createElement('canvas');
    confettiCanvas.id = 'confetti-canvas';
    confettiCanvas.style.position = 'fixed';
    confettiCanvas.style.top = '0';
    confettiCanvas.style.left = '0';
    confettiCanvas.style.width = '100%';
    confettiCanvas.style.height = '100%';
    confettiCanvas.style.pointerEvents = 'none';
    confettiCanvas.style.zIndex = '9999';
    document.body.appendChild(confettiCanvas);
    
    confettiContext = confettiCanvas.getContext('2d');
    
    // Ajuster la taille du canvas lors du redimensionnement de la fenêtre
    window.addEventListener('resize', function() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    });
    
    // Définir la taille initiale
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    
    // Masquer le canvas au départ
    confettiCanvas.style.display = 'none';
}

function startConfetti() {
    // Afficher le canvas
    confettiCanvas.style.display = 'block';
    
    // Créer les particules
    createConfettiParticles();
    
    // Démarrer l'animation
    animateConfetti();
}

function stopConfetti() {
    // Arrêter l'animation
    cancelAnimationFrame(confettiAnimationId);
    
    // Vider les particules
    confettiParticles = [];
    
    // Effacer le canvas
    confettiContext.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    // Masquer le canvas
    confettiCanvas.style.display = 'none';
}

function createConfettiParticles() {
    confettiParticles = [];
    
    const particleCount = 150;
    const colors = [
        '#f44336', // Rouge
        '#2196f3', // Bleu
        '#ffeb3b', // Jaune
        '#4caf50', // Vert
        '#9c27b0', // Violet
        '#ff9800', // Orange
        '#e91e63', // Rose
        '#00bcd4'  // Cyan
    ];
    
    for (let i = 0; i < particleCount; i++) {
        confettiParticles.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * -confettiCanvas.height,
            radius: Math.random() * 4 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 5 + 2,
            angle: Math.random() * 2 * Math.PI,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        });
    }
}

function animateConfetti() {
    confettiContext.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    for (let i = 0; i < confettiParticles.length; i++) {
        const particle = confettiParticles[i];
        
        // Mettre à jour la position
        particle.y += particle.speed;
        particle.x += Math.sin(particle.angle) * 2;
        particle.rotation += particle.rotationSpeed;
        
        // Dessiner la particule
        confettiContext.save();
        confettiContext.translate(particle.x, particle.y);
        confettiContext.rotate(particle.rotation * Math.PI / 180);
        
        confettiContext.fillStyle = particle.color;
        confettiContext.beginPath();
        confettiContext.rect(-particle.radius, -particle.radius, particle.radius * 2, particle.radius * 2);
        confettiContext.fill();
        
        confettiContext.restore();
        
        // Réinitialiser la particule si elle sort de l'écran
        if (particle.y > confettiCanvas.height) {
            particle.y = Math.random() * -confettiCanvas.height;
            particle.x = Math.random() * confettiCanvas.width;
        }
    }
    
    confettiAnimationId = requestAnimationFrame(animateConfetti);
}

// ========== MONTANTS DES PRIX ==========

let currentJackpot = 100000; // 1000€ en centimes
let currentGamePot = 0;
let playerCount = 0;
let cardPrice = 100; // 1€ en centimes

function initPrizeDisplay() {
    // Créer la section d'affichage des montants si elle n'existe pas
    if (!document.getElementById('prize-display')) {
        const prizeDisplay = document.createElement('div');
        prizeDisplay.id = 'prize-display';
        prizeDisplay.className = 'prize-display';
        prizeDisplay.innerHTML = `
            <div class="prize-item">
                <div class="prize-label">Quine</div>
                <div class="prize-value" id="quine-prize">0,00 €</div>
            </div>
            <div class="prize-item">
                <div class="prize-label">Bingo</div>
                <div class="prize-value" id="bingo-prize">0,00 €</div>
            </div>
            <div class="prize-item jackpot">
                <div class="prize-label">Jackpot</div>
                <div class="prize-value" id="jackpot-value">${formatMoney(currentJackpot)}</div>
            </div>
        `;
        
        // Insérer avant le conteneur de jeu
        const gameContainer = document.querySelector('.game-container, #game-container');
        if (gameContainer) {
            gameContainer.parentNode.insertBefore(prizeDisplay, gameContainer);
        } else {
            // Fallback: insérer au début du corps
            document.body.insertBefore(prizeDisplay, document.body.firstChild);
        }
    }
    
    // Mettre à jour les montants initiaux
    updatePrizeDisplay();
}

function updatePrizeDisplay() {
    document.getElementById('quine-prize').textContent = formatMoney(getCurrentQuinePrize());
    document.getElementById('bingo-prize').textContent = formatMoney(getCurrentBingoPrize());
    document.getElementById('jackpot-value').textContent = formatMoney(currentJackpot);
}

function getCurrentQuinePrize() {
    // 20% du pot pour la quine
    return Math.round(currentGamePot * 0.2);
}

function getCurrentBingoPrize() {
    // 50% du pot pour le bingo
    return Math.round(currentGamePot * 0.5);
}

function updateJackpot() {
    // 10% du pot va au jackpot
    const jackpotContribution = Math.round(currentGamePot * 0.1);
    currentJackpot += jackpotContribution;
    updatePrizeDisplay();
}

function updateGamePot(newPlayerCount) {
    // Mettre à jour le nombre de joueurs
    playerCount = newPlayerCount;
    
    // Calculer le pot total (prix carte * nombre de joueurs)
    currentGamePot = playerCount * cardPrice;
    
    // Mettre à jour l'affichage
    updatePrizeDisplay();
}

function formatMoney(cents) {
    return (cents / 100).toFixed(2).replace('.', ',') + ' €';
}

function simulateGameWithPlayers(numPlayers) {
    // Pour les tests: simuler une partie avec un nombre donné de joueurs
    updateGamePot(numPlayers);
    updateJackpot();
}

// ========== OPTIONS DE MARQUAGE ==========

function initMarkingOptions() {
    // Récupérer ou créer les préférences utilisateur
    let markingPreference = localStorage.getItem('bingoMarkingPreference') || 'auto';
    
    // Créer le sélecteur d'options s'il n'existe pas
    if (!document.getElementById('marking-options')) {
        const optionsContainer = document.createElement('div');
        optionsContainer.id = 'marking-options';
        optionsContainer.className = 'marking-options';
        optionsContainer.innerHTML = `
            <div class="option-label">Marquage des numéros:</div>
            <div class="toggle-container">
                <label class="toggle-option ${markingPreference === 'auto' ? 'active' : ''}">
                    <input type="radio" name="marking" value="auto" ${markingPreference === 'auto' ? 'checked' : ''}>
                    <span>Auto</span>
                </label>
                <label class="toggle-option ${markingPreference === 'manual' ? 'active' : ''}">
                    <input type="radio" name="marking" value="manual" ${markingPreference === 'manual' ? 'checked' : ''}>
                    <span>Manuel</span>
                </label>
            </div>
        `;
        
        // Insérer avant ou après l'affichage des prix
        const prizeDisplay = document.getElementById('prize-display');
        if (prizeDisplay) {
            prizeDisplay.parentNode.insertBefore(optionsContainer, prizeDisplay.nextSibling);
        } else {
            // Fallback: insérer au début du corps
            document.body.insertBefore(optionsContainer, document.body.firstChild);
        }
        
        // Ajouter les gestionnaires d'événements
        const radioButtons = optionsContainer.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', function() {
                // Mettre à jour l'apparence
                document.querySelectorAll('.toggle-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                this.parentNode.classList.add('active');
                
                // Enregistrer la préférence
                localStorage.setItem('bingoMarkingPreference', this.value);
                
                // Émettre un événement pour informer l'application
                const event = new CustomEvent('marking-preference-changed', {
                    detail: { preference: this.value }
                });
                document.dispatchEvent(event);
            });
        });
    }
    
    // Émettre l'événement initial
    const event = new CustomEvent('marking-preference-changed', {
        detail: { preference: markingPreference }
    });
    document.dispatchEvent(event);
}

// ========== ÉVÉNEMENTS DE VICTOIRE ==========

function listenForWinEvents() {
    // Écouter les événements de quine
    document.addEventListener('quine-achieved', function(e) {
        // Annoncer "Quine annoncé"
        if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
            const utterance = new SpeechSynthesisUtterance('Quine annoncé!');
            utterance.lang = 'fr-FR';
            utterance.volume = 1;
            window.speechSynthesis.speak(utterance);
        }
        
        // Afficher le carton gagnant
        showWinningCard(e.detail.card, 'quine');
    });
    
    // Écouter les événements de bingo
    document.addEventListener('bingo-achieved', function(e) {
        // Annoncer "Bingo annoncé"
        if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
            const utterance = new SpeechSynthesisUtterance('Bingo annoncé!');
            utterance.lang = 'fr-FR';
            utterance.volume = 1;
            window.speechSynthesis.speak(utterance);
        }
        
        // Afficher le carton gagnant
        showWinningCard(e.detail.card, 'bingo');
        
        // Mettre à jour le jackpot après la partie
        updateJackpot();
    });
    
    // Écouter les mises à jour du nombre de joueurs
    document.addEventListener('players-updated', function(e) {
        updateGamePot(e.detail.count);
    });
    
    // Pour les tests: simuler une partie avec 10 joueurs
    simulateGameWithPlayers(10);
}

// Ajouter les styles CSS nécessaires
const styleElement = document.createElement('style');
styleElement.textContent = `
    /* Styles pour l'affichage des cartons gagnants */
    .winning-card-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9000;
        animation: fade-in 0.5s ease-in-out;
    }
    
    @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .winning-card-overlay.fade-out {
        animation: fade-out 0.5s ease-in-out;
    }
    
    @keyframes fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    .winning-card-container {
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 90%;
        width: 500px;
        overflow: hidden;
    }
    
    .winning-card-header {
        background-color: #e53935;
        color: white;
        padding: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .winning-card-header h2 {
        margin: 0;
        font-size: 24px;
        text-align: center;
        flex-grow: 1;
    }
    
    .close-btn {
        font-size: 24px;
        cursor: pointer;
        padding: 0 10px;
    }
    
    .winning-card-content {
        padding: 20px;
    }
    
    .winner-info {
        margin-top: 20px;
        text-align: center;
        border-top: 1px solid #eee;
        padding-top: 15px;
    }
    
    /* Styles pour les cartes de bingo */
    .winning-card {
        margin: 0 auto;
        max-width: 350px;
    }
    
    .bingo-card-header {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        background-color: #e53935;
        color: white;
        font-weight: bold;
        font-size: 18px;
    }
    
    .header-cell {
        padding: 10px;
        text-align: center;
    }
    
    .bingo-card-row {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
    }
    
    .bingo-card-cell {
        padding: 10px;
        text-align: center;
        border: 1px solid #ddd;
        font-size: 16px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .bingo-card-cell.free-space {
        background-color: #f5f5f5;
    }
    
    .bingo-card-cell.marked {
        background-color: #ffcdd2;
    }
    
    .bingo-card-cell.winning-number {
        background-color: #e53935;
        color: white;
        font-weight: bold;
    }
    
    /* Styles pour l'affichage des prix */
    .prize-display {
        display: flex;
        justify-content: space-between;
        background-color: #2a2a2a;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        color: white;
    }
    
    .prize-item {
        text-align: center;
        flex: 1;
    }
    
    .prize-label {
        font-size: 14px;
        margin-bottom: 5px;
        opacity: 0.8;
    }
    
    .prize-value {
        font-size: 18px;
        font-weight: bold;
    }
    
    .prize-item.jackpot {
        background-color: #e53935;
        padding: 10px;
        border-radius: 5px;
        margin: -5px;
    }
    
    .prize-item.jackpot .prize-label {
        opacity: 1;
    }
    
    /* Styles pour les options de marquage */
    .marking-options {
        display: flex;
        align-items: center;
        background-color: #333;
        padding: 10px 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        color: white;
    }
    
    .option-label {
        margin-right: 15px;
        font-size: 14px;
    }
    
    .toggle-container {
        display: flex;
        background-color: #222;
        border-radius: 20px;
        overflow: hidden;
    }
    
    .toggle-option {
        padding: 8px 15px;
        cursor: pointer;
        position: relative;
    }
    
    .toggle-option input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
    }
    
    .toggle-option.active {
        background-color: #e53935;
    }
`;

document.head.appendChild(styleElement);

// Exporter les fonctions pour les tests et le débogage
window.msBingoEnhancements = {
    showWinningCard,
    displayWinningCardOverlay,
    updateGamePot,
    simulateGameWithPlayers,
    updateJackpot,
    startConfetti,
    stopConfetti
};