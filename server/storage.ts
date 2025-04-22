import { 
  User, InsertUser, 
  Card, InsertCard, 
  Game, InsertGame, 
  Transaction, InsertTransaction, 
  Jackpot, OrganizerWallet, InsertOrganizerWallet,
  CardTheme, AppTheme,
  UserDifficultyRecommendation, InsertUserDifficultyRecommendation
} from '../shared/schema';
import session from 'express-session';
import createMemoryStore from 'memorystore';

export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;

  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  getUsersWithQuery(query: Record<string, any>): Promise<User[]>;
  updateUserBalance(id: number, balance: number): Promise<User>;
  updateUserPassword(id: number, passwordHash: string): Promise<User>;
  updateStripeCustomerId(id: number, customerId: string): Promise<User>;
  updateUserSubscription(id: number, subscriptionData: {
    stripeSubscriptionId?: string | null;
    subscriptionStatus: string;
    subscriptionEndDate?: Date;
  }): Promise<User>;
  updateUserCardTheme(id: number, cardTheme: CardTheme): Promise<User>;
  updateUserAppTheme(id: number, appTheme: AppTheme): Promise<User>;
  getUserCount(): Promise<number>;
  
  // Card operations
  createCard(card: InsertCard): Promise<Card>;
  getCardById(id: number): Promise<Card | null>;
  getCardsByUserId(userId: number): Promise<Card[]>;
  getCardsByGameId(gameId: number): Promise<Card[]>;
  getCardsByUserAndGame(userId: number, gameId: number): Promise<Card[]>;
  
  // Game operations
  createGame(game: InsertGame): Promise<Game>;
  getGameById(id: number): Promise<Game | null>;
  getCurrentGame(): Promise<Game | null>;
  updateGameStatus(id: number, status: string): Promise<Game>;
  updateCalledNumbers(id: number, numbers: number[]): Promise<Game>;
  updateGamePrizes(id: number, prizes: {
    prize: number;
    bingoPrice: number;
    quinePrice: number;
    jackpotAmount: number;
    isSpecialGame: boolean;
  }): Promise<Game>;
  updateQuineWinner(id: number, userId: number, cardId: number, callCount: number): Promise<Game>;
  updateBingoWinner(id: number, userId: number, cardId: number, callCount: number, jackpotWon: boolean): Promise<Game>;
  getRecentGames(limit: number): Promise<Game[]>;
  getUpcomingGames(limit: number): Promise<Game[]>;
  
  // Blockchain verification operations
  updateGameVerification(gameId: number, verificationHash: string, blockchainTxHash: string): Promise<Game>;
  getGamesByBlockchainTxHash(blockchainTxHash: string): Promise<Game[]>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getTransactionsByStripeId(stripePaymentIntentId: string): Promise<Transaction[]>;
  getTransactionsByType(type: string, limit?: number): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction>;
  
  // Jackpot operations
  getJackpot(): Promise<Jackpot>;
  updateJackpot(amount: number): Promise<Jackpot>;
  getJackpotHistory(limit?: number): Promise<Transaction[]>;
  
  // Organizer Wallet operations
  getOrganizerWallet(): Promise<OrganizerWallet>;
  initializeOrganizerWallet(securityHash: string): Promise<OrganizerWallet>;
  updateOrganizerWalletBalance(amount: number): Promise<OrganizerWallet>;
  withdrawFromOrganizerWallet(amount: number): Promise<boolean>;
  
  // Difficulty recommendation operations
  createUserDifficultyRecommendation(recommendation: InsertUserDifficultyRecommendation): Promise<UserDifficultyRecommendation>;
  getUserDifficultyRecommendationById(id: number): Promise<UserDifficultyRecommendation | null>;
  getUserDifficultyRecommendationsByUserId(userId: number): Promise<UserDifficultyRecommendation[]>;
  getLatestUserDifficultyRecommendation(userId: number): Promise<UserDifficultyRecommendation | null>;
}

export class MemStorage implements IStorage {
  // Initialisation du sessionStore pour la gestion des sessions
  readonly sessionStore: session.Store;

  private users: User[] = [];
  private cards: Card[] = [];
  private games: Game[] = [];
  private transactions: Transaction[] = [];
  private jackpotData: Jackpot[] = [{ 
    id: 1, 
    amount: 0, 
    lastUpdated: new Date() 
  }];
  private organizerWalletData: OrganizerWallet[] = [];
  private userDifficultyRecommendations: UserDifficultyRecommendation[] = [];
  
  private nextIds = {
    user: 1,
    card: 1,
    game: 1,
    transaction: 1,
    recommendation: 1
  };

  constructor() {
    // Créer le memory store pour les sessions - expire après 24h
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 heures en millisecondes
    });
  }

  // User operations
  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.nextIds.user++,
      createdAt: new Date(),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      subscriptionEndDate: null,
      cardTheme: null,
      appTheme: null,
      email: user.email || null,
      passwordHash: user.passwordHash,
      username: user.username,
      balance: user.balance ?? 0,
      language: user.language ?? 'en'
    };
    this.users.push(newUser);
    return newUser;
  }

  async getUserById(id: number): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.users.find(user => user.username === username) || null;
  }
  
  async getUsersWithQuery(query: Record<string, any>): Promise<User[]> {
    // Filtrer les utilisateurs en fonction des critères de recherche
    return this.users.filter(user => {
      // Vérifier si tous les critères correspondent
      return Object.entries(query).every(([key, value]) => {
        // @ts-ignore - clé dynamique
        return user[key] === value;
      });
    });
  }

  async updateUserBalance(id: number, balance: number): Promise<User> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    user.balance = balance;
    return user;
  }
  
  async updateUserPassword(id: number, passwordHash: string): Promise<User> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    user.passwordHash = passwordHash;
    return user;
  }

  async updateStripeCustomerId(id: number, customerId: string): Promise<User> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    user.stripeCustomerId = customerId;
    return user;
  }
  
  async updateUserSubscription(id: number, subscriptionData: {
    stripeSubscriptionId?: string | null;
    subscriptionStatus: string;
    subscriptionEndDate?: Date;
  }): Promise<User> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    if (subscriptionData.stripeSubscriptionId !== undefined) {
      user.stripeSubscriptionId = subscriptionData.stripeSubscriptionId;
    }
    
    user.subscriptionStatus = subscriptionData.subscriptionStatus;
    
    if (subscriptionData.subscriptionEndDate) {
      user.subscriptionEndDate = subscriptionData.subscriptionEndDate;
    }
    
    return user;
  }

  async updateUserCardTheme(id: number, cardTheme: CardTheme): Promise<User> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    user.cardTheme = cardTheme;
    return user;
  }

  async updateUserAppTheme(id: number, appTheme: AppTheme): Promise<User> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    user.appTheme = appTheme;
    return user;
  }
  
  async getUserCount(): Promise<number> {
    return this.users.length;
  }

  // Card operations
  async createCard(card: InsertCard): Promise<Card> {
    const newCard: Card = {
      id: this.nextIds.card++,
      createdAt: new Date(),
      ...card
    };
    this.cards.push(newCard);
    return newCard;
  }
  
  async getCardById(id: number): Promise<Card | null> {
    return this.cards.find(card => card.id === id) || null;
  }

  async getCardsByUserId(userId: number): Promise<Card[]> {
    return this.cards.filter(card => card.userId === userId);
  }

  async getCardsByGameId(gameId: number): Promise<Card[]> {
    return this.cards.filter(card => card.gameId === gameId);
  }

  async getCardsByUserAndGame(userId: number, gameId: number): Promise<Card[]> {
    return this.cards.filter(card => card.userId === userId && card.gameId === gameId);
  }

  // Game operations
  async createGame(game: InsertGame): Promise<Game> {
    const newGame: Game = {
      id: this.nextIds.game++,
      endTime: null,
      quineWinnerIds: [],
      quineCardIds: [],
      quineNumberCount: null,
      bingoWinnerIds: [],
      bingoCardIds: [],
      bingoNumberCount: null,
      jackpotWon: false,
      prize: 0,
      quinePrice: null,
      bingoPrice: null,
      jackpotAmount: null,
      verificationHash: null,
      blockchainTxHash: null,
      ...game
    };
    this.games.push(newGame);
    return newGame;
  }

  async getGameById(id: number): Promise<Game | null> {
    return this.games.find(game => game.id === id) || null;
  }

  async getCurrentGame(): Promise<Game | null> {
    // Return the most recent active game, or scheduled game if no active games
    const activeGame = [...this.games]
      .filter(game => game.status === 'active')
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
    
    if (activeGame) return activeGame;
    
    const scheduledGames = [...this.games]
      .filter(game => game.status === 'scheduled')
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    return scheduledGames[0] || null;
  }

  async updateGameStatus(id: number, status: string): Promise<Game> {
    const game = await this.getGameById(id);
    if (!game) {
      throw new Error(`Game with ID ${id} not found`);
    }
    game.status = status;
    
    if (status === 'completed') {
      game.endTime = new Date();
      
      // Si le jeu a un prix, transférer 20% au portefeuille de l'organisateur
      if (game.prize > 0) {
        try {
          // Vérifier si le portefeuille de l'organisateur existe
          let organizerWallet;
          try {
            organizerWallet = await this.getOrganizerWallet();
          } catch (error) {
            // Si le portefeuille n'existe pas, l'initialiser avec un hash de sécurité
            // Idéalement, ce hash devrait être généré de manière sécurisée
            const securityHash = Buffer.from(Date.now().toString()).toString('base64');
            organizerWallet = await this.initializeOrganizerWallet(securityHash);
          }
          
          // Calculer la part de l'organisateur (20% du prix total)
          const organizerShare = Math.floor(game.prize * 0.2);
          
          // Mettre à jour le portefeuille de l'organisateur
          await this.updateOrganizerWalletBalance(organizerShare);
        } catch (error) {
          console.error("Erreur lors de la mise à jour du portefeuille organisateur:", error);
        }
      }
    }
    
    return game;
  }

  async updateCalledNumbers(id: number, numbers: number[]): Promise<Game> {
    const game = await this.getGameById(id);
    if (!game) {
      throw new Error(`Game with ID ${id} not found`);
    }
    game.calledNumbers = numbers;
    return game;
  }
  
  async updateGamePrizes(id: number, prizes: {
    prize: number;
    bingoPrice: number;
    quinePrice: number;
    jackpotAmount: number;
    isSpecialGame: boolean;
  }): Promise<Game> {
    const game = await this.getGameById(id);
    if (!game) {
      throw new Error(`Game with ID ${id} not found`);
    }
    
    game.prize = prizes.prize;
    game.bingoPrice = prizes.bingoPrice;
    game.quinePrice = prizes.quinePrice;
    game.jackpotAmount = prizes.jackpotAmount;
    game.isSpecialGame = prizes.isSpecialGame;
    
    return game;
  }

  async updateQuineWinner(id: number, userId: number, cardId: number, callCount: number): Promise<Game> {
    const game = await this.getGameById(id);
    if (!game) {
      throw new Error(`Game with ID ${id} not found`);
    }
    
    // Initialiser les tableaux si nécessaire
    if (!game.quineWinnerIds) {
      game.quineWinnerIds = [];
    }
    if (!game.quineCardIds) {
      game.quineCardIds = [];
    }
    
    // Ajouter le nouveau gagnant s'il n'est pas déjà dans la liste
    if (!game.quineWinnerIds.includes(userId)) {
      game.quineWinnerIds.push(userId);
      game.quineCardIds.push(cardId);
    }
    
    // Enregistrer le nombre d'appels la première fois
    if (game.quineNumberCount === null || game.quineNumberCount === undefined) {
      game.quineNumberCount = callCount;
    }
    
    // Calculer le prix de la quine (20% du prix total divisé par le nombre de gagnants)
    if (game.prize && !game.quinePrice) {
      game.quinePrice = Math.floor(game.prize * 0.2);
    }
    
    return game;
  }

  async updateBingoWinner(id: number, userId: number, cardId: number, callCount: number, jackpotWon: boolean): Promise<Game> {
    const game = await this.getGameById(id);
    if (!game) {
      throw new Error(`Game with ID ${id} not found`);
    }
    
    // Initialiser les tableaux si nécessaire
    if (!game.bingoWinnerIds) {
      game.bingoWinnerIds = [];
    }
    if (!game.bingoCardIds) {
      game.bingoCardIds = [];
    }
    
    // Ajouter le nouveau gagnant s'il n'est pas déjà dans la liste
    if (!game.bingoWinnerIds.includes(userId)) {
      game.bingoWinnerIds.push(userId);
      game.bingoCardIds.push(cardId);
    }
    
    // Enregistrer le nombre d'appels la première fois
    if (game.bingoNumberCount === null || game.bingoNumberCount === undefined) {
      game.bingoNumberCount = callCount;
    }
    
    game.jackpotWon = jackpotWon;
    
    // Calculer le prix du bingo (50% du prix total divisé par le nombre de gagnants)
    if (game.prize && !game.bingoPrice) {
      game.bingoPrice = Math.floor(game.prize * 0.5);
    }
    
    // Add jackpot to prize if won
    if (jackpotWon) {
      const jackpot = await this.getJackpot();
      game.jackpotAmount = jackpot.amount;
      // Reset jackpot to 0 if won
      await this.updateJackpot(0);
    }
    
    return game;
  }

  async getRecentGames(limit: number): Promise<Game[]> {
    return [...this.games]
      .filter(game => game.status === 'completed')
      .sort((a, b) => b.endTime!.getTime() - a.endTime!.getTime())
      .slice(0, limit);
  }

  async getUpcomingGames(limit: number): Promise<Game[]> {
    const now = new Date();
    return [...this.games]
      .filter(game => game.status === 'scheduled' && game.startTime.getTime() > now.getTime())
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, limit);
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: this.nextIds.transaction++,
      createdAt: new Date(),
      ...transaction
    };
    this.transactions.push(newTransaction);
    return newTransaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return [...this.transactions]
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getTransactionsByStripeId(stripePaymentIntentId: string): Promise<Transaction[]> {
    return [...this.transactions]
      .filter(transaction => transaction.stripePaymentIntentId === stripePaymentIntentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getTransactionsByType(type: string, limit: number = 10): Promise<Transaction[]> {
    return [...this.transactions]
      .filter(transaction => transaction.type === type)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  async updateTransactionStatus(id: number, status: string): Promise<Transaction> {
    const transaction = this.transactions.find(t => t.id === id);
    
    if (!transaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    
    transaction.status = status;
    return transaction;
  }
  
  async getJackpotHistory(limit: number = 10): Promise<Transaction[]> {
    return this.getTransactionsByType('jackpot', limit);
  }

  // Jackpot operations
  async getJackpot(): Promise<Jackpot> {
    return this.jackpotData[0];
  }

  async updateJackpot(amount: number): Promise<Jackpot> {
    this.jackpotData[0].amount = amount;
    this.jackpotData[0].lastUpdated = new Date();
    return this.jackpotData[0];
  }

  // Organizer Wallet operations
  async getOrganizerWallet(): Promise<OrganizerWallet> {
    // Auto-initialisation du portefeuille s'il n'existe pas
    if (this.organizerWalletData.length === 0) {
      console.log('Auto-initializing organizer wallet');
      const securityHash = Buffer.from(Date.now().toString() + Math.random().toString()).toString('base64');
      return this.initializeOrganizerWallet(securityHash);
    }
    return this.organizerWalletData[0];
  }

  async initializeOrganizerWallet(securityHash: string): Promise<OrganizerWallet> {
    // S'assurer qu'un seul portefeuille organisateur existe
    if (this.organizerWalletData.length > 0) {
      throw new Error('Organizer wallet already initialized');
    }

    const newWallet: OrganizerWallet = {
      id: 1,
      balance: 0,
      lastUpdated: new Date(),
      securityHash: securityHash
    };

    this.organizerWalletData.push(newWallet);
    return newWallet;
  }

  async updateOrganizerWalletBalance(amount: number): Promise<OrganizerWallet> {
    const wallet = await this.getOrganizerWallet();
    wallet.balance += amount;
    wallet.lastUpdated = new Date();
    
    return wallet;
  }

  async withdrawFromOrganizerWallet(amount: number): Promise<boolean> {
    const wallet = await this.getOrganizerWallet();
    
    // Vérifier que le solde est suffisant
    if (wallet.balance < amount) {
      return false;
    }
    
    wallet.balance -= amount;
    wallet.lastUpdated = new Date();
    
    return true;
  }

  // Difficulty recommendation operations
  async createUserDifficultyRecommendation(recommendation: InsertUserDifficultyRecommendation): Promise<UserDifficultyRecommendation> {
    const newRecommendation: UserDifficultyRecommendation = {
      id: this.nextIds.recommendation++,
      createdAt: new Date(),
      ...recommendation
    };
    
    this.userDifficultyRecommendations.push(newRecommendation);
    return newRecommendation;
  }

  async getUserDifficultyRecommendationById(id: number): Promise<UserDifficultyRecommendation | null> {
    return this.userDifficultyRecommendations.find(rec => rec.id === id) || null;
  }

  async getUserDifficultyRecommendationsByUserId(userId: number): Promise<UserDifficultyRecommendation[]> {
    return [...this.userDifficultyRecommendations]
      .filter(rec => rec.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getLatestUserDifficultyRecommendation(userId: number): Promise<UserDifficultyRecommendation | null> {
    const userRecommendations = await this.getUserDifficultyRecommendationsByUserId(userId);
    return userRecommendations.length > 0 ? userRecommendations[0] : null;
  }

  // Blockchain verification operations
  async updateGameVerification(gameId: number, verificationHash: string, blockchainTxHash: string): Promise<Game> {
    const game = await this.getGameById(gameId);
    if (!game) {
      throw new Error(`Game with ID ${gameId} not found`);
    }
    
    // @ts-ignore - Ajout des champs qui ne sont pas dans l'interface de base
    game.verificationHash = verificationHash;
    // @ts-ignore
    game.blockchainTxHash = blockchainTxHash;
    
    return game;
  }
  
  async getGamesByBlockchainTxHash(blockchainTxHash: string): Promise<Game[]> {
    return this.games.filter(game => {
      // @ts-ignore - Accès à la propriété qui n'est pas dans l'interface de base
      return game.blockchainTxHash === blockchainTxHash;
    });
  }
}

export const storage = new MemStorage();