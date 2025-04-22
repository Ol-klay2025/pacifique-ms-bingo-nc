/**
 * Service d'auto-exclusion et de limitation volontaire pour MS BINGO
 * Version: Avril 2025
 * 
 * Ce service permet aux joueurs de définir des limites personnelles 
 * ou de s'auto-exclure temporairement ou définitivement du jeu.
 */

const fs = require('fs');
const path = require('path');

/**
 * Service d'auto-exclusion et de limitation
 */
class SelfExclusionService {
  constructor(db, options = {}) {
    this.db = db;
    this.config = {
      notifyOnLimitReached: options.notifyOnLimitReached !== undefined ? options.notifyOnLimitReached : true,
      minExclusionPeriod: options.minExclusionPeriod || 24 * 60 * 60 * 1000, // 24 heures par défaut
      maxDailyLimit: options.maxDailyLimit || 1000, // Limite maximale quotidienne (₣)
      maxWeeklyLimit: options.maxWeeklyLimit || 5000, // Limite maximale hebdomadaire (₣)
      enforceCooldown: options.enforceCooldown !== undefined ? options.enforceCooldown : true,
      cooldownPeriod: options.cooldownPeriod || 24 * 60 * 60 * 1000, // 24 heures de réflexion avant de modifier les limites
      logsEnabled: options.logsEnabled !== undefined ? options.logsEnabled : true,
      logsDir: options.logsDir || path.join(__dirname, '../logs/exclusions'),
      ...options
    };

    // S'assurer que les tables existent
    this.initializeTables();

    // S'assurer que le répertoire de logs existe
    if (this.config.logsEnabled && !fs.existsSync(this.config.logsDir)) {
      fs.mkdirSync(this.config.logsDir, { recursive: true });
    }
  }

  /**
   * Initialise les tables nécessaires pour le service
   * @private
   */
  initializeTables() {
    return new Promise((resolve, reject) => {
      // Table des limites de jeu
      this.db.run(`
        CREATE TABLE IF NOT EXISTS player_limits (
          user_id INTEGER PRIMARY KEY,
          daily_limit INTEGER,
          weekly_limit INTEGER,
          session_time_limit INTEGER,
          created_at TEXT,
          updated_at TEXT,
          next_update_allowed TEXT
        )
      `, (err) => {
        if (err) {
          console.error('Erreur lors de la création de la table player_limits:', err);
          return reject(err);
        }

        // Table des auto-exclusions
        this.db.run(`
          CREATE TABLE IF NOT EXISTS self_exclusions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            start_date TEXT,
            end_date TEXT,
            is_permanent INTEGER,
            reason TEXT,
            created_at TEXT,
            UNIQUE(user_id, start_date)
          )
        `, (err) => {
          if (err) {
            console.error('Erreur lors de la création de la table self_exclusions:', err);
            return reject(err);
          }

          // Table des sessions de jeu (pour le suivi du temps)
          this.db.run(`
            CREATE TABLE IF NOT EXISTS play_sessions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER,
              start_time TEXT,
              end_time TEXT,
              duration INTEGER,
              ongoing INTEGER
            )
          `, (err) => {
            if (err) {
              console.error('Erreur lors de la création de la table play_sessions:', err);
              return reject(err);
            }

            // Table des historiques de mises (pour le suivi des limites)
            this.db.run(`
              CREATE TABLE IF NOT EXISTS bet_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                amount INTEGER,
                timestamp TEXT,
                game_id TEXT,
                transaction_type TEXT
              )
            `, (err) => {
              if (err) {
                console.error('Erreur lors de la création de la table bet_history:', err);
                return reject(err);
              }
              
              resolve();
            });
          });
        });
      });
    });
  }

  /**
   * Enregistre les routes de l'API d'auto-exclusion
   * @param {Express} app - Application Express
   * @param {Function} authMiddleware - Middleware d'authentification
   */
  registerRoutes(app, authMiddleware) {
    // Route pour obtenir les limites actuelles
    app.get('/api/self-exclusion/limits', authMiddleware, async (req, res) => {
      try {
        const userId = req.session.userId;
        const limits = await this.getUserLimits(userId);
        res.json(limits);
      } catch (error) {
        console.error('Erreur lors de la récupération des limites:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des limites', error: error.message });
      }
    });

    // Route pour définir des limites
    app.post('/api/self-exclusion/limits', authMiddleware, async (req, res) => {
      try {
        const userId = req.session.userId;
        const { dailyLimit, weeklyLimit, sessionTimeLimit } = req.body;

        // Valider les entrées
        if ((dailyLimit && dailyLimit <= 0) || 
            (weeklyLimit && weeklyLimit <= 0) || 
            (sessionTimeLimit && sessionTimeLimit <= 0)) {
          return res.status(400).json({ message: 'Les limites doivent être des valeurs positives' });
        }

        // Vérifier si la période de réflexion est respectée
        const canUpdate = await this.canUpdateLimits(userId);
        if (!canUpdate.allowed) {
          return res.status(403).json({ 
            message: 'Une période de réflexion est nécessaire avant de modifier vos limites',
            nextUpdateAllowed: canUpdate.nextUpdateAllowed
          });
        }

        // Définir les limites
        const result = await this.setUserLimits(userId, {
          dailyLimit: dailyLimit || null,
          weeklyLimit: weeklyLimit || null,
          sessionTimeLimit: sessionTimeLimit || null
        });

        res.json(result);
      } catch (error) {
        console.error('Erreur lors de la définition des limites:', error);
        res.status(500).json({ message: 'Erreur lors de la définition des limites', error: error.message });
      }
    });

    // Route pour s'auto-exclure
    app.post('/api/self-exclusion/exclude', authMiddleware, async (req, res) => {
      try {
        const userId = req.session.userId;
        const { duration, isPermanent, reason } = req.body;

        // Vérifier les paramètres
        if (!isPermanent && (!duration || duration < 0)) {
          return res.status(400).json({ message: 'La durée doit être une valeur positive' });
        }

        // Traiter l'auto-exclusion
        const result = await this.excludeUser(userId, {
          duration: duration * 24 * 60 * 60 * 1000, // Convertir les jours en millisecondes
          isPermanent: isPermanent === true,
          reason: reason || ''
        });

        // Déconnexion de la session en cours
        req.session.destroy();

        res.json(result);
      } catch (error) {
        console.error('Erreur lors de l\'auto-exclusion:', error);
        res.status(500).json({ message: 'Erreur lors de l\'auto-exclusion', error: error.message });
      }
    });

    // Route pour vérifier si un utilisateur peut jouer
    app.get('/api/self-exclusion/can-play', authMiddleware, async (req, res) => {
      try {
        const userId = req.session.userId;
        const result = await this.canUserPlay(userId);
        res.json(result);
      } catch (error) {
        console.error('Erreur lors de la vérification des permissions de jeu:', error);
        res.status(500).json({ message: 'Erreur lors de la vérification', error: error.message });
      }
    });

    // Route pour démarrer une session de jeu
    app.post('/api/self-exclusion/start-session', authMiddleware, async (req, res) => {
      try {
        const userId = req.session.userId;
        const session = await this.startPlaySession(userId);
        res.json(session);
      } catch (error) {
        console.error('Erreur lors du démarrage de la session:', error);
        res.status(500).json({ message: 'Erreur lors du démarrage de la session', error: error.message });
      }
    });

    // Route pour terminer une session de jeu
    app.post('/api/self-exclusion/end-session', authMiddleware, async (req, res) => {
      try {
        const userId = req.session.userId;
        const session = await this.endPlaySession(userId);
        res.json(session);
      } catch (error) {
        console.error('Erreur lors de la fin de la session:', error);
        res.status(500).json({ message: 'Erreur lors de la fin de la session', error: error.message });
      }
    });

    // Route pour enregistrer une mise
    app.post('/api/self-exclusion/record-bet', authMiddleware, async (req, res) => {
      try {
        const userId = req.session.userId;
        const { amount, gameId } = req.body;

        if (!amount || amount <= 0) {
          return res.status(400).json({ message: 'Le montant doit être une valeur positive' });
        }

        // Vérifier si l'utilisateur peut placer cette mise
        const canBet = await this.canPlaceBet(userId, amount);
        if (!canBet.allowed) {
          return res.status(403).json({ 
            message: canBet.reason,
            remainingDaily: canBet.remainingDaily,
            remainingWeekly: canBet.remainingWeekly
          });
        }

        // Enregistrer la mise
        const bet = await this.recordBet(userId, amount, gameId);
        res.json(bet);
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la mise:', error);
        res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la mise', error: error.message });
      }
    });

    // Route admin pour obtenir les statistiques d'auto-exclusion
    app.get('/api/self-exclusion/admin/stats', this.ensureAdmin, async (req, res) => {
      try {
        const stats = await this.getExclusionStats();
        res.json(stats);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
      }
    });
  }

  /**
   * Middleware pour vérifier si l'utilisateur est administrateur
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   * @param {Function} next - Fonction suivante
   */
  ensureAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
      return next();
    }
    
    res.status(403).json({ message: 'Accès refusé' });
  }

  /**
   * Récupère les limites actuelles d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Limites actuelles
   */
  async getUserLimits(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM player_limits WHERE user_id = ?`,
        [userId],
        async (err, row) => {
          if (err) return reject(err);

          if (!row) {
            // Aucune limite définie, créer un enregistrement par défaut
            const now = new Date().toISOString();
            try {
              await new Promise((resolve, reject) => {
                this.db.run(
                  `INSERT INTO player_limits (user_id, created_at, updated_at)
                   VALUES (?, ?, ?)`,
                  [userId, now, now],
                  function(err) {
                    if (err) return reject(err);
                    resolve();
                  }
                );
              });

              resolve({
                userId,
                dailyLimit: null,
                weeklyLimit: null,
                sessionTimeLimit: null,
                createdAt: now,
                updatedAt: now,
                nextUpdateAllowed: now
              });
            } catch (error) {
              reject(error);
            }
          } else {
            // Récupérer également les statistiques actuelles
            try {
              const stats = await this.getUserStats(userId);
              
              resolve({
                userId: row.user_id,
                dailyLimit: row.daily_limit,
                weeklyLimit: row.weekly_limit,
                sessionTimeLimit: row.session_time_limit,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                nextUpdateAllowed: row.next_update_allowed,
                currentStats: stats
              });
            } catch (error) {
              reject(error);
            }
          }
        }
      );
    });
  }

  /**
   * Vérifie si un utilisateur peut mettre à jour ses limites
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Résultat de la vérification
   */
  async canUpdateLimits(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT next_update_allowed FROM player_limits WHERE user_id = ?`,
        [userId],
        (err, row) => {
          if (err) return reject(err);

          if (!row || !row.next_update_allowed) {
            resolve({ allowed: true });
            return;
          }

          const nextUpdateAllowed = new Date(row.next_update_allowed);
          const now = new Date();

          if (now >= nextUpdateAllowed) {
            resolve({ allowed: true });
          } else {
            resolve({ 
              allowed: false,
              nextUpdateAllowed: row.next_update_allowed
            });
          }
        }
      );
    });
  }

  /**
   * Définit les limites pour un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {Object} limits - Limites à définir
   * @returns {Promise<Object>} Limites mises à jour
   */
  async setUserLimits(userId, limits) {
    const { dailyLimit, weeklyLimit, sessionTimeLimit } = limits;
    const now = new Date();
    const nextUpdateAllowed = new Date(now.getTime() + this.config.cooldownPeriod);

    return new Promise((resolve, reject) => {
      // Récupérer les limites actuelles pour la comparaison
      this.db.get(
        `SELECT * FROM player_limits WHERE user_id = ?`,
        [userId],
        (err, row) => {
          if (err) return reject(err);

          let isDecreasing = false;
          
          if (row) {
            // Vérifier si les nouvelles limites sont plus restrictives
            if ((dailyLimit !== null && row.daily_limit !== null && dailyLimit < row.daily_limit) ||
                (weeklyLimit !== null && row.weekly_limit !== null && weeklyLimit < row.weekly_limit) ||
                (sessionTimeLimit !== null && row.session_time_limit !== null && sessionTimeLimit < row.session_time_limit)) {
              isDecreasing = true;
            }
          }

          // Mettre à jour ou insérer les limites
          const query = row ? 
            `UPDATE player_limits SET 
               daily_limit = ?, weekly_limit = ?, session_time_limit = ?, 
               updated_at = ?, next_update_allowed = ?
             WHERE user_id = ?` : 
            `INSERT INTO player_limits 
               (daily_limit, weekly_limit, session_time_limit, created_at, updated_at, next_update_allowed, user_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`;
          
          const params = row ? 
            [
              dailyLimit, weeklyLimit, sessionTimeLimit, 
              now.toISOString(), 
              isDecreasing ? now.toISOString() : nextUpdateAllowed.toISOString(),
              userId
            ] : 
            [
              dailyLimit, weeklyLimit, sessionTimeLimit, 
              now.toISOString(), now.toISOString(), 
              isDecreasing ? now.toISOString() : nextUpdateAllowed.toISOString(),
              userId
            ];
          
          this.db.run(query, params, function(err) {
            if (err) return reject(err);

            // Enregistrer dans les logs
            if (this.config && this.config.logsEnabled) {
              const logFile = path.join(this.config.logsDir, `limits_${userId}.log`);
              const logEntry = `[${now.toISOString()}] User ${userId} set limits: daily=${dailyLimit}, weekly=${weeklyLimit}, sessionTime=${sessionTimeLimit}\n`;
              fs.appendFile(logFile, logEntry, (err) => {
                if (err) console.error('Erreur lors de l\'écriture du log:', err);
              });
            }

            resolve({
              userId,
              dailyLimit,
              weeklyLimit,
              sessionTimeLimit,
              updatedAt: now.toISOString(),
              nextUpdateAllowed: isDecreasing ? now.toISOString() : nextUpdateAllowed.toISOString()
            });
          }.bind(this));
        }
      );
    });
  }

  /**
   * Auto-exclut un utilisateur du jeu
   * @param {number} userId - ID de l'utilisateur
   * @param {Object} options - Options d'exclusion
   * @returns {Promise<Object>} Résultat de l'exclusion
   */
  async excludeUser(userId, options) {
    const { duration, isPermanent, reason } = options;
    const now = new Date();
    const startDate = now.toISOString();
    
    let endDate = null;
    if (!isPermanent) {
      const endDateObj = new Date(now.getTime() + duration);
      endDate = endDateObj.toISOString();
    }

    return new Promise((resolve, reject) => {
      // Vérifier les exclusions existantes
      this.db.get(
        `SELECT * FROM self_exclusions WHERE user_id = ? AND 
         (is_permanent = 1 OR end_date > ?) ORDER BY end_date DESC LIMIT 1`,
        [userId, now.toISOString()],
        (err, row) => {
          if (err) return reject(err);

          if (row) {
            // Il existe déjà une exclusion active
            if (row.is_permanent) {
              return resolve({
                userId,
                startDate: row.start_date,
                endDate: null,
                isPermanent: true,
                status: 'already_excluded',
                message: 'Vous êtes déjà exclu de façon permanente'
              });
            } else {
              // Extension d'une exclusion temporaire existante
              const existingEndDate = new Date(row.end_date);
              const newEndDate = isPermanent ? null : new Date(Math.max(existingEndDate.getTime(), now.getTime() + duration));
              
              this.db.run(
                `UPDATE self_exclusions SET end_date = ?, is_permanent = ?, reason = ?, created_at = ?
                 WHERE id = ?`,
                [isPermanent ? null : newEndDate.toISOString(), isPermanent ? 1 : 0, reason, now.toISOString(), row.id],
                function(err) {
                  if (err) return reject(err);

                  // Enregistrer dans les logs
                  if (this.config && this.config.logsEnabled) {
                    const logFile = path.join(this.config.logsDir, `exclusions_${userId}.log`);
                    const logEntry = `[${now.toISOString()}] User ${userId} extended exclusion: permanent=${isPermanent}, endDate=${isPermanent ? 'N/A' : newEndDate.toISOString()}, reason="${reason}"\n`;
                    fs.appendFile(logFile, logEntry, (err) => {
                      if (err) console.error('Erreur lors de l\'écriture du log:', err);
                    });
                  }

                  resolve({
                    userId,
                    startDate: row.start_date,
                    endDate: isPermanent ? null : newEndDate.toISOString(),
                    isPermanent,
                    status: 'extended',
                    message: isPermanent ? 'Exclusion rendue permanente' : 'Période d\'exclusion prolongée'
                  });
                }.bind(this)
              );
            }
          } else {
            // Créer une nouvelle exclusion
            this.db.run(
              `INSERT INTO self_exclusions (user_id, start_date, end_date, is_permanent, reason, created_at)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [userId, startDate, endDate, isPermanent ? 1 : 0, reason, now.toISOString()],
              function(err) {
                if (err) return reject(err);

                // Enregistrer dans les logs
                if (this.config && this.config.logsEnabled) {
                  const logFile = path.join(this.config.logsDir, `exclusions_${userId}.log`);
                  const logEntry = `[${now.toISOString()}] User ${userId} self-excluded: permanent=${isPermanent}, duration=${duration ? duration / (24 * 60 * 60 * 1000) : 'N/A'} days, reason="${reason}"\n`;
                  fs.appendFile(logFile, logEntry, (err) => {
                    if (err) console.error('Erreur lors de l\'écriture du log:', err);
                  });
                }

                resolve({
                  userId,
                  startDate,
                  endDate,
                  isPermanent,
                  status: 'new',
                  message: isPermanent ? 'Auto-exclusion permanente effectuée' : `Auto-exclusion temporaire effectuée jusqu'au ${new Date(endDate).toLocaleDateString()}`
                });
              }.bind(this)
            );
          }
        }
      );
    });
  }

  /**
   * Vérifie si un utilisateur peut jouer
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Résultat de la vérification
   */
  async canUserPlay(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        // Vérifier les exclusions
        const exclusion = await new Promise((resolve, reject) => {
          const now = new Date().toISOString();
          this.db.get(
            `SELECT * FROM self_exclusions WHERE user_id = ? AND 
             (is_permanent = 1 OR end_date > ?) ORDER BY end_date DESC LIMIT 1`,
            [userId, now],
            (err, row) => {
              if (err) return reject(err);
              resolve(row);
            }
          );
        });

        if (exclusion) {
          // L'utilisateur est exclu
          return resolve({
            canPlay: false,
            reason: 'excluded',
            endDate: exclusion.is_permanent ? null : exclusion.end_date,
            isPermanent: exclusion.is_permanent === 1
          });
        }

        // Vérifier les limites de mise
        const stats = await this.getUserStats(userId);
        const limits = await this.getUserLimits(userId);

        let canPlay = true;
        let reason = null;

        if (limits.dailyLimit !== null && stats.dailyTotal >= limits.dailyLimit) {
          canPlay = false;
          reason = 'daily_limit_reached';
        } else if (limits.weeklyLimit !== null && stats.weeklyTotal >= limits.weeklyLimit) {
          canPlay = false;
          reason = 'weekly_limit_reached';
        }

        // Vérifier les limites de temps de session
        const activeSession = await this.getActiveSession(userId);
        if (canPlay && activeSession && limits.sessionTimeLimit !== null) {
          const sessionDuration = (new Date().getTime() - new Date(activeSession.start_time).getTime()) / 60000; // en minutes
          if (sessionDuration >= limits.sessionTimeLimit) {
            canPlay = false;
            reason = 'session_time_limit_reached';
          }
        }

        resolve({
          canPlay,
          reason,
          dailySpent: stats.dailyTotal,
          weeklySpent: stats.weeklyTotal,
          dailyLimit: limits.dailyLimit,
          weeklyLimit: limits.weeklyLimit,
          sessionTimeLimit: limits.sessionTimeLimit,
          currentSessionDuration: activeSession ? 
            Math.floor((new Date().getTime() - new Date(activeSession.start_time).getTime()) / 60000) : 
            0
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Vérifie si un utilisateur peut placer une mise
   * @param {number} userId - ID de l'utilisateur
   * @param {number} amount - Montant de la mise
   * @returns {Promise<Object>} Résultat de la vérification
   */
  async canPlaceBet(userId, amount) {
    return new Promise(async (resolve, reject) => {
      try {
        // Vérifier d'abord si l'utilisateur peut jouer
        const playCheck = await this.canUserPlay(userId);
        if (!playCheck.canPlay) {
          return resolve({
            allowed: false,
            reason: playCheck.reason === 'excluded' ? 'Vous êtes actuellement exclu du jeu' :
                    playCheck.reason === 'daily_limit_reached' ? 'Vous avez atteint votre limite quotidienne de mises' :
                    playCheck.reason === 'weekly_limit_reached' ? 'Vous avez atteint votre limite hebdomadaire de mises' :
                    playCheck.reason === 'session_time_limit_reached' ? 'Vous avez atteint votre limite de temps de jeu' :
                    'Vous ne pouvez pas jouer actuellement'
          });
        }

        // Vérifier les limites avec la mise potentielle
        const stats = await this.getUserStats(userId);
        const limits = await this.getUserLimits(userId);

        let allowed = true;
        let reason = null;
        let remainingDaily = null;
        let remainingWeekly = null;

        if (limits.dailyLimit !== null) {
          remainingDaily = limits.dailyLimit - stats.dailyTotal;
          if (stats.dailyTotal + amount > limits.dailyLimit) {
            allowed = false;
            reason = `Cette mise dépasse votre limite quotidienne de ${limits.dailyLimit} ₣`;
          }
        }

        if (allowed && limits.weeklyLimit !== null) {
          remainingWeekly = limits.weeklyLimit - stats.weeklyTotal;
          if (stats.weeklyTotal + amount > limits.weeklyLimit) {
            allowed = false;
            reason = `Cette mise dépasse votre limite hebdomadaire de ${limits.weeklyLimit} ₣`;
          }
        }

        resolve({
          allowed,
          reason,
          remainingDaily,
          remainingWeekly,
          currentDaily: stats.dailyTotal,
          currentWeekly: stats.weeklyTotal
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Récupère les statistiques de mises d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Statistiques de l'utilisateur
   */
  async getUserStats(userId) {
    return new Promise((resolve, reject) => {
      // Calculer la date de début de la journée et de la semaine
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      
      // Calculer le début de la semaine (lundi)
      const day = now.getDay() || 7; // Convertir dimanche (0) en 7
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1).toISOString();

      // Récupérer les totaux de mises
      this.db.get(
        `SELECT 
           SUM(CASE WHEN timestamp >= ? THEN amount ELSE 0 END) as daily_total,
           SUM(CASE WHEN timestamp >= ? THEN amount ELSE 0 END) as weekly_total,
           COUNT(CASE WHEN timestamp >= ? THEN 1 ELSE NULL END) as daily_bets,
           COUNT(CASE WHEN timestamp >= ? THEN 1 ELSE NULL END) as weekly_bets
         FROM bet_history 
         WHERE user_id = ? AND transaction_type = 'bet'`,
        [startOfDay, startOfWeek, startOfDay, startOfWeek, userId],
        (err, row) => {
          if (err) return reject(err);

          resolve({
            userId,
            dailyTotal: row ? parseInt(row.daily_total || 0) : 0,
            weeklyTotal: row ? parseInt(row.weekly_total || 0) : 0,
            dailyBets: row ? parseInt(row.daily_bets || 0) : 0,
            weeklyBets: row ? parseInt(row.weekly_bets || 0) : 0
          });
        }
      );
    });
  }

  /**
   * Enregistre une mise pour un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {number} amount - Montant de la mise
   * @param {string} gameId - ID de la partie
   * @returns {Promise<Object>} Mise enregistrée
   */
  async recordBet(userId, amount, gameId) {
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO bet_history (user_id, amount, timestamp, game_id, transaction_type)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, amount, now, gameId || null, 'bet'],
        function(err) {
          if (err) return reject(err);

          resolve({
            id: this.lastID,
            userId,
            amount,
            timestamp: now,
            gameId: gameId || null,
            transactionType: 'bet'
          });
        }
      );
    });
  }

  /**
   * Démarre une session de jeu pour un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Session créée
   */
  async startPlaySession(userId) {
    // Vérifier s'il existe déjà une session active
    const activeSession = await this.getActiveSession(userId);
    if (activeSession) {
      return activeSession;
    }

    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO play_sessions (user_id, start_time, ongoing)
         VALUES (?, ?, ?)`,
        [userId, now, 1],
        function(err) {
          if (err) return reject(err);

          resolve({
            id: this.lastID,
            userId,
            startTime: now,
            ongoing: true
          });
        }
      );
    });
  }

  /**
   * Termine une session de jeu pour un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Session terminée
   */
  async endPlaySession(userId) {
    const activeSession = await this.getActiveSession(userId);
    if (!activeSession) {
      throw new Error('Aucune session active trouvée');
    }

    const now = new Date();
    const startTime = new Date(activeSession.start_time);
    const duration = Math.floor((now.getTime() - startTime.getTime()) / 60000); // en minutes

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE play_sessions SET end_time = ?, duration = ?, ongoing = ?
         WHERE id = ?`,
        [now.toISOString(), duration, 0, activeSession.id],
        function(err) {
          if (err) return reject(err);

          resolve({
            id: activeSession.id,
            userId,
            startTime: activeSession.start_time,
            endTime: now.toISOString(),
            duration,
            ongoing: false
          });
        }
      );
    });
  }

  /**
   * Récupère la session active d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object|null>} Session active ou null
   */
  async getActiveSession(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM play_sessions WHERE user_id = ? AND ongoing = 1`,
        [userId],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });
  }

  /**
   * Récupère les statistiques d'auto-exclusion
   * @returns {Promise<Object>} Statistiques d'auto-exclusion
   */
  async getExclusionStats() {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();

      this.db.all(
        `SELECT 
           COUNT(*) as total_exclusions,
           SUM(CASE WHEN is_permanent = 1 THEN 1 ELSE 0 END) as permanent_exclusions,
           SUM(CASE WHEN is_permanent = 0 AND end_date > ? THEN 1 ELSE 0 END) as active_temporary_exclusions,
           COUNT(DISTINCT user_id) as unique_users
         FROM self_exclusions`,
        [now],
        (err, rows) => {
          if (err) return reject(err);

          const stats = rows[0] || { 
            total_exclusions: 0,
            permanent_exclusions: 0,
            active_temporary_exclusions: 0,
            unique_users: 0
          };

          // Récupérer également les statistiques de limites
          this.db.all(
            `SELECT 
               COUNT(*) as total_users_with_limits,
               SUM(CASE WHEN daily_limit IS NOT NULL THEN 1 ELSE 0 END) as users_with_daily_limits,
               SUM(CASE WHEN weekly_limit IS NOT NULL THEN 1 ELSE 0 END) as users_with_weekly_limits,
               SUM(CASE WHEN session_time_limit IS NOT NULL THEN 1 ELSE 0 END) as users_with_time_limits,
               AVG(CASE WHEN daily_limit IS NOT NULL THEN daily_limit ELSE NULL END) as avg_daily_limit,
               AVG(CASE WHEN weekly_limit IS NOT NULL THEN weekly_limit ELSE NULL END) as avg_weekly_limit,
               AVG(CASE WHEN session_time_limit IS NOT NULL THEN session_time_limit ELSE NULL END) as avg_session_time_limit
             FROM player_limits`,
            (err, limitRows) => {
              if (err) return reject(err);

              const limitStats = limitRows[0] || {
                total_users_with_limits: 0,
                users_with_daily_limits: 0,
                users_with_weekly_limits: 0,
                users_with_time_limits: 0,
                avg_daily_limit: 0,
                avg_weekly_limit: 0,
                avg_session_time_limit: 0
              };

              resolve({
                exclusions: stats,
                limits: limitStats,
                timestamp: now
              });
            }
          );
        }
      );
    });
  }
}

module.exports = SelfExclusionService;