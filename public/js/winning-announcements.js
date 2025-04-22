/**
 * MS BINGO - Module d'affichage des annonces de victoires
 * Ce module gère l'affichage des animations lors des quines et bingos
 */

class WinningAnnouncements {
    constructor() {
        this.container = null;
        this.initiated = false;
        this.initContainer();
        this.setupEventListeners();
    }

    /**
     * Initialise le conteneur d'animations
     */
    initContainer() {
        // Créer le conteneur principal s'il n'existe pas déjà
        if (!document.getElementById('winning-announcements-container')) {
            this.container = document.createElement('div');
            this.container.id = 'winning-announcements-container';
            this.container.innerHTML = `
                <div class="winning-logo"></div>
                <div class="winning-cards-display"></div>
            `;
            document.body.appendChild(this.container);
            
            // Ajouter les styles CSS si nécessaire
            if (!document.getElementById('winning-announcements-style')) {
                const style = document.createElement('style');
                style.id = 'winning-announcements-style';
                style.textContent = `
                    #winning-announcements-container {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.8);
                        z-index: 9999;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity 0.5s ease;
                    }
                    
                    #winning-announcements-container.active {
                        opacity: 1;
                        pointer-events: auto;
                    }
                    
                    .winning-logo {
                        width: 300px;
                        height: 300px;
                        background-size: contain;
                        background-repeat: no-repeat;
                        background-position: center;
                        margin-bottom: 30px;
                        transform: scale(0);
                        transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    }
                    
                    #winning-announcements-container.active .winning-logo {
                        transform: scale(1);
                    }
                    
                    .winning-logo.quine {
                        background-image: url('/assets/quine-logo.svg');
                    }
                    
                    .winning-logo.bingo {
                        background-image: url('/assets/bingo-logo.svg');
                    }
                    
                    .winning-cards-display {
                        width: 90%;
                        max-width: 1200px;
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                        gap: 20px;
                        opacity: 0;
                        transform: translateY(20px);
                        transition: opacity 0.5s ease, transform 0.5s ease;
                    }
                    
                    #winning-announcements-container.active .winning-cards-display {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    
                    .winning-card {
                        background-color: white;
                        border-radius: 10px;
                        padding: 15px;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                        max-width: 350px;
                    }
                    
                    .winning-card-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #eee;
                    }
                    
                    .winning-card-grid {
                        display: grid;
                        grid-template-columns: repeat(9, 1fr);
                        gap: 5px;
                    }
                    
                    .winning-card-cell {
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        border-radius: 5px;
                        background-color: #f0f0f0;
                    }
                    
                    .winning-card-cell.marked {
                        background-color: #ff9800;
                        color: white;
                    }
                    
                    .winning-card-cell.empty {
                        background-color: #e0e0e0;
                    }
                    
                    .winner-title {
                        text-align: center;
                        font-size: 24px;
                        margin: 0 0 20px 0;
                        color: white;
                    }
                `;
                document.head.appendChild(style);
            }
            
            this.initiated = true;
        } else {
            this.container = document.getElementById('winning-announcements-container');
        }
    }

    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Écouter les événements de quine
        document.addEventListener('quine-achieved', (event) => {
            this.showWinningAnnouncement({
                type: 'quine',
                winnerName: event.detail.card.playerName,
                cards: [event.detail.card]
            });
        });
        
        // Écouter les événements de bingo
        document.addEventListener('bingo-achieved', (event) => {
            this.showWinningAnnouncement({
                type: 'bingo',
                winnerName: event.detail.card.playerName,
                cards: [event.detail.card]
            });
        });
        
        // Fermer l'annonce en cliquant n'importe où
        this.container.addEventListener('click', () => {
            this.container.classList.remove('active');
        });
    }

    /**
     * Affiche l'annonce de victoire
     * @param {Object} winData - Données de la victoire
     */
    showWinningAnnouncement(winData) {
        if (!this.initiated) {
            this.initContainer();
        }
        
        // Mettre à jour le logo
        const logoElement = this.container.querySelector('.winning-logo');
        logoElement.className = 'winning-logo';
        logoElement.classList.add(winData.type);
        
        // Montrer le conteneur
        this.container.classList.add('active');
        
        // Afficher le logo pendant 3 secondes, puis afficher les cartons
        setTimeout(() => {
            this.showWinningCards(winData);
        }, 3000);
        
        // Fermer l'annonce après 13 secondes au total (3s logo + 10s cartes)
        setTimeout(() => {
            this.container.classList.remove('active');
        }, 13000);
    }

    /**
     * Affiche les cartons gagnants
     * @param {Object} winData - Données de la victoire
     */
    showWinningCards(winData) {
        const cardsContainer = this.container.querySelector('.winning-cards-display');
        
        // Titre pour les gagnants
        const winnerTitle = document.createElement('div');
        winnerTitle.className = 'winner-title';
        winnerTitle.textContent = winData.type === 'quine' ? 'Quine gagnante !' : 'Bingo gagnant !';
        
        // Rendu des cartons
        const cardsHTML = this.renderWinningCards(winData);
        
        // Mettre à jour le conteneur
        cardsContainer.innerHTML = '';
        cardsContainer.appendChild(winnerTitle);
        cardsContainer.insertAdjacentHTML('beforeend', cardsHTML);
    }

    /**
     * Génère le HTML pour les cartons gagnants
     * @param {Object} winData - Données de la victoire
     * @returns {string} HTML des cartons gagnants
     */
    renderWinningCards(winData) {
        return winData.cards.map(card => {
            // Génération de la structure de la carte
            return `
                <div class="winning-card">
                    <div class="winning-card-header">
                        <span class="player-name">${card.playerName}</span>
                        <span class="win-type">${winData.type.toUpperCase()}</span>
                    </div>
                    <div class="winning-card-grid">
                        ${this.renderCardContent(card.numbers, card)}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Génère le contenu HTML du carton
     * @param {Array} numbers - Numéros du carton
     * @param {Object|string} card - Données du carton ou ID
     * @returns {string} HTML du contenu du carton
     */
    renderCardContent(numbers, card) {
        let html = '';
        
        // Parcourir chaque ligne
        for (let row = 0; row < numbers.length; row++) {
            const rowNumbers = numbers[row];
            
            // Pour chaque colonne possible (1-9)
            for (let col = 0; col < 9; col++) {
                // Trouver le numéro correspondant à cette colonne 
                // (ou 0 si la case est vide)
                let number = 0;
                
                // Dans le format européen, chaque colonne contient des numéros spécifiques
                // Col 1: 1-9, Col 2: 10-19, etc.
                for (let i = 0; i < rowNumbers.length; i++) {
                    const num = rowNumbers[i];
                    if (num === 0) continue; // Case vide
                    
                    // Vérifier si le numéro appartient à cette colonne
                    const colStart = col * 10 + (col === 0 ? 1 : 0);
                    const colEnd = col * 10 + 9;
                    
                    if (num >= colStart && num <= colEnd) {
                        number = num;
                        break;
                    }
                }
                
                // Déterminer les classes CSS
                let cellClass = 'winning-card-cell';
                if (number === 0) {
                    cellClass += ' empty';
                } else if (card.markedNumbers && card.markedNumbers.includes(number)) {
                    cellClass += ' marked';
                }
                
                // Générer la cellule
                html += `<div class="${cellClass}">${number > 0 ? number : ''}</div>`;
            }
        }
        
        return html;
    }
}

// Initialiser dès le chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.winningAnnouncements = new WinningAnnouncements();
});

// Fonction de test pour démontrer l'annonce de victoire
function testWinningAnnouncement(type = 'quine') {
    const testCard = {
        playerName: 'Joueur Test',
        numbers: [
            [3, 16, 31, 47, 62],
            [7, 24, 0, 54, 65],
            [14, 28, 36, 59, 71]
        ],
        markedNumbers: type === 'quine' 
            ? [3, 14, 24, 59]
            : [3, 14, 24, 59, 16, 31, 47, 62, 7, 54, 65, 28, 36, 71],
        winningNumbers: type === 'quine'
            ? [3, 14, 24, 59, 0]
            : [3, 14, 24, 59, 16, 31, 47, 62, 7, 54, 65, 28, 36, 71, 0]
    };
    
    const event = new CustomEvent(`${type}-achieved`, {
        detail: { card: testCard }
    });
    
    document.dispatchEvent(event);
}

// Exposer la fonction de test globalement
window.testWinningAnnouncement = testWinningAnnouncement;