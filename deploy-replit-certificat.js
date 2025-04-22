/**
 * MS BINGO PACIFIQUE - Script de déploiement pour Replit
 * Version: 15 avril 2025
 * 
 * Ce script est spécifiquement conçu pour le déploiement sur Replit.
 * Il contient toutes les fonctionnalités nécessaires directement, sans dépendances externes.
 */

// Importer les modules nécessaires
const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

// Créer l'application Express
const app = express();

// Configuration du port
const PORT = process.env.PORT || 3000;

// Détection de l'environnement Replit
const isReplit = process.env.REPL_ID && process.env.REPL_OWNER;
// URL Replit correcte (basée sur la configuration constatée)
let REPLIT_URL = "https://bingo-master-filomenepipiseg.replit.app";

// Affichage immédiat des URLs pour le déploiement
console.log('\n====== MS BINGO PACIFIQUE - URLS D\'ACCÈS DIRECTS ======');
console.log(`🌐 Application déployée sur: ${REPLIT_URL}`);
console.log(`🏠 Page d'accueil originale: ${REPLIT_URL}/home`);
console.log(`🎮 Interface organisateur: ${REPLIT_URL}/direct-organizer`);
console.log(`ℹ️ Information de déploiement: ${REPLIT_URL}/deployment-info`);
console.log('============================================================\n');

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour les en-têtes de sécurité
app.use((req, res, next) => {
    // Activer HSTS pour forcer HTTPS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    // Empêcher le clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    // Protection XSS
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Empêcher le MIME-sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Referer policy
    res.setHeader('Referrer-Policy', 'same-origin');
    next();
});

// Variable pour suivre si l'URL a été détectée
let urlDetected = false;

// Middleware pour détecter l'URL réelle au premier accès
app.use((req, res, next) => {
    if (!urlDetected) {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        
        if (host && host !== 'localhost') {
            const detectedUrl = `${protocol}://${host}`;
            
            // Afficher les URLs détectées
            const line = '='.repeat(70);
            console.log('\n' + line);
            console.log('       MS BINGO PACIFIQUE - URLS D\'ACCÈS RÉEL DÉTECTÉES        ');
            console.log(line);
            console.log(`\n🌐 URL détectée:                ${detectedUrl}  ← Accès direct au jeu`);
            console.log(`🏠 Page d'accueil originale:      ${detectedUrl}/home`);
            console.log(`🎮 Interface organisateur:        ${detectedUrl}/direct-organizer`);
            console.log(`📋 Information complète:         ${detectedUrl}/deployment-info`);
            console.log(line + '\n');
            
            // Créer un fichier avec les URLs pour référence future
            try {
                const urlInfoContent = `
MS BINGO PACIFIQUE - URLS D'ACCÈS (${new Date().toLocaleString()})
=======================================================
URL principale (accès direct au jeu): ${detectedUrl}
URL page d'accueil (si besoin): ${detectedUrl}/home
Accès interface organisateur: ${detectedUrl}/direct-organizer
Information de déploiement: ${detectedUrl}/deployment-info
=======================================================

INFORMATIONS IMPORTANTES:
* L'URL principale redirige automatiquement vers l'interface de jeu
* Pour accéder à la page d'accueil originale, utilisez /home
* L'interface organisateur est accessible via /direct-organizer
=======================================================
                `;
                fs.writeFileSync('urls-acces.txt', urlInfoContent);
                console.log('✓ URLs enregistrées dans le fichier urls-acces.txt');
            } catch (err) {
                console.error('Erreur lors de l\'enregistrement des URLs:', err.message);
            }
            
            // Marquer comme détecté
            urlDetected = true;
        }
    }
    next();
});

// Middleware pour corriger les URLs dans le HTML
function fixUrls(html, baseUrl) {
    if (!baseUrl) return html;
    
    // Correction des chemins relatifs vers des chemins absolus
    html = html.replace(/href=["']\/([^"']*?)["']/g, `href="${baseUrl}/$1"`);
    html = html.replace(/src=["']\/([^"']*?)["']/g, `src="${baseUrl}/$1"`);
    
    // Ajouter une balise base pour tous les autres liens relatifs
    html = html.replace('<head>', `<head>\n<base href="${baseUrl}/">`);
    
    return html;
}

// Routes pour les pages principales et accès directs
app.get('/', (req, res) => {
    // Redirection directe vers l'interface de jeu pour la démo
    res.redirect('/direct-play');
});

// ===== ROUTES D'ACCÈS DIRECT =====
// Fonction pour servir une page HTML avec l'hommage et les corrections d'URL
function servePage(res, pageFile) {
    let htmlContent = fs.readFileSync(path.join(__dirname, 'public', pageFile), 'utf-8');
    htmlContent = injectHommage(htmlContent);
    
    // Fixer les URLs si nécessaire
    if (isReplit) {
        htmlContent = fixUrls(htmlContent, "https://bingo-master-filomenepipiseg.replit.app");
    }
    
    res.send(htmlContent);
}

// Route d'accueil originale (accessible via /home)
app.get('/home', (req, res) => {
    servePage(res, 'index.html');
});

// ROUTES POUR L'INTERFACE DE JEU
app.get('/direct-play', (req, res) => {
    servePage(res, 'play.html');
});
app.get('/play', (req, res) => {
    res.redirect('/direct-play');
});
app.get('/jeu', (req, res) => {
    res.redirect('/direct-play');
});
app.get('/game', (req, res) => {
    res.redirect('/direct-play');
});

// ROUTES POUR L'INTERFACE ORGANISATEUR
app.get('/direct-organizer', (req, res) => {
    servePage(res, 'organizer.html');
});
app.get('/organizer', (req, res) => {
    res.redirect('/direct-organizer');
});
app.get('/organisateur', (req, res) => {
    res.redirect('/direct-organizer');
});
app.get('/admin', (req, res) => {
    res.redirect('/direct-organizer');
});

// ROUTES POUR KYC ET SELF-EXCLUSION
app.get('/kyc', (req, res) => {
    servePage(res, 'kyc.html');
});
app.get('/direct-kyc', (req, res) => {
    servePage(res, 'kyc.html');
});
app.get('/self-exclusion', (req, res) => {
    servePage(res, 'self-exclusion.html');
});
app.get('/direct-self-exclusion', (req, res) => {
    servePage(res, 'self-exclusion.html');
});

// PAGE D'INFORMATION UTILISATEUR
app.get('/info', (req, res) => {
    res.redirect('/deployment-info');
});
app.get('/aide', (req, res) => {
    servePage(res, 'help.html');
});
app.get('/help', (req, res) => {
    servePage(res, 'help.html');
});

// Route d'info pour connaître l'URL de déploiement complète
app.get('/deployment-info', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = `${protocol}://${host}`;
    const correctUrl = "https://bingo-master-filomenepipiseg.replit.app";
    
    res.json({
        base_url: correctUrl,
        replit_url: correctUrl,
        is_replit: true,
        direct_play_url: `${correctUrl}/direct-play`,
        direct_organizer_url: `${correctUrl}/direct-organizer`,
        direct_kyc_url: `${correctUrl}/direct-kyc`,
        direct_self_exclusion_url: `${correctUrl}/direct-self-exclusion`,
        help_url: `${correctUrl}/help`,
        version: "15 avril 2025"
    });
});

// PAGE DES URLS D'ACCÈS DIRECT
app.get('/urls', (req, res) => {
    try {
        const urlContent = fs.readFileSync(path.join(__dirname, 'urls-acces.txt'), 'utf-8');
        res.send(`<html><head><title>MS BINGO - URLs d'accès</title>
                 <style>body{font-family:sans-serif;line-height:1.6;margin:20px;background:#f5f5f5}
                 pre{background:#fff;padding:20px;border-radius:5px;border:1px solid #ddd;overflow:auto}
                 h1{color:#0066cc}</style></head>
                 <body><h1>MS BINGO PACIFIQUE - URLs d'accès direct</h1>
                 <pre>${urlContent}</pre></body></html>`);
    } catch (err) {
        res.status(500).send("Erreur lors de la lecture des URLs d'accès");
    }
});

// PORTAIL DE NAVIGATION
app.get('/portail', (req, res) => {
    const correctUrl = "https://bingo-master-filomenepipiseg.replit.app";
    const links = [
        { url: '/', title: 'Accueil / Jeu', description: 'Interface principale de jeu' },
        { url: '/home', title: 'Page d\'accueil originale', description: 'Page d\'accueil avec présentation' },
        { url: '/direct-organizer', title: 'Interface Organisateur', description: 'Gestion des parties et tirages' },
        { url: '/direct-kyc', title: 'KYC', description: 'Know Your Customer - Vérification d\'identité' },
        { url: '/direct-self-exclusion', title: 'Auto-exclusion', description: 'Gestion des auto-exclusions' },
        { url: '/help', title: 'Aide', description: 'Documentation et aide' },
        { url: '/urls', title: 'Toutes les URLs', description: 'Liste complète des URLs d\'accès' },
        { url: '/deployment-info', title: 'Informations techniques', description: 'Détails techniques du déploiement' }
    ];

    let html = `<!DOCTYPE html>
    <html>
    <head>
        <title>MS BINGO PACIFIQUE - Portail d'accès</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f0f8ff; }
            .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #0066cc; text-align: center; margin-bottom: 30px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
            .card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; transition: all 0.3s ease; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.12); }
            .card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .card h2 { margin-top: 0; color: #0066cc; font-size: 1.2rem; }
            .card p { color: #666; margin-bottom: 15px; }
            .btn { display: inline-block; background: #0066cc; color: white; text-decoration: none; padding: 8px 15px; border-radius: 4px; font-weight: bold; }
            .btn:hover { background: #0052a3; }
            footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9rem; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>MS BINGO PACIFIQUE - Portail d'accès</h1>
            <div class="grid">`;
            
    links.forEach(link => {
        html += `
                <div class="card">
                    <h2>${link.title}</h2>
                    <p>${link.description}</p>
                    <a href="${link.url}" class="btn">Accéder</a>
                </div>`;
    });
            
    html += `
            </div>
            <footer>
                MS BINGO PACIFIQUE - Version du 15 avril 2025<br>
                En hommage à Monika Seuvea - Notre inspiration dans le Pacifique
            </footer>
        </div>
    </body>
    </html>`;
    
    res.send(html);
});

// Route pour vérifier le statut du certificat SSL
app.get('/certificat-status', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    
    res.json({
        ssl_enabled: protocol === 'https',
        ssl_message: "Certificat SSL activé dans le déploiement Replit",
        version: "15 avril 2025",
        transport: protocol === 'https' ? "HTTPS" : "HTTP",
        base_url: "https://bingo-master-filomenepipiseg.replit.app"
    });
});

// Fonction pour injecter l'hommage à Monika Seuvea dans le HTML
function injectHommage(htmlContent) {
    const hommageCss = `
    <style>
        .hommage-footer {
            text-align: center;
            padding: 10px;
            margin-top: 20px;
            font-size: 0.8em;
            color: #666;
            border-top: 1px solid #eee;
        }
        .hommage-footer a {
            color: #0099cc;
            text-decoration: none;
        }
        .hommage-footer a:hover {
            text-decoration: underline;
        }
    </style>`;
    
    const hommageHtml = `
    <div class="hommage-footer">
        En hommage à Monika Seuvea - Notre inspiration dans le Pacifique
    </div>`;
    
    // Injecter le CSS avant la fin de head
    htmlContent = htmlContent.replace('</head>', hommageCss + '</head>');
    
    // Injecter le HTML avant la fin de body
    htmlContent = htmlContent.replace('</body>', hommageHtml + '</body>');
    
    return htmlContent;
}

// Démarrer le serveur HTTP
const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
    console.log(`\n✓ Serveur MS BINGO démarré sur le port ${PORT}`);
    
    // Créer un cadre bien visible pour les URLs d'accès
    const line = '='.repeat(70);
    console.log('\n' + line);
    console.log('           MS BINGO PACIFIQUE - URLS D\'ACCÈS DIRECT           ');
    console.log(line);
    
    if (isReplit) {
        // URL correcte de l'application
        console.log(`\n🌐 Application déployée sur:      https://bingo-master-filomenepipiseg.replit.app  ← Accès direct au jeu`);
        console.log(`🏠 Page d'accueil originale:      https://bingo-master-filomenepipiseg.replit.app/home`);
        console.log(`🎮 Interface organisateur:        https://bingo-master-filomenepipiseg.replit.app/direct-organizer`);
        console.log(`ℹ️ Information de déploiement:    https://bingo-master-filomenepipiseg.replit.app/deployment-info`);
    } else {
        console.log(`\n🌐 Application locale:           http://localhost:${PORT}  ← Accès direct au jeu`);
        console.log(`🏠 Page d'accueil originale:      http://localhost:${PORT}/home`);
        console.log(`🎮 Interface organisateur:        http://localhost:${PORT}/direct-organizer`);
        console.log(`ℹ️ Information de déploiement:    http://localhost:${PORT}/deployment-info`);
    }
    
    console.log(`\n📅 Version déployée: 15 avril 2025`);
    console.log(line + '\n');
    
    // Détection automatique de l'URL depuis les en-têtes lors de la première requête
    console.log('⏳ En attente de la première connexion pour confirmer l\'URL complète...');
});