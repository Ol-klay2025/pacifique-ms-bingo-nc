/**
 * Module d'animations ludiques pour les cartes de bingo
 * Ce module ajoute des animations pendant la génération et l'utilisation des cartes
 */

class BingoCardAnimator {
    constructor() {
        // Préférences d'animation
        this.preferences = this.loadPreferences();
        
        // État des animations
        this.animating = false;
        
        // Compteur pour les animations
        this.animationCounter = 0;
        
        // Référence aux cartes en cours d'animation
        this.animatedCards = [];
        
        // Initialiser les animations
        this.init();
    }

    /**
     * Charge les préférences d'animation du localStorage
     * @returns {Object} Préférences d'animation
     */
    loadPreferences() {
        try {
            const savedPrefs = localStorage.getItem('msBingoAnimationPrefs');
            if (savedPrefs) {
                return JSON.parse(savedPrefs);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des préférences d\'animation:', error);
        }
        
        // Préférences par défaut
        return {
            enabled: true,
            intensity: 'medium', // 'low', 'medium', 'high'
            cardCreateAnimation: true,
            numberMarkAnimation: true,
            winAnimation: true,
            backgroundEffects: true
        };
    }
    
    /**
     * Sauvegarde les préférences d'animation
     */
    savePreferences() {
        try {
            localStorage.setItem('msBingoAnimationPrefs', JSON.stringify(this.preferences));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des préférences d\'animation:', error);
        }
    }
    
    /**
     * Met à jour les préférences d'animation
     * @param {Object} newPrefs Nouvelles préférences
     */
    updatePreferences(newPrefs) {
        this.preferences = { ...this.preferences, ...newPrefs };
        this.savePreferences();
    }
    
    /**
     * Initialise les animations
     */
    init() {
        // S'abonner aux événements de création de cartes
        document.addEventListener('card-creation-started', (e) => {
            if (this.preferences.enabled && this.preferences.cardCreateAnimation) {
                this.animateCardCreation(e.detail.count);
            }
        });
        
        // S'abonner aux événements de marquage de numéros
        document.addEventListener('number-marked', (e) => {
            if (this.preferences.enabled && this.preferences.numberMarkAnimation) {
                this.animateNumberMarking(e.detail.element);
            }
        });
        
        // S'abonner aux événements de victoire
        document.addEventListener('quine-achieved', () => {
            if (this.preferences.enabled && this.preferences.winAnimation) {
                this.animateQuineWin();
            }
        });
        
        document.addEventListener('bingo-achieved', () => {
            if (this.preferences.enabled && this.preferences.winAnimation) {
                this.animateBingoWin();
            }
        });
        
        // Ajouter le CSS d'animation
        this.injectAnimationStyles();
    }
    
    /**
     * Injecte les styles CSS nécessaires aux animations
     */
    injectAnimationStyles() {
        const styleElement = document.createElement('style');
        styleElement.id = 'bingo-card-animation-styles';
        
        styleElement.textContent = `
            /* Animation de création de carte */
            @keyframes cardAppear {
                0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            
            @keyframes cardShuffle {
                0% { transform: translateX(0) rotateZ(0deg); }
                25% { transform: translateX(-5px) rotateZ(-2deg); }
                75% { transform: translateX(5px) rotateZ(2deg); }
                100% { transform: translateX(0) rotateZ(0deg); }
            }
            
            @keyframes cardFlip {
                0% { transform: perspective(1000px) rotateY(-90deg); opacity: 0; }
                100% { transform: perspective(1000px) rotateY(0deg); opacity: 1; }
            }
            
            @keyframes cardScale {
                0% { transform: scale(0.8); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            /* Animation de marquage de numéro */
            @keyframes numberPop {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); }
                100% { transform: scale(1); }
            }
            
            @keyframes numberPulse {
                0% { box-shadow: 0 0 0 0 rgba(0, 153, 204, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(0, 153, 204, 0); }
                100% { box-shadow: 0 0 0 0 rgba(0, 153, 204, 0); }
            }
            
            @keyframes numberRotate {
                0% { transform: rotateZ(0deg); }
                25% { transform: rotateZ(-10deg); }
                75% { transform: rotateZ(10deg); }
                100% { transform: rotateZ(0deg); }
            }
            
            /* Animation de fond pour les victoires */
            @keyframes backgroundPulse {
                0% { background-color: rgba(0, 153, 204, 0.1); }
                50% { background-color: rgba(0, 153, 204, 0.3); }
                100% { background-color: rgba(0, 153, 204, 0.1); }
            }
            
            /* Animation de brillance pour les cartons gagnants */
            @keyframes winningGlow {
                0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.7); }
                50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.9); }
                100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.7); }
            }
            
            /* Classes d'animation pour les cartes */
            .card-appear {
                animation: cardAppear 0.5s ease-out forwards;
            }
            
            .card-shuffle {
                animation: cardShuffle 0.3s ease-in-out;
            }
            
            .card-flip {
                animation: cardFlip 0.6s ease-out forwards;
                transform-origin: center left;
            }
            
            .card-scale {
                animation: cardScale 0.4s ease-out forwards;
            }
            
            /* Classes d'animation pour les numéros */
            .number-pop {
                animation: numberPop 0.3s ease-out;
            }
            
            .number-pulse {
                animation: numberPulse 1s ease-out;
            }
            
            .number-rotate {
                animation: numberRotate 0.4s ease-out;
            }
            
            /* Classes d'animation pour les victoires */
            .background-pulse {
                animation: backgroundPulse 1.5s ease-in-out infinite;
            }
            
            .winning-glow {
                animation: winningGlow 1.5s ease-in-out infinite;
            }
            
            /* Animation spéciale pour carton chanceux */
            @keyframes luckyCardReveal {
                0% { transform: scale(0.5) rotateY(-90deg); opacity: 0; filter: brightness(0.5); }
                50% { transform: scale(1.05) rotateY(0deg); opacity: 1; filter: brightness(1.2); }
                75% { transform: scale(1.05) rotateY(0deg); opacity: 1; filter: brightness(1.2); }
                100% { transform: scale(1) rotateY(0deg); opacity: 1; filter: brightness(1); }
            }
            
            .lucky-card-reveal {
                animation: luckyCardReveal 1.2s ease-out forwards;
            }
            
            /* Animation pour les cartes révélées une par une */
            .sequential-reveal {
                opacity: 0;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    /**
     * Anime la création d'une ou plusieurs cartes
     * @param {number} count Nombre de cartes à animer
     */
    animateCardCreation(count) {
        if (this.animating) return;
        
        this.animating = true;
        this.animationCounter = 0;
        this.animatedCards = [];
        
        // Sélectionner le conteneur de cartes
        const cardGrid = document.getElementById('bingo-card-grid');
        if (!cardGrid) {
            this.animating = false;
            return;
        }
        
        // Sélectionner les nouvelles cartes
        const cards = cardGrid.querySelectorAll('.bingo-card');
        const newCards = Array.from(cards).slice(-count);
        
        if (newCards.length === 0) {
            this.animating = false;
            return;
        }
        
        // Déterminer le type d'animation en fonction du nombre de cartes
        const animationType = this.getCardCreationAnimationType(count);
        
        // Appliquer l'animation en fonction du type
        switch (animationType) {
            case 'sequential':
                this.animateCardsSequentially(newCards);
                break;
            case 'all-at-once':
                this.animateCardsAllAtOnce(newCards);
                break;
            case 'shuffle':
                this.animateCardsShuffle(newCards);
                break;
        }
    }
    
    /**
     * Détermine le type d'animation à utiliser pour la création de cartes
     * @param {number} count Nombre de cartes
     * @returns {string} Type d'animation à utiliser
     */
    getCardCreationAnimationType(count) {
        if (count === 1) {
            // Animation spéciale pour une seule carte
            return 'all-at-once';
        } else if (count <= 6) {
            // Animation séquentielle pour quelques cartes
            return 'sequential';
        } else {
            // Animation de mélange pour beaucoup de cartes
            return 'shuffle';
        }
    }
    
    /**
     * Anime les cartes une par une séquentiellement
     * @param {Array<Element>} cards Tableau des éléments de carte
     */
    animateCardsSequentially(cards) {
        // Masquer d'abord toutes les cartes
        cards.forEach(card => {
            card.classList.add('sequential-reveal');
        });
        
        // Fonction pour révéler une carte
        const revealNextCard = (index) => {
            if (index >= cards.length) {
                this.animating = false;
                return;
            }
            
            const card = cards[index];
            
            // Choisir une animation aléatoire parmi les options disponibles
            const animations = ['card-appear', 'card-flip', 'card-scale'];
            const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
            
            // Appliquer l'animation
            card.classList.remove('sequential-reveal');
            card.classList.add(randomAnimation);
            
            // Nettoyer après l'animation
            const cleanupAnimation = () => {
                card.classList.remove(randomAnimation);
                card.removeEventListener('animationend', cleanupAnimation);
                
                // Passer à la carte suivante
                setTimeout(() => {
                    revealNextCard(index + 1);
                }, 150);
            };
            
            card.addEventListener('animationend', cleanupAnimation);
        };
        
        // Commencer la séquence d'animation
        setTimeout(() => {
            revealNextCard(0);
        }, 300);
    }
    
    /**
     * Anime toutes les cartes en même temps
     * @param {Array<Element>} cards Tableau des éléments de carte
     */
    animateCardsAllAtOnce(cards) {
        // Déterminer si c'est une carte chanceuse
        const isLuckyCard = cards.length === 1 && window.currentLuckyCard;
        
        cards.forEach(card => {
            if (isLuckyCard) {
                card.classList.add('lucky-card-reveal');
                
                // Ajouter un effet de lueur temporaire
                setTimeout(() => {
                    card.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.7)';
                    
                    // Retirer l'effet après quelques secondes
                    setTimeout(() => {
                        card.style.boxShadow = '';
                    }, 3000);
                }, 1000);
            } else {
                card.classList.add('card-appear');
            }
            
            // Nettoyer après l'animation
            const cleanupAnimation = () => {
                if (isLuckyCard) {
                    card.classList.remove('lucky-card-reveal');
                } else {
                    card.classList.remove('card-appear');
                }
                card.removeEventListener('animationend', cleanupAnimation);
                this.animating = false;
            };
            
            card.addEventListener('animationend', cleanupAnimation);
        });
    }
    
    /**
     * Anime les cartes avec un effet de mélange
     * @param {Array<Element>} cards Tableau des éléments de carte
     */
    animateCardsShuffle(cards) {
        // Animer le mélange des cartes
        cards.forEach(card => {
            card.style.opacity = '0';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.classList.add('card-shuffle');
                
                // Nettoyer après l'animation
                const cleanupAnimation = () => {
                    card.classList.remove('card-shuffle');
                    card.removeEventListener('animationend', cleanupAnimation);
                };
                
                card.addEventListener('animationend', cleanupAnimation);
            }, Math.random() * 500);
        });
        
        // Terminer l'animation après un certain délai
        setTimeout(() => {
            this.animating = false;
        }, 1000);
    }
    
    /**
     * Anime le marquage d'un numéro
     * @param {Element} element Élément du numéro marqué
     */
    animateNumberMarking(element) {
        if (!element) return;
        
        // Déterminer le type d'animation en fonction de l'intensité
        let animationClass;
        
        switch (this.preferences.intensity) {
            case 'low':
                animationClass = 'number-pop';
                break;
            case 'medium':
                animationClass = 'number-pulse';
                break;
            case 'high':
                animationClass = 'number-rotate';
                break;
            default:
                animationClass = 'number-pulse';
        }
        
        // Appliquer l'animation
        element.classList.add(animationClass);
        
        // Nettoyer après l'animation
        const cleanupAnimation = () => {
            element.classList.remove(animationClass);
            element.removeEventListener('animationend', cleanupAnimation);
        };
        
        element.addEventListener('animationend', cleanupAnimation);
    }
    
    /**
     * Anime la victoire en quine
     */
    animateQuineWin() {
        if (!this.preferences.backgroundEffects) return;
        
        // Obtenir les éléments de la carte à animer
        const cards = document.querySelectorAll('.bingo-card');
        
        // Trouver la carte qui a une quine
        // Pour cette démo, on anime simplement toutes les cartes
        cards.forEach(card => {
            // Appliquer l'animation
            card.classList.add('background-pulse');
            
            // Nettoyer après 3 secondes
            setTimeout(() => {
                card.classList.remove('background-pulse');
            }, 3000);
        });
    }
    
    /**
     * Anime la victoire en bingo
     */
    animateBingoWin() {
        if (!this.preferences.backgroundEffects) return;
        
        // Obtenir les éléments de la carte à animer
        const cards = document.querySelectorAll('.bingo-card');
        
        // Pour cette démo, on anime simplement toutes les cartes
        cards.forEach(card => {
            // Appliquer l'animation
            card.classList.add('winning-glow');
            
            // Nettoyer après 5 secondes
            setTimeout(() => {
                card.classList.remove('winning-glow');
            }, 5000);
        });
    }
    
    /**
     * Ouvre l'interface de configuration des animations
     */
    showAnimationSettingsUI() {
        // Créer la modale
        const modalContainer = document.createElement('div');
        modalContainer.className = 'animation-settings-modal-container';
        
        // Créer le HTML de la modale
        modalContainer.innerHTML = `
            <div class="animation-settings-modal">
                <div class="modal-header">
                    <h3>Paramètres d'Animation</h3>
                    <button class="close-btn">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="toggle-option">
                        <div class="toggle-label">Animations activées</div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="animations-enabled" ${this.preferences.enabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="settings-group" id="animation-options" ${!this.preferences.enabled ? 'style="opacity: 0.5; pointer-events: none;"' : ''}>
                        <div class="option-group">
                            <div class="option-label">Intensité des animations</div>
                            <div class="option-controls">
                                <label>
                                    <input type="radio" name="animation-intensity" value="low" ${this.preferences.intensity === 'low' ? 'checked' : ''}>
                                    Basse
                                </label>
                                <label>
                                    <input type="radio" name="animation-intensity" value="medium" ${this.preferences.intensity === 'medium' ? 'checked' : ''}>
                                    Moyenne
                                </label>
                                <label>
                                    <input type="radio" name="animation-intensity" value="high" ${this.preferences.intensity === 'high' ? 'checked' : ''}>
                                    Élevée
                                </label>
                            </div>
                        </div>
                        
                        <div class="toggle-option">
                            <div class="toggle-label">Animation de création de carte</div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="card-create-animation" ${this.preferences.cardCreateAnimation ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="toggle-option">
                            <div class="toggle-label">Animation de marquage des numéros</div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="number-mark-animation" ${this.preferences.numberMarkAnimation ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="toggle-option">
                            <div class="toggle-label">Animation de victoire</div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="win-animation" ${this.preferences.winAnimation ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="toggle-option">
                            <div class="toggle-label">Effets de fond</div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="background-effects" ${this.preferences.backgroundEffects ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button id="test-animation-btn" class="primary-btn">Tester</button>
                    <button id="save-animation-settings" class="success-btn">Enregistrer</button>
                    <button class="dismiss-btn">Annuler</button>
                </div>
            </div>
        `;
        
        // Ajouter des styles CSS
        const styles = document.createElement('style');
        styles.textContent = `
            .animation-settings-modal-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeIn 0.3s ease-out;
            }
            
            .animation-settings-modal {
                background-color: #2a2a2a;
                width: 90%;
                max-width: 500px;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                animation: slideIn 0.3s ease-out;
            }
            
            .modal-header {
                background-color: #0099cc;
                color: white;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                margin: 0;
            }
            
            .modal-body {
                padding: 20px;
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .toggle-option {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .toggle-label {
                flex: 1;
                font-weight: bold;
            }
            
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 48px;
                height: 24px;
            }
            
            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #444;
                border-radius: 24px;
                transition: .4s;
            }
            
            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                border-radius: 50%;
                transition: .4s;
            }
            
            input:checked + .toggle-slider {
                background-color: #0099cc;
            }
            
            input:checked + .toggle-slider:before {
                transform: translateX(24px);
            }
            
            .settings-group {
                margin-top: 10px;
                transition: opacity 0.3s;
            }
            
            .option-group {
                margin-bottom: 20px;
            }
            
            .option-label {
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .option-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .option-controls label {
                display: flex;
                align-items: center;
                gap: 5px;
                cursor: pointer;
            }
            
            .modal-footer {
                padding: 15px 20px;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            button {
                padding: 8px 15px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .primary-btn {
                background-color: #0099cc;
                color: white;
            }
            
            .primary-btn:hover {
                background-color: #00b3ee;
            }
            
            .success-btn {
                background-color: #4CAF50;
                color: white;
            }
            
            .success-btn:hover {
                background-color: #5cb85c;
            }
            
            .dismiss-btn {
                background-color: #555;
                color: white;
            }
            
            .dismiss-btn:hover {
                background-color: #666;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @media (max-width: 768px) {
                .animation-settings-modal {
                    width: 95%;
                }
                
                .option-controls {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .modal-footer {
                    flex-direction: column;
                }
                
                .modal-footer button {
                    width: 100%;
                }
            }
        `;
        
        // Ajouter la modale et les styles au document
        document.head.appendChild(styles);
        document.body.appendChild(modalContainer);
        
        // Gérer les interactions avec les contrôles
        
        // Fermer la modale
        const closeBtn = modalContainer.querySelector('.close-btn');
        const dismissBtn = modalContainer.querySelector('.dismiss-btn');
        
        [closeBtn, dismissBtn].forEach(btn => {
            btn.addEventListener('click', () => {
                styles.remove();
                modalContainer.remove();
            });
        });
        
        // Gérer le toggle principal
        const animationsEnabledCheckbox = document.getElementById('animations-enabled');
        const animationOptions = document.getElementById('animation-options');
        
        animationsEnabledCheckbox.addEventListener('change', () => {
            animationOptions.style.opacity = animationsEnabledCheckbox.checked ? '1' : '0.5';
            animationOptions.style.pointerEvents = animationsEnabledCheckbox.checked ? 'auto' : 'none';
        });
        
        // Tester les animations
        document.getElementById('test-animation-btn').addEventListener('click', () => {
            // Récupérer les paramètres actuels
            const tempPrefs = {
                enabled: animationsEnabledCheckbox.checked,
                intensity: document.querySelector('input[name="animation-intensity"]:checked').value,
                cardCreateAnimation: document.getElementById('card-create-animation').checked,
                numberMarkAnimation: document.getElementById('number-mark-animation').checked,
                winAnimation: document.getElementById('win-animation').checked,
                backgroundEffects: document.getElementById('background-effects').checked
            };
            
            // Sauvegarder temporairement
            const originalPrefs = { ...this.preferences };
            this.preferences = tempPrefs;
            
            // Tester les animations
            this.testAnimations();
            
            // Restaurer les préférences originales
            setTimeout(() => {
                this.preferences = originalPrefs;
            }, 3000);
        });
        
        // Enregistrer les paramètres
        document.getElementById('save-animation-settings').addEventListener('click', () => {
            const newPrefs = {
                enabled: animationsEnabledCheckbox.checked,
                intensity: document.querySelector('input[name="animation-intensity"]:checked').value,
                cardCreateAnimation: document.getElementById('card-create-animation').checked,
                numberMarkAnimation: document.getElementById('number-mark-animation').checked,
                winAnimation: document.getElementById('win-animation').checked,
                backgroundEffects: document.getElementById('background-effects').checked
            };
            
            this.updatePreferences(newPrefs);
            
            // Fermer la modale
            styles.remove();
            modalContainer.remove();
            
            // Afficher une notification
            const notification = document.createElement('div');
            notification.className = 'notification success-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <h3>Paramètres enregistrés</h3>
                    <p>Vos préférences d'animation ont été mises à jour.</p>
                </div>
            `;
            document.body.appendChild(notification);
            
            // Fermer la notification après 3 secondes
            setTimeout(() => {
                notification.remove();
            }, 3000);
        });
    }
    
    /**
     * Teste les animations avec les paramètres actuels
     */
    testAnimations() {
        // Tester l'animation de carte si activée
        if (this.preferences.enabled && this.preferences.cardCreateAnimation) {
            // Trouver une carte à animer
            const cards = document.querySelectorAll('.bingo-card');
            if (cards.length > 0) {
                const card = cards[0];
                
                // Appliquer une animation de carte
                card.classList.add('card-scale');
                
                // Nettoyer après l'animation
                setTimeout(() => {
                    card.classList.remove('card-scale');
                }, 1000);
            }
        }
        
        // Tester l'animation de marquage si activée
        if (this.preferences.enabled && this.preferences.numberMarkAnimation) {
            // Trouver un numéro à animer
            const cells = document.querySelectorAll('.card-cell:not(.empty):not(.marked)');
            if (cells.length > 0) {
                const cell = cells[0];
                
                // Déterminer le type d'animation
                let animationClass;
                switch (this.preferences.intensity) {
                    case 'low':
                        animationClass = 'number-pop';
                        break;
                    case 'medium':
                        animationClass = 'number-pulse';
                        break;
                    case 'high':
                        animationClass = 'number-rotate';
                        break;
                    default:
                        animationClass = 'number-pulse';
                }
                
                // Appliquer l'animation
                cell.classList.add(animationClass);
                
                // Nettoyer après l'animation
                setTimeout(() => {
                    cell.classList.remove(animationClass);
                }, 1000);
            }
        }
        
        // Tester l'animation de victoire si activée
        if (this.preferences.enabled && this.preferences.winAnimation) {
            // Trouver une carte à animer
            const cards = document.querySelectorAll('.bingo-card');
            if (cards.length > 0) {
                const card = cards[0];
                
                // Appliquer l'animation
                card.classList.add('winning-glow');
                
                // Nettoyer après l'animation
                setTimeout(() => {
                    card.classList.remove('winning-glow');
                }, 3000);
            }
        }
    }
}

// Initialiser l'animateur et l'exposer globalement
window.bingoCardAnimator = new BingoCardAnimator();

// Fonction pour afficher les paramètres d'animation
window.showAnimationSettings = function() {
    window.bingoCardAnimator.showAnimationSettingsUI();
};

// Fonction pour déclencher l'animation de création de carte
window.animateCardCreation = function(count = 1) {
    // Créer et déclencher un événement personnalisé
    const event = new CustomEvent('card-creation-started', {
        detail: { count }
    });
    document.dispatchEvent(event);
};

// Fonction pour déclencher l'animation de marquage de numéro
window.animateNumberMarking = function(element) {
    // Créer et déclencher un événement personnalisé
    const event = new CustomEvent('number-marked', {
        detail: { element }
    });
    document.dispatchEvent(event);
};

// Modifier la fonction de marquage existante (si elle existe)
document.addEventListener('DOMContentLoaded', () => {
    // Patch pour la fonction de marquage des numéros
    // On surveillera les clics sur les cellules
    document.addEventListener('click', (e) => {
        const cell = e.target.closest('.card-cell');
        if (cell && !cell.classList.contains('empty') && cell.classList.contains('marked')) {
            // Le numéro vient d'être marqué, déclencher l'animation
            window.animateNumberMarking(cell);
        }
    });
    
    // Patch pour la création de cartes
    // On observera le conteneur de cartes pour détecter les nouvelles cartes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Vérifier si ce sont des cartes de bingo
                let cardCount = 0;
                mutation.addedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('bingo-card')) {
                        cardCount++;
                    }
                });
                
                if (cardCount > 0) {
                    window.animateCardCreation(cardCount);
                }
            }
        });
    });
    
    // Observer le conteneur de cartes
    const cardGrid = document.getElementById('bingo-card-grid');
    if (cardGrid) {
        observer.observe(cardGrid, { childList: true });
    }
});