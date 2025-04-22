/**
 * MS BINGO - Module de partage sur les réseaux sociaux
 * Ce module permet de partager les victoires sur différentes plateformes sociales
 */

// Configuration pour les différents réseaux sociaux
const socialNetworks = {
    facebook: {
        name: 'Facebook',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>',
        shareUrl: 'https://www.facebook.com/sharer/sharer.php?u={url}&quote={message}',
        color: '#3b5998'
    },
    twitter: {
        name: 'Twitter',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>',
        shareUrl: 'https://twitter.com/intent/tweet?text={message}&url={url}',
        color: '#1DA1F2'
    },
    whatsapp: {
        name: 'WhatsApp',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>',
        shareUrl: 'https://api.whatsapp.com/send?text={message}%20{url}',
        color: '#25D366'
    },
    telegram: {
        name: 'Telegram',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 7.5a2.25 2.25 0 0 0 .126 4.303l3.984 1.027 2.378 7.484c.23.721 1.097 1.16 1.818.93a1.75 1.75 0 0 0 1.103-1.533L12.483 12l7.1.87c1.103.135 2.27-.737 2.135-1.84l-.5-7.43a2.25 2.25 0 0 0-2.02-2.167z"></path></svg>',
        shareUrl: 'https://t.me/share/url?url={url}&text={message}',
        color: '#0088cc'
    },
    email: {
        name: 'Email',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
        shareUrl: 'mailto:?subject={title}&body={message}%20{url}',
        color: '#555'
    }
};

// Messages par défaut pour les différents types de victoires
const defaultMessages = {
    quine: {
        title: 'J\'ai réalisé une quine sur MS BINGO Pacifique !',
        message: 'Je viens de réaliser une quine sur MS BINGO Pacifique et de gagner un prix ! Rejoignez-moi pour jouer.'
    },
    bingo: {
        title: 'J\'ai gagné au BINGO Pacifique !',
        message: 'Je viens de gagner au BINGO Pacifique et de remporter un gros prix ! Venez jouer avec moi.'
    },
    jackpot: {
        title: 'JACKPOT sur MS BINGO Pacifique !',
        message: 'INCROYABLE ! Je viens de gagner le JACKPOT sur MS BINGO Pacifique ! Un gain énorme ! Venez tenter votre chance.'
    }
};

// Messages localisés (pourra être étendu avec plus de langues)
const localizedMessages = {
    'fr': defaultMessages,
    'en': {
        quine: {
            title: 'I got a line on MS BINGO Pacific!',
            message: 'I just got a line on MS BINGO Pacific and won a prize! Join me to play.'
        },
        bingo: {
            title: 'I won at BINGO Pacific!',
            message: 'I just won at BINGO Pacific and got a big prize! Come play with me.'
        },
        jackpot: {
            title: 'JACKPOT on MS BINGO Pacific!',
            message: 'INCREDIBLE! I just won the JACKPOT on MS BINGO Pacific! A huge win! Come try your luck.'
        }
    }
};

/**
 * Crée et affiche la modal de partage social
 * @param {string} winType - Type de victoire (quine, bingo, jackpot)
 * @param {number} amount - Montant gagné (optionnel)
 * @param {string} language - Code de langue (fr, en)
 */
function showShareModal(winType, amount = null, language = 'fr') {
    // Sélectionner les messages selon la langue
    const messages = localizedMessages[language] || defaultMessages;
    
    // Récupérer le message pour ce type de victoire
    let messageConfig = messages[winType] || messages.bingo;
    
    // Personnaliser le message avec le montant si fourni
    let message = messageConfig.message;
    if (amount) {
        // Pour le français
        if (language === 'fr') {
            message = message.replace('un prix', `${amount} F`).replace('un gros prix', `${amount} F`);
        } 
        // Pour l'anglais
        else if (language === 'en') {
            message = message.replace('a prize', `${amount} F`).replace('a big prize', `${amount} F`);
        }
    }
    
    // Créer l'URL à partager (l'URL actuelle)
    const shareUrl = encodeURIComponent(window.location.href);
    const shareTitle = encodeURIComponent(messageConfig.title);
    const shareMessage = encodeURIComponent(message);
    
    // Créer la modal
    const modalContainer = document.createElement('div');
    modalContainer.className = 'share-modal-container';
    modalContainer.innerHTML = `
        <div class="share-modal">
            <div class="share-modal-header">
                <h3>Partagez votre victoire</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="share-modal-content">
                <p>${message}</p>
                <div class="share-buttons">
                    ${Object.keys(socialNetworks).map(network => {
                        const socialNet = socialNetworks[network];
                        const shareLink = socialNet.shareUrl
                            .replace('{url}', shareUrl)
                            .replace('{message}', shareMessage)
                            .replace('{title}', shareTitle);
                        
                        return `
                            <a href="${shareLink}" target="_blank" rel="noopener noreferrer"
                               class="share-button" style="background-color: ${socialNet.color};">
                                ${socialNet.icon}
                                <span>${socialNet.name}</span>
                            </a>
                        `;
                    }).join('')}
                </div>
            </div>
            <div class="share-modal-footer">
                <button class="dismiss-btn">Fermer</button>
            </div>
        </div>
    `;
    
    // Ajouter des styles CSS pour la modal
    const styles = document.createElement('style');
    styles.textContent = `
        .share-modal-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease-out;
        }
        
        .share-modal {
            background-color: #2a2a2a;
            border-radius: 10px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            animation: slideIn 0.3s ease-out;
        }
        
        .share-modal-header {
            background-color: #0099cc;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .share-modal-header h3 {
            margin: 0;
            color: white;
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
        
        .share-modal-content {
            padding: 20px;
        }
        
        .share-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }
        
        .share-button {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 15px;
            border-radius: 5px;
            color: white;
            text-decoration: none;
            transition: transform 0.2s, opacity 0.2s;
            flex: 1 0 calc(50% - 10px);
            max-width: calc(50% - 10px);
        }
        
        .share-button:hover {
            transform: translateY(-2px);
            opacity: 0.9;
        }
        
        .share-button svg {
            flex-shrink: 0;
        }
        
        .share-modal-footer {
            padding: 15px;
            text-align: right;
            border-top: 1px solid #444;
        }
        
        .dismiss-btn {
            background-color: #555;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
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
        
        @media (max-width: 576px) {
            .share-button {
                flex: 1 0 100%;
                max-width: 100%;
            }
        }
    `;
    
    // Ajouter la modal et les styles au document
    document.head.appendChild(styles);
    document.body.appendChild(modalContainer);
    
    // Gérer la fermeture de la modal
    const closeButtons = modalContainer.querySelectorAll('.close-btn, .dismiss-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modalContainer.classList.add('fade-out');
            setTimeout(() => {
                modalContainer.remove();
            }, 300);
        });
    });
    
    // Fermer la modal en cliquant en dehors
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            modalContainer.classList.add('fade-out');
            setTimeout(() => {
                modalContainer.remove();
            }, 300);
        }
    });
}

// Exposer la fonction pour utilisation externe
window.showShareModal = showShareModal;

/**
 * Ajoute un bouton de partage flottant après une victoire
 * @param {string} winType - Type de victoire (quine, bingo, jackpot)
 * @param {number} amount - Montant gagné (optionnel)
 */
function addShareButton(winType, amount = null) {
    // Si un bouton existe déjà, le supprimer
    const existingButton = document.querySelector('.floating-share-button');
    if (existingButton) {
        existingButton.remove();
    }
    
    // Déterminer la couleur et le message selon le type de victoire
    let buttonColor, buttonText;
    switch (winType) {
        case 'quine':
            buttonColor = '#ff9800';
            buttonText = 'Partager ma quine';
            break;
        case 'jackpot':
            buttonColor = '#f44336';
            buttonText = 'Partager mon jackpot';
            break;
        case 'bingo':
        default:
            buttonColor = '#4CAF50';
            buttonText = 'Partager mon bingo';
    }
    
    // Créer le bouton
    const button = document.createElement('button');
    button.className = 'floating-share-button';
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        ${buttonText}
    `;
    
    // Styles pour le bouton
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.backgroundColor = buttonColor;
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.padding = '12px 16px';
    button.style.borderRadius = '50px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.gap = '8px';
    button.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
    button.style.cursor = 'pointer';
    button.style.zIndex = '999';
    button.style.animation = 'pulse 2s infinite';
    
    // Ajouter des styles d'animation
    const styles = document.createElement('style');
    styles.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .floating-share-button:hover {
            transform: scale(1.05);
            animation: none;
        }
    `;
    document.head.appendChild(styles);
    
    // Gérer le clic sur le bouton
    button.addEventListener('click', () => {
        // Détecter la langue (simple pour l'exemple)
        const language = document.documentElement.lang || 'fr';
        
        // Montrer la modal de partage
        showShareModal(winType, amount, language);
    });
    
    // Ajouter le bouton au document
    document.body.appendChild(button);
    
    // Supprimer le bouton après un certain temps (optionnel)
    // setTimeout(() => button.remove(), 60000); // 1 minute
}

// Exposer la fonction pour utilisation externe
window.addShareButton = addShareButton;

/**
 * Objet global pour le tracking des partages et l'interaction avec d'autres modules
 */
const socialShare = {
    // Stocke les stats de partage
    shareStats: {
        total: 0,
        byPlatform: {
            facebook: 0,
            twitter: 0,
            whatsapp: 0,
            telegram: 0,
            email: 0
        },
        byType: {
            quine: 0,
            bingo: 0,
            jackpot: 0,
            achievement: 0
        }
    },
    
    /**
     * Initialise le module de partage
     */
    init() {
        // Charger les stats de partage depuis localStorage si disponibles
        const savedStats = localStorage.getItem('ms-bingo-share-stats');
        if (savedStats) {
            try {
                this.shareStats = JSON.parse(savedStats);
            } catch (error) {
                console.error('Erreur lors du chargement des stats de partage:', error);
            }
        }
    },
    
    /**
     * Enregistre un partage
     * @param {Object} shareData - Données du partage
     * @param {string} shareData.platform - Plateforme (facebook, twitter, etc.)
     * @param {string} shareData.type - Type de contenu partagé (quine, bingo, jackpot, achievement)
     * @param {string} [shareData.achievementId] - ID de l'achievement si type === 'achievement'
     */
    logShare(shareData) {
        if (!shareData || !shareData.platform || !shareData.type) return;
        
        // Incrémenter les compteurs
        this.shareStats.total++;
        
        // Par plateforme
        if (this.shareStats.byPlatform[shareData.platform] !== undefined) {
            this.shareStats.byPlatform[shareData.platform]++;
        }
        
        // Par type
        if (this.shareStats.byType[shareData.type] !== undefined) {
            this.shareStats.byType[shareData.type]++;
        }
        
        // Si c'est un achievement et que achievementShowcase existe, mettre à jour le badge
        if (shareData.type === 'achievement' && window.achievementShowcase) {
            window.achievementShowcase.updateSharerBadge();
        }
        
        // Sauvegarder dans localStorage
        this.saveStats();
        
        // Événement personnalisé de partage
        document.dispatchEvent(new CustomEvent('social:shared', { detail: shareData }));
    },
    
    /**
     * Sauvegarde les stats dans localStorage
     */
    saveStats() {
        try {
            localStorage.setItem('ms-bingo-share-stats', JSON.stringify(this.shareStats));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des stats de partage:', error);
        }
    },
    
    /**
     * Récupère les stats de partage
     * @returns {Object} Statistiques de partage
     */
    getStats() {
        return this.shareStats;
    }
};

// Initialiser l'objet socialShare
socialShare.init();

// Exposer l'objet socialShare pour utilisation externe
window.socialShare = socialShare;

/**
 * Fonction pour capturer une image du carton de bingo gagnant
 * Sera implémentée ultérieurement avec une bibliothèque comme html2canvas
 * @returns {Promise<string>} URL de données de l'image capturée
 */
function captureWinningCard() {
    // Pour l'instant, on retourne une promesse résolue avec null
    // car nous n'avons pas encore implémenté la capture d'écran
    return Promise.resolve(null);
    
    // Exemple d'implémentation future avec html2canvas:
    // const bingoCard = document.querySelector('.bingo-card');
    // if (!bingoCard) return Promise.resolve(null);
    // 
    // return html2canvas(bingoCard).then(canvas => {
    //     return canvas.toDataURL('image/png');
    // }).catch(err => {
    //     console.error('Erreur lors de la capture du carton:', err);
    //     return null;
    // });
}

// Écouter les événements de victoire
document.addEventListener('DOMContentLoaded', () => {
    // Calculer les montants des victoires en fonction du jackpot actuel
    // Ces valeurs peuvent être remplacées par des données réelles du jeu
    const jackpotAmount = parseInt(localStorage.getItem('currentJackpot')) || 100000;
    const bingoAmount = Math.round(jackpotAmount * 0.1); // 10% du jackpot pour un bingo
    const quineAmount = Math.round(jackpotAmount * 0.03); // 3% du jackpot pour une quine
    
    document.addEventListener('bingo:quine', (event) => {
        setTimeout(() => {
            addShareButton('quine', quineAmount);
        }, 3000);
    });
    
    document.addEventListener('bingo:bingo', (event) => {
        setTimeout(() => {
            addShareButton('bingo', bingoAmount);
        }, 3000);
    });
    
    document.addEventListener('bingo:jackpot', (event) => {
        setTimeout(() => {
            addShareButton('jackpot', jackpotAmount);
        }, 3000);
    });
    
    // Suivre les gains totaux pour les afficher dans les messages de partage
    // Encore une fois, cela peut être remplacé par des données réelles du backend
    let totalWinnings = parseInt(localStorage.getItem('totalWinnings')) || 0;
    
    function updateTotalWinnings(amount) {
        totalWinnings += amount;
        localStorage.setItem('totalWinnings', totalWinnings);
    }
    
    // Mettre à jour les gains totaux lors des victoires
    document.addEventListener('quine-achieved', (event) => updateTotalWinnings(quineAmount));
    document.addEventListener('bingo-achieved', (event) => updateTotalWinnings(bingoAmount));
});