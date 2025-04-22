import { db } from '../db';
import { games, cards, users, jackpot, transactions, organizerWallet } from '@shared/schema';
import { eq, and, lt, desc } from 'drizzle-orm';
import { WebSocket } from 'ws';
import { generateBingoCard, verifyQuineWin, verifyBingoWin, verifyJackpotWin } from '../utils/bingoUtils';

const CARD_PRICE_REGULAR = 100; // 1€ en centimes
const CARD_PRICE_SPECIAL = 250; // 2.5€ en centimes
const JACKPOT_THRESHOLD = 40; // Nombre max de numéros pour gagner le jackpot

// Stockage des connections WebSocket par userId et gameId
const connections: Map<number, WebSocket[]> = new Map();
const gameConnections: Map<number, Set<WebSocket>> = new Map();

/**
 * Création d'une nouvelle partie de Bingo
 * @param isSpecial Indique si c'est une partie spéciale (prix plus élevé, prix plus importants)
 * @returns L'ID de la partie créée
 */
export async function createGame(isSpecial: boolean = false) {
  try {
    // Calcul du début de la partie (2 minutes dans le futur pour permettre l'achat de cartes)
    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() + 2);
    
    // Insertion de la nouvelle partie
    const [newGame] = await db.insert(games).values({
      startTime,
      status: 'scheduled',
      calledNumbers: [],
      prize: 0, // Sera mis à jour au fur et à mesure des achats de cartes
      isSpecialGame: isSpecial,
      quinePrice: 0,
      bingoPrice: 0,
      jackpotAmount: 0
    }).returning();
    
    console.log(`Nouvelle partie créée avec ID: ${newGame.id}, démarrage prévu à ${startTime}`);
    
    // Planifier le démarrage de la partie
    setTimeout(() => {
      startGame(newGame.id);
    }, startTime.getTime() - Date.now());
    
    return newGame.id;
  } catch (error) {
    console.error('Erreur lors de la création d\'une partie:', error);
    throw error;
  }
}

/**
 * Démarrage d'une partie de Bingo
 * @param gameId ID de la partie à démarrer
 */
async function startGame(gameId: number) {
  try {
    // Vérifier que la partie existe et est en statut 'scheduled'
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId)
    });
    
    if (!game || game.status !== 'scheduled') {
      console.error(`Partie ${gameId} non trouvée ou non prévue.`);
      return;
    }
    
    // Calculer le prix total en fonction des cartes vendues
    const allCards = await db.query.cards.findMany({
      where: eq(cards.gameId, gameId)
    });
    
    if (allCards.length === 0) {
      // Annuler la partie si aucune carte n'a été vendue
      await db.update(games).set({ status: 'canceled' }).where(eq(games.id, gameId));
      broadcastToGame(gameId, { type: 'GAME_CANCELED', message: 'Aucune carte vendue pour cette partie.' });
      return;
    }
    
    // Calculer le prix total et la répartition
    const cardPrice = game.isSpecialGame ? CARD_PRICE_SPECIAL : CARD_PRICE_REGULAR;
    const totalPrize = allCards.length * cardPrice;
    
    // Répartition: 50% pour Bingo, 20% pour Quine, 10% pour jackpot, 20% pour la plateforme
    const bingoPrice = Math.floor(totalPrize * 0.5);
    const quinePrice = Math.floor(totalPrize * 0.2);
    const jackpotContribution = Math.floor(totalPrize * 0.1);
    const platformFee = Math.floor(totalPrize * 0.2);
    
    // Mettre à jour la cagnotte du jackpot
    const [currentJackpot] = await db.select().from(jackpot).limit(1);
    const newJackpotAmount = (currentJackpot?.amount || 0) + jackpotContribution;
    
    if (currentJackpot) {
      await db.update(jackpot).set({ 
        amount: newJackpotAmount,
        lastUpdated: new Date() 
      }).where(eq(jackpot.id, currentJackpot.id));
    } else {
      await db.insert(jackpot).values({
        amount: jackpotContribution,
        lastUpdated: new Date()
      });
    }
    
    // Ajouter les frais de plateforme au portefeuille organisateur
    const [currentWallet] = await db.select().from(organizerWallet).limit(1);
    if (currentWallet) {
      await db.update(organizerWallet)
        .set({ 
          balance: currentWallet.balance + platformFee,
          lastUpdated: new Date()
        })
        .where(eq(organizerWallet.id, currentWallet.id));
    } else {
      // Générer un hash de sécurité (à améliorer dans une implémentation réelle)
      const securityHash = Buffer.from(Math.random().toString()).toString('base64');
      await db.insert(organizerWallet).values({
        balance: platformFee,
        lastUpdated: new Date(),
        securityHash
      });
    }
    
    // Mettre à jour les informations de la partie
    await db.update(games).set({
      status: 'active',
      prize: totalPrize,
      quinePrice,
      bingoPrice,
      jackpotAmount: currentJackpot?.amount || jackpotContribution
    }).where(eq(games.id, gameId));
    
    // Informer tous les joueurs du début de la partie
    broadcastToGame(gameId, { 
      type: 'GAME_STARTED', 
      gameId,
      participants: allCards.length,
      prize: {
        total: totalPrize,
        quine: quinePrice,
        bingo: bingoPrice,
        jackpot: currentJackpot?.amount || jackpotContribution
      }
    });
    
    // Démarrer le tirage des numéros
    runNumberCalling(gameId);
  } catch (error) {
    console.error(`Erreur lors du démarrage de la partie ${gameId}:`, error);
    // Tentative de récupération en annulant la partie
    try {
      await db.update(games).set({ status: 'canceled' }).where(eq(games.id, gameId));
      broadcastToGame(gameId, { type: 'GAME_CANCELED', message: 'Erreur technique lors du démarrage de la partie.' });
    } catch (recoveryError) {
      console.error('Échec de la récupération après erreur:', recoveryError);
    }
  }
}

/**
 * Exécution du tirage des numéros pour une partie
 * @param gameId ID de la partie
 */
async function runNumberCalling(gameId: number) {
  try {
    // Créer un tableau de tous les numéros de 1 à 90
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    
    // Mélanger les numéros
    const shuffledNumbers = [...allNumbers].sort(() => Math.random() - 0.5);
    
    // Appeler les numéros un par un
    let calledNumbers: number[] = [];
    let quineWon = false;
    let bingoWon = false;
    let jackpotWon = false;
    
    // Récupérer les cartes pour cette partie
    const gameCards = await db.query.cards.findMany({
      where: eq(cards.gameId, gameId),
      with: {
        user: true
      }
    });
    
    // Initialiser les variables pour les gagnants
    let quineWinnerIds: number[] = [];
    let quineCardIds: number[] = [];
    let quineNumberCount = 0;
    let bingoWinnerIds: number[] = [];
    let bingoCardIds: number[] = [];
    let bingoNumberCount = 0;
    
    // Récupérer les infos sur la partie
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId)
    });
    
    if (!game) {
      throw new Error(`Partie ${gameId} non trouvée`);
    }
    
    // Initialiser le gain pour le jackpot
    const jackpotAmount = game.jackpotAmount || 0;
    
    // Fonction pour appeler un seul numéro
    const callNextNumber = async (index: number) => {
      if (index >= shuffledNumbers.length || bingoWon) {
        // Fin de la partie, tous les numéros ont été appelés ou le bingo a été gagné
        endGame(gameId, {
          quineWinnerIds,
          quineCardIds,
          quineNumberCount,
          bingoWinnerIds,
          bingoCardIds,
          bingoNumberCount,
          jackpotWon
        });
        return;
      }
      
      const number = shuffledNumbers[index];
      calledNumbers.push(number);
      
      // Mettre à jour les numéros appelés dans la base de données
      await db.update(games)
        .set({ calledNumbers: calledNumbers })
        .where(eq(games.id, gameId));
      
      // Notifier tous les joueurs du nouveau numéro
      broadcastToGame(gameId, { 
        type: 'NUMBER_CALLED', 
        number, 
        calledCount: calledNumbers.length 
      });
      
      // Pour chaque carte, vérifier si un joueur a gagné
      if (!quineWon) {
        // Vérifier les quines
        for (const card of gameCards) {
          if (verifyQuineWin(card.numbers, calledNumbers)) {
            quineWon = true;
            quineWinnerIds.push(card.userId);
            quineCardIds.push(card.id);
            quineNumberCount = calledNumbers.length;
            
            // Calculer le gain pour chaque gagnant (divisé en cas de multiples gagnants)
            const winAmount = Math.floor(game.quinePrice! / quineWinnerIds.length);
            
            // Mettre à jour le solde du gagnant
            await db.update(users)
              .set({ balance: card.user.balance + winAmount })
              .where(eq(users.id, card.userId));
            
            // Créer une transaction pour le gain
            await db.insert(transactions).values({
              userId: card.userId,
              type: 'win',
              amount: winAmount,
              status: 'completed',
              description: `Gain de quine - Partie #${gameId}`
            });
            
            // Notifier tous les joueurs qu'un quine a été gagné
            broadcastToGame(gameId, { 
              type: 'QUINE_WON', 
              winners: quineWinnerIds,
              numbersCalled: calledNumbers.length,
              amount: winAmount
            });
          }
        }
      }
      
      if (!bingoWon) {
        // Vérifier les bingos
        for (const card of gameCards) {
          if (verifyBingoWin(card.numbers, calledNumbers)) {
            bingoWon = true;
            bingoWinnerIds.push(card.userId);
            bingoCardIds.push(card.id);
            bingoNumberCount = calledNumbers.length;
            
            // Calculer le gain pour chaque gagnant (divisé en cas de multiples gagnants)
            const winAmount = Math.floor(game.bingoPrice! / bingoWinnerIds.length);
            
            // Vérifier si le jackpot est gagné (moins de 40 numéros appelés)
            let jackpotWinAmount = 0;
            if (calledNumbers.length <= JACKPOT_THRESHOLD && !jackpotWon) {
              jackpotWon = true;
              jackpotWinAmount = jackpotAmount;
              
              // Mettre à zéro le jackpot
              const [currentJackpot] = await db.select().from(jackpot).limit(1);
              if (currentJackpot) {
                await db.update(jackpot)
                  .set({ amount: 0, lastUpdated: new Date() })
                  .where(eq(jackpot.id, currentJackpot.id));
              }
            }
            
            // Mettre à jour le solde du gagnant (bingo + jackpot si applicable)
            const totalWinAmount = winAmount + (jackpotWon ? Math.floor(jackpotWinAmount / bingoWinnerIds.length) : 0);
            await db.update(users)
              .set({ balance: card.user.balance + totalWinAmount })
              .where(eq(users.id, card.userId));
            
            // Créer une transaction pour le gain
            await db.insert(transactions).values({
              userId: card.userId,
              type: 'win',
              amount: totalWinAmount,
              status: 'completed',
              description: `Gain de bingo ${jackpotWon ? 'et jackpot ' : ''}- Partie #${gameId}`
            });
            
            // Notifier tous les joueurs qu'un bingo a été gagné
            broadcastToGame(gameId, { 
              type: 'BINGO_WON', 
              winners: bingoWinnerIds,
              numbersCalled: calledNumbers.length,
              amount: winAmount,
              jackpotWon,
              jackpotAmount: jackpotWon ? Math.floor(jackpotWinAmount / bingoWinnerIds.length) : 0
            });
          }
        }
      }
      
      // Planifier l'appel du prochain numéro (1 seconde d'intervalle)
      setTimeout(() => callNextNumber(index + 1), 1000);
    };
    
    // Démarrer l'appel des numéros
    callNextNumber(0);
  } catch (error) {
    console.error(`Erreur lors du tirage des numéros pour la partie ${gameId}:`, error);
    // Tentative de récupération
    try {
      await db.update(games).set({ status: 'canceled' }).where(eq(games.id, gameId));
      broadcastToGame(gameId, { type: 'GAME_CANCELED', message: 'Erreur technique lors du tirage des numéros.' });
    } catch (recoveryError) {
      console.error('Échec de la récupération après erreur:', recoveryError);
    }
  }
}

/**
 * Termine une partie de Bingo
 * @param gameId ID de la partie
 * @param results Résultats de la partie
 */
async function endGame(gameId: number, results: {
  quineWinnerIds: number[],
  quineCardIds: number[],
  quineNumberCount: number,
  bingoWinnerIds: number[],
  bingoCardIds: number[],
  bingoNumberCount: number,
  jackpotWon: boolean
}) {
  try {
    // Mettre à jour le statut de la partie et enregistrer les résultats
    await db.update(games).set({
      status: 'completed',
      endTime: new Date(),
      quineWinnerIds: results.quineWinnerIds,
      quineCardIds: results.quineCardIds,
      quineNumberCount: results.quineNumberCount,
      bingoWinnerIds: results.bingoWinnerIds,
      bingoCardIds: results.bingoCardIds,
      bingoNumberCount: results.bingoNumberCount,
      jackpotWon: results.jackpotWon,
      // On pourrait ajouter ici la génération d'une preuve de vérification blockchain
      verificationHash: Buffer.from(JSON.stringify(results)).toString('base64')
    }).where(eq(games.id, gameId));
    
    // Informer tous les joueurs de la fin de la partie
    broadcastToGame(gameId, { 
      type: 'GAME_ENDED',
      results
    });
    
    // Planifier la prochaine partie
    scheduleNextGame(gameId);
  } catch (error) {
    console.error(`Erreur lors de la fin de la partie ${gameId}:`, error);
  }
}

/**
 * Planifie la prochaine partie de Bingo
 * @param lastGameId ID de la dernière partie terminée
 */
async function scheduleNextGame(lastGameId: number) {
  try {
    // Récupérer la dernière partie
    const lastGame = await db.query.games.findFirst({
      where: eq(games.id, lastGameId)
    });
    
    if (!lastGame) return;
    
    // Déterminer si la prochaine partie est spéciale
    // Les parties spéciales ont lieu toutes les 4 heures
    const now = new Date();
    const isSpecialHour = now.getHours() % 4 === 0;
    
    // Créer la prochaine partie régulière
    // Avec un délai pour permettre aux joueurs de se préparer
    setTimeout(() => {
      createGame(isSpecialHour);
    }, 3 * 60 * 1000); // 3 minutes après la fin de la dernière partie
  } catch (error) {
    console.error('Erreur lors de la planification de la prochaine partie:', error);
    // En cas d'erreur, on tente quand même de créer une partie régulière
    setTimeout(() => {
      createGame(false);
    }, 5 * 60 * 1000);
  }
}

/**
 * Achat d'une carte de Bingo pour une partie
 * @param userId ID de l'utilisateur
 * @param gameId ID de la partie
 * @returns La carte créée
 */
export async function purchaseCard(userId: number, gameId: number) {
  try {
    // Vérifier que l'utilisateur existe
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!user) {
      throw new Error(`Utilisateur ${userId} non trouvé`);
    }
    
    // Vérifier que la partie existe et est en statut 'scheduled'
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId)
    });
    
    if (!game) {
      throw new Error(`Partie ${gameId} non trouvée`);
    }
    
    if (game.status !== 'scheduled') {
      throw new Error(`La partie ${gameId} n'est pas ouverte à l'achat de cartes`);
    }
    
    // Déterminer le prix de la carte
    const cardPrice = game.isSpecialGame ? CARD_PRICE_SPECIAL : CARD_PRICE_REGULAR;
    
    // Vérifier que l'utilisateur a assez d'argent
    if (user.balance < cardPrice) {
      throw new Error(`Solde insuffisant. Nécessaire: ${cardPrice/100}€, Disponible: ${user.balance/100}€`);
    }
    
    // Générer une carte de bingo
    const numbers = generateBingoCard();
    
    // Créer la carte dans la base de données
    const [card] = await db.insert(cards).values({
      userId,
      gameId,
      numbers,
      createdAt: new Date()
    }).returning();
    
    // Débiter le solde de l'utilisateur
    await db.update(users)
      .set({ balance: user.balance - cardPrice })
      .where(eq(users.id, userId));
    
    // Créer une transaction pour l'achat
    await db.insert(transactions).values({
      userId,
      type: 'purchase',
      amount: -cardPrice,
      status: 'completed',
      description: `Achat de carte - Partie #${gameId}`
    });
    
    return card;
  } catch (error) {
    console.error(`Erreur lors de l'achat d'une carte pour la partie ${gameId} par l'utilisateur ${userId}:`, error);
    throw error;
  }
}

/**
 * Récupère l'état actuel d'une partie
 * @param gameId ID de la partie
 * @returns État de la partie
 */
export async function getGameState(gameId: number) {
  try {
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId)
    });
    
    if (!game) {
      throw new Error(`Partie ${gameId} non trouvée`);
    }
    
    const gameCards = await db.query.cards.findMany({
      where: eq(cards.gameId, gameId)
    });
    
    return {
      game,
      participantsCount: gameCards.length,
      remainingTime: game.status === 'scheduled' ? Math.max(0, game.startTime.getTime() - Date.now()) : null
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'état de la partie ${gameId}:`, error);
    throw error;
  }
}

/**
 * Récupère les cartes d'un utilisateur pour une partie
 * @param userId ID de l'utilisateur
 * @param gameId ID de la partie
 * @returns Liste des cartes de l'utilisateur
 */
export async function getUserCards(userId: number, gameId: number) {
  try {
    return await db.query.cards.findMany({
      where: and(
        eq(cards.userId, userId),
        eq(cards.gameId, gameId)
      )
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération des cartes de l'utilisateur ${userId} pour la partie ${gameId}:`, error);
    throw error;
  }
}

/**
 * Ajoute une connexion WebSocket pour un utilisateur
 * @param userId ID de l'utilisateur
 * @param ws Connexion WebSocket
 */
export function addUserConnection(userId: number, ws: WebSocket) {
  if (!connections.has(userId)) {
    connections.set(userId, []);
  }
  
  connections.get(userId)?.push(ws);
}

/**
 * Ajoute une connexion WebSocket pour une partie
 * @param gameId ID de la partie
 * @param ws Connexion WebSocket
 */
export function addGameConnection(gameId: number, ws: WebSocket) {
  if (!gameConnections.has(gameId)) {
    gameConnections.set(gameId, new Set());
  }
  
  gameConnections.get(gameId)?.add(ws);
}

/**
 * Supprime une connexion WebSocket
 * @param userId ID de l'utilisateur
 * @param ws Connexion WebSocket
 */
export function removeConnection(userId: number | null, gameId: number | null, ws: WebSocket) {
  if (userId !== null) {
    const userConns = connections.get(userId);
    if (userConns) {
      const index = userConns.indexOf(ws);
      if (index !== -1) {
        userConns.splice(index, 1);
      }
      
      if (userConns.length === 0) {
        connections.delete(userId);
      }
    }
  }
  
  if (gameId !== null) {
    const gameConns = gameConnections.get(gameId);
    if (gameConns) {
      gameConns.delete(ws);
      
      if (gameConns.size === 0) {
        gameConnections.delete(gameId);
      }
    }
  }
}

/**
 * Envoie un message à tous les clients connectés pour un utilisateur
 * @param userId ID de l'utilisateur
 * @param message Message à envoyer
 */
export function broadcastToUser(userId: number, message: any) {
  const userConns = connections.get(userId);
  if (!userConns) return;
  
  const messageStr = JSON.stringify(message);
  
  for (const conn of userConns) {
    if (conn.readyState === WebSocket.OPEN) {
      conn.send(messageStr);
    }
  }
}

/**
 * Envoie un message à tous les clients connectés pour une partie
 * @param gameId ID de la partie
 * @param message Message à envoyer
 */
export function broadcastToGame(gameId: number, message: any) {
  const gameConns = gameConnections.get(gameId);
  if (!gameConns) return;
  
  const messageStr = JSON.stringify(message);
  
  for (const conn of gameConns) {
    if (conn.readyState === WebSocket.OPEN) {
      conn.send(messageStr);
    }
  }
}

/**
 * Récupère les statistiques globales du jackpot
 * @returns Statistiques du jackpot
 */
export async function getJackpotStats() {
  try {
    // Récupérer le montant actuel du jackpot
    const [currentJackpot] = await db.select().from(jackpot).limit(1);
    
    // Récupérer l'historique des parties où le jackpot a été gagné
    const jackpotGames = await db.query.games.findMany({
      where: eq(games.jackpotWon, true),
      orderBy: [desc(games.endTime)],
      limit: 10
    });
    
    return {
      currentAmount: currentJackpot?.amount || 0,
      threshold: JACKPOT_THRESHOLD,
      recentWins: jackpotGames.map(game => ({
        gameId: game.id,
        date: game.endTime,
        winnerIds: game.bingoWinnerIds,
        numbersCalled: game.bingoNumberCount,
        amount: game.jackpotAmount
      }))
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques du jackpot:', error);
    throw error;
  }
}

// Démarrer la première partie au lancement du serveur
setTimeout(async () => {
  try {
    // Vérifier s'il y a des parties actives
    const activeGames = await db.query.games.findMany({
      where: eq(games.status, 'active')
    });
    
    if (activeGames.length > 0) {
      // Annuler les parties actives (par sécurité au redémarrage)
      for (const game of activeGames) {
        await db.update(games)
          .set({ status: 'canceled' })
          .where(eq(games.id, game.id));
      }
    }
    
    // Vérifier les parties planifiées
    const scheduledGames = await db.query.games.findMany({
      where: eq(games.status, 'scheduled')
    });
    
    if (scheduledGames.length > 0) {
      for (const game of scheduledGames) {
        // Si le début est dans le futur, réplanifier
        if (game.startTime > new Date()) {
          const timeToStart = game.startTime.getTime() - Date.now();
          setTimeout(() => {
            startGame(game.id);
          }, timeToStart);
        } else {
          // Si le début était dans le passé, annuler
          await db.update(games)
            .set({ status: 'canceled' })
            .where(eq(games.id, game.id));
        }
      }
    } else {
      // Aucune partie planifiée, on en crée une nouvelle
      createGame(new Date().getHours() % 4 === 0); // Partie spéciale toutes les 4 heures
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des parties:', error);
    // En cas d'erreur, on essaie quand même de créer une partie
    setTimeout(() => {
      createGame(false);
    }, 5000);
  }
}, 1000);