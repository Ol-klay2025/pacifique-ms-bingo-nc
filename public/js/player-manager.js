/**
 * MS BINGO Pacifique - Gestionnaire de joueurs
 * 
 * Ce module gère l'affichage des joueurs connectés et le système 
 * de tirage au sort pour les gagnants (max 3 par partie)
 */

class PlayerManager {
    constructor() {
        // Initialiser les listes de joueurs
        this.onlinePlayers = [];
        this.winningQuines = [];
        this.winningBingos = [];
        
        // Limite maximale de gagnants par catégorie
        this.maxWinnersPerCategory = 3;
        
        // Références aux éléments DOM
        this.userListEl = document.getElementById('user-list');
        this.winnerListEl = document.getElementById('winners-list');
        this.onlineCountEl = document.getElementById('online-count');
        
        // Initialiser les écouteurs d'événements
        this.setupEventListeners();
        
        // Simuler des utilisateurs en ligne (à remplacer par des données réelles)
        this.simulateOnlineUsers();
        
        // Mettre à jour l'interface
        this.updateUI();
    }
    
    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Écouter les événements de quine et bingo pour mettre à jour les gagnants
        document.addEventListener('quine-achieved', (e) => {
            this.handleWin('quine', e.detail.card);
        });
        
        document.addEventListener('bingo-achieved', (e) => {
            this.handleWin('bingo', e.detail.card);
        });
        
        // Écouter l'événement de fin de partie pour réinitialiser les cartons
        document.addEventListener('gameEnded', () => {
            this.resetCards();
        });
        
        // Écouteur pour les changements de photo de profil
        document.addEventListener('profile-photo-updated', (e) => {
            this.updateUserAvatar(e.detail.userId, e.detail.photoUrl);
        });
        
        // Événement personnalisé pour simuler de nouveaux joueurs qui se connectent
        setInterval(() => {
            if (Math.random() > 0.7 && this.onlinePlayers.length < 15) {
                this.simulateNewUser();
            }
        }, 10000); // Toutes les 10 secondes
    }
    
    /**
     * Gère un nouveau gagnant (quine ou bingo)
     * @param {string} type - Type de gain ('quine' ou 'bingo')
     * @param {Object} cardInfo - Informations sur la carte gagnante
     */
    handleWin(type, cardInfo) {
        const winnersList = type === 'quine' ? this.winningQuines : this.winningBingos;
        
        // Gérer le cas où il y a déjà un gagnant pour la quine
        if (type === 'quine' && this.winningQuines.length > 0) {
            // Une quine a déjà été validée, ne pas accepter d'autres quines
            console.log('Une quine a déjà été validée dans cette partie');
            
            // Informer l'utilisateur si possible
            if (window.voiceAnnouncer && window.voiceAnnouncer.enabled) {
                const message = window.voiceAnnouncer.language === 'fr-FR'
                    ? 'Une quine a déjà été validée pour cette partie'
                    : 'A line has already been validated for this game';
                window.voiceAnnouncer.speak(message);
            }
            
            // Désactiver tous les boutons de quine dans l'interface
            const quineBtns = document.querySelectorAll('.quine-btn');
            quineBtns.forEach(btn => {
                btn.disabled = true;
                btn.textContent = 'Quine déjà validée';
                btn.style.backgroundColor = '#888';
            });
            
            return;
        }
        
        // Vérifier si le joueur a déjà gagné dans cette catégorie
        const existingWinnerIndex = winnersList.findIndex(winner => winner.userId === cardInfo.playerName);
        
        if (existingWinnerIndex >= 0) {
            // Le joueur a déjà gagné, ne rien faire
            return;
        }
        
        // Ajouter le gagnant à la liste appropriée
        const newWinner = {
            userId: cardInfo.playerName,
            userName: cardInfo.playerName,
            winType: type,
            timestamp: new Date().getTime(),
            cardNumbers: cardInfo.numbers,
            winningNumbers: cardInfo.winningNumbers || []
        };
        
        // Si nous atteignons la limite de gagnants, effectuer un tirage au sort
        if (winnersList.length >= this.maxWinnersPerCategory) {
            this.performLottery(type);
        } else {
            winnersList.push(newWinner);
        }
        
        // Mettre à jour l'interface utilisateur
        this.updateWinnersList();
        
        // Si c'est une quine, définir la variable globale pour indiquer qu'une quine a été validée
        if (type === 'quine') {
            window.quineValidated = true;
            
            // Désactiver tous les boutons de quine dans l'interface
            const quineBtns = document.querySelectorAll('.quine-btn');
            quineBtns.forEach(btn => {
                btn.disabled = true;
                btn.textContent = 'Quine déjà validée';
                btn.style.backgroundColor = '#888';
            });
        }
        
        // Pour les bingos, on laisse la possibilité d'avoir plusieurs gagnants
        if (type === 'bingo') {
            // Annoncer vocalement le nombre de gagnants restants
            const remainingWinners = this.maxWinnersPerCategory - winnersList.length;
            if (remainingWinners > 0 && window.voiceAnnouncer && window.voiceAnnouncer.enabled) {
                setTimeout(() => {
                    const message = window.voiceAnnouncer.language === 'fr-FR'
                        ? `Il reste ${remainingWinners} bingos disponibles.`
                        : `There are ${remainingWinners} bingos remaining.`;
                    window.voiceAnnouncer.speak(message);
                }, 3000); // Attendre 3 secondes après l'annonce de victoire
            }
        }
    }
    
    /**
     * Effectue un tirage au sort lorsque le nombre maximum de gagnants est atteint
     * @param {string} type - Type de gain ('quine' ou 'bingo')
     */
    performLottery(type) {
        const winnersList = type === 'quine' ? this.winningQuines : this.winningBingos;
        
        // Ajouter le nouveau gagnant à la liste temporaire
        const allWinners = [...winnersList];
        
        // Mélanger la liste et sélectionner les gagnants aléatoirement
        this.shuffleArray(allWinners);
        
        // Garder seulement le nombre maximum de gagnants
        const selectedWinners = allWinners.slice(0, this.maxWinnersPerCategory);
        
        // Mettre à jour la liste des gagnants
        if (type === 'quine') {
            this.winningQuines = selectedWinners;
        } else {
            this.winningBingos = selectedWinners;
        }
        
        // Afficher une notification de tirage au sort
        const notification = document.createElement('div');
        notification.className = 'notification lottery-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>Tirage au sort effectué !</h3>
                <p>Le nombre maximum de gagnants (${this.maxWinnersPerCategory}) pour les ${type === 'quine' ? 'quines' : 'bingos'} a été atteint.</p>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Supprimer la notification après quelques secondes
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Annoncer le tirage au sort vocalement
        if (window.voiceAnnouncer && window.voiceAnnouncer.enabled) {
            const message = window.voiceAnnouncer.language === 'fr-FR'
                ? `Attention ! Le nombre maximum de ${type === 'quine' ? 'quines' : 'bingos'} a été atteint. Un tirage au sort a été effectué.`
                : `Attention! The maximum number of ${type === 'quine' ? 'lines' : 'bingos'} has been reached. A random draw has been performed.`;
            window.voiceAnnouncer.speak(message);
        }
    }
    
    /**
     * Mélange aléatoirement un tableau (algorithme de Fisher-Yates)
     * @param {Array} array - Le tableau à mélanger
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    /**
     * Met à jour l'avatar d'un utilisateur
     * @param {string} userId - ID de l'utilisateur
     * @param {string} photoUrl - URL de la nouvelle photo
     */
    updateUserAvatar(userId, photoUrl) {
        const userIndex = this.onlinePlayers.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            this.onlinePlayers[userIndex].photoUrl = photoUrl;
            this.updateUserList();
        }
    }
    
    /**
     * Simule des utilisateurs en ligne pour la démonstration
     */
    simulateOnlineUsers() {
        const demoNames = [
            'Sophie', 'Thomas', 'Leilani', 'Keoni', 'Marie', 'Jean',
            'Hina', 'Marama', 'Pierre', 'Anne', 'Vaitiare', 'Moana',
            'Maeva', 'Teva', 'Vaiana', 'Tama', 'Julie', 'Marc'
        ];
        
        // Ajouter l'utilisateur actuel
        this.onlinePlayers.push({
            id: 'current-user',
            name: 'Vous',
            status: 'En jeu',
            isCurrentUser: true,
            photoUrl: null // L'utilisateur peut choisir sa photo
        });
        
        // Générer quelques utilisateurs aléatoires
        const numUsers = 4 + Math.floor(Math.random() * 5); // Entre 4 et 8 utilisateurs
        
        for (let i = 0; i < numUsers; i++) {
            const randomName = dummyAvatars[Math.floor(Math.random() * dummyAvatars.length)];
            const randomStatus = Math.random() > 0.7 ? 'En jeu' : 'En ligne';
            
            this.onlinePlayers.push({
                id: 'user-' + (i + 1),
                name: demoNames[i % demoNames.length],
                status: randomStatus,
                isCurrentUser: false,
                photoUrl: randomName.avatar
            });
        }
        
        // Mettre à jour l'interface utilisateur
        this.updateUserList();
    }
    
    /**
     * Simule l'arrivée d'un nouvel utilisateur
     */
    simulateNewUser() {
        const demoNames = [
            'Sophie', 'Thomas', 'Leilani', 'Keoni', 'Marie', 'Jean',
            'Hina', 'Marama', 'Pierre', 'Anne', 'Vaitiare', 'Moana'
        ];
        
        const randomName = dummyAvatars[Math.floor(Math.random() * dummyAvatars.length)];
        const randomStatus = Math.random() > 0.7 ? 'En jeu' : 'En ligne';
        
        const newUser = {
            id: 'user-' + (this.onlinePlayers.length + 1),
            name: demoNames[Math.floor(Math.random() * demoNames.length)],
            status: randomStatus,
            isCurrentUser: false,
            photoUrl: randomName.avatar
        };
        
        this.onlinePlayers.push(newUser);
        
        // Mettre à jour l'interface utilisateur
        this.updateUserList();
        
        // Afficher une notification de connexion
        const notification = document.createElement('div');
        notification.className = 'notification connect-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>${newUser.name} vient de se connecter</h3>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Supprimer la notification après quelques secondes
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    /**
     * Met à jour la liste des utilisateurs en ligne dans l'interface
     */
    updateUserList() {
        if (!this.userListEl) return;
        
        this.userListEl.innerHTML = '';
        
        // Mettre à jour le compteur
        if (this.onlineCountEl) {
            this.onlineCountEl.textContent = this.onlinePlayers.length;
        }
        
        // Ajouter l'utilisateur actuel en premier
        const currentUser = this.onlinePlayers.find(user => user.isCurrentUser);
        if (currentUser) {
            this.addUserToList(currentUser, true);
        }
        
        // Ajouter les autres utilisateurs
        this.onlinePlayers
            .filter(user => !user.isCurrentUser)
            .forEach(user => this.addUserToList(user, false));
    }
    
    /**
     * Met à jour la liste des gagnants dans l'interface
     */
    updateWinnersList() {
        if (!this.winnerListEl) return;
        
        this.winnerListEl.innerHTML = '';
        
        // Ajouter les gagnants de quine
        this.winningQuines.forEach(winner => {
            this.addWinnerToList(winner, 'quine');
        });
        
        // Ajouter les gagnants de bingo
        this.winningBingos.forEach(winner => {
            this.addWinnerToList(winner, 'bingo');
        });
        
        // Si pas de gagnants, afficher un message
        if (this.winningQuines.length === 0 && this.winningBingos.length === 0) {
            this.winnerListEl.innerHTML = '<div class="no-winners">Aucun gagnant pour le moment</div>';
        }
    }
    
    /**
     * Ajoute un utilisateur à la liste des utilisateurs connectés
     * @param {Object} user - L'utilisateur à ajouter
     * @param {boolean} isCurrent - S'il s'agit de l'utilisateur actuel
     */
    addUserToList(user, isCurrent) {
        const userEl = document.createElement('div');
        userEl.className = 'user-bubble' + (isCurrent ? ' current-user' : '');
        
        // Déterminer le contenu de l'avatar
        let avatarContent = '';
        if (user.photoUrl) {
            avatarContent = `<img src="${user.photoUrl}" alt="${user.name}" />`;
        } else {
            avatarContent = `<span class="user-avatar-placeholder">${user.name.charAt(0)}</span>`;
        }
        
        userEl.innerHTML = `
            <div class="user-avatar">
                ${avatarContent}
            </div>
            <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-status">${user.status}</div>
            </div>
        `;
        
        // Ajouter la possibilité de changer sa photo pour l'utilisateur actuel
        if (isCurrent) {
            userEl.addEventListener('click', () => this.showProfilePhotoSelector());
        }
        
        this.userListEl.appendChild(userEl);
    }
    
    /**
     * Ajoute un gagnant à la liste des gagnants
     * @param {Object} winner - Les informations du gagnant
     * @param {string} type - Le type de gain (quine ou bingo)
     */
    addWinnerToList(winner, type) {
        const winnerEl = document.createElement('div');
        winnerEl.className = `winner-item ${type}`;
        
        // Déterminer le contenu de l'avatar
        let avatarContent = '';
        if (winner.photoUrl) {
            avatarContent = `<img src="${winner.photoUrl}" alt="${winner.userName}" />`;
        } else {
            avatarContent = `<span class="winner-avatar-placeholder">${winner.userName.charAt(0)}</span>`;
        }
        
        winnerEl.innerHTML = `
            <div class="winner-avatar">
                ${avatarContent}
            </div>
            <div class="winner-info">
                <div class="winner-name">${winner.userName}</div>
                <div class="win-type">${type === 'quine' ? 'Quine' : 'Bingo'}</div>
            </div>
        `;
        
        this.winnerListEl.appendChild(winnerEl);
    }
    
    /**
     * Affiche le sélecteur de photo de profil
     */
    showProfilePhotoSelector() {
        // Créer la modale pour sélectionner une photo de profil
        const modalEl = document.createElement('div');
        modalEl.className = 'photo-selector-modal';
        modalEl.innerHTML = `
            <div class="photo-selector-content">
                <div class="photo-selector-header">
                    <h3>Choisir une photo de profil</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="photo-options">
                    <p>Cliquez sur une image pour la sélectionner comme photo de profil:</p>
                    <div class="avatar-grid"></div>
                </div>
                <div class="photo-upload">
                    <label for="custom-photo">Ou téléchargez votre propre photo:</label>
                    <input type="file" id="custom-photo" accept="image/*">
                </div>
            </div>
        `;
        
        document.body.appendChild(modalEl);
        
        // Ajouter les avatars prédéfinis
        const avatarGrid = modalEl.querySelector('.avatar-grid');
        
        // Ajouter l'option "aucun avatar"
        const noAvatarEl = document.createElement('div');
        noAvatarEl.className = 'avatar-option';
        noAvatarEl.innerHTML = `
            <div class="avatar-preview no-avatar">
                <span>?</span>
            </div>
            <div class="avatar-name">Aucun</div>
        `;
        noAvatarEl.addEventListener('click', () => {
            this.updateUserAvatar('current-user', null);
            modalEl.remove();
        });
        avatarGrid.appendChild(noAvatarEl);
        
        // Ajouter les avatars prédéfinis
        dummyAvatars.forEach(avatar => {
            const avatarEl = document.createElement('div');
            avatarEl.className = 'avatar-option';
            avatarEl.innerHTML = `
                <div class="avatar-preview">
                    <img src="${avatar.avatar}" alt="${avatar.name}">
                </div>
                <div class="avatar-name">${avatar.name}</div>
            `;
            avatarEl.addEventListener('click', () => {
                this.updateUserAvatar('current-user', avatar.avatar);
                modalEl.remove();
                
                // Afficher une notification
                const notification = document.createElement('div');
                notification.className = 'notification photo-notification';
                notification.innerHTML = `
                    <div class="notification-content">
                        <h3>Photo de profil mise à jour</h3>
                    </div>
                `;
                document.body.appendChild(notification);
                
                // Supprimer la notification après quelques secondes
                setTimeout(() => {
                    notification.remove();
                }, 3000);
            });
            avatarGrid.appendChild(avatarEl);
        });
        
        // Gérer le téléchargement de photo personnalisée
        const fileInput = modalEl.querySelector('#custom-photo');
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.updateUserAvatar('current-user', e.target.result);
                    modalEl.remove();
                    
                    // Afficher une notification
                    const notification = document.createElement('div');
                    notification.className = 'notification photo-notification';
                    notification.innerHTML = `
                        <div class="notification-content">
                            <h3>Photo de profil mise à jour</h3>
                        </div>
                    `;
                    document.body.appendChild(notification);
                    
                    // Supprimer la notification après quelques secondes
                    setTimeout(() => {
                        notification.remove();
                    }, 3000);
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
        
        // Gérer la fermeture de la modale
        const closeBtn = modalEl.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            modalEl.remove();
        });
    }
    
    /**
     * Met à jour l'interface utilisateur
     */
    updateUI() {
        this.updateUserList();
        this.updateWinnersList();
    }
    
    /**
     * Réinitialise les cartons à la fin d'une partie
     * Cette méthode est appelée lorsque l'événement 'gameEnded' est déclenché
     */
    resetCards() {
        console.log("Réinitialisation des cartons à la fin de la partie");
        
        // Réinitialiser les listes de gagnants
        this.winningQuines = [];
        this.winningBingos = [];
        
        // Mettre à jour l'interface
        this.updateWinnersList();
        
        // Réinitialiser les cartons du joueur
        const bingoCards = document.querySelectorAll('.bingo-card');
        bingoCards.forEach(card => {
            // Supprimer les marques sur tous les cartons
            const markedCells = card.querySelectorAll('.card-cell.marked');
            markedCells.forEach(cell => {
                cell.classList.remove('marked');
            });
            
            // Déterminer le type de partie et appliquer les classes appropriées
            if (window.currentGameType === 'special') {
                card.classList.remove('normal', 'series');
                card.classList.add('special');
            } else if (window.currentGameType === 'series') {
                card.classList.remove('normal', 'special');
                card.classList.add('series');
            } else {
                // Par défaut: partie normale
                card.classList.remove('special', 'series');
                card.classList.add('normal');
            }
        });
        
        // Afficher une notification pour la nouvelle partie
        const notification = document.createElement('div');
        notification.className = 'notification game-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>Nouvelle partie lancée</h3>
                <p>Les cartons ont été réinitialisés</p>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Supprimer la notification après quelques secondes
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Avatars prédéfinis pour la démonstration
const dummyAvatars = [
    { name: 'Avatar 1', avatar: 'https://ui-avatars.com/api/?name=P&background=0D8ABC&color=fff' },
    { name: 'Avatar 2', avatar: 'https://ui-avatars.com/api/?name=M&background=43A047&color=fff' },
    { name: 'Avatar 3', avatar: 'https://ui-avatars.com/api/?name=S&background=E53935&color=fff' },
    { name: 'Avatar 4', avatar: 'https://ui-avatars.com/api/?name=T&background=FB8C00&color=fff' },
    { name: 'Avatar 5', avatar: 'https://ui-avatars.com/api/?name=L&background=8E24AA&color=fff' },
    { name: 'Avatar 6', avatar: 'https://ui-avatars.com/api/?name=K&background=039BE5&color=fff' }
];

// Initialiser le gestionnaire de joueurs lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.playerManager = new PlayerManager();
});