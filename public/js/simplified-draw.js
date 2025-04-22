/**
 * MS BINGO Pacifique - Système de tirage simplifié
 * Version: 2.0 - Avril 2025
 * 
 * Ce module fournit une solution simplifiée pour le tirage des numéros
 * qui évite les problèmes de blocage dans l'interface utilisateur.
 */

class SimplifiedDrawSystem {
    constructor() {
        // État du système
        this.drawnNumbers = [];
        this.isAutoDrawActive = false;
        this.autoDrawInterval = null;
        this.maxNumber = 90; // Format européen (1-90)
        this.drawIntervalTime = 5000; // 5 secondes entre les tirages automatiques
        
        // Éléments DOM
        this.drawButton = null;
        this.autoDrawButton = null;
        this.resetButton = null;
        this.counterElement = null;
        
        // Configuration
        this.useModernInterface = false; // Désactivé pour garder l'interface originale
        this.hideOldDrawnNumbers = true; // Cacher l'ancien tableau de numéros tirés
        
        // Initialiser le système au chargement de la page
        document.addEventListener('DOMContentLoaded', () => {
            this.initialize();
        });
    }
    
    /**
     * Initialise le système de tirage
     */
    initialize() {
        console.log('Initialisation du système de tirage simplifié...');
        
        // Créer l'interface utilisateur
        this.createUI();
        
        // Remplacer l'ancien système si présent
        const oldDrawSystem = document.querySelector('.bingo-machine');
        if (oldDrawSystem) {
            oldDrawSystem.style.display = 'none';
        }
        
        // Initialiser les événements
        this.attachEventListeners();
    }
    
    /**
     * Crée l'interface utilisateur
     */
    createUI() {
        // Créer le conteneur principal
        const container = document.createElement('div');
        container.id = 'simplified-draw-system';
        container.className = 'simplified-draw-system';
        
        container.innerHTML = `
            <div class="draw-system-container">
                <div class="draw-buttons">
                    <button id="draw-button" class="draw-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4 4-4-4m4 4V8"/></svg>
                        Tirer un numéro
                    </button>
                    <button id="auto-draw-button" class="auto-draw-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v4M1 5h8M5 19v-4M1 19h8M19 5h4M16 7V3.5a1.5 1.5 0 0 1 3 0V7M19 21v-4M16 17h6"/></svg>
                        Tirage automatique
                    </button>
                    <button id="reset-button" class="reset-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        Réinitialiser
                    </button>
                </div>
                <div class="draw-counter">
                    <span id="draw-counter">Numéros tirés: 0 / 90</span>
                </div>
            </div>
        `;
        
        // Style CSS en ligne pour l'interface
        const style = document.createElement('style');
        style.textContent = `
            .simplified-draw-system {
                margin: 20px auto;
                max-width: 680px;
                text-align: center;
            }
            
            .draw-system-container {
                background: linear-gradient(160deg, #3a7bd5, #00d2ff);
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                position: relative;
                overflow: hidden;
            }
            
            .draw-system-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('/img/wave-pattern.svg');
                background-size: cover;
                opacity: 0.05;
                z-index: 0;
            }
            
            .draw-buttons {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-bottom: 15px;
                position: relative;
                z-index: 1;
                flex-wrap: wrap;
            }
            
            .draw-buttons button {
                background: #fff;
                border: none;
                border-radius: 50px;
                padding: 12px 20px;
                font-size: 16px;
                font-weight: 600;
                color: #3a7bd5;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
            }
            
            .draw-buttons button:hover {
                background: #f8f9fa;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
            }
            
            .draw-buttons button:active {
                transform: translateY(1px);
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            
            .draw-button {
                background: linear-gradient(90deg, #ff9966, #ff5e62) !important;
                color: white !important;
            }
            
            .auto-draw-button.active {
                background: linear-gradient(90deg, #7F7FD5, #91EAE4) !important;
                color: white !important;
            }
            
            .reset-button {
                background: linear-gradient(90deg, #DCE35B, #45B649) !important;
                color: white !important;
            }
            
            .draw-counter {
                margin-top: 15px;
                color: white;
                font-size: 18px;
                font-weight: 600;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                position: relative;
                z-index: 1;
            }
            
            @media (max-width: 768px) {
                .draw-buttons {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .draw-buttons button {
                    width: 100%;
                    justify-content: center;
                }
            }
            
            /* Cacher l'ancien système */
            .bingo-machine {
                display: none !important;
            }
            
            .drawn-numbers-container {
                display: none !important;
            }
        `;
        
        // Ajouter à la page
        document.head.appendChild(style);
        
        // Trouver le bon endroit pour insérer l'interface
        const bingoHall = document.querySelector('.bingo-hall');
        if (bingoHall) {
            bingoHall.insertBefore(container, bingoHall.firstChild);
        } else {
            // Fallback
            const main = document.querySelector('main') || document.body;
            main.insertBefore(container, main.firstChild);
        }
        
        // Créer aussi le conteneur pour l'annonceur moderne si pas déjà présent
        if (!document.getElementById('modern-announcer-container')) {
            const announcerContainer = document.createElement('div');
            announcerContainer.id = 'modern-announcer-container';
            container.insertAdjacentElement('afterend', announcerContainer);
        }
        
        // Stocker les références aux éléments DOM
        this.drawButton = document.getElementById('draw-button');
        this.autoDrawButton = document.getElementById('auto-draw-button');
        this.resetButton = document.getElementById('reset-button');
        this.counterElement = document.getElementById('draw-counter');
    }
    
    /**
     * Attache les écouteurs d'événements
     */
    attachEventListeners() {
        if (this.drawButton) {
            this.drawButton.addEventListener('click', () => this.drawNumber());
        }
        
        if (this.autoDrawButton) {
            this.autoDrawButton.addEventListener('click', () => this.toggleAutoDraw());
        }
        
        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => this.resetDraw());
        }
    }
    
    /**
     * Tire un nouveau numéro
     */
    drawNumber() {
        // Si tous les numéros ont été tirés
        if (this.drawnNumbers.length >= this.maxNumber) {
            console.log('Tous les numéros ont été tirés');
            this.stopAutoDraw();
            return;
        }
        
        // Tirer un numéro qui n'a pas encore été tiré
        let number;
        do {
            number = Math.floor(Math.random() * this.maxNumber) + 1;
        } while (this.drawnNumbers.includes(number));
        
        // Ajouter à la liste des numéros tirés
        this.drawnNumbers.push(number);
        
        // Mettre à jour le compteur
        this.updateCounter();
        
        // Déterminer la colonne (format européen)
        const column = Math.ceil(number / 15);
        
        // Déclencher l'événement de tirage
        this.triggerDrawEvent(number, column);
        
        console.log(`Numéro tiré: ${number} (colonne ${column})`);
        
        return number;
    }
    
    /**
     * Déclenche un événement de tirage de numéro
     * @param {number} number - Numéro tiré
     * @param {number} column - Colonne du numéro
     */
    triggerDrawEvent(number, column) {
        const event = new CustomEvent('numberDrawn', {
            detail: {
                number: number,
                column: column
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Active ou désactive le tirage automatique
     */
    toggleAutoDraw() {
        if (this.isAutoDrawActive) {
            this.stopAutoDraw();
        } else {
            this.startAutoDraw();
        }
    }
    
    /**
     * Démarre le tirage automatique
     */
    startAutoDraw() {
        if (this.isAutoDrawActive) return;
        
        this.isAutoDrawActive = true;
        this.autoDrawButton.classList.add('active');
        this.autoDrawButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            Pause
        `;
        
        // Tirer un premier numéro immédiatement
        this.drawNumber();
        
        // Puis configurer l'intervalle
        this.autoDrawInterval = setInterval(() => {
            this.drawNumber();
            
            // Si tous les numéros ont été tirés, arrêter
            if (this.drawnNumbers.length >= this.maxNumber) {
                this.stopAutoDraw();
            }
        }, this.drawIntervalTime);
        
        console.log('Tirage automatique démarré');
    }
    
    /**
     * Arrête le tirage automatique
     */
    stopAutoDraw() {
        if (!this.isAutoDrawActive) return;
        
        this.isAutoDrawActive = false;
        clearInterval(this.autoDrawInterval);
        this.autoDrawInterval = null;
        
        if (this.autoDrawButton) {
            this.autoDrawButton.classList.remove('active');
            this.autoDrawButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v4M1 5h8M5 19v-4M1 19h8M19 5h4M16 7V3.5a1.5 1.5 0 0 1 3 0V7M19 21v-4M16 17h6"/></svg>
                Tirage automatique
            `;
        }
        
        console.log('Tirage automatique arrêté');
    }
    
    /**
     * Réinitialise le tirage
     */
    resetDraw() {
        // Arrêter le tirage automatique si actif
        this.stopAutoDraw();
        
        // Réinitialiser les numéros tirés
        this.drawnNumbers = [];
        
        // Mettre à jour le compteur
        this.updateCounter();
        
        // Déclencher un événement de réinitialisation
        const event = new CustomEvent('gameReset');
        document.dispatchEvent(event);
        
        console.log('Tirage réinitialisé');
    }
    
    /**
     * Met à jour le compteur de numéros tirés
     */
    updateCounter() {
        if (this.counterElement) {
            this.counterElement.textContent = `Numéros tirés: ${this.drawnNumbers.length} / ${this.maxNumber}`;
        }
    }
}

// Initialiser le système de tirage simplifié
window.drawSystem = new SimplifiedDrawSystem();