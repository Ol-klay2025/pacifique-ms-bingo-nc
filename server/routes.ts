import express, { type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import bodyParser from "body-parser";
import WebSocket from "ws";
import Stripe from "stripe";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, games, cards, transactions } from "@shared/schema";
import { setupAuth } from "./auth";
import { runMigrations, initializeDatabase } from "./db";
import * as gameService from "./services/gameService";
import recommendationRoutes from './routes/recommendation';
import challengeRoutes from './routes/challenges';

// Configuration de Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
}) : null;

// Middleware pour vérifier l'authentification
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Non authentifié" });
}

// Middleware pour vérifier les droits d'administration
function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ error: "Accès refusé" });
}

export async function registerRoutes(app: express.Express): Promise<Server> {
  app.use(bodyParser.json());
  app.use(cors({
    origin: process.env.NODE_ENV === "production" ? false : "*",
    credentials: true
  }));

  // Configurer l'authentification
  setupAuth(app);

  // Exécuter les migrations de base de données
  try {
    await runMigrations();
    console.log("Migrations terminées avec succès");
    await initializeDatabase();
    console.log("Initialisation de la base de données terminée");
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données:", error);
    // Ne pas arrêter le serveur, on continue même s'il y a une erreur
  }

  // Chemins pour vérifier la santé du serveur (pour les déploiements)
  app.get("/health", (req, res) => res.send("OK"));
  app.get("/api/health", (req, res) => res.send("OK"));

  // Routes sécurisées - Nécessitent une authentification
  app.use("/api/secured", ensureAuthenticated);

  // Récupérer le profil de l'utilisateur (déjà implémenté dans auth.ts)
  
  // Mettre à jour le profil de l'utilisateur
  app.put("/api/secured/profile", async (req, res) => {
    try {
      const { language, email } = req.body;
      const userId = req.user.id;
      
      // Vérifier si l'email est déjà utilisé
      if (email && email !== req.user.email) {
        const existingEmail = await db.query.users.findFirst({
          where: eq(users.email, email)
        });
        
        if (existingEmail) {
          return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }
      }
      
      // Mettre à jour le profil
      await db.update(users)
        .set({
          language: language || req.user.language,
          email: email || req.user.email
        })
        .where(eq(users.id, userId));
      
      res.json({ message: "Profil mis à jour avec succès" });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
    }
  });

  // Obtenir le solde actuel de l'utilisateur
  app.get("/api/secured/balance", async (req, res) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user.id)
      });
      
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      res.json({ balance: user.balance });
    } catch (error) {
      console.error("Erreur lors de la récupération du solde:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du solde" });
    }
  });

  // Obtenir l'historique des transactions de l'utilisateur
  app.get("/api/secured/transactions", async (req, res) => {
    try {
      const userTransactions = await db.query.transactions.findMany({
        where: eq(transactions.userId, req.user.id),
        orderBy: (transactions, { desc }) => [desc(transactions.createdAt)]
      });
      
      res.json(userTransactions);
    } catch (error) {
      console.error("Erreur lors de la récupération des transactions:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des transactions" });
    }
  });

  // Récupérer les parties à venir et en cours
  app.get("/api/games", async (req, res) => {
    try {
      const activeGames = await db.query.games.findMany({
        where: (games, { eq, or }) => or(
          eq(games.status, "scheduled"),
          eq(games.status, "active")
        ),
        orderBy: (games, { asc }) => [asc(games.startTime)]
      });
      
      res.json(activeGames);
    } catch (error) {
      console.error("Erreur lors de la récupération des parties:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des parties" });
    }
  });

  // Récupérer les détails d'une partie spécifique
  app.get("/api/games/:id", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const gameState = await gameService.getGameState(gameId);
      
      res.json(gameState);
    } catch (error) {
      console.error(`Erreur lors de la récupération de la partie ${req.params.id}:`, error);
      res.status(500).json({ message: "Erreur lors de la récupération de la partie" });
    }
  });

  // Acheter une carte pour une partie (nécessite authentification)
  app.post("/api/secured/games/:id/purchase-card", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const userId = req.user.id;
      
      const card = await gameService.purchaseCard(userId, gameId);
      
      res.status(201).json(card);
    } catch (error) {
      console.error("Erreur lors de l'achat d'une carte:", error);
      res.status(400).json({ message: error.message || "Erreur lors de l'achat d'une carte" });
    }
  });

  // Récupérer les cartes de l'utilisateur pour une partie
  app.get("/api/secured/games/:id/cards", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const userId = req.user.id;
      
      const userCards = await gameService.getUserCards(userId, gameId);
      
      res.json(userCards);
    } catch (error) {
      console.error("Erreur lors de la récupération des cartes:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des cartes" });
    }
  });

  // Récupérer les statistiques du jackpot
  app.get("/api/jackpot", async (req, res) => {
    try {
      const jackpotStats = await gameService.getJackpotStats();
      
      res.json(jackpotStats);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques du jackpot:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des statistiques du jackpot" });
    }
  });

  // Routes pour Stripe

  // Créer une intention de paiement pour ajouter des fonds
  app.post("/api/secured/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Configuration Stripe manquante" });
      }
      
      const { amount } = req.body;
      
      if (!amount || amount < 100) { // Minimum 1€
        return res.status(400).json({ message: "Montant invalide. Minimum: 1€" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount, // Déjà en centimes
        currency: "eur",
        metadata: {
          userId: req.user.id.toString(),
          type: "deposit"
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Erreur lors de la création de l'intention de paiement:", error);
      res.status(500).json({ message: "Erreur lors de la création de l'intention de paiement" });
    }
  });

  // Demander un retrait
  app.post("/api/secured/request-withdrawal", async (req, res) => {
    try {
      const { amount, method, details } = req.body;
      const userId = req.user.id;
      
      // Vérifier le montant minimum
      if (!amount || amount < 1000) { // Minimum 10€
        return res.status(400).json({ message: "Montant de retrait invalide. Minimum: 10€" });
      }
      
      // Vérifier si l'utilisateur a assez d'argent
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      if (user.balance < amount) {
        return res.status(400).json({ message: `Solde insuffisant. Disponible: ${user.balance/100}€, Demandé: ${amount/100}€` });
      }
      
      // Créer une transaction de retrait (en attente)
      await db.insert(transactions).values({
        userId,
        amount: -amount, // Négatif car c'est un débit
        type: "withdrawal",
        status: "pending",
        description: `Demande de retrait via ${method}`,
        createdAt: new Date()
      });
      
      // Mettre à jour le solde de l'utilisateur
      await db.update(users)
        .set({ balance: user.balance - amount })
        .where(eq(users.id, userId));
      
      res.json({ message: "Demande de retrait enregistrée. Le traitement peut prendre jusqu'à 48 heures." });
    } catch (error) {
      console.error("Erreur lors de la demande de retrait:", error);
      res.status(500).json({ message: "Erreur lors de la demande de retrait" });
    }
  });

  // Webhook pour Stripe
  app.post("/api/webhook/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Configuration Stripe manquante" });
    }
    
    const sig = req.headers["stripe-signature"] as string;
    
    try {
      let event;
      
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        // Vérifier la signature du webhook
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } else {
        // En développement, on peut accepter les webhooks sans vérification
        event = JSON.parse(req.body.toString()) as StripeWebhookEvent;
      }
      
      // Traiter les événements Stripe
      switch (event.type) {
        case "payment_intent.succeeded":
          await handlePaymentIntentSucceeded(event.data.object);
          break;
        case "payment_intent.payment_failed":
          await handlePaymentIntentFailed(event.data.object);
          break;
        case "charge.refunded":
          await handleChargeRefunded(event.data.object);
          break;
        case "customer.subscription.created":
          await handleSubscriptionCreated(event.data.object);
          break;
        case "customer.subscription.updated":
          await handleSubscriptionUpdated(event.data.object);
          break;
        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(event.data.object);
          break;
        case "invoice.payment_succeeded":
          await handleInvoicePaymentSucceeded(event.data.object);
          break;
        case "invoice.payment_failed":
          await handleInvoicePaymentFailed(event.data.object);
          break;
      }
      
      res.json({ received: true });
    } catch (err) {
      console.error("Erreur webhook Stripe:", err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  // Gestionnaires d'événements Stripe (à implémenter)
  async function handlePaymentIntentSucceeded(paymentIntent: any) {
    console.log("Paiement réussi:", paymentIntent.id);
    
    // Vérifier que c'est un dépôt
    if (paymentIntent.metadata && paymentIntent.metadata.type === "deposit") {
      const userId = parseInt(paymentIntent.metadata.userId);
      const amount = paymentIntent.amount;
      
      try {
        // Récupérer l'utilisateur
        const user = await db.query.users.findFirst({
          where: eq(users.id, userId)
        });
        
        if (!user) {
          console.error(`Utilisateur ${userId} non trouvé pour le paiement ${paymentIntent.id}`);
          return;
        }
        
        // Mettre à jour le solde de l'utilisateur
        await db.update(users)
          .set({ balance: user.balance + amount })
          .where(eq(users.id, userId));
        
        // Créer une transaction
        await db.insert(transactions).values({
          userId,
          amount,
          type: "deposit",
          status: "completed",
          description: `Dépôt via Stripe - ${amount/100}€`,
          createdAt: new Date()
        });
        
        console.log(`Solde de l'utilisateur ${userId} mis à jour: +${amount/100}€`);
      } catch (error) {
        console.error(`Erreur lors du traitement du paiement ${paymentIntent.id}:`, error);
      }
    }
  }

  async function handlePaymentIntentFailed(paymentIntent: any) {
    console.log("Paiement échoué:", paymentIntent.id);
    
    // Enregistrer l'échec dans les journaux
    if (paymentIntent.metadata && paymentIntent.metadata.userId) {
      const userId = parseInt(paymentIntent.metadata.userId);
      
      try {
        // Créer une transaction échouée
        await db.insert(transactions).values({
          userId,
          amount: paymentIntent.amount,
          type: "deposit",
          status: "failed",
          description: `Dépôt échoué via Stripe - ${paymentIntent.amount/100}€`,
          createdAt: new Date()
        });
      } catch (error) {
        console.error(`Erreur lors de l'enregistrement de l'échec du paiement ${paymentIntent.id}:`, error);
      }
    }
  }

  async function handleChargeRefunded(charge: any) {
    console.log("Remboursement:", charge.id);
    
    // Trouver la transaction originale et l'utilisateur
    if (charge.payment_intent && charge.amount_refunded > 0) {
      try {
        const paymentIntent = await stripe?.paymentIntents.retrieve(charge.payment_intent);
        
        if (paymentIntent?.metadata.userId) {
          const userId = parseInt(paymentIntent.metadata.userId);
          const refundAmount = charge.amount_refunded;
          
          // Trouver l'utilisateur
          const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
          });
          
          if (!user) {
            console.error(`Utilisateur ${userId} non trouvé pour le remboursement ${charge.id}`);
            return;
          }
          
          // Mettre à jour le solde de l'utilisateur (déduire le montant remboursé)
          await db.update(users)
            .set({ balance: Math.max(0, user.balance - refundAmount) })
            .where(eq(users.id, userId));
          
          // Créer une transaction de remboursement
          await db.insert(transactions).values({
            userId,
            amount: -refundAmount,
            type: "refund",
            status: "completed",
            description: `Remboursement via Stripe - ${refundAmount/100}€`,
            createdAt: new Date()
          });
          
          console.log(`Remboursement traité pour l'utilisateur ${userId}: -${refundAmount/100}€`);
        }
      } catch (error) {
        console.error(`Erreur lors du traitement du remboursement ${charge.id}:`, error);
      }
    }
  }

  async function handleSubscriptionCreated(subscription: any) {
    console.log("Abonnement créé:", subscription.id);
    
    if (subscription.customer) {
      try {
        // Trouver l'utilisateur par son ID client Stripe
        const user = await getUserByStripeCustomerId(subscription.customer);
        
        if (user) {
          // Mettre à jour les informations d'abonnement
          await db.update(users)
            .set({
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: subscription.status
            })
            .where(eq(users.id, user.id));
          
          console.log(`Abonnement ${subscription.id} créé pour l'utilisateur ${user.id}`);
        }
      } catch (error) {
        console.error(`Erreur lors du traitement de la création d'abonnement ${subscription.id}:`, error);
      }
    }
  }

  async function handleSubscriptionUpdated(subscription: any) {
    console.log("Abonnement mis à jour:", subscription.id);
    
    try {
      // Trouver l'utilisateur par son ID d'abonnement
      const user = await db.query.users.findFirst({
        where: eq(users.stripeSubscriptionId, subscription.id)
      });
      
      if (user) {
        // Mettre à jour le statut de l'abonnement
        await db.update(users)
          .set({ subscriptionStatus: subscription.status })
          .where(eq(users.id, user.id));
        
        console.log(`Statut d'abonnement mis à jour pour l'utilisateur ${user.id}: ${subscription.status}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'abonnement ${subscription.id}:`, error);
    }
  }

  async function handleSubscriptionDeleted(subscription: any) {
    console.log("Abonnement supprimé:", subscription.id);
    
    try {
      // Trouver l'utilisateur par son ID d'abonnement
      const user = await db.query.users.findFirst({
        where: eq(users.stripeSubscriptionId, subscription.id)
      });
      
      if (user) {
        // Marquer l'abonnement comme résilié
        await db.update(users)
          .set({
            subscriptionStatus: "canceled",
            stripeSubscriptionId: null
          })
          .where(eq(users.id, user.id));
        
        console.log(`Abonnement résilié pour l'utilisateur ${user.id}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'abonnement ${subscription.id}:`, error);
    }
  }

  async function handleInvoicePaymentSucceeded(invoice: any) {
    console.log("Paiement de facture réussi:", invoice.id);
    
    if (invoice.subscription && invoice.customer) {
      try {
        // Trouver l'utilisateur par son ID client Stripe
        const user = await getUserByStripeCustomerId(invoice.customer);
        
        if (user) {
          // Mettre à jour la date de fin d'abonnement si disponible
          if (invoice.lines && invoice.lines.data && invoice.lines.data.length > 0) {
            const periodEnd = invoice.lines.data[0].period?.end;
            
            if (periodEnd) {
              await db.update(users)
                .set({
                  subscriptionEndDate: new Date(periodEnd * 1000),
                  subscriptionStatus: "active"
                })
                .where(eq(users.id, user.id));
              
              console.log(`Date de fin d'abonnement mise à jour pour l'utilisateur ${user.id}`);
            }
          }
        }
      } catch (error) {
        console.error(`Erreur lors du traitement du paiement de facture ${invoice.id}:`, error);
      }
    }
  }

  async function handleInvoicePaymentFailed(invoice: any) {
    console.log("Paiement de facture échoué:", invoice.id);
    
    if (invoice.subscription && invoice.customer) {
      try {
        // Trouver l'utilisateur par son ID client Stripe
        const user = await getUserByStripeCustomerId(invoice.customer);
        
        if (user) {
          // Marquer l'abonnement comme ayant un problème de paiement
          await db.update(users)
            .set({ subscriptionStatus: "past_due" })
            .where(eq(users.id, user.id));
          
          console.log(`Problème de paiement d'abonnement pour l'utilisateur ${user.id}`);
        }
      } catch (error) {
        console.error(`Erreur lors du traitement de l'échec de paiement de facture ${invoice.id}:`, error);
      }
    }
  }

  // Récupération de l'utilisateur à partir de l'ID client Stripe
  async function getUserByStripeCustomerId(customerId: string) {
    try {
      return await db.query.users.findFirst({
        where: eq(users.stripeCustomerId, customerId)
      });
    } catch (error) {
      console.error(`Erreur lors de la recherche de l'utilisateur par Stripe ID ${customerId}:`, error);
      return null;
    }
  }

  // Importer et configurer les routes de recommandation et défis
  app.use('/api/recommendations', recommendationRoutes);
  app.use('/api/challenges', challengeRoutes);

  // Créer un serveur HTTP
  const httpServer = createServer(app);

  // Configurer le serveur WebSocket
  const WebSocketServer = WebSocket.Server;
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: "/ws",
    clientTracking: true
  });

  wss.on("connection", (ws: WebSocket) => {
    console.log("Nouvelle connexion WebSocket");
    let userId: number | null = null;
    let gameId: number | null = null;

    ws.on("message", (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log("Message reçu:", data);

        // Authentification
        if (data.type === "AUTH" && data.token) {
          // À implémenter: vérifier le token et récupérer l'ID utilisateur
          // Pour l'instant, on accepte juste l'ID fourni
          userId = data.userId;
          if (userId) {
            gameService.addUserConnection(userId, ws);
            ws.send(JSON.stringify({ type: "AUTH_SUCCESS", userId }));
          }
        }

        // Rejoindre une partie
        if (data.type === "JOIN_GAME" && data.gameId) {
          gameId = data.gameId;
          gameService.addGameConnection(gameId, ws);
          ws.send(JSON.stringify({ type: "JOINED_GAME", gameId }));
        }

        // Annoncer une quine
        if (data.type === "CLAIM_QUINE" && data.gameId && data.cardId && userId) {
          // Confirmation immédiate de la réception de la réclamation
          ws.send(JSON.stringify({ type: "CLAIM_RECEIVED", claim: "quine" }));
          
          try {
            // Validation automatique de la quine
            const { validateQuine } = require('./utils/bingoValidator');
            
            // Récupérer les données nécessaires
            const game = await db.query('SELECT * FROM games WHERE id = $1', [data.gameId]);
            const card = await db.query('SELECT * FROM cards WHERE id = $1', [data.cardId]);
            const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
            
            if (game.rows.length && card.rows.length && user.rows.length) {
              // Valider la quine
              const validationResult = validateQuine(game.rows[0], card.rows[0], user.rows[0]);
              
              // Envoyer le résultat de la validation
              ws.send(JSON.stringify({ 
                type: "CLAIM_VALIDATED", 
                claim: "quine",
                result: validationResult
              }));
              
              // Si la validation est réussie, mettre à jour et notifier tous les joueurs
              if (validationResult.success) {
                // Mise à jour de la base de données
                await db.query(`
                  UPDATE games 
                  SET quine_winner_ids = array_append(quine_winner_ids, $1),
                      quine_card_ids = array_append(quine_card_ids, $2),
                      quine_number_count = COALESCE(quine_number_count, $3)
                  WHERE id = $4
                `, [userId, data.cardId, validationResult.callCount, data.gameId]);
                
                // Broadcast aux autres joueurs
                gameService.broadcast(data.gameId, {
                  type: "QUINE_VALIDATED",
                  userId: userId,
                  username: user.rows[0].username,
                  cardId: data.cardId,
                  callCount: validationResult.callCount
                });
              }
            }
          } catch (error) {
            console.error("Erreur lors de la validation de quine:", error);
          }
        }

        // Annoncer un bingo
        if (data.type === "CLAIM_BINGO" && data.gameId && data.cardId && userId) {
          // Confirmation immédiate de la réception de la réclamation
          ws.send(JSON.stringify({ type: "CLAIM_RECEIVED", claim: "bingo" }));
          
          try {
            // Validation automatique du bingo
            const { validateBingo } = require('./utils/bingoValidator');
            
            // Récupérer les données nécessaires
            const game = await db.query('SELECT * FROM games WHERE id = $1', [data.gameId]);
            const card = await db.query('SELECT * FROM cards WHERE id = $1', [data.cardId]);
            const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
            
            if (game.rows.length && card.rows.length && user.rows.length) {
              // Valider le bingo
              const validationResult = validateBingo(game.rows[0], card.rows[0], user.rows[0]);
              
              // Envoyer le résultat de la validation
              ws.send(JSON.stringify({ 
                type: "CLAIM_VALIDATED", 
                claim: "bingo",
                result: validationResult
              }));
              
              // Si la validation est réussie, mettre à jour et notifier tous les joueurs
              if (validationResult.success) {
                // Mise à jour de la base de données
                await db.query(`
                  UPDATE games 
                  SET bingo_winner_ids = array_append(bingo_winner_ids, $1),
                      bingo_card_ids = array_append(bingo_card_ids, $2),
                      bingo_number_count = COALESCE(bingo_number_count, $3),
                      jackpot_won = $4
                  WHERE id = $5
                `, [userId, data.cardId, validationResult.callCount, validationResult.jackpotWon, data.gameId]);
                
                // Gérer le jackpot si gagné
                if (validationResult.jackpotWon) {
                  // Obtenir le montant actuel du jackpot
                  const jackpotResult = await db.query('SELECT amount FROM jackpot LIMIT 1');
                  if (jackpotResult.rows.length) {
                    validationResult.jackpotAmount = jackpotResult.rows[0].amount;
                    
                    // Réinitialiser le jackpot
                    await db.query('UPDATE jackpot SET amount = 0, last_updated = NOW()');
                  }
                }
                
                // Broadcast aux autres joueurs
                gameService.broadcast(data.gameId, {
                  type: "BINGO_VALIDATED",
                  userId: userId,
                  username: user.rows[0].username,
                  cardId: data.cardId,
                  callCount: validationResult.callCount,
                  jackpotWon: validationResult.jackpotWon,
                  jackpotAmount: validationResult.jackpotAmount
                });
                
                // Terminer le jeu si un bingo a été validé
                await db.query(`
                  UPDATE games 
                  SET status = 'completed', end_time = NOW()
                  WHERE id = $1 AND status = 'active'
                `, [data.gameId]);
              }
            }
          } catch (error) {
            console.error("Erreur lors de la validation de bingo:", error);
          }
        }
      } catch (error) {
        console.error("Erreur de traitement du message WebSocket:", error);
      }
    });

    ws.on("close", () => {
      console.log("Connexion WebSocket fermée");
      gameService.removeConnection(userId, gameId, ws);
    });
  });

  return httpServer;
}