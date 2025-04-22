/**
 * MS BINGO PACIFIQUE - Script d'activation HSTS
 * Version: 15 avril 2025
 * 
 * Ce script est conçu pour activer HSTS (HTTP Strict Transport Security)
 * sur les déploiements Replit afin de renforcer la sécurité SSL/TLS.
 */

const express = require('express');
const app = express();

// Middleware pour activer HSTS avec paramètres stricts
app.use((req, res, next) => {
  // Activer HSTS pour 1 an (31536000 secondes)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Configurez d'autres en-têtes de sécurité
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

// Redirection HTTP vers HTTPS pour les requêtes qui ne sont pas en HTTPS
app.use((req, res, next) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  
  if (!isSecure && process.env.NODE_ENV === 'production') {
    const redirectUrl = `https://${req.headers.host}${req.url}`;
    return res.redirect(301, redirectUrl);
  }
  
  next();
});

// Routes pour tester
app.get('/hsts-test', (req, res) => {
  res.send('HSTS est correctement configuré sur ce serveur.');
});

// Intégrer ce middleware dans votre application principale
console.log('✅ Middleware HSTS chargé et prêt à être utilisé');
console.log('🔒 Pour l\'intégrer à votre application, ajoutez ces middlewares à votre fichier principal');

// Exporter les middlewares pour utilisation dans d'autres fichiers
module.exports = {
  hstsMiddleware: (req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    next();
  },
  
  securityHeadersMiddleware: (req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  },
  
  httpsRedirectMiddleware: (req, res, next) => {
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    
    if (!isSecure && process.env.NODE_ENV === 'production') {
      const redirectUrl = `https://${req.headers.host}${req.url}`;
      return res.redirect(301, redirectUrl);
    }
    
    next();
  }
};

// Si exécuté directement, démarrer un serveur de test
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🔒 Serveur de test HSTS démarré sur le port ${PORT}`);
    console.log(`💡 Testez la configuration HSTS à: http://localhost:${PORT}/hsts-test`);
  });
}