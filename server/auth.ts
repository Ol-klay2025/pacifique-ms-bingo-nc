import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { storage } from './storage';
import { User } from '../shared/schema';

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

/**
 * Hache un mot de passe avec un sel aléatoire
 * @param password Mot de passe à hacher
 * @returns Chaîne contenant le hachage et le sel, séparés par un point
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Compare un mot de passe fourni avec un mot de passe haché stocké
 * @param supplied Mot de passe fourni (non haché)
 * @param stored Mot de passe stocké (haché)
 * @returns Vrai si les mots de passe correspondent
 */
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Configure l'authentification pour l'application
 * @param app Application Express
 */
export function setupAuth(app: Express): void {
  // Configuration des paramètres de session
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'msbingo-default-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 semaine
    },
  };

  // Configuration du support de proxy
  app.set('trust proxy', 1);
  
  // Initialisation de la session
  app.use(session(sessionSettings));
  
  // Initialisation de passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configuration de la stratégie d'authentification locale
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }
        
        const isValid = await comparePasswords(password, user.passwordHash);
        
        if (!isValid) {
          return done(null, false, { message: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Sérialisation et désérialisation de l'utilisateur
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Route d'inscription
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await storage.getUserByUsername(req.body.username);
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ce nom d\'utilisateur est déjà utilisé' 
        });
      }

      // Créer un nouvel utilisateur
      const hashedPassword = await hashPassword(req.body.password);
      
      const newUser = await storage.createUser({
        username: req.body.username,
        email: req.body.email,
        passwordHash: hashedPassword,
        language: req.body.language || 'en',
        balance: 0
      });

      // Connecter automatiquement l'utilisateur après l'inscription
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la connexion après inscription' 
          });
        }
        
        return res.status(201).json({
          success: true,
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            language: newUser.language,
            balance: newUser.balance
          }
        });
      });
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de l\'inscription. Veuillez réessayer.'
      });
    }
  });

  // Route de connexion
  app.post('/api/login', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: info?.message || 'Authentification échouée' 
        });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        return res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            language: user.language,
            balance: user.balance
          }
        });
      });
    })(req, res, next);
  });

  // Route de déconnexion
  app.post('/api/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de la déconnexion' 
        });
      }
      
      res.json({ success: true, message: 'Déconnecté avec succès' });
    });
  });

  // Route pour obtenir l'utilisateur actuel
  app.get('/api/user', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Non authentifié' 
      });
    }
    
    const user = req.user;
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        language: user.language,
        balance: user.balance
      }
    });
  });
  
  // Route pour changer le mot de passe
  app.post('/api/change-password', async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Non authentifié' 
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Informations manquantes' 
      });
    }
    
    try {
      // Vérifier que le mot de passe actuel est correct
      const isCurrentPasswordValid = await comparePasswords(currentPassword, req.user.passwordHash);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Mot de passe actuel incorrect' 
        });
      }
      
      // Hacher le nouveau mot de passe
      const newPasswordHash = await hashPassword(newPassword);
      
      // Mettre à jour le mot de passe de l'utilisateur
      await storage.updateUserPassword(req.user.id, newPasswordHash);
      
      res.json({ 
        success: true, 
        message: 'Mot de passe modifié avec succès' 
      });
    } catch (error) {
      console.error('❌ Erreur lors de la modification du mot de passe:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur serveur lors de la modification du mot de passe' 
      });
    }
  });
}

/**
 * Middleware pour vérifier si l'utilisateur est authentifié
 */
export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ 
    success: false, 
    message: 'Veuillez vous connecter pour accéder à cette ressource' 
  });
}

/**
 * Middleware pour vérifier si l'utilisateur est administrateur
 */
export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && req.user.isAdmin) {
    return next();
  }
  
  res.status(403).json({ 
    success: false, 
    message: 'Accès non autorisé' 
  });
}