/**
 * MS BINGO Pacifique - Annonceur moderne de numéros
 * 
 * Ce module fournit un affichage visuel moderne et élégant des numéros tirés
 * avec animations fluides et interface utilisateur optimisée.
 * Version: 2.0 - Avril 2025
 */

class ModernAnnouncer {
    constructor(options = {}) {
        // Configuration par défaut
        this.options = {
            containerId: 'modern-announcer-container',
            theme: 'pacifique', // pacific, modern, classic
            animation: 'bounce', // bounce, fade, slide
            historySize: 24,     // Nombre de boules à afficher dans l'historique
            columnGrouping: true, // Grouper par colonnes (1-15, 16-30, etc.)
            ...options
        };
        
        // État interne
        this.currentNumber = null;
        this.numberHistory = [];
        this.columnCounts = [0, 0, 0, 0, 0, 0]; // Indice 0 non utilisé, 1-5 pour les colonnes B-O
        this.isAnimating = false;
        
        // Couleurs par défaut pour les colonnes (style Pacifique)
        this.columnColors = {
            1: '#1E88E5', // Bleu (B: 1-15)
            2: '#26A69A', // Vert teal (I: 16-30)
            3: '#FFC107', // Jaune (N: 31-45)
            4: '#FF7043', // Orange (G: 46-60)
            5: '#EC407A'  // Rose (O: 61-75)
        };
        
        // Créer l'interface au chargement de la page
        document.addEventListener('DOMContentLoaded', () => this.initialize());
    }
    
    /**
     * Initialise l'annonceur et crée l'interface
     */
    initialize() {
        // Créer le conteneur s'il n'existe pas
        let container = document.getElementById(this.options.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = this.options.containerId;
            document.body.appendChild(container);
        }
        
        // Styles CSS pour l'annonceur
        this.injectStyles();
        
        // Créer l'interface utilisateur
        this.renderUI(container);
        
        // Écouter les événements de tirage de numéro
        document.addEventListener('numberDrawn', (e) => {
            const number = e.detail.number;
            const column = this.getColumnForNumber(number);
            this.displayNumber(number, column);
        });
        
        // Écouter les événements de réinitialisation
        document.addEventListener('gameReset', () => {
            this.reset();
        });
    }
    
    /**
     * Injecte les styles CSS nécessaires
     */
    injectStyles() {
        if (document.getElementById('modern-announcer-styles')) return;
        
        const styles = `
            #${this.options.containerId} {
                font-family: 'Roboto', 'Segoe UI', sans-serif;
                max-width: 100%;
                overflow: hidden;
                color: #333;
                --primary-color: #0277BD;
                --secondary-color: #26A69A;
                --accent-color: #FFC107;
                --success-color: #66BB6A;
                --warning-color: #FF7043;
                --info-color: #29B6F6;
                margin: 0 auto;
            }
            
            .modern-announcer-main {
                border-radius: 12px;
                background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,240,240,0.85));
                padding: 15px;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                backdrop-filter: blur(5px);
                margin-bottom: 15px;
                position: relative;
                overflow: hidden;
                border: 1px solid rgba(255,255,255,0.5);
            }
            
            .modern-announcer-palm-bg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('/img/palm-leaves.svg');
                background-size: cover;
                background-position: center;
                opacity: 0.07;
                z-index: -1;
            }
            
            .modern-announcer-title {
                font-size: 1.2rem;
                font-weight: 600;
                text-align: center;
                margin-bottom: 10px;
                color: #333;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .modern-announcer-current {
                text-align: center;
                min-height: 140px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: relative;
            }
            
            .modern-announcer-number {
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 50%;
                font-size: 3.5rem;
                font-weight: 700;
                width: 100px;
                height: 100px;
                color: white;
                text-shadow: 0 1px 1px rgba(0,0,0,0.5);
                margin-bottom: 10px;
                position: relative;
                box-shadow: 0 4px 8px rgba(0,0,0,0.15), inset 0 -3px 8px rgba(0,0,0,0.2);
                background: linear-gradient(135deg, var(--ball-color), rgba(0,0,0,0.1)) var(--ball-color);
                transition: transform 0.3s ease-out;
                overflow: hidden;
            }
            
            .modern-announcer-number::after {
                content: '';
                position: absolute;
                top: 10px;
                left: 25px;
                width: 20px;
                height: 10px;
                background: rgba(255,255,255,0.6);
                border-radius: 50%;
                filter: blur(2px);
            }
            
            .modern-announcer-number.animate-bounce {
                animation: announce-bounce 0.5s ease-out;
            }
            
            @keyframes announce-bounce {
                0% { transform: scale(0.5); opacity: 0; }
                60% { transform: scale(1.2); }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .modern-announcer-label {
                font-size: 0.9rem;
                font-weight: 600;
                color: #666;
            }
            
            .modern-announcer-history {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
                gap: 8px;
                padding: 10px 15px;
                max-width: 100%;
                overflow-x: auto;
                justify-content: center;
            }
            
            .modern-announcer-history-title {
                grid-column: 1 / -1;
                font-size: 1rem;
                font-weight: 600;
                margin: 5px 0;
                text-align: center;
                color: #555;
            }
            
            .modern-announcer-ball {
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 50%;
                font-size: 1rem;
                font-weight: 600;
                width: 40px;
                height: 40px;
                color: white;
                background: var(--ball-color);
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                position: relative;
                overflow: hidden;
                transition: transform 0.2s ease;
            }
            
            .modern-announcer-ball::after {
                content: '';
                position: absolute;
                top: 5px;
                left: 10px;
                width: 10px;
                height: 5px;
                background: rgba(255,255,255,0.5);
                border-radius: 50%;
                filter: blur(1px);
            }
            
            .modern-announcer-ball:hover {
                transform: scale(1.15);
                cursor: pointer;
                z-index: 2;
            }
            
            .modern-announcer-range {
                grid-column: 1 / -1;
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                margin: 5px 0;
                border-bottom: 1px solid #eee;
                font-size: 0.8rem;
                color: #666;
            }
            
            .modern-announcer-range-title {
                font-weight: 600;
                color: #333;
            }
            
            .modern-announcer-count {
                font-size: 0.75rem;
                color: #777;
            }
            
            /* Styles spécifiques pour le thème Pacifique */
            .theme-pacifique .modern-announcer-main {
                background: linear-gradient(135deg, rgba(235,255,255,0.9), rgba(225,245,255,0.85));
                border-color: rgba(200,240,255,0.5);
            }
            
            .theme-pacifique .modern-announcer-title {
                color: #0277BD;
                text-shadow: 0 1px 1px rgba(255,255,255,0.9);
            }
            
            /* Animations */
            @keyframes wave {
                0% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
                100% { transform: translateY(0); }
            }
            
            .wave-animation {
                animation: wave 2s infinite ease-in-out;
            }
            
            /* Style pour les groupes de colonnes */
            .column-group-1 .modern-announcer-ball { --ball-color: ${this.columnColors[1]}; }
            .column-group-2 .modern-announcer-ball { --ball-color: ${this.columnColors[2]}; }
            .column-group-3 .modern-announcer-ball { --ball-color: ${this.columnColors[3]}; }
            .column-group-4 .modern-announcer-ball { --ball-color: ${this.columnColors[4]}; }
            .column-group-5 .modern-announcer-ball { --ball-color: ${this.columnColors[5]}; }
            
            .column-1 { --ball-color: ${this.columnColors[1]}; }
            .column-2 { --ball-color: ${this.columnColors[2]}; }
            .column-3 { --ball-color: ${this.columnColors[3]}; }
            .column-4 { --ball-color: ${this.columnColors[4]}; }
            .column-5 { --ball-color: ${this.columnColors[5]}; }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'modern-announcer-styles';
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }
    
    /**
     * Crée l'interface utilisateur
     * @param {HTMLElement} container - Élément conteneur
     */
    renderUI(container) {
        container.className = `theme-${this.options.theme}`;
        
        container.innerHTML = `
            <div class="modern-announcer-main">
                <div class="modern-announcer-palm-bg"></div>
                <div class="modern-announcer-title">Numéros tirés</div>
                <div class="modern-announcer-current">
                    <div class="modern-announcer-number" id="current-number">
                        <span id="number-display"></span>
                    </div>
                    <div class="modern-announcer-label" id="column-label"></div>
                </div>
            </div>
            
            <div class="modern-announcer-history-container">
                <div class="modern-announcer-history" id="number-history">
                    <div class="modern-announcer-history-title">Historique des tirages</div>
                    ${this.renderColumnGroups()}
                </div>
            </div>
        `;
    }
    
    /**
     * Génère le HTML pour les groupes de colonnes
     */
    renderColumnGroups() {
        if (!this.options.columnGrouping) return '';
        
        let html = '';
        const groups = [
            { id: 1, name: 'B', start: 1, end: 15 },
            { id: 2, name: 'I', start: 16, end: 30 },
            { id: 3, name: 'N', start: 31, end: 45 },
            { id: 4, name: 'G', start: 46, end: 60 },
            { id: 5, name: 'O', start: 61, end: 75 }
        ];
        
        groups.forEach(group => {
            html += `
                <div class="modern-announcer-range column-group-${group.id}">
                    <span class="modern-announcer-range-title">${group.name}: ${group.start}-${group.end}</span>
                    <span class="modern-announcer-count" id="column-count-${group.id}">0/${group.end - group.start + 1}</span>
                </div>
                <div id="column-balls-${group.id}" class="column-group-${group.id}"></div>
            `;
        });
        
        return html;
    }
    
    /**
     * Détermine la colonne pour un numéro donné
     * @param {number} number - Numéro de bingo
     * @returns {number} Colonne (1-5)
     */
    getColumnForNumber(number) {
        if (number <= 15) return 1; // B
        if (number <= 30) return 2; // I
        if (number <= 45) return 3; // N
        if (number <= 60) return 4; // G
        return 5; // O
    }
    
    /**
     * Obtient la lettre de colonne pour un numéro
     * @param {number} column - Numéro de colonne (1-5)
     * @returns {string} Lettre de colonne (B, I, N, G, O)
     */
    getColumnLetter(column) {
        const letters = ['B', 'I', 'N', 'G', 'O'];
        return letters[column - 1];
    }
    
    /**
     * Affiche un nouveau numéro tiré
     * @param {number} number - Numéro tiré
     * @param {number} column - Colonne du numéro (1-5)
     */
    displayNumber(number, column) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        // Mettre à jour le numéro courant
        this.currentNumber = number;
        
        // Afficher le numéro courant avec animation
        const numberDisplay = document.getElementById('number-display');
        const currentNumberElement = document.getElementById('current-number');
        const columnLabel = document.getElementById('column-label');
        
        if (numberDisplay && currentNumberElement && columnLabel) {
            // Réinitialiser les classes pour l'animation
            currentNumberElement.classList.remove('animate-bounce');
            void currentNumberElement.offsetWidth; // Force reflow
            
            // Mettre à jour le numéro et ajouter la classe de colonne
            numberDisplay.textContent = number;
            currentNumberElement.className = `modern-announcer-number column-${column}`;
            
            // Ajouter l'animation
            currentNumberElement.classList.add(`animate-${this.options.animation}`);
            
            // Mettre à jour le label de colonne
            columnLabel.textContent = `Colonne ${this.getColumnLetter(column)}`;
            
            // Ajouter à l'historique
            this.addToHistory(number, column);
            
            // Mettre à jour le compteur de colonne
            this.columnCounts[column]++;
            const countElement = document.getElementById(`column-count-${column}`);
            if (countElement) {
                const max = column === 1 ? 15 : column === 2 ? 15 : column === 3 ? 15 : column === 4 ? 15 : 15;
                countElement.textContent = `${this.columnCounts[column]}/${max}`;
            }
            
            // Réinitialiser l'état d'animation après un délai
            setTimeout(() => {
                this.isAnimating = false;
            }, 600);
        }
    }
    
    /**
     * Ajoute un numéro à l'historique
     * @param {number} number - Numéro tiré
     * @param {number} column - Colonne du numéro
     */
    addToHistory(number, column) {
        // Ajouter au tableau d'historique
        this.numberHistory.unshift({ number, column });
        
        // Limiter la taille de l'historique
        if (this.numberHistory.length > this.options.historySize) {
            this.numberHistory = this.numberHistory.slice(0, this.options.historySize);
        }
        
        // Mettre à jour l'affichage de l'historique
        this.updateHistoryDisplay();
    }
    
    /**
     * Met à jour l'affichage de l'historique
     */
    updateHistoryDisplay() {
        if (this.options.columnGrouping) {
            // Grouper par colonne
            const columnGroups = [[], [], [], [], [], []]; // Index 0 non utilisé
            
            this.numberHistory.forEach(item => {
                columnGroups[item.column].push(item.number);
            });
            
            // Mettre à jour chaque groupe
            for (let i = 1; i <= 5; i++) {
                const groupContainer = document.getElementById(`column-balls-${i}`);
                if (groupContainer) {
                    groupContainer.innerHTML = columnGroups[i].map(number => 
                        `<div class="modern-announcer-ball">${number}</div>`
                    ).join('');
                }
            }
        } else {
            // Affichage simple (non groupé)
            const historyContainer = document.getElementById('number-history');
            if (historyContainer) {
                const existingTitle = historyContainer.querySelector('.modern-announcer-history-title');
                
                historyContainer.innerHTML = '';
                if (existingTitle) {
                    historyContainer.appendChild(existingTitle);
                }
                
                this.numberHistory.forEach(item => {
                    const ball = document.createElement('div');
                    ball.className = `modern-announcer-ball column-${item.column}`;
                    ball.textContent = item.number;
                    historyContainer.appendChild(ball);
                });
            }
        }
    }
    
    /**
     * Réinitialise l'annonceur
     */
    reset() {
        this.currentNumber = null;
        this.numberHistory = [];
        this.columnCounts = [0, 0, 0, 0, 0, 0];
        
        // Réinitialiser l'affichage
        const numberDisplay = document.getElementById('number-display');
        const columnLabel = document.getElementById('column-label');
        
        if (numberDisplay) numberDisplay.textContent = '';
        if (columnLabel) columnLabel.textContent = '';
        
        // Réinitialiser les compteurs de colonne
        for (let i = 1; i <= 5; i++) {
            const countElement = document.getElementById(`column-count-${i}`);
            if (countElement) {
                const max = i === 1 ? 15 : i === 2 ? 15 : i === 3 ? 15 : i === 4 ? 15 : 15;
                countElement.textContent = `0/${max}`;
            }
            
            // Vider les groupes de boules
            const groupContainer = document.getElementById(`column-balls-${i}`);
            if (groupContainer) {
                groupContainer.innerHTML = '';
            }
        }
    }
}

// Initialiser l'annonceur moderne
window.modernAnnouncer = new ModernAnnouncer();