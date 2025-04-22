import geoip from 'geoip-lite';

// Liste des codes de pays restreints
// Cette liste peut être facilement mise à jour selon les réglementations
export const RESTRICTED_COUNTRIES = [
  'US', // États-Unis
  'CN', // Chine
  'JP', // Japon
  'KR', // Corée du Sud
  'TR', // Turquie
  'AE', // Émirats arabes unis
  'ID', // Indonésie
];

/**
 * Vérifie si une adresse IP est localisée dans un pays restreint
 * @param ip Adresse IP à vérifier
 * @returns Un objet contenant le résultat de la vérification et les informations de géolocalisation
 */
export function checkIpRestriction(ip: string) {
  // Ignorer les adresses IP locales pour le développement
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return {
      restricted: false,
      country: null,
      region: null,
      city: null,
      countryName: null,
      message: 'Local development IP - no restrictions'
    };
  }

  // Utiliser geoip-lite pour obtenir des informations de géolocalisation
  const geo = geoip.lookup(ip);
  
  if (!geo) {
    return {
      restricted: false,
      country: null,
      region: null,
      city: null,
      countryName: null,
      message: 'Unable to determine location'
    };
  }

  const isRestricted = RESTRICTED_COUNTRIES.includes(geo.country);
  
  return {
    restricted: isRestricted,
    country: geo.country,
    region: geo.region,
    city: geo.city,
    countryName: getCountryName(geo.country),
    message: isRestricted 
      ? `Access restricted in ${getCountryName(geo.country)} (${geo.country})`
      : `Access allowed in ${getCountryName(geo.country)} (${geo.country})`
  };
}

/**
 * Obtenir le nom complet d'un pays à partir de son code ISO
 * @param countryCode Code ISO du pays
 * @returns Nom complet du pays
 */
function getCountryName(countryCode: string | null): string {
  if (!countryCode) return 'Unknown';
  
  const countries: {[key: string]: string} = {
    'US': 'United States',
    'CN': 'China',
    'JP': 'Japan',
    'KR': 'South Korea',
    'TR': 'Turkey',
    'AE': 'United Arab Emirates',
    'ID': 'Indonesia',
    'FR': 'France',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'ES': 'Spain',
    'IT': 'Italy',
    'PT': 'Portugal',
    'BR': 'Brazil',
    'RU': 'Russia',
    'IN': 'India',
    'CA': 'Canada',
    'AU': 'Australia',
    'NZ': 'New Zealand',
    'AR': 'Argentina',
    'MX': 'Mexico',
    'ZA': 'South Africa',
    'EG': 'Egypt',
    'SA': 'Saudi Arabia'
    // Ajoutez d'autres pays selon les besoins
  };
  
  return countries[countryCode] || 'Unknown Country';
}

/**
 * Extraire l'adresse IP réelle d'une requête Express
 * Gère les cas où l'utilisateur est derrière un proxy ou un équilibreur de charge
 * @param req Requête Express
 * @returns Adresse IP réelle
 */
export function getClientIp(req: any): string {
  // Récupérer l'adresse IP depuis les en-têtes de proxy, si disponible
  const xForwardedFor = req.headers['x-forwarded-for'];
  
  if (xForwardedFor) {
    // x-forwarded-for peut contenir plusieurs IPs séparées par des virgules
    // La première est généralement l'adresse IP originale du client
    const ips = xForwardedFor.split(',').map((ip: string) => ip.trim());
    return ips[0];
  }
  
  // Si pas de x-forwarded-for, essayer d'autres en-têtes courants
  const xRealIp = req.headers['x-real-ip'];
  if (xRealIp) {
    return xRealIp;
  }
  
  // Si aucun en-tête de proxy n'est trouvé, utiliser l'adresse IP directe
  // Avec Node.js/Express, l'adresse IP distante est généralement dans req.connection.remoteAddress
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
}