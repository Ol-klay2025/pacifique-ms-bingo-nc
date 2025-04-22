import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traductions
const resources = {
  en: {
    translation: {
      // Common
      'app.name': 'MS BINGO',
      'app.description': 'The ultimate online Bingo experience',
      'app.loading': 'Loading...',
      'app.error': 'An error occurred',
      'app.retry': 'Retry',
      'app.cancel': 'Cancel',
      'app.save': 'Save',
      'app.confirm': 'Confirm',
      'app.back': 'Back',
      'app.next': 'Next',
      'app.close': 'Close',

      // Auth
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.logout': 'Logout',
      'auth.username': 'Username',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.alreadyHaveAccount': 'Already have an account?',
      'auth.dontHaveAccount': 'Don\'t have an account?',
      'auth.loginSuccess': 'Login successful',
      'auth.registerSuccess': 'Registration successful',
      'auth.logoutSuccess': 'Logout successful',

      // Home
      'home.title': 'Welcome to MS BINGO',
      'home.subtitle': 'The European Bingo experience, now online',
      'home.cta': 'Play Now',
      'home.launch': 'Official launch at 1000 registered users',
      'home.currentlyRegistered': 'Currently registered',
      'home.users': 'users',
      'home.features': 'Features',
      'home.feature1': 'European 90-number Bingo format',
      'home.feature2': 'Regular games every hour (€1 per card)',
      'home.feature3': 'Special games every 4 hours (€2.5 per card)',
      'home.feature4': 'Progressive jackpot for completing Bingo in under 40 numbers',
      'home.feature5': 'Automated voice announcements in multiple languages',

      // Game
      'game.regular': 'Regular Game',
      'game.special': 'Special Game',
      'game.upcoming': 'Upcoming Games',
      'game.inProgress': 'Game in Progress',
      'game.completed': 'Game Completed',
      'game.startTime': 'Start Time',
      'game.endTime': 'End Time',
      'game.price': 'Price',
      'game.prize': 'Prize',
      'game.buy': 'Buy Cards',
      'game.buyMoreCards': 'Buy More Cards',
      'game.totalPlayers': 'Total Players',
      'game.totalCards': 'Total Cards',
      'game.myCards': 'My Cards',
      'game.selectedCards': 'Selected Cards',
      'game.currentNumber': 'Current Number',
      'game.drawnNumbers': 'Drawn Numbers',
      'game.quine': 'Quine (Line)',
      'game.bingo': 'Bingo (Full Card)',
      'game.jackpot': 'Jackpot',
      'game.winners': 'Winners',
      'game.noWinners': 'No Winners',
      'game.waitingForDraw': 'Waiting for the next draw...',
      'game.salesOpen': 'Card sales open',
      'game.salesClose': 'Card sales close in',
      'game.nextDraw': 'Next draw in',
      'game.gameStarts': 'Game starts in',

      // Dashboard
      'dashboard.title': 'Dashboard',
      'dashboard.welcome': 'Welcome back',
      'dashboard.balance': 'Balance',
      'dashboard.deposit': 'Deposit',
      'dashboard.withdraw': 'Withdraw',
      'dashboard.upcomingGames': 'Upcoming Games',
      'dashboard.recentGames': 'Recent Games',
      'dashboard.transactions': 'Transactions',
      'dashboard.stats': 'Statistics',
      'dashboard.noUpcomingGames': 'No upcoming games',
      'dashboard.noRecentGames': 'No recent games',
      'dashboard.noTransactions': 'No transactions',

      // Profile
      'profile.title': 'Profile',
      'profile.edit': 'Edit Profile',
      'profile.language': 'Language',
      'profile.notifications': 'Notifications',
      'profile.theme': 'Theme',
      'profile.sound': 'Sound',
      'profile.cardPreferences': 'Card Preferences',
      'profile.difficulty': 'Difficulty',
      'profile.defaultCardCount': 'Default Card Count',
      'profile.savePreferences': 'Save Preferences',
      'profile.preferencesUpdated': 'Preferences updated successfully',

      // Payments
      'payment.title': 'Payment',
      'payment.deposit': 'Deposit',
      'payment.withdraw': 'Withdraw',
      'payment.amount': 'Amount',
      'payment.method': 'Method',
      'payment.creditCard': 'Credit Card',
      'payment.bankTransfer': 'Bank Transfer',
      'payment.eWallet': 'E-Wallet',
      'payment.virtualCard': 'Virtual Card',
      'payment.minAmount': 'Minimum amount',
      'payment.maxAmount': 'Maximum amount',
      'payment.processingFee': 'Processing fee',
      'payment.total': 'Total',
      'payment.confirm': 'Confirm Payment',
      'payment.success': 'Payment successful',
      'payment.failure': 'Payment failed',
      'payment.pending': 'Payment pending',
      'payment.processing': 'Processing payment...',
      'payment.withdrawalRequested': 'Withdrawal request submitted',
      'payment.withdrawalProcessing': 'Your withdrawal is being processed'
    }
  },
  fr: {
    translation: {
      // Commun
      'app.name': 'MS BINGO',
      'app.description': 'L\'expérience ultime de Bingo en ligne',
      'app.loading': 'Chargement...',
      'app.error': 'Une erreur est survenue',
      'app.retry': 'Réessayer',
      'app.cancel': 'Annuler',
      'app.save': 'Enregistrer',
      'app.confirm': 'Confirmer',
      'app.back': 'Retour',
      'app.next': 'Suivant',
      'app.close': 'Fermer',

      // Authentification
      'auth.login': 'Connexion',
      'auth.register': 'Inscription',
      'auth.logout': 'Déconnexion',
      'auth.username': 'Nom d\'utilisateur',
      'auth.email': 'Email',
      'auth.password': 'Mot de passe',
      'auth.confirmPassword': 'Confirmer le mot de passe',
      'auth.forgotPassword': 'Mot de passe oublié ?',
      'auth.alreadyHaveAccount': 'Vous avez déjà un compte ?',
      'auth.dontHaveAccount': 'Vous n\'avez pas de compte ?',
      'auth.loginSuccess': 'Connexion réussie',
      'auth.registerSuccess': 'Inscription réussie',
      'auth.logoutSuccess': 'Déconnexion réussie',

      // Accueil
      'home.title': 'Bienvenue sur MS BINGO',
      'home.subtitle': 'L\'expérience du Bingo européen, maintenant en ligne',
      'home.cta': 'Jouer maintenant',
      'home.launch': 'Lancement officiel à 1000 utilisateurs inscrits',
      'home.currentlyRegistered': 'Actuellement inscrits',
      'home.users': 'utilisateurs',
      'home.features': 'Fonctionnalités',
      'home.feature1': 'Format Bingo européen à 90 numéros',
      'home.feature2': 'Parties régulières toutes les heures (1€ par carte)',
      'home.feature3': 'Parties spéciales toutes les 4 heures (2,5€ par carte)',
      'home.feature4': 'Jackpot progressif pour un Bingo en moins de 40 numéros',
      'home.feature5': 'Annonces vocales automatisées en plusieurs langues',

      // Jeu
      'game.regular': 'Partie Régulière',
      'game.special': 'Partie Spéciale',
      'game.upcoming': 'Parties à venir',
      'game.inProgress': 'Partie en cours',
      'game.completed': 'Partie terminée',
      'game.startTime': 'Heure de début',
      'game.endTime': 'Heure de fin',
      'game.price': 'Prix',
      'game.prize': 'Prix',
      'game.buy': 'Acheter des cartes',
      'game.buyMoreCards': 'Acheter plus de cartes',
      'game.totalPlayers': 'Nombre de joueurs',
      'game.totalCards': 'Nombre de cartes',
      'game.myCards': 'Mes cartes',
      'game.selectedCards': 'Cartes sélectionnées',
      'game.currentNumber': 'Numéro actuel',
      'game.drawnNumbers': 'Numéros tirés',
      'game.quine': 'Quine (Ligne)',
      'game.bingo': 'Bingo (Carton plein)',
      'game.jackpot': 'Jackpot',
      'game.winners': 'Gagnants',
      'game.noWinners': 'Pas de gagnants',
      'game.waitingForDraw': 'En attente du prochain tirage...',
      'game.salesOpen': 'Vente de cartes ouverte',
      'game.salesClose': 'Fermeture des ventes dans',
      'game.nextDraw': 'Prochain tirage dans',
      'game.gameStarts': 'La partie commence dans',

      // Tableau de bord
      'dashboard.title': 'Tableau de bord',
      'dashboard.welcome': 'Bienvenue',
      'dashboard.balance': 'Solde',
      'dashboard.deposit': 'Dépôt',
      'dashboard.withdraw': 'Retrait',
      'dashboard.upcomingGames': 'Parties à venir',
      'dashboard.recentGames': 'Parties récentes',
      'dashboard.transactions': 'Transactions',
      'dashboard.stats': 'Statistiques',
      'dashboard.noUpcomingGames': 'Aucune partie à venir',
      'dashboard.noRecentGames': 'Aucune partie récente',
      'dashboard.noTransactions': 'Aucune transaction',

      // Profil
      'profile.title': 'Profil',
      'profile.edit': 'Modifier le profil',
      'profile.language': 'Langue',
      'profile.notifications': 'Notifications',
      'profile.theme': 'Thème',
      'profile.sound': 'Son',
      'profile.cardPreferences': 'Préférences de cartes',
      'profile.difficulty': 'Difficulté',
      'profile.defaultCardCount': 'Nombre de cartes par défaut',
      'profile.savePreferences': 'Enregistrer les préférences',
      'profile.preferencesUpdated': 'Préférences mises à jour avec succès',

      // Paiements
      'payment.title': 'Paiement',
      'payment.deposit': 'Dépôt',
      'payment.withdraw': 'Retrait',
      'payment.amount': 'Montant',
      'payment.method': 'Méthode',
      'payment.creditCard': 'Carte de crédit',
      'payment.bankTransfer': 'Virement bancaire',
      'payment.eWallet': 'Portefeuille électronique',
      'payment.virtualCard': 'Carte virtuelle',
      'payment.minAmount': 'Montant minimum',
      'payment.maxAmount': 'Montant maximum',
      'payment.processingFee': 'Frais de traitement',
      'payment.total': 'Total',
      'payment.confirm': 'Confirmer le paiement',
      'payment.success': 'Paiement réussi',
      'payment.failure': 'Paiement échoué',
      'payment.pending': 'Paiement en attente',
      'payment.processing': 'Traitement du paiement...',
      'payment.withdrawalRequested': 'Demande de retrait soumise',
      'payment.withdrawalProcessing': 'Votre retrait est en cours de traitement'
    }
  }
};

// Configuration i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false // React échape déjà les valeurs
    },
    detection: {
      order: ['navigator', 'querystring', 'cookie', 'localStorage', 'htmlTag'],
      lookupQuerystring: 'lang',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie']
    }
  });

export default i18n;