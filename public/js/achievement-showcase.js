/**
 * MS BINGO Pacifique - Vitrine des réalisations des joueurs
 * 
 * Ce module gère l'affichage et l'interaction avec les réalisations des joueurs
 * (achievements). Il permet d'afficher les trophées, badges et statistiques
 * de jeu de manière interactive.
 */

class AchievementShowcase {
    constructor() {
        // Initialiser les données d'achievements
        this.achievements = [];
        this.playerStats = {};
        this.badges = [];
        this.trophies = [];
        
        // Références aux éléments DOM
        this.showcaseContainer = document.getElementById('achievement-showcase');
        this.statsContainer = document.getElementById('player-stats');
        
        // Initialiser les écouteurs d'événements
        this.setupEventListeners();
        
        // Charger les données depuis le serveur
        this.loadAchievements();
    }
    
    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Montrer la vitrine quand le bouton est cliqué
        const showcaseBtn = document.getElementById('showcase-btn');
        if (showcaseBtn) {
            showcaseBtn.addEventListener('click', () => this.toggleShowcase());
        }
        
        // Écouteur pour les événements de jeu
        document.addEventListener('quine-achieved', () => this.checkAchievements('quine'));
        document.addEventListener('bingo-achieved', () => this.checkAchievements('bingo'));
        document.addEventListener('bingo:jackpot', () => this.checkAchievements('jackpot'));
        
        // Événement personnalisé pour les nouveaux achievements 
        document.addEventListener('achievement-unlocked', (e) => this.showAchievementNotification(e.detail));
    }
    
    /**
     * Charge les données d'achievements depuis le serveur
     */
    loadAchievements() {
        // Charger les achievements depuis le localStorage d'abord (pour une réponse rapide)
        const hasLocalData = this.loadAchievementsFromStorage();
        
        // Charger les statistiques du joueur depuis le serveur
        fetch('/api/player-stats')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors du chargement des statistiques');
                }
                return response.json();
            })
            .then(data => {
                this.playerStats = data;
                
                // Mettre à jour l'interface avec les nouvelles statistiques
                this.updateShowcase();
                this.updateProgressBars();
                
                // Ensuite charger la liste des achievements débloqués
                return fetch('/api/achievements');
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors du chargement des achievements');
                }
                return response.json();
            })
            .then(unlockedAchievements => {
                // Obtenir la liste complète des achievements possibles
                const allAchievements = this.getDefaultAchievements();
                
                // Marquer ceux qui sont débloqués
                allAchievements.forEach(achievement => {
                    const unlocked = unlockedAchievements.find(a => a.achievement_id === achievement.id);
                    if (unlocked) {
                        achievement.unlocked = true;
                        achievement.unlockedDate = new Date(unlocked.unlocked_at);
                    } else {
                        achievement.unlocked = false;
                    }
                });
                
                this.achievements = allAchievements;
                this.badges = this.getPlayerBadges(); // À remplacer par une API plus tard
                this.trophies = this.getPlayerTrophies(); // À remplacer par une API plus tard
                
                // Mettre à jour l'interface
                this.updateShowcase();
                
                // Vérifier les achievements à débloquer
                this.checkAllAchievements();
                
                // Sauvegarder les données dans le localStorage
                this.saveAchievements();
            })
            .catch(error => {
                console.error('Erreur lors du chargement des données:', error);
                
                // Si nous n'avons pas pu charger les données depuis le serveur mais que nous avons
                // des données locales, les utiliser
                if (!hasLocalData) {
                    // Si nous n'avons pas de données locales non plus, utiliser des valeurs par défaut
                    this.playerStats = {
                        gamesPlayed: 0,
                        quinesWon: 0,
                        bingosWon: 0, 
                        jackpotsWon: 0,
                        totalWinnings: 0,
                        favoriteNumbers: [7, 13, 24, 42, 77],
                        winRate: 0,
                        level: 1,
                        xp: 0,
                        nextLevelXp: 1000
                    };
                    
                    this.achievements = this.getDefaultAchievements();
                    this.badges = this.getPlayerBadges();
                    this.trophies = this.getPlayerTrophies();
                    
                    // Mettre à jour l'interface
                    this.updateShowcase();
                    this.updateProgressBars();
                }
            });
    }
    
    /**
     * Vérifie tous les achievements pour voir si de nouveaux ont été débloqués
     */
    checkAllAchievements() {
        if (!this.achievements || !this.playerStats) return;
        
        // Vérifier chaque achievement
        this.achievements.forEach(achievement => {
            // Si l'achievement n'est pas encore débloqué
            if (!achievement.unlocked) {
                // Vérifier les conditions
                let unlocked = false;
                
                switch (achievement.type) {
                    case 'games_played':
                        unlocked = this.playerStats.gamesPlayed >= achievement.requirement;
                        break;
                    case 'quines_won':
                        unlocked = this.playerStats.quinesWon >= achievement.requirement;
                        break;
                    case 'bingos_won':
                        unlocked = this.playerStats.bingosWon >= achievement.requirement;
                        break;
                    case 'jackpots_won':
                        unlocked = this.playerStats.jackpotsWon >= achievement.requirement;
                        break;
                    case 'total_winnings':
                        unlocked = this.playerStats.totalWinnings >= achievement.requirement;
                        break;
                    // Autres types...
                }
                
                // Si l'achievement est débloqué
                if (unlocked) {
                    achievement.unlocked = true;
                    achievement.unlockedDate = new Date();
                    
                    // Enregistrer l'achievement sur le serveur
                    fetch('/api/achievements/unlock', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            achievementId: achievement.id
                        })
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Erreur lors du déverrouillage de l\'achievement');
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Ne déclencher la notification que si c'est un nouvel achievement
                        if (data.isNew) {
                            // Déclencher l'événement achievement-unlocked
                            const event = new CustomEvent('achievement-unlocked', {
                                detail: achievement
                            });
                            document.dispatchEvent(event);
                        }
                        
                        console.log('Achievement déverrouillé avec succès:', data);
                    })
                    .catch(error => {
                        console.error('Erreur lors du déverrouillage de l\'achievement:', error);
                    });
                    
                    // Sauvegarder dans le localStorage
                    this.saveAchievements();
                    
                    // Mettre à jour l'interface
                    this.updateShowcase();
                }
            }
        });
    }
    
    /**
     * Vérifie les achievements en fonction d'un événement de jeu spécifique
     * @param {string} eventType - Type d'événement (quine, bingo, jackpot)
     */
    checkAchievements(eventType) {
        // Incrémenter le compteur de parties jouées si c'est un nouvel événement de jeu
        if (eventType === 'game_start') {
            this.playerStats.gamesPlayed = (this.playerStats.gamesPlayed || 0) + 1;
        }
        
        // Mettre à jour les statistiques du joueur
        switch (eventType) {
            case 'quine':
                this.playerStats.quinesWon = (this.playerStats.quinesWon || 0) + 1;
                this.playerStats.xp = (this.playerStats.xp || 0) + 50;
                break;
            case 'bingo':
                this.playerStats.bingosWon = (this.playerStats.bingosWon || 0) + 1;
                this.playerStats.xp = (this.playerStats.xp || 0) + 100;
                break;
            case 'jackpot':
                this.playerStats.jackpotsWon = (this.playerStats.jackpotsWon || 0) + 1;
                this.playerStats.xp = (this.playerStats.xp || 0) + 500;
                break;
        }
        
        // Vérifier le level up
        this.checkLevelUp();
        
        // Mettre à jour l'interface
        this.updateProgressBars();
        
        // Vérifier les achievements
        this.checkAllAchievements();
        
        // Envoyer les mises à jour des statistiques au serveur
        this.updateStatsOnServer();
    }
    
    /**
     * Met à jour les statistiques du joueur sur le serveur
     */
    updateStatsOnServer() {
        fetch('/api/player-stats/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gamesPlayed: this.playerStats.gamesPlayed,
                quinesWon: this.playerStats.quinesWon,
                bingosWon: this.playerStats.bingosWon,
                jackpotsWon: this.playerStats.jackpotsWon,
                totalWinnings: this.playerStats.totalWinnings,
                xp: this.playerStats.xp,
                level: this.playerStats.level
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour des statistiques');
            }
            return response.json();
        })
        .then(data => {
            console.log('Statistiques mises à jour avec succès:', data);
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour des statistiques:', error);
        });
    }
    
    /**
     * Vérifie si le joueur a obtenu suffisamment d'XP pour monter de niveau
     */
    checkLevelUp() {
        if (this.playerStats.xp >= this.playerStats.nextLevelXp) {
            // Monter de niveau
            this.playerStats.level++;
            const excessXp = this.playerStats.xp - this.playerStats.nextLevelXp;
            this.playerStats.xp = excessXp;
            this.playerStats.nextLevelXp = Math.round(this.playerStats.nextLevelXp * 1.5);
            
            // Afficher la notification de niveau supérieur
            this.showLevelUpNotification();
        }
    }
    
    /**
     * Affiche une notification de montée de niveau
     */
    showLevelUpNotification() {
        const notification = document.createElement('div');
        notification.className = 'notification level-up-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>Niveau supérieur !</h3>
                <p>Vous avez atteint le niveau ${this.playerStats.level}</p>
                <div class="level-up-icon">🏆</div>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('notification-visible');
        }, 100);
        
        // Supprimer la notification après quelques secondes
        setTimeout(() => {
            notification.classList.remove('notification-visible');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
        
        // Jouer un son si disponible
        if (window.voiceAnnouncer && window.voiceAnnouncer.enabled) {
            const message = window.voiceAnnouncer.language === 'fr-FR'
                ? `Félicitations! Vous avez atteint le niveau ${this.playerStats.level}!`
                : `Congratulations! You have reached level ${this.playerStats.level}!`;
            window.voiceAnnouncer.speak(message);
        }
    }
    
    /**
     * Affiche une notification d'achievement débloqué
     * @param {Object} achievement - L'achievement débloqué
     */
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'notification achievement-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>Achievement Débloqué!</h3>
                <p>${achievement.title}</p>
                <div class="achievement-icon">${achievement.icon}</div>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('notification-visible');
        }, 100);
        
        // Supprimer la notification après quelques secondes
        setTimeout(() => {
            notification.classList.remove('notification-visible');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
        
        // Jouer un son si disponible
        if (window.voiceAnnouncer && window.voiceAnnouncer.enabled) {
            const message = window.voiceAnnouncer.language === 'fr-FR'
                ? `Félicitations! Vous avez débloqué un nouvel achievement: ${achievement.title}!`
                : `Congratulations! You have unlocked a new achievement: ${achievement.title}!`;
            window.voiceAnnouncer.speak(message);
        }
        
        // Animation de confettis si disponible
        if (window.confetti) {
            window.confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }
    
    /**
     * Met à jour la vitrine des achievements dans l'interface
     */
    updateShowcase() {
        if (!this.showcaseContainer) return;
        
        // Vider le conteneur
        this.showcaseContainer.innerHTML = '';
        
        // Créer les sections
        const achievementsSection = document.createElement('div');
        achievementsSection.className = 'achievements-section';
        achievementsSection.innerHTML = `<h3>Achievements</h3>`;
        
        const badgesSection = document.createElement('div');
        badgesSection.className = 'badges-section';
        badgesSection.innerHTML = `<h3>Badges</h3>`;
        
        const trophiesSection = document.createElement('div');
        trophiesSection.className = 'trophies-section';
        trophiesSection.innerHTML = `<h3>Trophées</h3>`;
        
        // Ajouter les achievements
        const achievementsGrid = document.createElement('div');
        achievementsGrid.className = 'achievements-grid';
        
        this.achievements.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            achievementElement.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    ${achievement.unlocked ? `
                    <div class="achievement-date">${this.formatDate(achievement.unlockedDate)}</div>
                    <div class="achievement-share">
                        <button class="share-btn" data-id="${achievement.id}" data-title="${achievement.title}" onclick="window.achievementShowcase.shareAchievement('${achievement.id}', event)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            Partager
                        </button>
                    </div>` : ''}
                </div>
            `;
            
            // Ajouter un tooltip avec plus d'informations
            achievementElement.setAttribute('data-tooltip', achievement.unlocked ? 
                `Débloqué le ${this.formatDate(achievement.unlockedDate)}` : 
                `Requis: ${this.formatRequirement(achievement)}`);
            
            achievementsGrid.appendChild(achievementElement);
        });
        
        achievementsSection.appendChild(achievementsGrid);
        
        // Ajouter les badges
        const badgesGrid = document.createElement('div');
        badgesGrid.className = 'badges-grid';
        
        this.badges.forEach(badge => {
            const badgeElement = document.createElement('div');
            badgeElement.className = `badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`;
            badgeElement.innerHTML = `
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-info">
                    <div class="badge-title">${badge.title}</div>
                </div>
            `;
            
            // Ajouter un tooltip
            badgeElement.setAttribute('data-tooltip', badge.description);
            
            badgesGrid.appendChild(badgeElement);
        });
        
        badgesSection.appendChild(badgesGrid);
        
        // Ajouter les trophées
        const trophiesGrid = document.createElement('div');
        trophiesGrid.className = 'trophies-grid';
        
        this.trophies.forEach(trophy => {
            const trophyElement = document.createElement('div');
            trophyElement.className = `trophy-item ${trophy.unlocked ? 'unlocked' : 'locked'}`;
            trophyElement.innerHTML = `
                <div class="trophy-icon">${trophy.icon}</div>
                <div class="trophy-info">
                    <div class="trophy-title">${trophy.title}</div>
                    <div class="trophy-description">${trophy.description}</div>
                </div>
            `;
            
            trophiesGrid.appendChild(trophyElement);
        });
        
        trophiesSection.appendChild(trophiesGrid);
        
        // Ajouter les sections au conteneur
        this.showcaseContainer.appendChild(achievementsSection);
        this.showcaseContainer.appendChild(badgesSection);
        this.showcaseContainer.appendChild(trophiesSection);
        
        // Mise à jour des statistiques du joueur
        this.updatePlayerStats();
    }
    
    /**
     * Met à jour l'affichage des statistiques du joueur
     */
    updatePlayerStats() {
        if (!this.statsContainer || !this.playerStats) return;
        
        // Calculer des statistiques avancées
        const totalGames = this.playerStats.gamesPlayed || 0;
        const totalWins = (this.playerStats.quinesWon || 0) + (this.playerStats.bingosWon || 0);
        const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
        const avgWinnings = totalWins > 0 ? (this.playerStats.totalWinnings || 0) / totalWins : 0;
        const weeklyAvgGames = Math.round((totalGames / 4) * 10) / 10; // Approximation simple
        const bestStreak = this.playerStats.bestStreak || 0;
        const currentStreak = this.playerStats.currentStreak || 0;
        
        // Créer l'histogramme des gains hebdomadaires (simulé pour l'instant)
        const weeklyHistogram = this.getWeeklyHistogram();
        
        this.statsContainer.innerHTML = `
            <div class="player-level">
                <div class="level-circle">
                    <span>${this.playerStats.level}</span>
                </div>
                <div class="level-info">
                    <div class="level-title">Niveau ${this.playerStats.level}</div>
                    <div class="xp-bar">
                        <div class="xp-progress" style="width: ${(this.playerStats.xp / this.playerStats.nextLevelXp) * 100}%"></div>
                    </div>
                    <div class="xp-text">${this.playerStats.xp} / ${this.playerStats.nextLevelXp} XP</div>
                </div>
            </div>
            
            <div class="stats-tabs">
                <div class="stats-tab active" data-tab="basic">Statistiques de base</div>
                <div class="stats-tab" data-tab="advanced">Statistiques avancées</div>
                <div class="stats-tab" data-tab="trends">Tendances</div>
            </div>
            
            <div class="stats-content">
                <div class="stats-panel active" data-panel="basic">
                    <div class="player-stats-grid">
                        <div class="stat-item">
                            <div class="stat-label">Parties jouées</div>
                            <div class="stat-value">${this.playerStats.gamesPlayed || 0}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Quines gagnées</div>
                            <div class="stat-value">${this.playerStats.quinesWon || 0}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Bingos gagnés</div>
                            <div class="stat-value">${this.playerStats.bingosWon || 0}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Jackpots gagnés</div>
                            <div class="stat-value">${this.playerStats.jackpotsWon || 0}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Total des gains</div>
                            <div class="stat-value">${this.formatCurrency(this.playerStats.totalWinnings || 0)}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Taux de victoire</div>
                            <div class="stat-value">${winRate.toFixed(1)}%</div>
                        </div>
                    </div>
                    
                    <div class="favorite-numbers">
                        <div class="favorite-numbers-label">Vos numéros porte-bonheur:</div>
                        <div class="favorite-numbers-list">
                            ${(this.playerStats.favoriteNumbers || []).map(num => `<div class="favorite-number">${num}</div>`).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="stats-panel" data-panel="advanced">
                    <div class="player-stats-grid">
                        <div class="stat-item">
                            <div class="stat-label">Séquence actuelle</div>
                            <div class="stat-value">${currentStreak} parties</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Meilleure séquence</div>
                            <div class="stat-value">${bestStreak} parties</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Parties par semaine</div>
                            <div class="stat-value">~${weeklyAvgGames}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Gain moyen par victoire</div>
                            <div class="stat-value">${this.formatCurrency(avgWinnings)}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Ratio quine/bingo</div>
                            <div class="stat-value">${this.playerStats.bingosWon > 0 ? (this.playerStats.quinesWon / this.playerStats.bingosWon).toFixed(1) : '0'}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Achievements débloqués</div>
                            <div class="stat-value">${this.countUnlockedAchievements()}/${this.achievements.length}</div>
                        </div>
                    </div>
                    
                    <div class="playtime-stats">
                        <div class="playtime-label">Statistiques de jeu par heure de la journée</div>
                        <div class="playtime-chart">
                            ${this.generatePlaytimeChart()}
                        </div>
                        <div class="playtime-legend">
                            <div class="legend-item"><span class="color-dot low"></span> Faible</div>
                            <div class="legend-item"><span class="color-dot medium"></span> Moyen</div>
                            <div class="legend-item"><span class="color-dot high"></span> Élevé</div>
                        </div>
                    </div>
                </div>
                
                <div class="stats-panel" data-panel="trends">
                    <div class="trend-chart-container">
                        <div class="trend-title">Gains hebdomadaires (4 dernières semaines)</div>
                        <div class="trend-chart">
                            ${weeklyHistogram}
                        </div>
                    </div>
                    
                    <div class="trend-stats-grid">
                        <div class="trend-stat">
                            <div class="trend-label">Tendance des victoires</div>
                            <div class="trend-value ${this.getTrend() >= 0 ? 'positive' : 'negative'}">
                                ${this.getTrend() >= 0 ? '↗' : '↘'} ${Math.abs(this.getTrend())}%
                            </div>
                            <div class="trend-period">sur les 4 dernières semaines</div>
                        </div>
                        <div class="trend-stat">
                            <div class="trend-label">Jour de prédilection</div>
                            <div class="trend-value">Mercredi</div>
                            <div class="trend-period">taux de victoire: 68%</div>
                        </div>
                    </div>
                    
                    <div class="stats-improvement">
                        <div class="improvement-title">Suggestions d'amélioration</div>
                        <ul class="improvement-list">
                            <li>Essayez de jouer plus souvent le mercredi, votre jour avec le plus haut taux de victoire</li>
                            <li>Votre taux de victoire à 19h est 25% plus élevé que la moyenne</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter les écouteurs d'événements pour les onglets
        const tabs = this.statsContainer.querySelectorAll('.stats-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Désactiver tous les onglets et panneaux
                tabs.forEach(t => t.classList.remove('active'));
                const panels = this.statsContainer.querySelectorAll('.stats-panel');
                panels.forEach(p => p.classList.remove('active'));
                
                // Activer l'onglet cliqué et le panneau correspondant
                tab.classList.add('active');
                const targetPanel = this.statsContainer.querySelector(`.stats-panel[data-panel="${tab.dataset.tab}"]`);
                if (targetPanel) targetPanel.classList.add('active');
            });
        });
    }
    
    /**
     * Compte le nombre d'achievements débloqués
     * @returns {number} Nombre d'achievements débloqués
     */
    countUnlockedAchievements() {
        if (!this.achievements) return 0;
        return this.achievements.filter(a => a.unlocked).length;
    }
    
    /**
     * Génère un histogramme des gains hebdomadaires
     * @returns {string} HTML de l'histogramme
     */
    getWeeklyHistogram() {
        // Simuler des données pour l'histogramme (à remplacer par de vraies données)
        const weeklyData = [2800, 4200, 1500, 3600];
        const maxValue = Math.max(...weeklyData);
        
        return `
            <div class="histogram">
                ${weeklyData.map((value, index) => {
                    const height = (value / maxValue) * 100;
                    return `
                        <div class="histogram-column">
                            <div class="histogram-bar" style="height: ${height}%">
                                <div class="histogram-value">${this.formatCurrency(value)}</div>
                            </div>
                            <div class="histogram-label">S${index + 1}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    /**
     * Génère un graphique de temps de jeu
     * @returns {string} HTML du graphique
     */
    generatePlaytimeChart() {
        // Simuler des données d'activité par heure (0 = faible, 1 = moyen, 2 = élevé)
        const hourlyActivity = [
            0, 0, 0, 0, 0, 0, // 0h-6h
            0, 1, 1, 1, 1, 1, // 6h-12h
            1, 1, 1, 1, 2, 2, // 12h-18h
            2, 2, 1, 1, 0, 0  // 18h-24h
        ];
        
        return `
            <div class="hour-chart">
                ${hourlyActivity.map((level, hour) => {
                    let levelClass = '';
                    switch(level) {
                        case 0: levelClass = 'low'; break;
                        case 1: levelClass = 'medium'; break;
                        case 2: levelClass = 'high'; break;
                    }
                    
                    return `
                        <div class="hour-block ${levelClass}" title="${hour}h: ${['Faible', 'Moyen', 'Élevé'][level]} activité">
                            ${hour}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    /**
     * Calcule la tendance des victoires (simulée)
     * @returns {number} Pourcentage de tendance
     */
    getTrend() {
        // Simuler une tendance (valeur positive = en hausse, négative = en baisse)
        return 12.5;
    }
    
    /**
     * Met à jour les barres de progression
     */
    updateProgressBars() {
        // Mettre à jour la barre de progression XP si elle existe
        const xpBar = document.querySelector('.xp-progress');
        if (xpBar && this.playerStats) {
            xpBar.style.width = `${(this.playerStats.xp / this.playerStats.nextLevelXp) * 100}%`;
            
            // Mettre à jour le texte d'XP
            const xpText = document.querySelector('.xp-text');
            if (xpText) {
                xpText.textContent = `${this.playerStats.xp} / ${this.playerStats.nextLevelXp} XP`;
            }
            
            // Mettre à jour le niveau
            const levelCircle = document.querySelector('.level-circle span');
            if (levelCircle) {
                levelCircle.textContent = this.playerStats.level;
            }
            
            const levelTitle = document.querySelector('.level-title');
            if (levelTitle) {
                levelTitle.textContent = `Niveau ${this.playerStats.level}`;
            }
        }
    }
    
    /**
     * Affiche ou masque la vitrine des achievements
     */
    toggleShowcase() {
        const showcaseContainer = document.getElementById('achievement-showcase-container');
        if (showcaseContainer) {
            showcaseContainer.classList.toggle('visible');
            // Mettre à jour lorsque la vitrine est affichée
            if (showcaseContainer.classList.contains('visible')) {
                this.updateShowcase();
                this.updateProgressBars();
            }
        }
    }
    
    /**
     * Formate une date pour l'affichage
     * @param {Date} date - La date à formater
     * @returns {string} La date formatée
     */
    formatDate(date) {
        if (!date) return '';
        
        // Si la date est une chaîne, la convertir en objet Date
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        // Format: JJ/MM/AAAA
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }
    
    /**
     * Formate une valeur monétaire
     * @param {number} amount - Le montant à formater
     * @returns {string} Le montant formaté
     */
    formatCurrency(amount) {
        return `${amount.toLocaleString()} F`;
    }
    
    /**
     * Formate les exigences d'un achievement pour l'affichage
     * @param {Object} achievement - L'achievement à formater
     * @returns {string} Les exigences formatées
     */
    formatRequirement(achievement) {
        switch (achievement.type) {
            case 'games_played':
                return `Jouer ${achievement.requirement} parties`;
            case 'quines_won':
                return `Gagner ${achievement.requirement} quines`;
            case 'bingos_won':
                return `Gagner ${achievement.requirement} bingos`;
            case 'jackpots_won':
                return `Gagner ${achievement.requirement} jackpots`;
            case 'total_winnings':
                return `Gagner ${this.formatCurrency(achievement.requirement)}`;
            default:
                return achievement.description;
        }
    }
    
    /**
     * Sauvegarde les achievements dans le localStorage
     */
    saveAchievements() {
        try {
            localStorage.setItem('ms-bingo-achievements', JSON.stringify({
                achievements: this.achievements,
                playerStats: this.playerStats,
                badges: this.badges,
                trophies: this.trophies
            }));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des achievements:', error);
        }
    }
    
    /**
     * Charge les achievements depuis le localStorage
     * @returns {boolean} Vrai si les achievements ont été chargés avec succès
     */
    loadAchievementsFromStorage() {
        try {
            const savedData = localStorage.getItem('ms-bingo-achievements');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.achievements = parsedData.achievements || this.getDefaultAchievements();
                this.playerStats = parsedData.playerStats || {};
                this.badges = parsedData.badges || this.getPlayerBadges();
                this.trophies = parsedData.trophies || this.getPlayerTrophies();
                return true;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des achievements:', error);
        }
        return false;
    }
    
    /**
     * Met à jour le badge de partage social
     * Cette méthode est appelée par socialShare.logShare
     */
    updateSharerBadge() {
        const socialSharerBadge = this.badges.find(b => b.id === 'social_sharer');
        if (socialSharerBadge && !socialSharerBadge.unlocked) {
            socialSharerBadge.unlocked = true;
            this.saveAchievements();
            
            // Notification de badge débloqué
            this.showAchievementNotification(socialSharerBadge);
        }
    }
    
    /**
     * Partage un achievement sur les réseaux sociaux
     * @param {string} achievementId - ID de l'achievement à partager
     * @param {Event} event - L'événement de clic
     */
    shareAchievement(achievementId, event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Trouver l'achievement correspondant
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement || !achievement.unlocked) return;
        
        // Créer la modal de partage
        const shareModal = document.createElement('div');
        shareModal.className = 'share-modal-overlay';
        shareModal.innerHTML = `
            <div class="share-modal">
                <div class="share-modal-header">
                    <h3>Partager l'achievement "${achievement.title}"</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="share-modal-content">
                    <div class="share-preview">
                        <div class="share-achievement">
                            <div class="share-achievement-icon">${achievement.icon}</div>
                            <div class="share-achievement-info">
                                <div class="share-achievement-title">${achievement.title}</div>
                                <div class="share-achievement-description">${achievement.description}</div>
                            </div>
                        </div>
                        <div class="share-message">
                            <textarea placeholder="Ajouter un message à votre partage...">Je viens de débloquer l'achievement "${achievement.title}" sur MS BINGO ! 🎮 #MSBingo #Pacifique</textarea>
                        </div>
                    </div>
                    <div class="share-options">
                        <button class="share-option facebook" data-platform="facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            Facebook
                        </button>
                        <button class="share-option twitter" data-platform="twitter">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.1 10.1 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                            Twitter
                        </button>
                        <button class="share-option whatsapp" data-platform="whatsapp">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(shareModal);
        
        // Gérer la fermeture de la modal
        const closeBtn = shareModal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            shareModal.classList.add('closing');
            setTimeout(() => {
                shareModal.remove();
            }, 300);
        });
        
        // Gérer les clics sur les boutons de partage
        const shareButtons = shareModal.querySelectorAll('.share-option');
        shareButtons.forEach(button => {
            button.addEventListener('click', () => {
                const platform = button.getAttribute('data-platform');
                const message = shareModal.querySelector('textarea').value;
                this.shareToSocialMedia(platform, message, achievement);
                
                // Fermer la modal après partage
                setTimeout(() => {
                    shareModal.classList.add('closing');
                    setTimeout(() => {
                        shareModal.remove();
                    }, 300);
                }, 500);
            });
        });
        
        // Animation d'entrée
        setTimeout(() => {
            shareModal.classList.add('visible');
        }, 10);
    }
    
    /**
     * Partage sur les réseaux sociaux
     * @param {string} platform - Plateforme (facebook, twitter, whatsapp)
     * @param {string} message - Message à partager
     * @param {Object} achievement - L'achievement à partager
     */
    shareToSocialMedia(platform, message, achievement) {
        const appUrl = window.location.origin;
        const text = encodeURIComponent(message);
        let url = '';
        
        switch(platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${text}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(appUrl)}`;
                break;
            case 'whatsapp':
                url = `https://api.whatsapp.com/send?text=${text} ${encodeURIComponent(appUrl)}`;
                break;
            default:
                return;
        }
        
        // Ouvrir la fenêtre de partage
        window.open(url, '_blank', 'width=600,height=400');
        
        // Si le système social-share.js existe, mettre à jour les statistiques
        if (window.socialShare) {
            window.socialShare.logShare({
                type: 'achievement',
                platform: platform,
                achievementId: achievement.id,
                achievementTitle: achievement.title
            });
        }
    }
    
    /**
     * Retourne la liste des achievements par défaut
     * @returns {Array} Liste des achievements
     */
    getDefaultAchievements() {
        return [
            {
                id: 'first_game',
                type: 'games_played',
                title: 'Premier Pas',
                description: 'Jouer votre première partie',
                icon: '🎮',
                requirement: 1,
                unlocked: false
            },
            {
                id: 'regular_player',
                type: 'games_played',
                title: 'Joueur Régulier',
                description: 'Jouer 10 parties',
                icon: '🎯',
                requirement: 10,
                unlocked: false
            },
            {
                id: 'enthusiast',
                type: 'games_played',
                title: 'Enthousiaste',
                description: 'Jouer 50 parties',
                icon: '🌟',
                requirement: 50,
                unlocked: false
            },
            {
                id: 'first_quine',
                type: 'quines_won',
                title: 'Première Ligne',
                description: 'Gagner votre première quine',
                icon: '🎲',
                requirement: 1,
                unlocked: false
            },
            {
                id: 'quine_collector',
                type: 'quines_won',
                title: 'Collectionneur de Quines',
                description: 'Gagner 10 quines',
                icon: '🏅',
                requirement: 10,
                unlocked: false
            },
            {
                id: 'quine_master',
                type: 'quines_won',
                title: 'Maître des Quines',
                description: 'Gagner 25 quines',
                icon: '👑',
                requirement: 25,
                unlocked: false
            },
            {
                id: 'first_bingo',
                type: 'bingos_won',
                title: 'Premier Carton',
                description: 'Gagner votre premier bingo',
                icon: '🎪',
                requirement: 1,
                unlocked: false
            },
            {
                id: 'bingo_collector',
                type: 'bingos_won',
                title: 'Collectionneur de Bingos',
                description: 'Gagner 5 bingos',
                icon: '🥇',
                requirement: 5,
                unlocked: false
            },
            {
                id: 'bingo_master',
                type: 'bingos_won',
                title: 'Maître des Bingos',
                description: 'Gagner 15 bingos',
                icon: '👑',
                requirement: 15,
                unlocked: false
            },
            {
                id: 'first_jackpot',
                type: 'jackpots_won',
                title: 'Chanceux',
                description: 'Gagner votre premier jackpot',
                icon: '💰',
                requirement: 1,
                unlocked: false
            },
            {
                id: 'small_fortune',
                type: 'total_winnings',
                title: 'Petite Fortune',
                description: 'Accumuler 10,000 F de gains',
                icon: '💵',
                requirement: 10000,
                unlocked: false
            },
            {
                id: 'big_fortune',
                type: 'total_winnings',
                title: 'Grande Fortune',
                description: 'Accumuler 50,000 F de gains',
                icon: '💸',
                requirement: 50000,
                unlocked: false
            }
        ];
    }
    
    /**
     * Retourne la liste des badges du joueur
     * @returns {Array} Liste des badges
     */
    getPlayerBadges() {
        return [
            {
                id: 'newcomer',
                title: 'Nouveau Venu',
                description: 'Bienvenue dans la communauté!',
                icon: '👋',
                unlocked: true
            },
            {
                id: 'weekly_player',
                title: 'Joueur Hebdomadaire',
                description: 'Joue régulièrement chaque semaine',
                icon: '📅',
                unlocked: true
            },
            {
                id: 'social_sharer',
                title: 'Partageur Social',
                description: 'Partage ses victoires sur les réseaux sociaux',
                icon: '📱',
                unlocked: false
            },
            {
                id: 'community_supporter',
                title: 'Soutien de la Communauté',
                description: 'Participe activement à la communauté',
                icon: '🤝',
                unlocked: false
            },
            {
                id: 'high_roller',
                title: 'Grand Joueur',
                description: 'Joue régulièrement aux parties spéciales',
                icon: '💎',
                unlocked: false
            }
        ];
    }
    
    /**
     * Retourne la liste des trophées du joueur
     * @returns {Array} Liste des trophées
     */
    getPlayerTrophies() {
        return [
            {
                id: 'bronze_player',
                title: 'Joueur Bronze',
                description: 'Atteindre le niveau 5',
                icon: '🥉',
                unlocked: false
            },
            {
                id: 'silver_player',
                title: 'Joueur Argent',
                description: 'Atteindre le niveau 10',
                icon: '🥈',
                unlocked: false
            },
            {
                id: 'gold_player',
                title: 'Joueur Or',
                description: 'Atteindre le niveau 20',
                icon: '🥇',
                unlocked: false
            },
            {
                id: 'platinum_player',
                title: 'Joueur Platine',
                description: 'Atteindre le niveau 50',
                icon: '💠',
                unlocked: false
            },
            {
                id: 'november_2025',
                title: 'Tournoi Novembre 2025',
                description: 'Participation au tournoi de novembre 2025',
                icon: '🏆',
                unlocked: false
            }
        ];
    }
}

// Initialiser la vitrine des achievements lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.achievementShowcase = new AchievementShowcase();
    
    // Ajouter un bouton pour afficher la vitrine s'il n'existe pas déjà
    if (!document.getElementById('showcase-btn')) {
        const navBar = document.querySelector('nav');
        if (navBar) {
            const showcaseBtn = document.createElement('a');
            showcaseBtn.href = '#';
            showcaseBtn.id = 'showcase-btn';
            showcaseBtn.textContent = 'Achievements';
            navBar.appendChild(showcaseBtn);
        }
    }
});