import express from "express";
import * as routesModule from "./routes";

async function main() {
  const app = express();

  // Enregistre toutes les routes et middleware
  const httpServer = await routesModule.registerRoutes(app);

  // Démarrer le serveur sur le port 80 pour la compatibilité Replit
  const PORT = process.env.PORT || 80;
  httpServer.listen(PORT, () => {
    console.log(`Serveur PACIFIQUE MS BINGO démarré sur le port ${PORT}`);
    console.log(`Site accessible à : http://localhost:${PORT}/`);
    
    // Vérifier si les clés Stripe sont configurées
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("⚠️ STRIPE_SECRET_KEY non configurée. Les paiements ne fonctionneront pas.");
    }
    if (!process.env.VITE_STRIPE_PUBLIC_KEY) {
      console.warn("⚠️ VITE_STRIPE_PUBLIC_KEY non configurée. Les paiements ne fonctionneront pas côté client.");
    }
  });

  // Gérer les arrêts proprement
  process.on("SIGINT", () => {
    console.log("Arrêt du serveur PACIFIQUE MS BINGO...");
    httpServer.close(() => {
      console.log("Serveur PACIFIQUE MS BINGO arrêté.");
      process.exit(0);
    });
  });
}

main().catch((error) => {
  console.error("Erreur fatale:", error);
  process.exit(1);
});