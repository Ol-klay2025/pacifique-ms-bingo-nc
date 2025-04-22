import { Request, Response, NextFunction } from 'express';
import { checkIpRestriction, getClientIp } from '../geoService';

/**
 * Middleware pour vérifier les restrictions géographiques
 * Si l'utilisateur est dans un pays restreint, renvoie une erreur 403
 * Sinon, passe à la requête suivante
 */
export function geoRestrictionMiddleware(req: Request, res: Response, next: NextFunction) {
  // Obtenir l'adresse IP du client
  const clientIp = getClientIp(req);
  
  // Vérifier si l'IP est dans un pays restreint
  const geoCheck = checkIpRestriction(clientIp);
  
  // Ajouter les informations de géolocalisation à la requête pour utilisation ultérieure
  (req as any).geoInfo = geoCheck;
  
  // Si l'accès est restreint, renvoyer une erreur 403
  if (geoCheck.restricted) {
    return res.status(403).json({
      error: 'Geo-restriction',
      message: `Access from ${geoCheck.countryName} is currently restricted due to gambling regulations.`,
      country: geoCheck.country,
      countryName: geoCheck.countryName
    });
  }
  
  // Si l'accès est autorisé, passer à la prochaine middleware
  next();
}

/**
 * Route API pour obtenir les informations de géolocalisation du client
 * Utilisée par le frontend pour afficher des informations pertinentes
 */
export function geoInfoHandler(req: Request, res: Response) {
  const clientIp = getClientIp(req);
  const geoInfo = checkIpRestriction(clientIp);
  
  res.json({
    ip: clientIp,
    country: geoInfo.country,
    countryName: geoInfo.countryName,
    region: geoInfo.region,
    city: geoInfo.city,
    restricted: geoInfo.restricted
  });
}

/**
 * Page HTML personnalisée pour les accès restreints
 * Renvoie une page HTML informative expliquant la restriction
 */
export function restrictedAccessHandler(req: Request, res: Response) {
  const clientIp = getClientIp(req);
  const geoInfo = checkIpRestriction(clientIp);
  
  // Si l'utilisateur n'est pas dans un pays restreint, rediriger vers la page d'accueil
  if (!geoInfo.restricted) {
    return res.redirect('/');
  }
  
  // Envoyer une page HTML personnalisée
  res.status(403).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Access Restricted - PACIFIQUE MS BINGO</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8f9fa;
          color: #333;
          line-height: 1.6;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .container {
          background-color: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          margin-top: 50px;
        }
        h1 {
          color: #e63946;
          margin-bottom: 20px;
        }
        .info {
          background-color: #f8d7da;
          border-left: 4px solid #e63946;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        .footer {
          margin-top: 30px;
          font-size: 0.9rem;
          color: #6c757d;
          text-align: center;
        }
        a {
          color: #0366d6;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Access Restricted</h1>
        <div class="info">
          <p>We've detected that you're accessing PACIFIQUE MS BINGO from <strong>${geoInfo.countryName}</strong>.</p>
          <p>Due to local gambling regulations, PACIFIQUE MS BINGO is not available in your region at this time.</p>
        </div>
        <p>Online gaming regulations vary by country, and we are committed to complying with all applicable laws and regulations.</p>
        <p>If you believe this restriction is in error, please contact our support team.</p>
        <p>Thank you for your understanding.</p>
        <div class="footer">
          <p>PACIFIQUE MS BINGO &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `);
}