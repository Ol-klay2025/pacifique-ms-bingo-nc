/**
 * MS BINGO Pacifique - Module d'intégration des réseaux sociaux en un clic
 * 
 * Ce module permet aux joueurs de se connecter à leurs comptes de réseaux sociaux
 * directement depuis l'application pour un partage plus fluide et une expérience intégrée.
 */

// Configuration des API de réseaux sociaux
const socialConfig = {
    facebook: {
        name: 'Facebook',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2" stroke="none"><path d="M24 12.073C24 5.446 18.627 0 12 0S0 5.446 0 12.073C0 18.063 4.388 23.027 10.125 23.94V15.563H7.078v-3.49h3.047v-2.65c0-3.025 1.79-4.688 4.548-4.688 1.318 0 2.695.235 2.695.235v2.97H15.83c-1.491 0-1.956.93-1.956 1.886v2.247h3.328l-.532 3.49h-2.796v8.377C19.612 23.027 24 18.063 24 12.073z"/></svg>',
        color: '#1877F2',
        apiKey: 'facebook_app_id_placeholder',
        redirectUri: `${window.location.origin}/auth/facebook/callback`,
        scope: 'public_profile,email'
    },
    twitter: {
        name: 'Twitter',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2" stroke="none"><path d="M22 5.8a8.5 8.5 0 0 1-2.4.7 4.2 4.2 0 0 0 1.8-2.3c-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7.1 3.7A11.7 11.7 0 0 1 3 4.9a4.1 4.1 0 0 0 1.3 5.5A4 4 0 0 1 2.5 10v.1a4.1 4.1 0 0 0 3.3 4 4.2 4.2 0 0 1-1.9.1 4.1 4.1 0 0 0 3.9 2.9 8.3 8.3 0 0 1-5.1 1.7c-.3 0-.7 0-1-.1a11.7 11.7 0 0 0 6.3 1.9c7.6 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.2z"/></svg>',
        color: '#1DA1F2',
        apiKey: 'twitter_app_id_placeholder',
        redirectUri: `${window.location.origin}/auth/twitter/callback`,
        scope: 'tweet.read,users.read,offline.access'
    },
    google: {
        name: 'Google',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="none"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>',
        color: '#4285F4',
        apiKey: 'google_app_id_placeholder',
        redirectUri: `${window.location.origin}/auth/google/callback`,
        scope: 'profile email'
    }
};

/**
 * Classe pour la gestion de l'intégration des réseaux sociaux
 */
class SocialIntegration {
    constructor() {
        this.userData = {};
        this.connectedServices = {};
        this.initFromLocalStorage();
    }

    /**
     * Initialise les données à partir du localStorage
     */
    initFromLocalStorage() {
        try {
            // Récupérer les services connectés
            const savedConnectedServices = localStorage.getItem('msBingo_connectedSocialServices');
            if (savedConnectedServices) {
                this.connectedServices = JSON.parse(savedConnectedServices);
            }
            
            // Récupérer les données utilisateur
            const savedUserData = localStorage.getItem('msBingo_socialUserData');
            if (savedUserData) {
                this.userData = JSON.parse(savedUserData);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données sociales:', error);
            // Réinitialiser en cas d'erreur
            this.userData = {};
            this.connectedServices = {};
        }
    }

    /**
     * Enregistre les données dans le localStorage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('msBingo_connectedSocialServices', JSON.stringify(this.connectedServices));
            localStorage.setItem('msBingo_socialUserData', JSON.stringify(this.userData));
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement des données sociales:', error);
        }
    }

    /**
     * Connecte l'utilisateur à un réseau social
     * @param {string} service - Nom du réseau social (facebook, twitter, google)
     * @returns {Promise<boolean>} - Vrai si la connexion a réussi
     */
    async connect(service) {
        if (!socialConfig[service]) {
            throw new Error(`Service ${service} non pris en charge`);
        }

        try {
            const config = socialConfig[service];
            
            // Générer un état aléatoire pour la sécurité
            const state = this.generateRandomState();
            localStorage.setItem('msBingo_oauthState', state);
            
            // Construire l'URL de redirection
            let authUrl;
            
            switch (service) {
                case 'facebook':
                    authUrl = `https://www.facebook.com/v14.0/dialog/oauth?client_id=${config.apiKey}&redirect_uri=${encodeURIComponent(config.redirectUri)}&state=${state}&scope=${encodeURIComponent(config.scope)}`;
                    break;
                    
                case 'twitter':
                    authUrl = `https://twitter.com/i/oauth2/authorize?client_id=${config.apiKey}&redirect_uri=${encodeURIComponent(config.redirectUri)}&state=${state}&scope=${encodeURIComponent(config.scope)}&response_type=code`;
                    break;
                    
                case 'google':
                    authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.apiKey}&redirect_uri=${encodeURIComponent(config.redirectUri)}&state=${state}&scope=${encodeURIComponent(config.scope)}&response_type=code`;
                    break;
                    
                default:
                    throw new Error(`Service ${service} non configuré`);
            }
            
            // En l'absence des clés API réelles, simulons une connexion réussie
            // pour la démonstration du prototype
            this.connectedServices[service] = {
                connected: true,
                timestamp: Date.now(),
                tokenExpires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 jours
            };
            
            // Données utilisateur fictives pour la démonstration
            if (!this.userData[service]) {
                this.userData[service] = {
                    id: this.generateRandomId(),
                    name: 'Utilisateur MS Bingo',
                    profileUrl: '#',
                    lastSync: Date.now()
                };
            }
            
            this.saveToLocalStorage();
            
            // Normalement, on ouvrirait l'URL d'authentification mais pour
            // notre prototype, on simule une connexion réussie
            // window.open(authUrl, 'social-auth-window', 'width=600,height=600');
            
            return true;
        } catch (error) {
            console.error(`Erreur lors de la connexion à ${service}:`, error);
            return false;
        }
    }

    /**
     * Déconnecte un service social
     * @param {string} service - Nom du réseau social
     */
    disconnect(service) {
        if (this.connectedServices[service]) {
            delete this.connectedServices[service];
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    /**
     * Vérifie si un service est connecté
     * @param {string} service - Nom du réseau social
     * @returns {boolean} - Vrai si connecté
     */
    isConnected(service) {
        if (!this.connectedServices[service]) {
            return false;
        }
        
        // Vérifier si le token n'a pas expiré
        if (this.connectedServices[service].tokenExpires < Date.now()) {
            this.disconnect(service);
            return false;
        }
        
        return this.connectedServices[service].connected === true;
    }

    /**
     * Partage un message sur un réseau social connecté
     * @param {string} service - Nom du réseau social
     * @param {Object} data - Données à partager (message, url, image, etc.)
     * @returns {Promise<boolean>} - Vrai si le partage a réussi
     */
    async share(service, data) {
        if (!this.isConnected(service)) {
            throw new Error(`Service ${service} non connecté`);
        }

        try {
            // Dans un cas réel, on ferait des appels API ici
            // Pour notre prototype, on simule un partage réussi
            console.log(`Message partagé sur ${service}:`, data);
            
            // Simuler un délai pour l'API
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Déclencher un événement pour informer que le partage a réussi
            const shareEvent = new CustomEvent('social:shared', {
                detail: {
                    service,
                    success: true,
                    timestamp: Date.now(),
                    data
                }
            });
            document.dispatchEvent(shareEvent);
            
            return true;
        } catch (error) {
            console.error(`Erreur lors du partage sur ${service}:`, error);
            
            // Déclencher un événement pour informer que le partage a échoué
            const shareEvent = new CustomEvent('social:shared', {
                detail: {
                    service,
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                }
            });
            document.dispatchEvent(shareEvent);
            
            return false;
        }
    }

    /**
     * Récupère les informations utilisateur pour un service
     * @param {string} service - Nom du réseau social
     * @returns {Object|null} - Données utilisateur ou null si non connecté
     */
    getUserData(service) {
        if (!this.isConnected(service)) {
            return null;
        }
        
        return this.userData[service] || null;
    }

    /**
     * Génère un état aléatoire pour la sécurité OAuth
     * @returns {string} - Chaîne aléatoire
     */
    generateRandomState() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
    
    /**
     * Génère un ID aléatoire pour simuler les ID utilisateur
     * @returns {string} - ID utilisateur simulé
     */
    generateRandomId() {
        return `user_${Math.random().toString(36).substring(2, 10)}`;
    }
    
    /**
     * Ouvre la fenêtre de configuration des connexions sociales
     * @returns {HTMLElement} - L'élément DOM de la fenêtre modale
     */
    showSettingsModal() {
        // Créer la modal
        const modalContainer = document.createElement('div');
        modalContainer.className = 'social-settings-modal-container';
        
        const connectedServices = Object.keys(this.connectedServices).filter(
            service => this.isConnected(service)
        );
        
        modalContainer.innerHTML = `
            <div class="social-settings-modal">
                <div class="social-settings-header">
                    <h3>Intégration des réseaux sociaux</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="social-settings-content">
                    <p>Connectez-vous à vos réseaux sociaux pour partager vos victoires plus facilement.</p>
                    
                    <div class="social-services">
                        ${Object.keys(socialConfig).map(service => {
                            const config = socialConfig[service];
                            const isConnected = this.isConnected(service);
                            const userData = this.getUserData(service);
                            
                            return `
                                <div class="social-service-card ${isConnected ? 'connected' : ''}">
                                    <div class="service-header" style="background-color: ${config.color}">
                                        ${config.icon}
                                        <span>${config.name}</span>
                                    </div>
                                    <div class="service-content">
                                        ${isConnected && userData ? `
                                            <div class="user-info">
                                                <div class="user-name">${userData.name}</div>
                                                <div class="connection-status">Connecté</div>
                                            </div>
                                        ` : `
                                            <div class="connection-message">
                                                Non connecté
                                            </div>
                                        `}
                                    </div>
                                    <div class="service-actions">
                                        <button class="service-btn ${isConnected ? 'disconnect-btn' : 'connect-btn'}" 
                                                data-service="${service}">
                                            ${isConnected ? 'Déconnecter' : 'Connecter'}
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="settings-info">
                        <p><strong>Note:</strong> La connexion à vos réseaux sociaux permet un partage en un clic sans avoir à ouvrir de nouvelles fenêtres.</p>
                    </div>
                </div>
                <div class="social-settings-footer">
                    <button class="dismiss-btn">Fermer</button>
                </div>
            </div>
        `;
        
        // Ajouter des styles CSS pour la modal
        const styles = document.createElement('style');
        styles.textContent = `
            .social-settings-modal-container {
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
            
            .social-settings-modal {
                background-color: #2a2a2a;
                border-radius: 10px;
                width: 90%;
                max-width: 600px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
                overflow: hidden;
                animation: slideIn 0.3s ease-out;
            }
            
            .social-settings-header {
                background-color: #0099cc;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .social-settings-header h3 {
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
            
            .social-settings-content {
                padding: 20px;
            }
            
            .social-services {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }
            
            .social-service-card {
                background-color: #333;
                border-radius: 8px;
                overflow: hidden;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .social-service-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
            }
            
            .service-header {
                padding: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
                color: white;
            }
            
            .service-header svg {
                width: 24px;
                height: 24px;
            }
            
            .service-content {
                padding: 15px;
                min-height: 50px;
            }
            
            .user-info {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .user-name {
                font-weight: bold;
            }
            
            .connection-status {
                font-size: 12px;
                color: #4CAF50;
            }
            
            .connection-message {
                color: #999;
                font-style: italic;
            }
            
            .service-actions {
                padding: 0 15px 15px;
            }
            
            .service-btn {
                width: 100%;
                padding: 8px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.3s;
            }
            
            .connect-btn {
                background-color: #0099cc;
                color: white;
            }
            
            .connect-btn:hover {
                background-color: #00b3ee;
            }
            
            .disconnect-btn {
                background-color: #f44336;
                color: white;
            }
            
            .disconnect-btn:hover {
                background-color: #ff5252;
            }
            
            .settings-info {
                background-color: rgba(0, 153, 204, 0.1);
                border-left: 3px solid #0099cc;
                padding: 10px 15px;
                margin-top: 15px;
            }
            
            .social-settings-footer {
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
            
            /* Style des cartes connectées */
            .social-service-card.connected {
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
        `;
        
        // Ajouter la modal et les styles au document
        document.head.appendChild(styles);
        document.body.appendChild(modalContainer);
        
        // Gérer les clics sur les boutons connecter/déconnecter
        const serviceButtons = modalContainer.querySelectorAll('.service-btn');
        serviceButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const service = button.getAttribute('data-service');
                
                if (button.classList.contains('connect-btn')) {
                    // Connecter
                    const success = await this.connect(service);
                    if (success) {
                        // Rafraîchir la modale
                        this.showSettingsModal();
                        modalContainer.remove();
                    }
                } else {
                    // Déconnecter
                    const confirmed = confirm(`Êtes-vous sûr de vouloir vous déconnecter de ${socialConfig[service].name} ?`);
                    if (confirmed) {
                        this.disconnect(service);
                        // Rafraîchir la modale
                        this.showSettingsModal();
                        modalContainer.remove();
                    }
                }
            });
        });
        
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
        
        return modalContainer;
    }
    
    /**
     * Ouvre la fenêtre de partage optimisée pour les services connectés
     * @param {string} winType - Type de victoire (quine, bingo, jackpot)
     * @param {number} amount - Montant gagné (optionnel)
     */
    openOneClickShareModal(winType, amount = null) {
        // Créer la modal
        const modalContainer = document.createElement('div');
        modalContainer.className = 'oneclick-share-modal-container';
        
        // Messages par défaut
        const messages = {
            quine: {
                title: 'J\'ai réalisé une quine sur MS BINGO Pacifique !',
                message: `Je viens de réaliser une quine sur MS BINGO Pacifique et de gagner ${amount ? amount + ' F' : 'un prix'} ! Rejoignez-moi pour jouer.`
            },
            bingo: {
                title: 'J\'ai gagné au BINGO Pacifique !',
                message: `Je viens de gagner au BINGO Pacifique et de remporter ${amount ? amount + ' F' : 'un gros prix'} ! Venez jouer avec moi.`
            },
            jackpot: {
                title: 'JACKPOT sur MS BINGO Pacifique !',
                message: `INCROYABLE ! Je viens de gagner le JACKPOT sur MS BINGO Pacifique ! ${amount ? amount + ' F' : 'Un gain énorme'} ! Venez tenter votre chance.`
            }
        };
        
        const messageConfig = messages[winType] || messages.bingo;
        
        // Trouver les services connectés
        const connectedServices = Object.keys(socialConfig).filter(
            service => this.isConnected(service)
        );
        
        modalContainer.innerHTML = `
            <div class="oneclick-share-modal">
                <div class="oneclick-share-header">
                    <h3>Partager votre victoire en un clic</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="oneclick-share-content">
                    <div class="share-message-preview">
                        <h4>Votre message</h4>
                        <div class="message-editor">
                            <textarea id="share-message-text" rows="4">${messageConfig.message}</textarea>
                        </div>
                    </div>
                    
                    <div class="share-services">
                        <h4>${connectedServices.length > 0 ? 'Partager sur' : 'Connectez-vous à vos réseaux sociaux'}</h4>
                        
                        ${connectedServices.length > 0 ? `
                            <div class="connected-services">
                                ${connectedServices.map(service => {
                                    const config = socialConfig[service];
                                    return `
                                        <button class="oneclick-share-btn" data-service="${service}" style="background-color: ${config.color}">
                                            ${config.icon}
                                            <span>Partager sur ${config.name}</span>
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                        ` : `
                            <div class="no-connected-services">
                                <p>Vous n'êtes pas encore connecté à vos réseaux sociaux.</p>
                                <button id="connect-services-btn" class="connect-services-btn">
                                    Configurer vos réseaux sociaux
                                </button>
                            </div>
                        `}
                    </div>
                    
                    <div class="share-result" style="display: none;">
                        <div class="success-message" style="display: none;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            <span>Message partagé avec succès !</span>
                        </div>
                        <div class="error-message" style="display: none;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            <span>Erreur lors du partage. Veuillez réessayer.</span>
                        </div>
                    </div>
                </div>
                <div class="oneclick-share-footer">
                    ${connectedServices.length > 0 ? `
                        <button class="settings-btn">Gérer les connexions</button>
                    ` : ''}
                    <button class="dismiss-btn">Fermer</button>
                </div>
            </div>
        `;
        
        // Ajouter des styles CSS pour la modal
        const styles = document.createElement('style');
        styles.textContent = `
            .oneclick-share-modal-container {
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
            
            .oneclick-share-modal {
                background-color: #2a2a2a;
                border-radius: 10px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
                overflow: hidden;
                animation: slideIn 0.3s ease-out;
            }
            
            .oneclick-share-header {
                background-color: #0099cc;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .oneclick-share-header h3 {
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
            
            .oneclick-share-content {
                padding: 20px;
            }
            
            .share-message-preview {
                margin-bottom: 20px;
            }
            
            .share-message-preview h4 {
                margin-top: 0;
                margin-bottom: 10px;
            }
            
            .message-editor textarea {
                width: 100%;
                padding: 10px;
                border-radius: 5px;
                background-color: #333;
                color: white;
                border: 1px solid #444;
                resize: vertical;
            }
            
            .share-services h4 {
                margin-bottom: 10px;
            }
            
            .connected-services {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .oneclick-share-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 15px;
                border-radius: 5px;
                border: none;
                color: white;
                cursor: pointer;
                transition: opacity 0.3s, transform 0.2s;
            }
            
            .oneclick-share-btn:hover {
                opacity: 0.9;
                transform: translateY(-2px);
            }
            
            .oneclick-share-btn:active {
                transform: translateY(0);
            }
            
            .oneclick-share-btn svg {
                width: 20px;
                height: 20px;
            }
            
            .no-connected-services {
                background-color: rgba(0, 0, 0, 0.2);
                padding: 15px;
                border-radius: 5px;
                text-align: center;
            }
            
            .connect-services-btn {
                background-color: #0099cc;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            }
            
            .connect-services-btn:hover {
                background-color: #00b3ee;
            }
            
            .share-result {
                margin-top: 15px;
                padding: 10px;
                border-radius: 5px;
            }
            
            .success-message, .error-message {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                border-radius: 5px;
            }
            
            .success-message {
                background-color: rgba(76, 175, 80, 0.1);
                border: 1px solid rgba(76, 175, 80, 0.3);
            }
            
            .error-message {
                background-color: rgba(244, 67, 54, 0.1);
                border: 1px solid rgba(244, 67, 54, 0.3);
            }
            
            .oneclick-share-footer {
                padding: 15px;
                text-align: right;
                border-top: 1px solid #444;
                display: flex;
                justify-content: space-between;
            }
            
            .settings-btn {
                background-color: #555;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .settings-btn:hover {
                background-color: #666;
            }
            
            .dismiss-btn {
                background-color: #555;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 4px;
                cursor: pointer;
                margin-left: auto;
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
        `;
        
        // Ajouter la modal et les styles au document
        document.head.appendChild(styles);
        document.body.appendChild(modalContainer);
        
        // Gérer le clic sur les boutons de partage en un clic
        const shareButtons = modalContainer.querySelectorAll('.oneclick-share-btn');
        shareButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const service = button.getAttribute('data-service');
                const messageText = document.getElementById('share-message-text').value;
                
                // Préparer les données à partager
                const shareData = {
                    message: messageText,
                    title: messageConfig.title,
                    url: window.location.href,
                    winType: winType,
                    amount: amount
                };
                
                try {
                    // Désactiver tous les boutons pendant le partage
                    shareButtons.forEach(btn => btn.disabled = true);
                    
                    // Effectuer le partage
                    const success = await this.share(service, shareData);
                    
                    // Afficher le résultat
                    const resultContainer = modalContainer.querySelector('.share-result');
                    const successMessage = modalContainer.querySelector('.success-message');
                    const errorMessage = modalContainer.querySelector('.error-message');
                    
                    resultContainer.style.display = 'block';
                    
                    if (success) {
                        successMessage.style.display = 'flex';
                        errorMessage.style.display = 'none';
                    } else {
                        successMessage.style.display = 'none';
                        errorMessage.style.display = 'flex';
                    }
                    
                    // Réactiver les boutons après le partage
                    shareButtons.forEach(btn => btn.disabled = false);
                } catch (error) {
                    console.error('Erreur lors du partage:', error);
                    
                    // Afficher l'erreur
                    const resultContainer = modalContainer.querySelector('.share-result');
                    const successMessage = modalContainer.querySelector('.success-message');
                    const errorMessage = modalContainer.querySelector('.error-message');
                    
                    resultContainer.style.display = 'block';
                    successMessage.style.display = 'none';
                    errorMessage.style.display = 'flex';
                    errorMessage.querySelector('span').textContent = `Erreur: ${error.message}`;
                    
                    // Réactiver les boutons après l'erreur
                    shareButtons.forEach(btn => btn.disabled = false);
                }
            });
        });
        
        // Gérer le clic sur le bouton de configuration des services
        const connectButton = modalContainer.querySelector('#connect-services-btn');
        if (connectButton) {
            connectButton.addEventListener('click', () => {
                modalContainer.remove();
                this.showSettingsModal();
            });
        }
        
        // Gérer le clic sur le bouton de gestion des connexions
        const settingsButton = modalContainer.querySelector('.settings-btn');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                modalContainer.remove();
                this.showSettingsModal();
            });
        }
        
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
        
        return modalContainer;
    }
}

// Créer et exposer l'instance globale
window.socialIntegration = new SocialIntegration();

// Fonctions d'aide exposées globalement
window.showSocialSettings = function() {
    return window.socialIntegration.showSettingsModal();
};

window.showOneClickShare = function(winType, amount = null) {
    return window.socialIntegration.openOneClickShareModal(winType, amount);
};

// Ajouter un écouteur d'événements pour le bouton d'intégration sociale
document.addEventListener('DOMContentLoaded', () => {
    // Écouter les événements de victoire pour proposer le partage en un clic
    document.addEventListener('bingo:quine', (event) => {
        // Attendre que l'animation de célébration soit terminée
        setTimeout(() => {
            const jackpotAmount = parseInt(localStorage.getItem('currentJackpot')) || 100000;
            const quineAmount = Math.round(jackpotAmount * 0.03); // 3% du jackpot pour une quine
            window.showOneClickShare('quine', quineAmount);
        }, 4000);
    });
    
    document.addEventListener('bingo:bingo', (event) => {
        // Attendre que l'animation de célébration soit terminée
        setTimeout(() => {
            const jackpotAmount = parseInt(localStorage.getItem('currentJackpot')) || 100000;
            const bingoAmount = Math.round(jackpotAmount * 0.1); // 10% du jackpot pour un bingo
            window.showOneClickShare('bingo', bingoAmount);
        }, 4000);
    });
    
    document.addEventListener('bingo:jackpot', (event) => {
        // Attendre que l'animation de célébration soit terminée
        setTimeout(() => {
            const jackpotAmount = parseInt(localStorage.getItem('currentJackpot')) || 100000;
            window.showOneClickShare('jackpot', jackpotAmount);
        }, 4000);
    });
});