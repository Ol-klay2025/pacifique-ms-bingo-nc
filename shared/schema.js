/**
 * Schémas de données partagés pour MS BINGO
 * 
 * Ce module définit les schémas de données utilisés par l'application,
 * à la fois côté client et côté serveur.
 */

const { pgTable, serial, text, integer, timestamp, boolean, json, pgEnum } = require('drizzle-orm/pg-core');
const { createInsertSchema } = require('drizzle-zod');
const { z } = require('zod');

// Énumérations
const gameTypeEnum = pgEnum('game_type', ['regular', 'special']);
const gameStatusEnum = pgEnum('game_status', ['scheduled', 'open', 'in_progress', 'completed', 'cancelled']);
const transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdrawal', 'game_purchase', 'winning', 'refund', 'bonus', 'fee']);
const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'cancelled']);
const withdrawalMethodEnum = pgEnum('withdrawal_method', ['bank_transfer', 'e_wallet', 'virtual_card']);
const difficultyLevelEnum = pgEnum('difficulty_level', ['beginner', 'easy', 'medium', 'hard', 'expert']);

// Tables
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  language: text('language').notNull().default('fr'),
  balance: integer('balance').notNull().default(0), // en centimes
  isAdmin: boolean('is_admin').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastLogin: timestamp('last_login'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id')
});

const games = pgTable('games', {
  id: serial('id').primaryKey(),
  externalId: text('external_id').notNull().unique(),
  type: gameTypeEnum('type').notNull(),
  status: gameStatusEnum('status').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  drawnNumbers: json('drawn_numbers').$type(),
  totalCards: integer('total_cards').notNull().default(0),
  totalPlayers: integer('total_players').notNull().default(0),
  totalPrize: integer('total_prize').notNull().default(0), // en centimes
  quineWinners: json('quine_winners').$type(),
  bingoWinners: json('bingo_winners').$type(),
  jackpotWon: boolean('jackpot_won').notNull().default(false),
  jackpotWinners: json('jackpot_winners').$type(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

const cards = pgTable('cards', {
  id: serial('id').primaryKey(),
  externalId: text('external_id').notNull().unique(),
  gameId: integer('game_id').notNull().references(() => games.id),
  userId: integer('user_id').notNull().references(() => users.id),
  numbers: json('numbers').$type(), // Grille 9x3
  quineAchieved: boolean('quine_achieved').notNull().default(false),
  bingoAchieved: boolean('bingo_achieved').notNull().default(false),
  jackpotAchieved: boolean('jackpot_achieved').notNull().default(false),
  quineAt: integer('quine_at'), // Indice du numéro tiré
  bingoAt: integer('bingo_at'), // Indice du numéro tiré
  purchased: timestamp('purchased').notNull().defaultNow()
});

const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  externalId: text('external_id').notNull().unique(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: transactionTypeEnum('type').notNull(),
  amount: integer('amount').notNull(), // en centimes
  status: transactionStatusEnum('status').notNull(),
  description: text('description'),
  metadata: json('metadata').$type(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
});

const withdrawals = pgTable('withdrawals', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id').notNull().references(() => transactions.id),
  userId: integer('user_id').notNull().references(() => users.id),
  method: withdrawalMethodEnum('method').notNull(),
  details: json('details').$type(),
  status: transactionStatusEnum('status').notNull(),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
});

const recommendations = pgTable('recommendations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  recommendedLevel: difficultyLevelEnum('recommended_level').notNull(),
  recommendedCardCount: integer('recommended_card_count').notNull(),
  confidence: integer('confidence').notNull(), // 0-100
  factors: json('factors').$type(),
  previousLevel: difficultyLevelEnum('previous_level'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Schémas Zod pour la validation
const insertUserSchema = createInsertSchema(users, {
  password: z.string().min(8),
  email: z.string().email(),
  username: z.string().min(3).max(50)
}).omit({ id: true, createdAt: true, lastLogin: true });

const insertGameSchema = createInsertSchema(games).omit({ id: true, createdAt: true });
const insertCardSchema = createInsertSchema(cards).omit({ id: true, purchased: true });
const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, updatedAt: true });
const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({ id: true, createdAt: true, updatedAt: true, processedAt: true });
const insertRecommendationSchema = createInsertSchema(recommendations).omit({ id: true, createdAt: true });

module.exports = {
  // Tables
  users,
  games,
  cards,
  transactions,
  withdrawals,
  recommendations,
  
  // Énumérations
  gameTypeEnum,
  gameStatusEnum,
  transactionTypeEnum,
  transactionStatusEnum,
  withdrawalMethodEnum,
  difficultyLevelEnum,
  
  // Schémas d'insertion
  insertUserSchema,
  insertGameSchema,
  insertCardSchema,
  insertTransactionSchema,
  insertWithdrawalSchema,
  insertRecommendationSchema
};