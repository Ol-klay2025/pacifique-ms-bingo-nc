import { createInsertSchema } from 'drizzle-zod';
import { pgTable, serial, text, integer, timestamp, boolean, json, real, date, varchar } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// Define types for customization options
export type CardTheme = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  font: string;
  borderRadius: string;
  numberStyle: string;
  animation: boolean;
  soundEffects: boolean;
  name?: string;
};

export type AppTheme = {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontFamily: string;
  borderRadius: string;
  animations: boolean;
};

// Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email'),
  passwordHash: text('password_hash').notNull(),
  balance: integer('balance').notNull().default(0),
  language: text('language').notNull().default('en'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status'),
  subscriptionEndDate: timestamp('subscription_end_date'),
  cardTheme: json('card_theme').$type<CardTheme>(),
  appTheme: json('app_theme').$type<AppTheme>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Bingo Cards Table
export const cards = pgTable('cards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  gameId: integer('game_id').notNull().references(() => games.id),
  numbers: json('numbers').$type<number[][]>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Games Table
export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  status: text('status').notNull().default('scheduled'), // scheduled, active, completed, canceled
  calledNumbers: json('called_numbers').$type<number[]>().notNull().default([]),
  // Champs modifiés pour supporter plusieurs gagnants
  quineWinnerIds: json('quine_winner_ids').$type<number[]>(), // Liste des IDs utilisateurs gagnants
  quineCardIds: json('quine_card_ids').$type<number[]>(), // Liste des IDs des cartes gagnantes
  quineNumberCount: integer('quine_number_count'),
  bingoWinnerIds: json('bingo_winner_ids').$type<number[]>(), // Liste des IDs utilisateurs gagnants
  bingoCardIds: json('bingo_card_ids').$type<number[]>(), // Liste des IDs des cartes gagnantes
  bingoNumberCount: integer('bingo_number_count'),
  jackpotWon: boolean('jackpot_won').notNull().default(false),
  prize: integer('prize').notNull().default(0),
  quinePrice: integer('quine_price'),
  bingoPrice: integer('bingo_price'),
  jackpotAmount: integer('jackpot_amount'),
  isSpecialGame: boolean('is_special_game').notNull().default(false),
  // Champs de vérification blockchain
  verificationHash: text('verification_hash'), // Hash cryptographique des résultats pour la vérification
  blockchainTxHash: text('blockchain_tx_hash'), // Hash de transaction blockchain
});

// Transactions Table
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // deposit, withdrawal, win, purchase
  amount: integer('amount').notNull(),
  status: text('status').notNull().default('pending'), // pending, completed, failed
  description: text('description'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Jackpot Table
export const jackpot = pgTable('jackpot', {
  id: serial('id').primaryKey(),
  amount: integer('amount').notNull().default(0),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
});

// Organizer Wallet Table
export const organizerWallet = pgTable('organizer_wallet', {
  id: serial('id').primaryKey(),
  balance: integer('balance').notNull().default(0),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
  securityHash: text('security_hash').notNull(),
});

// User Difficulty Recommendations Table
export const userDifficultyRecommendations = pgTable('user_difficulty_recommendations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  recommendedLevel: text('recommended_level').notNull(),
  recommendedCardCount: integer('recommended_card_count').notNull(),
  confidence: real('confidence').notNull(),
  factorsAnalysis: json('factors_analysis').$type<Record<string, { score: number; description: string }>>().notNull(),
  previousLevel: text('previous_level'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// System Settings Table
export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  regularGamePrice: integer('regular_game_price').notNull().default(100), // 1€
  specialGamePrice: integer('special_game_price').notNull().default(250), // 2.5€
  bingoPercentage: integer('bingo_percentage').notNull().default(50),
  quinePercentage: integer('quine_percentage').notNull().default(20),
  jackpotPercentage: integer('jackpot_percentage').notNull().default(10),
  platformPercentage: integer('platform_percentage').notNull().default(20),
  minimumWithdrawal: integer('minimum_withdrawal').notNull().default(1000), // 10€
  targetRegisteredUsers: integer('target_registered_users').notNull().default(1000),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Pré-inscriptions Table
export const preRegistrations = pgTable('pre_registrations', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  source: text('source').default('website'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Daily Challenges Table
export const dailyChallenges = pgTable('daily_challenges', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  difficultyLevel: text('difficulty_level').notNull(), // beginner, intermediate, advanced, expert, master
  rewardAmount: integer('reward_amount').notNull(),
  requiredPatternType: text('required_pattern_type').notNull(), // line, diagonal, corners, full, specific
  requiredPattern: json('required_pattern').$type<number[][]>(), // Required for 'specific' pattern type
  maxNumberCalls: integer('max_number_calls'), // Maximum number of called numbers to complete challenge (null for no limit)
  activeDate: date('active_date').notNull(), // The date when this challenge is active
  expirationDate: date('expiration_date').notNull(), // The date when this challenge expires
  isRecurring: boolean('is_recurring').default(false), // Whether this challenge repeats (weekly, monthly)
  recurrencePattern: text('recurrence_pattern'), // daily, weekly_monday, monthly_first, etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// User Challenge Participation Table
export const userChallenges = pgTable('user_challenges', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  challengeId: integer('challenge_id').notNull().references(() => dailyChallenges.id),
  cardId: integer('card_id').references(() => cards.id), // The card chosen for this challenge (optional as user might select later)
  gameId: integer('game_id').references(() => games.id), // The game played for this challenge
  status: text('status').notNull().default('pending'), // pending, in_progress, completed, failed, expired
  progress: json('progress').$type<{ pattern: number[][], completed: boolean[] }>(), // Track progress for complex patterns
  completedAt: timestamp('completed_at'), // When the challenge was completed
  rewardClaimed: boolean('reward_claimed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Zod schemas for inserting data
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  subscriptionStatus: true,
  subscriptionEndDate: true
});
export const insertCardSchema = createInsertSchema(cards).omit({ id: true, createdAt: true });
export const insertGameSchema = createInsertSchema(games).omit({ 
  id: true, 
  endTime: true, 
  quineWinnerIds: true,
  quineCardIds: true,
  quineNumberCount: true,
  bingoWinnerIds: true,
  bingoCardIds: true,
  bingoNumberCount: true,
  jackpotWon: true,
  verificationHash: true,
  blockchainTxHash: true
});
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertJackpotSchema = createInsertSchema(jackpot).omit({ id: true, lastUpdated: true });
export const insertOrganizerWalletSchema = createInsertSchema(organizerWallet).omit({ id: true, lastUpdated: true });
export const insertUserDifficultyRecommendationSchema = createInsertSchema(userDifficultyRecommendations).omit({ id: true, createdAt: true });
export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({ id: true, updatedAt: true });
export const insertPreRegistrationSchema = createInsertSchema(preRegistrations).omit({ id: true, createdAt: true });
export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({ id: true, createdAt: true });
export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({ id: true, createdAt: true, completedAt: true });

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cards.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertJackpot = z.infer<typeof insertJackpotSchema>;
export type Jackpot = typeof jackpot.$inferSelect;

export type InsertOrganizerWallet = z.infer<typeof insertOrganizerWalletSchema>;
export type OrganizerWallet = typeof organizerWallet.$inferSelect;

export type InsertUserDifficultyRecommendation = z.infer<typeof insertUserDifficultyRecommendationSchema>;
export type UserDifficultyRecommendation = typeof userDifficultyRecommendations.$inferSelect;

export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type SystemSettings = typeof systemSettings.$inferSelect;

export type InsertPreRegistration = z.infer<typeof insertPreRegistrationSchema>;
export type PreRegistration = typeof preRegistrations.$inferSelect;

export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;

export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
export type UserChallenge = typeof userChallenges.$inferSelect;

// KYC Tables
export const kycVerifications = pgTable('kyc_verifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  status: text('status').notNull().default('pending'), // pending, approved, rejected
  verificationLevel: text('verification_level').notNull().default('basic'), // basic, enhanced, full
  rejectionReason: text('rejection_reason'),
  reviewedBy: integer('reviewed_by'), // Admin ID who reviewed this verification
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const kycDocuments = pgTable('kyc_documents', {
  id: serial('id').primaryKey(),
  kycVerificationId: integer('kyc_verification_id').notNull().references(() => kycVerifications.id),
  documentType: text('document_type').notNull(), // identity_card, passport, driver_license, proof_of_address, selfie
  documentNumber: varchar('document_number', { length: 100 }),
  documentCountry: varchar('document_country', { length: 2 }),
  documentExpiryDate: timestamp('document_expiry_date'),
  documentPath: text('document_path').notNull(), // path to the stored document
  verificationStatus: text('verification_status').notNull().default('pending'), // pending, verified, rejected
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const kycLogs = pgTable('kyc_logs', {
  id: serial('id').primaryKey(),
  kycVerificationId: integer('kyc_verification_id').notNull().references(() => kycVerifications.id),
  action: text('action').notNull(), // document_upload, status_change, verification_request, admin_review
  details: json('details').$type<Record<string, any>>(),
  performedBy: integer('performed_by'), // User ID who performed this action (could be admin or user)
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Zod schemas for KYC
export const insertKycVerificationSchema = createInsertSchema(kycVerifications).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  reviewedAt: true 
});
export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({ id: true, createdAt: true });
export const insertKycLogSchema = createInsertSchema(kycLogs).omit({ id: true, createdAt: true });

// TypeScript types for KYC
export type InsertKycVerification = z.infer<typeof insertKycVerificationSchema>;
export type KycVerification = typeof kycVerifications.$inferSelect;

export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type KycDocument = typeof kycDocuments.$inferSelect;

export type InsertKycLog = z.infer<typeof insertKycLogSchema>;
export type KycLog = typeof kycLogs.$inferSelect;

// AML - Tables Anti-Money Laundering
export const amlFlags = pgTable('aml_flags', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  severity: text('severity').notNull(), // low, medium, high, critical
  status: text('status').notNull().default('open'), // open, under_review, resolved, dismissed
  category: text('category').notNull(), // structured_deposits, rapid_withdrawal, suspicious_pattern, high_volume, etc.
  description: text('description').notNull(),
  details: json('details').$type<Record<string, any>>(),
  reviewedBy: integer('reviewed_by'), // Admin ID who reviewed this flag
  resolutionNotes: text('resolution_notes'),
  detectedAt: timestamp('detected_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at'),
});

export const amlTransactionReviews = pgTable('aml_transaction_reviews', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id').notNull().references(() => transactions.id),
  reviewStatus: text('review_status').notNull().default('pending'), // pending, approved, rejected, flagged
  riskScore: integer('risk_score').notNull().default(0), // 0-100
  reviewNotes: text('review_notes'),
  reviewedBy: integer('reviewed_by'), // Admin ID who reviewed this transaction
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const riskProfiles = pgTable('risk_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id).unique(),
  riskLevel: text('risk_level').notNull().default('standard'), // low, standard, elevated, high
  lastAssessmentDate: timestamp('last_assessment_date').notNull().defaultNow(),
  monthlyDepositLimit: integer('monthly_deposit_limit'),
  monthlyWithdrawalLimit: integer('monthly_withdrawal_limit'),
  requiresEnhancedDueDiligence: boolean('requires_enhanced_due_diligence').notNull().default(false),
  notes: text('notes'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const bankingMethods = pgTable('banking_methods', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  methodType: text('method_type').notNull(), // bank_account, credit_card, wallet, etc.
  status: text('status').notNull().default('pending_verification'), // pending_verification, verified, rejected, disabled
  details: json('details').$type<Record<string, any>>().notNull(), // Encrypted banking details
  isDefault: boolean('is_default').notNull().default(false),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const depositRequests = pgTable('deposit_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  methodId: integer('method_id').references(() => bankingMethods.id),
  amount: integer('amount').notNull(),
  status: text('status').notNull().default('pending'), // pending, processing, completed, failed, canceled
  transactionReference: text('transaction_reference'),
  transactionId: integer('transaction_id').references(() => transactions.id),
  metadata: json('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const withdrawalRequests = pgTable('withdrawal_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  methodId: integer('method_id').references(() => bankingMethods.id),
  amount: integer('amount').notNull(),
  status: text('status').notNull().default('pending'), // pending, approved, processing, completed, rejected
  rejectionReason: text('rejection_reason'),
  transactionReference: text('transaction_reference'),
  transactionId: integer('transaction_id').references(() => transactions.id),
  reviewedBy: integer('reviewed_by'), // Admin ID who reviewed this withdrawal
  metadata: json('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const amlActivityLogs = pgTable('aml_activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  action: text('action').notNull(), // login, game_played, deposit, withdrawal, profile_update, etc.
  ipAddress: text('ip_address'),
  location: text('location'), // Country/city derived from IP
  deviceInfo: text('device_info'),
  metadata: json('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Zod schemas for AML
export const insertAmlFlagSchema = createInsertSchema(amlFlags).omit({ 
  id: true, 
  detectedAt: true, 
  updatedAt: true,
  resolvedAt: true
});
export const insertAmlTransactionReviewSchema = createInsertSchema(amlTransactionReviews).omit({ id: true, createdAt: true, reviewedAt: true });
export const insertRiskProfileSchema = createInsertSchema(riskProfiles).omit({ id: true, lastAssessmentDate: true, updatedAt: true });
export const insertBankingMethodSchema = createInsertSchema(bankingMethods).omit({ id: true, createdAt: true, updatedAt: true, verifiedAt: true });
export const insertDepositRequestSchema = createInsertSchema(depositRequests).omit({ id: true, createdAt: true, updatedAt: true, completedAt: true });
export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({ id: true, createdAt: true, updatedAt: true, completedAt: true });
export const insertAmlActivityLogSchema = createInsertSchema(amlActivityLogs).omit({ id: true, createdAt: true });

// GDPR Tables
export const gdprDeletionRequests = pgTable('gdpr_deletion_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  requestDate: timestamp('request_date').notNull().defaultNow(),
  completionDate: timestamp('completion_date'),
  reason: text('reason'),
  status: text('status').notNull().default('pending'), // 'pending', 'completed', 'rejected'
  adminNotes: text('admin_notes'),
});

export const gdprExportRequests = pgTable('gdpr_export_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  requestDate: timestamp('request_date').notNull().defaultNow(),
  status: text('status').notNull().default('pending'), // 'pending', 'completed', 'rejected'
  format: text('format').notNull().default('json'), // 'json', 'csv', 'xml'
});

export const userCookiePreferences = pgTable('user_cookie_preferences', {
  userId: integer('user_id').primaryKey().references(() => users.id),
  necessary: boolean('necessary').notNull().default(true), // Toujours true, car nécessaires au fonctionnement
  functional: boolean('functional').notNull().default(false),
  analytics: boolean('analytics').notNull().default(false),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Zod schemas for GDPR
export const insertGdprDeletionRequestSchema = createInsertSchema(gdprDeletionRequests).omit({ 
  id: true, 
  completionDate: true,
  requestDate: true
});
export const insertGdprExportRequestSchema = createInsertSchema(gdprExportRequests).omit({ id: true, requestDate: true });
export const insertUserCookiePreferencesSchema = createInsertSchema(userCookiePreferences).omit({ updatedAt: true });

// TypeScript types for GDPR
export type InsertGdprDeletionRequest = z.infer<typeof insertGdprDeletionRequestSchema>;
export type GdprDeletionRequest = typeof gdprDeletionRequests.$inferSelect;

export type InsertGdprExportRequest = z.infer<typeof insertGdprExportRequestSchema>;
export type GdprExportRequest = typeof gdprExportRequests.$inferSelect;

export type InsertUserCookiePreferences = z.infer<typeof insertUserCookiePreferencesSchema>;
export type UserCookiePreferences = typeof userCookiePreferences.$inferSelect;

// TypeScript types for AML
export type InsertAmlFlag = z.infer<typeof insertAmlFlagSchema>;
export type AmlFlag = typeof amlFlags.$inferSelect;

export type InsertAmlTransactionReview = z.infer<typeof insertAmlTransactionReviewSchema>;
export type AmlTransactionReview = typeof amlTransactionReviews.$inferSelect;

export type InsertRiskProfile = z.infer<typeof insertRiskProfileSchema>;
export type RiskProfile = typeof riskProfiles.$inferSelect;

export type InsertBankingMethod = z.infer<typeof insertBankingMethodSchema>;
export type BankingMethod = typeof bankingMethods.$inferSelect;

export type InsertDepositRequest = z.infer<typeof insertDepositRequestSchema>;
export type DepositRequest = typeof depositRequests.$inferSelect;

export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;

export type InsertAmlActivityLog = z.infer<typeof insertAmlActivityLogSchema>;
export type AmlActivityLog = typeof amlActivityLogs.$inferSelect;