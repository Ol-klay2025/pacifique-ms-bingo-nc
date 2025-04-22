/**
 * MS BINGO - Loader Animation
 * 
 * Ce fichier gère l'animation de chargement thématique BINGO avec effet "sniper"
 * pour les transitions et chargements de l'application
 */

class BingoLoader {
    constructor() {
        this.overlay = null;
        this.progressBar = null;
        this.loadingText = null;
        this.ballElements = [];
        this.scope = null;
        this.targetIndex = 0;
        this.progress = 0;
        this.messages = [
            "Préparation des cartons...",
            "Mélange des boules...",
            "Vérification du jackpot...",
            "Initialisation du tirage...",
            "Connexion des joueurs..."
        ];
        
        // Initialiser l'écouteur d'événements
        document.addEventListener('DOMContentLoaded', () => {
            this.injectStyles();
            this.createOverlay();
        });
    }
    
    /**
     * Injecte le CSS de l'animation si nécessaire
     */
    injectStyles() {
        // Vérifier si le CSS est déjà chargé
        if (!document.querySelector('link[href*="loading-animation.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/css/loading-animation.css';
            document.head.appendChild(link);
        }
    }
    
    /**
     * Crée l'overlay de chargement et tous ses éléments
     */
    createOverlay() {
        // Créer l'overlay s'il n'existe pas déjà
        if (this.overlay) return;
        
        // Créer l'overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        
        // Créer le conteneur d'animation
        const loader = document.createElement('div');
        loader.className = 'bingo-loader';
        
        // Ajouter les boules BINGO
        const letters = ['B', 'I', 'N', 'G', 'O'];
        letters.forEach((letter, index) => {
            const ball = document.createElement('div');
            ball.className = 'bingo-ball';
            ball.textContent = letter;
            ball.setAttribute('data-letter', letter);
            loader.appendChild(ball);
            this.ballElements.push(ball);
        });
        
        // Ajouter l'effet de viseur sniper
        this.scope = document.createElement('div');
        this.scope.className = 'sniper-scope';
        
        const dot = document.createElement('div');
        dot.className = 'sniper-dot';
        
        this.scope.appendChild(dot);
        loader.appendChild(this.scope);
        
        // Créer le texte de chargement
        this.loadingText = document.createElement('div');
        this.loadingText.className = 'loading-text';
        this.loadingText.textContent = this.messages[0];
        
        // Créer la barre de progression
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-bar';
        progressContainer.style.width = '280px';
        progressContainer.style.height = '6px';
        progressContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        progressContainer.style.borderRadius = '3px';
        progressContainer.style.marginTop = '15px';
        progressContainer.style.overflow = 'hidden';
        
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'progress-fill';
        this.progressBar.style.height = '100%';
        this.progressBar.style.backgroundColor = '#0099cc';
        this.progressBar.style.width = '0%';
        this.progressBar.style.borderRadius = '3px';
        this.progressBar.style.transition = 'width 0.5s ease-out';
        this.progressBar.style.boxShadow = '0 0 8px #0099cc';
        
        progressContainer.appendChild(this.progressBar);
        
        // Assembler tous les éléments
        this.overlay.appendChild(loader);
        this.overlay.appendChild(this.loadingText);
        this.overlay.appendChild(progressContainer);
        
        // Ajouter à la page
        document.body.appendChild(this.overlay);
    }
    
    /**
     * Affiche l'animation de chargement
     */
    show() {
        this.createOverlay();
        document.body.style.overflow = 'hidden';
        this.progress = 0;
        this.updateProgress(0);
        this.startTargeting();
        
        // Rendre visible
        setTimeout(() => {
            this.overlay.classList.remove('hidden');
        }, 10);
        
        return this;
    }
    
    /**
     * Cache l'animation de chargement
     */
    hide() {
        if (!this.overlay) return this;
        
        this.overlay.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Supprimer après la transition
        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
                this.overlay = null;
            }
        }, 500);
        
        return this;
    }
    
    /**
     * Met à jour la barre de progression
     * @param {number} percent Pourcentage de progression (0-100)
     */
    updateProgress(percent) {
        if (!this.progressBar) return this;
        
        this.progress = Math.min(100, Math.max(0, percent));
        
        // Forcer l'affichage de la jauge avec style inline pour s'assurer qu'elle est visible
        this.progressBar.style.display = 'block';
        this.progressBar.style.width = `${this.progress}%`;
        this.progressBar.style.backgroundColor = '#0099cc';
        this.progressBar.style.boxShadow = '0 0 8px #0099cc';
        
        // Mettre à jour le message de chargement
        const messageIndex = Math.min(
            this.messages.length - 1,
            Math.floor(this.progress / (100 / this.messages.length))
        );
        this.loadingText.textContent = this.messages[messageIndex];
        
        // Si terminé, cacher automatiquement après un délai
        if (this.progress >= 100) {
            setTimeout(() => this.hide(), 500);
        }
        
        return this;
    }
    
    /**
     * Incrémente la barre de progression
     * @param {number} increment Incrément à ajouter au pourcentage actuel
     */
    incrementProgress(increment = 10) {
        return this.updateProgress(this.progress + increment);
    }
    
    /**
     * Anime l'effet de ciblage "sniper" sur les boules
     */
    startTargeting() {
        if (!this.scope || this.ballElements.length === 0) return;
        
        // Animer le déplacement du viseur vers une boule cible
        const targetBall = this.ballElements[this.targetIndex];
        const ballRect = targetBall.getBoundingClientRect();
        const loaderRect = this.overlay.querySelector('.bingo-loader').getBoundingClientRect();
        
        // Positionner le viseur sur la boule cible (relatif au conteneur loader)
        const targetX = (ballRect.left + ballRect.width / 2) - (loaderRect.left + loaderRect.width / 2);
        const targetY = (ballRect.top + ballRect.height / 2) - (loaderRect.top + loaderRect.height / 2);
        
        // Animer le mouvement du viseur
        this.scope.style.transition = 'transform 1s ease-in-out';
        this.scope.style.transform = `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px))`;
        
        // Ajouter l'effet "targeted" à la boule après un court délai
        setTimeout(() => {
            targetBall.classList.add('targeted');
            
            // Passer à la boule suivante
            setTimeout(() => {
                targetBall.classList.remove('targeted');
                this.targetIndex = (this.targetIndex + 1) % this.ballElements.length;
                
                // Déplacer le viseur au centre avant la prochaine cible
                this.scope.style.transition = 'transform 0.5s ease-in-out';
                this.scope.style.transform = 'translate(-50%, -50%)';
                
                // Continuer le ciblage tant que l'overlay est visible
                setTimeout(() => {
                    if (this.overlay && !this.overlay.classList.contains('hidden')) {
                        this.startTargeting();
                    }
                }, 700);
            }, 1000);
        }, 1000);
    }
    
    /**
     * Simule un chargement automatique pour les démonstrations
     * @param {number} duration Durée totale du chargement (ms)
     * @param {number} steps Nombre d'incréments de progression
     */
    simulateLoading(duration = 5000, steps = 10) {
        if (steps <= 0) return this;
        
        const increment = 100 / steps;
        const interval = duration / steps;
        
        this.show();
        let currentStep = 0;
        
        const step = () => {
            currentStep++;
            this.updateProgress(currentStep * increment);
            
            if (currentStep < steps) {
                setTimeout(step, interval);
            }
        };
        
        setTimeout(step, interval);
        return this;
    }
}

// Créer l'instance globale
window.bingoLoader = new BingoLoader();

// Exposer des méthodes utilitaires
window.showBingoLoader = () => window.bingoLoader.show();
window.hideBingoLoader = () => window.bingoLoader.hide();
window.updateLoaderProgress = (percent) => window.bingoLoader.updateProgress(percent);
window.incrementLoaderProgress = (increment) => window.bingoLoader.incrementProgress(increment);
window.simulateBingoLoading = (duration, steps) => window.bingoLoader.simulateLoading(duration, steps);

console.log('MS BINGO - Loader Animation chargée');