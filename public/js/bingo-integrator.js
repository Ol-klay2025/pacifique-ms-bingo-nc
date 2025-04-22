/**
 * MS BINGO - Intégrateur des améliorations
 * 
 * Ce fichier assure l'intégration des nouvelles fonctionnalités :
 * - Affichage des cartons gagnants et animations de confettis
 * - Annonces vocales améliorées avec "Quine annoncé" et "Bingo annoncé"
 * - Option de marquage automatique/manuel
 * - Affichage des montants des prix (quine, bingo, jackpot)
 */

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si les scripts des améliorations sont chargés
    ensureScriptsLoaded()
        .then(() => {
            console.log('MS BINGO - Toutes les améliorations sont chargées');
            initializeIntegration();
        })
        .catch(error => {
            console.error('MS BINGO - Erreur lors du chargement des améliorations:', error);
        });
});

/**
 * S'assure que tous les scripts nécessaires sont chargés
 */
function ensureScriptsLoaded() {
    return new Promise((resolve, reject) => {
        const requiredScripts = [
            { id: 'bingo-enhancements', src: '/js/bingo-enhancements.js' },
            { id: 'speech-enhancements', src: '/js/speech-enhancements.js' }
        ];
        
        const scriptsToLoad = requiredScripts.filter(script => 
            !document.getElementById(script.id) && 
            !Array.from(document.scripts).some(s => s.src.includes(script.src))
        );
        
        if (scriptsToLoad.length === 0) {
            // Tous les scripts sont déjà chargés
            resolve();
            return;
        }
        
        let loadedCount = 0;
        
        scriptsToLoad.forEach(scriptInfo => {
            const script = document.createElement('script');
            script.id = scriptInfo.id;
            script.src = scriptInfo.src;
            script.async = true;
            
            script.onload = () => {
                loadedCount++;
                if (loadedCount === scriptsToLoad.length) {
                    // Attendre un court instant pour s'assurer que les scripts sont initialisés
                    setTimeout(resolve, 100);
                }
            };
            
            script.onerror = (error) => {
                reject(new Error(`Impossible de charger le script: ${scriptInfo.src}`));
            };
            
            document.head.appendChild(script);
        });
    });
}

/**
 * Initialise l'intégration des améliorations avec le jeu existant
 */
function initializeIntegration() {
    // Vérifier si le jeu est initialisé
    if (window.msBingoGame) {
        // Le jeu est déjà initialisé, connecter les événements
        connectEvents();
    } else {
        // Le jeu n'est pas encore initialisé, attendre qu'il le soit
        const gameCheckInterval = setInterval(() => {
            if (window.msBingoGame) {
                clearInterval(gameCheckInterval);
                connectEvents();
            }
        }, 500);
        
        // Arrêter la vérification après 10 secondes si le jeu n'est pas initialisé
        setTimeout(() => {
            clearInterval(gameCheckInterval);
            console.warn('MS BINGO - Le jeu n\'a pas pu être détecté après 10 secondes');
            
            // Tenter de connecter les événements aux éléments DOM directement
            connectEventsToDOM();
        }, 10000);
    }
    
    // Ajouter les préférences de marquage au localStorage si elles n'existent pas
    if (localStorage.getItem('bingoMarkingPreference') === null) {
        localStorage.setItem('bingoMarkingPreference', 'auto');
    }
}

/**
 * Connecte les événements aux objets du jeu
 */
function connectEvents() {
    console.log('MS BINGO - Connexion des événements au jeu');
    
    // Récupérer les objets du jeu et des améliorations
    const game = window.msBingoGame;
    const enhancements = window.msBingoEnhancements;
    const speech = window.msBingoSpeech;
    
    // Événement de tirage d'un nouveau numéro
    if (game.on) {
        game.on('numberDrawn', (number, column) => {
            // Annoncer le numéro tiré
            if (speech) {
                speech.announceNumber(number, column);
            }
            
            // Mettre à jour l'affichage des montants (pot de jeu basé sur le nombre de joueurs)
            if (enhancements && game.getPlayerCount) {
                enhancements.updateGamePot(game.getPlayerCount());
            }
        });
        
        // Événement de quine
        game.on('quine', (cardData, playerId) => {
            // Annoncer la quine
            if (speech) {
                speech.announceQuine();
            }
            
            // Afficher le carton gagnant
            if (enhancements) {
                enhancements.showWinningCard(cardData, 'quine');
            }
            
            // Enregistrer dans les statistiques
            if (window.msBingoStats) {
                const event = new CustomEvent('quine-achieved', {
                    detail: { card: cardData }
                });
                document.dispatchEvent(event);
            }
        });
        
        // Événement de bingo
        game.on('bingo', (cardData, playerId) => {
            // Annoncer le bingo
            if (speech) {
                speech.announceBingo();
            }
            
            // Afficher le carton gagnant
            if (enhancements) {
                enhancements.showWinningCard(cardData, 'bingo');
            }
            
            // Mettre à jour le jackpot après la partie
            if (enhancements) {
                enhancements.updateJackpot();
            }
            
            // Enregistrer dans les statistiques
            if (window.msBingoStats) {
                const event = new CustomEvent('bingo-achieved', {
                    detail: { card: cardData }
                });
                document.dispatchEvent(event);
                
                // Envoyer un événement de fin de partie
                setTimeout(() => {
                    const gameEndedEvent = new Event('gameEnded');
                    document.dispatchEvent(gameEndedEvent);
                }, 2000);
            }
        });
        
        // Événement de début de partie
        game.on('gameStarted', () => {
            // Afficher l'animation de chargement pour le début de partie
            if (window.bingoLoader) {
                window.showBingoLoader();
                window.bingoLoader.loadingText.textContent = "Nouvelle partie en cours...";
                
                // Créer un effet de ciblage rapide des chiffres
                let progress = 0;
                const gameStartInterval = setInterval(() => {
                    progress += 20;
                    window.updateLoaderProgress(progress);
                    
                    if (progress >= 100) {
                        clearInterval(gameStartInterval);
                        // L'animation disparaîtra automatiquement
                    }
                }, 400);
            }
            
            // Annoncer le début de la partie après la fin de l'animation
            setTimeout(() => {
                if (speech) {
                    speech.announceNewGame();
                }
                
                // Initialiser les statistiques
                if (window.msBingoStats) {
                    const gameStartedEvent = new Event('gameStarted');
                    document.dispatchEvent(gameStartedEvent);
                }
            }, 2000);
        });
        
        // Mise à jour du nombre de joueurs
        game.on('playersUpdated', (count) => {
            if (enhancements) {
                enhancements.updateGamePot(count);
            }
        });
    }
    
    // Préférence de marquage automatique/manuel
    document.addEventListener('marking-preference-changed', (e) => {
        if (game.setAutoMarkEnabled) {
            game.setAutoMarkEnabled(e.detail.preference === 'auto');
        }
    });
    
    // Initialiser le jeu avec la préférence actuelle
    const autoMarkEnabled = localStorage.getItem('bingoMarkingPreference') !== 'manual';
    if (game.setAutoMarkEnabled) {
        game.setAutoMarkEnabled(autoMarkEnabled);
    }
}

/**
 * Connecte les événements directement aux éléments DOM si le jeu n'est pas accessible
 */
function connectEventsToDOM() {
    console.log('MS BINGO - Tentative de connexion directe aux éléments DOM');
    
    const enhancements = window.msBingoEnhancements;
    const speech = window.msBingoSpeech;
    
    // Observer les changements dans le DOM pour détecter les tirages de numéros
    const numberObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            // Vérifier si un nouveau numéro a été ajouté
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                const drawnNumberElement = document.querySelector('.drawn-number, #last-number, .last-drawn');
                if (drawnNumberElement) {
                    const numberText = drawnNumberElement.textContent.trim();
                    const match = numberText.match(/([B|I|N|G|O])[^\d]*(\d+)/i);
                    
                    if (match && match.length >= 3) {
                        const column = 'BINGO'.indexOf(match[1].toUpperCase()) + 1;
                        const number = parseInt(match[2], 10);
                        
                        // Annoncer le numéro
                        if (speech && !isNaN(number) && column > 0) {
                            speech.announceNumber(number, column);
                        }
                    }
                }
            }
        });
    });
    
    // Observer le conteneur des numéros tirés
    const drawnNumbersContainer = document.querySelector('.drawn-numbers, #drawn-numbers, .number-board');
    if (drawnNumbersContainer) {
        numberObserver.observe(drawnNumbersContainer, { childList: true, subtree: true });
    }
    
    // Créer manuellement des écouteurs pour les boutons de quine et bingo
    const quineButton = document.querySelector('.quine-btn, #quine-btn, button:contains("Quine")');
    if (quineButton) {
        quineButton.addEventListener('click', () => {
            // Déclenchement manuel de la quine
            if (speech) {
                speech.announceQuine();
            }
            
            // Afficher un carton factice
            if (enhancements) {
                enhancements.showWinningCard({ playerName: 'Joueur' }, 'quine');
            }
        });
    }
    
    const bingoButton = document.querySelector('.bingo-btn, #bingo-btn, button:contains("Bingo")');
    if (bingoButton) {
        bingoButton.addEventListener('click', () => {
            // Déclenchement manuel du bingo
            if (speech) {
                speech.announceBingo();
            }
            
            // Afficher un carton factice
            if (enhancements) {
                enhancements.showWinningCard({ playerName: 'Joueur' }, 'bingo');
            }
            
            // Mettre à jour le jackpot
            if (enhancements) {
                enhancements.updateJackpot();
            }
        });
    }
    
    // Initialiser l'affichage des montants avec une valeur par défaut
    if (enhancements) {
        // Simuler une partie avec 10 joueurs par défaut
        enhancements.simulateGameWithPlayers(10);
    }
    
    // Préférence de marquage automatique/manuel
    document.addEventListener('marking-preference-changed', (e) => {
        // Stocker la préférence pour que le jeu puisse la récupérer ultérieurement
        localStorage.setItem('bingoMarkingPreference', e.detail.preference);
        
        // Essayer de manipuler directement les éléments DOM pour activer/désactiver le marquage automatique
        if (e.detail.preference === 'manual') {
            document.body.classList.add('manual-marking');
            document.body.classList.remove('auto-marking');
        } else {
            document.body.classList.add('auto-marking');
            document.body.classList.remove('manual-marking');
        }
    });
}

// Ajouter des méthodes d'interopérabilité pour permettre aux composants existants d'utiliser les nouvelles fonctionnalités
window.msBingoIntegrator = {
    // Méthodes pour annoncer les événements vocalement
    announceNumber: (number, column) => {
        if (window.msBingoSpeech) {
            window.msBingoSpeech.announceNumber(number, column);
        }
    },
    
    announceQuine: () => {
        if (window.msBingoSpeech) {
            window.msBingoSpeech.announceQuine();
        }
    },
    
    announceBingo: () => {
        if (window.msBingoSpeech) {
            window.msBingoSpeech.announceBingo();
        }
    },
    
    // Méthodes pour montrer les cartons gagnants
    showQuineCard: (cardData) => {
        if (window.msBingoEnhancements) {
            window.msBingoEnhancements.showWinningCard(cardData, 'quine');
        }
    },
    
    showBingoCard: (cardData) => {
        if (window.msBingoEnhancements) {
            window.msBingoEnhancements.showWinningCard(cardData, 'bingo');
        }
    },
    
    // Méthodes pour gérer le pot de jeu et le jackpot
    updatePot: (playerCount) => {
        if (window.msBingoEnhancements) {
            window.msBingoEnhancements.updateGamePot(playerCount);
        }
    },
    
    updateJackpot: () => {
        if (window.msBingoEnhancements) {
            window.msBingoEnhancements.updateJackpot();
        }
    },
    
    // Méthode pour vérifier si le marquage automatique est activé
    isAutoMarkEnabled: () => {
        return localStorage.getItem('bingoMarkingPreference') !== 'manual';
    }
};

console.log('MS BINGO - Intégrateur des améliorations chargé');