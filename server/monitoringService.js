/**
 * Service de Surveillance et Alertes pour MS BINGO
 * Version: Avril 2025
 * 
 * Ce module fournit des outils pour surveiller l'état de l'application,
 * enregistrer des métriques et envoyer des alertes en cas de problèmes.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Service de surveillance et alertes
 */
class MonitoringService {
  constructor(options = {}) {
    this.config = {
      logsDir: options.logsDir || path.join(__dirname, '../logs'),
      alertThresholds: {
        cpuUsage: options.cpuThreshold || 80, // Pourcentage
        memoryUsage: options.memoryThreshold || 85, // Pourcentage
        responseTime: options.responseTimeThreshold || 1000, // ms
        errorRate: options.errorRateThreshold || 5 // Pourcentage
      },
      metricsInterval: options.metricsInterval || 60000, // Par défaut: 1 minute
      alertChannels: options.alertChannels || ['log', 'email'],
      alertRecipients: options.alertRecipients || ['admin@msbingo.com'],
      enabled: options.enabled !== undefined ? options.enabled : true,
      ...options
    };

    // Statistiques et métriques
    this.stats = {
      startTime: Date.now(),
      requestCount: 0,
      errorCount: 0,
      slowResponseCount: 0,
      lastMetricsTime: Date.now(),
      responseTimeTotal: 0,
      responseTimeMax: 0,
      cpuHistory: [],
      memoryHistory: [],
      requestHistory: [],
      activeConnections: 0
    };

    // Créer le répertoire des logs s'il n'existe pas
    if (!fs.existsSync(this.config.logsDir)) {
      fs.mkdirSync(this.config.logsDir, { recursive: true });
    }

    // Fichiers de logs
    this.logFiles = {
      metrics: path.join(this.config.logsDir, 'metrics.log'),
      errors: path.join(this.config.logsDir, 'errors.log'),
      alerts: path.join(this.config.logsDir, 'alerts.log'),
      access: path.join(this.config.logsDir, 'access.log')
    };

    // Initialisation des intervalles
    if (this.config.enabled) {
      this.metricsInterval = setInterval(() => this.collectMetrics(), this.config.metricsInterval);
      console.log(`Service de surveillance activé avec intervalle de ${this.config.metricsInterval / 1000} secondes`);
    }
  }

  /**
   * Configure l'application avec les middlewares de surveillance
   * @param {Express} app - Application Express
   */
  configureApp(app) {
    if (!this.config.enabled) return;

    // Middleware de surveillance des requêtes
    app.use((req, res, next) => {
      // Marquer le début de la requête
      const startTime = Date.now();
      this.stats.activeConnections++;

      // Comptage des requêtes
      this.stats.requestCount++;

      // Intercepter la fin de la réponse
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.stats.responseTimeTotal += duration;
        this.stats.responseTimeMax = Math.max(this.stats.responseTimeMax, duration);
        this.stats.activeConnections--;

        // Détecter les réponses lentes
        if (duration > this.config.alertThresholds.responseTime) {
          this.stats.slowResponseCount++;
          this.logSlowResponse(req, duration);
        }

        // Détecter les erreurs
        if (res.statusCode >= 400) {
          this.stats.errorCount++;
          this.logError(req, res);
        }

        // Enregistrer l'accès
        this.logAccess(req, res, duration);
      });

      next();
    });

    // Middleware de gestion des erreurs
    app.use((err, req, res, next) => {
      this.stats.errorCount++;
      this.logException(err, req);

      // Vérifier si l'erreur nécessite une alerte
      this.checkErrorAlert(err);

      // Passer au gestionnaire d'erreurs suivant
      next(err);
    });
  }

  /**
   * Collecte les métriques système
   */
  collectMetrics() {
    try {
      const now = Date.now();
      const elapsedMs = now - this.stats.lastMetricsTime;
      this.stats.lastMetricsTime = now;

      // Métriques CPU
      const cpuUsage = this.getCPUUsage();
      this.stats.cpuHistory.push({ timestamp: now, value: cpuUsage });

      // Métriques mémoire
      const memUsage = this.getMemoryUsage();
      this.stats.memoryHistory.push({ timestamp: now, value: memUsage });

      // Métriques de requêtes
      const requestsPerSecond = (this.stats.requestCount / elapsedMs) * 1000;
      this.stats.requestHistory.push({ timestamp: now, value: requestsPerSecond });

      // Calculer le taux d'erreur
      const errorRate = this.stats.requestCount > 0 
        ? (this.stats.errorCount / this.stats.requestCount) * 100 
        : 0;

      // Enregistrer les métriques
      const metrics = {
        timestamp: now,
        uptime: this.getUptime(),
        cpuUsage,
        memoryUsage: memUsage,
        requestsPerSecond,
        activeConnections: this.stats.activeConnections,
        errorRate,
        responseTimeAvg: this.stats.requestCount > 0 
          ? this.stats.responseTimeTotal / this.stats.requestCount 
          : 0,
        responseTimeMax: this.stats.responseTimeMax,
        slowResponseCount: this.stats.slowResponseCount
      };

      this.logMetrics(metrics);

      // Vérifier les seuils d'alerte
      this.checkAlertThresholds(metrics);

      // Limiter la taille de l'historique
      if (this.stats.cpuHistory.length > 100) this.stats.cpuHistory.shift();
      if (this.stats.memoryHistory.length > 100) this.stats.memoryHistory.shift();
      if (this.stats.requestHistory.length > 100) this.stats.requestHistory.shift();

      return metrics;
    } catch (error) {
      console.error('Erreur lors de la collecte des métriques:', error);
    }
  }

  /**
   * Obtient l'utilisation actuelle du CPU
   * @returns {number} Pourcentage d'utilisation CPU
   */
  getCPUUsage() {
    try {
      const cpus = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;
      
      for (const cpu of cpus) {
        for (const type in cpu.times) {
          totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
      }
      
      // Calculer le pourcentage d'utilisation
      const idle = totalIdle / cpus.length;
      const total = totalTick / cpus.length;
      const usage = 100 - ((idle / total) * 100);
      
      return parseFloat(usage.toFixed(2));
    } catch (error) {
      console.error('Erreur lors du calcul de l\'utilisation CPU:', error);
      return 0;
    }
  }

  /**
   * Obtient l'utilisation actuelle de la mémoire
   * @returns {number} Pourcentage d'utilisation mémoire
   */
  getMemoryUsage() {
    try {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memUsagePercent = (usedMem / totalMem) * 100;
      
      return parseFloat(memUsagePercent.toFixed(2));
    } catch (error) {
      console.error('Erreur lors du calcul de l\'utilisation mémoire:', error);
      return 0;
    }
  }

  /**
   * Obtient le temps écoulé depuis le démarrage du service
   * @returns {string} Durée formatée
   */
  getUptime() {
    const uptime = Date.now() - this.stats.startTime;
    const seconds = Math.floor(uptime / 1000) % 60;
    const minutes = Math.floor(uptime / 60000) % 60;
    const hours = Math.floor(uptime / 3600000) % 24;
    const days = Math.floor(uptime / 86400000);
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  /**
   * Vérifie les seuils d'alerte pour les métriques
   * @param {Object} metrics - Métriques collectées
   */
  checkAlertThresholds(metrics) {
    const alerts = [];
    const { alertThresholds } = this.config;
    
    if (metrics.cpuUsage > alertThresholds.cpuUsage) {
      alerts.push(`Alerte CPU: Utilisation à ${metrics.cpuUsage}% (seuil: ${alertThresholds.cpuUsage}%)`);
    }
    
    if (metrics.memoryUsage > alertThresholds.memoryUsage) {
      alerts.push(`Alerte mémoire: Utilisation à ${metrics.memoryUsage}% (seuil: ${alertThresholds.memoryUsage}%)`);
    }
    
    if (metrics.errorRate > alertThresholds.errorRate) {
      alerts.push(`Alerte taux d'erreurs: ${metrics.errorRate.toFixed(2)}% (seuil: ${alertThresholds.errorRate}%)`);
    }
    
    if (metrics.responseTimeAvg > alertThresholds.responseTime) {
      alerts.push(`Alerte temps de réponse: ${metrics.responseTimeAvg.toFixed(2)}ms (seuil: ${alertThresholds.responseTime}ms)`);
    }
    
    // Envoyer les alertes si nécessaire
    if (alerts.length > 0) {
      this.sendAlerts(alerts.join('\n'));
    }
  }

  /**
   * Vérifie si une erreur nécessite une alerte
   * @param {Error} error - Erreur à vérifier
   */
  checkErrorAlert(error) {
    // Déterminer si l'erreur est critique
    const isCritical = error.name === 'ReferenceError' || 
                     error.name === 'TypeError' ||
                     error.message.includes('database') ||
                     error.message.includes('connexion');
    
    if (isCritical) {
      this.sendAlerts(`Alerte erreur critique: ${error.name} - ${error.message}`);
    }
  }

  /**
   * Envoie des alertes via les canaux configurés
   * @param {string} message - Message d'alerte
   */
  sendAlerts(message) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}`;
    
    // Journaliser l'alerte
    this.appendToLog(this.logFiles.alerts, formattedMessage);
    
    // Selon les canaux configurés
    for (const channel of this.config.alertChannels) {
      switch (channel) {
        case 'log':
          console.warn(`⚠️ ALERTE: ${message}`);
          break;
          
        case 'email':
          // Dans une implémentation réelle, envoyer un email
          console.log(`[Simulation] Envoi d'email d'alerte à ${this.config.alertRecipients.join(', ')}`);
          break;
          
        case 'sms':
          // Dans une implémentation réelle, envoyer un SMS
          console.log('[Simulation] Envoi de SMS d\'alerte');
          break;
          
        case 'webhook':
          // Dans une implémentation réelle, appeler un webhook
          console.log('[Simulation] Appel webhook d\'alerte');
          break;
      }
    }
  }

  /**
   * Enregistre les métriques collectées
   * @param {Object} metrics - Métriques à enregistrer
   */
  logMetrics(metrics) {
    const timestamp = new Date(metrics.timestamp).toISOString();
    const logEntry = `[${timestamp}] CPU: ${metrics.cpuUsage}% | MEM: ${metrics.memoryUsage}% | REQ: ${metrics.requestsPerSecond.toFixed(2)}/s | ERR: ${metrics.errorRate.toFixed(2)}% | RT-AVG: ${metrics.responseTimeAvg.toFixed(2)}ms | CONN: ${metrics.activeConnections}`;
    
    this.appendToLog(this.logFiles.metrics, logEntry);
  }

  /**
   * Enregistre une erreur
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  logError(req, res) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${res.statusCode} ${req.method} ${req.originalUrl} - ${req.ip} - ${req.get('user-agent') || 'Inconnu'}`;
    
    this.appendToLog(this.logFiles.errors, logEntry);
  }

  /**
   * Enregistre une exception
   * @param {Error} err - Erreur survenue
   * @param {Object} req - Requête Express
   */
  logException(err, req) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${err.name}: ${err.message}\n${err.stack}\nRequête: ${req.method} ${req.originalUrl} - ${req.ip}`;
    
    this.appendToLog(this.logFiles.errors, logEntry);
  }

  /**
   * Enregistre une réponse lente
   * @param {Object} req - Requête Express
   * @param {number} duration - Durée de la requête en ms
   */
  logSlowResponse(req, duration) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] Réponse lente (${duration}ms) - ${req.method} ${req.originalUrl} - ${req.ip}`;
    
    this.appendToLog(this.logFiles.errors, logEntry);
  }

  /**
   * Enregistre un accès
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   * @param {number} duration - Durée de la requête en ms
   */
  logAccess(req, res, duration) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${res.statusCode} ${req.method} ${req.originalUrl} ${duration}ms - ${req.ip} - ${req.get('user-agent') || 'Inconnu'}`;
    
    this.appendToLog(this.logFiles.access, logEntry);
  }

  /**
   * Ajoute une entrée à un fichier de log
   * @param {string} file - Chemin du fichier de log
   * @param {string} entry - Entrée à ajouter
   */
  appendToLog(file, entry) {
    try {
      fs.appendFileSync(file, entry + '\n');
    } catch (error) {
      console.error(`Erreur d'écriture dans le fichier de log ${file}:`, error);
    }
  }

  /**
   * Obtient des statistiques récentes pour l'affichage dans l'interface d'administration
   * @returns {Object} Statistiques récentes
   */
  getRecentStats() {
    return {
      uptime: this.getUptime(),
      startTime: new Date(this.stats.startTime).toISOString(),
      cpuUsage: this.stats.cpuHistory.slice(-20),
      memoryUsage: this.stats.memoryHistory.slice(-20),
      requestsPerSecond: this.stats.requestHistory.slice(-20),
      requestCount: this.stats.requestCount,
      errorCount: this.stats.errorCount,
      errorRate: this.stats.requestCount > 0 
        ? (this.stats.errorCount / this.stats.requestCount) * 100 
        : 0,
      responseTimeAvg: this.stats.requestCount > 0 
        ? this.stats.responseTimeTotal / this.stats.requestCount 
        : 0,
      responseTimeMax: this.stats.responseTimeMax,
      slowResponseCount: this.stats.slowResponseCount,
      activeConnections: this.stats.activeConnections
    };
  }

  /**
   * Enregistre les routes API pour accéder aux métriques et statistiques
   * @param {Express} app - Application Express
   * @param {Function} authMiddleware - Middleware d'authentification
   */
  registerRoutes(app, authMiddleware) {
    // Route pour obtenir les statistiques système récentes
    app.get('/api/monitoring/stats', authMiddleware, (req, res) => {
      res.json(this.getRecentStats());
    });
    
    // Route pour obtenir les métriques actuelles
    app.get('/api/monitoring/metrics', authMiddleware, (req, res) => {
      const metrics = this.collectMetrics();
      res.json(metrics);
    });
    
    // Route pour obtenir les dernières alertes
    app.get('/api/monitoring/alerts', authMiddleware, (req, res) => {
      try {
        const alertsLog = fs.existsSync(this.logFiles.alerts) 
          ? fs.readFileSync(this.logFiles.alerts, 'utf8').split('\n').filter(Boolean).slice(-100)
          : [];
        
        res.json({ alerts: alertsLog });
      } catch (error) {
        console.error('Erreur lors de la lecture des alertes:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des alertes' });
      }
    });
    
    // Route pour obtenir les logs d'erreurs récents
    app.get('/api/monitoring/errors', authMiddleware, (req, res) => {
      try {
        const errorsLog = fs.existsSync(this.logFiles.errors) 
          ? fs.readFileSync(this.logFiles.errors, 'utf8').split('\n').filter(Boolean).slice(-100)
          : [];
        
        res.json({ errors: errorsLog });
      } catch (error) {
        console.error('Erreur lors de la lecture des erreurs:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des erreurs' });
      }
    });
    
    // Route de check health pour les systèmes externes
    app.get('/api/health-check', (req, res) => {
      // Vérifier les ressources critiques
      const dbStatus = this.checkDatabaseStatus();
      const memStatus = this.getMemoryUsage() < 95; // Moins de 95% d'utilisation mémoire
      const cpuStatus = this.getCPUUsage() < 95; // Moins de 95% d'utilisation CPU
      
      const healthy = dbStatus && memStatus && cpuStatus;
      
      res.status(healthy ? 200 : 503).json({
        status: healthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: dbStatus ? 'connected' : 'error',
          memory: memStatus ? 'normal' : 'critical',
          cpu: cpuStatus ? 'normal' : 'critical'
        }
      });
    });
  }

  /**
   * Vérifie l'état de la base de données
   * @returns {boolean} Vrai si la base de données est disponible
   */
  checkDatabaseStatus() {
    try {
      // Cette méthode devrait être adaptée selon le système de base de données utilisé
      // Pour SQLite, vérifier si le fichier existe
      return fs.existsSync('msbingo.db');
    } catch (error) {
      console.error('Erreur lors de la vérification de la base de données:', error);
      return false;
    }
  }

  /**
   * Arrête le service de surveillance
   */
  stop() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      console.log('Service de surveillance arrêté');
    }
  }
}

module.exports = MonitoringService;