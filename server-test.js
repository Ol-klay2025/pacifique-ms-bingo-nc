const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Définir l'URL de base pour l'index
  const url = req.url === '/' ? '/bingo-play.html' : req.url;
  
  // Construire le chemin vers le fichier
  const filePath = path.join(__dirname, 'public', url);
  
  // Extension du fichier
  const extname = path.extname(filePath);
  
  // Type de contenu par défaut
  let contentType = 'text/html';
  
  // Déterminer le type de contenu correct en fonction de l'extension
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
  }
  
  // Lire le fichier
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Page non trouvée
        console.error(`Fichier non trouvé: ${filePath}`);
        fs.readFile(path.join(__dirname, 'public', '404.html'), (err, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content, 'utf8');
        });
      } else {
        // Erreur serveur
        console.error(`Erreur serveur: ${err.code}`);
        res.writeHead(500);
        res.end(`Erreur serveur: ${err.code}`);
      }
    } else {
      // Réponse réussie
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf8');
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});