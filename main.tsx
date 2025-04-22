import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ToastProvider } from './components/ui/toast-provider';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './context/auth-context';

// Initialisation de i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    resources: {
      fr: {
        translation: {
          // Traductions générales
          header: {
            welcome: 'Bienvenue',
            balance: 'Solde',
            logout: 'Déconnexion',
          },
          footer: {
            description: 'La plateforme de bingo en ligne qui révolutionne les jeux sociaux avec la technologie blockchain.',
            links: 'Liens',
            rules: 'Règles du jeu',
            faq: 'FAQ',
            contact: 'Contact',
            legal: 'Mentions légales',
            terms: 'Conditions d\'utilisation',
            privacy: 'Politique de confidentialité',
            responsibleGaming: 'Jeu responsable',
            rights: 'Tous droits réservés.',
          },
          // Page d'authentification
          auth: {
            tagline: 'Votre plateforme de bingo en ligne',
            login: 'Connexion',
            register: 'Inscription',
            username: 'Nom d\'utilisateur',
            email: 'Email',
            password: 'Mot de passe',
            confirmPassword: 'Confirmer le mot de passe',
            language: 'Langue préférée',
            loggingIn: 'Connexion en cours...',
            registering: 'Inscription en cours...',
            launchProgress: 'Progression du lancement',
            heroTitle: 'Bienvenue sur MS BINGO',
            heroDescription: 'La plateforme de bingo en ligne qui révolutionne les jeux sociaux avec technologie blockchain, paiements sécurisés et expérience utilisateur de pointe.',
            feature1Title: 'Parties automatisées 24/7',
            feature1Description: 'Parties régulières toutes les heures et parties spéciales toutes les 4 heures.',
            feature2Title: 'Distribution transparente',
            feature2Description: '50% pour Bingo (carte complète), 20% pour Quine (ligne), 10% pour jackpot, 20% pour la plateforme.',
            feature3Title: 'Expérience immersive',
            feature3Description: 'Annonce vocale des numéros, interface intuitive, et vérification automatique des cartes.',
          },
          // Messages de validation
          validation: {
            required: 'Ce champ est requis',
            minLength: 'Doit contenir au moins {{count}} caractères',
            email: 'Adresse email invalide',
            passwordMatch: 'Les mots de passe ne correspondent pas',
          },
          // Page d'accueil
          home: {
            nextGame: 'Prochaine partie',
            startsIn: 'Commence dans',
            buyCards: 'Acheter des cartes',
            gameInfo: 'Informations sur la partie',
            type: 'Type',
            standardGame: 'Partie standard',
            specialGame: 'Partie spéciale',
            players: 'Joueurs',
            registered: 'inscrits',
            prize: 'Cagnotte',
            latestGames: 'Dernières parties',
            date: 'Date',
            winner: 'Gagnant',
            calledNumbers: 'Numéros',
            launchProgress: 'Progression du lancement',
            registeredUsers: 'Utilisateurs inscrits',
            progressInfo: 'MS BINGO sera officiellement lancé lorsque nous atteindrons 1000 utilisateurs inscrits',
            jackpotInfo: 'Jackpot actuel',
            jackpotRule: 'Pour gagner le jackpot, complétez votre carte en moins de 40 numéros.',
          },
          // Page 404
          notFound: {
            title: 'Page introuvable',
            description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
            goHome: 'Retourner à l\'accueil',
          },
          // Choix de langue
          language: {
            french: 'Français',
            english: 'Anglais',
          },
        },
      },
      en: {
        translation: {
          // General translations
          header: {
            welcome: 'Welcome',
            balance: 'Balance',
            logout: 'Logout',
          },
          footer: {
            description: 'The online bingo platform that revolutionizes social gaming with blockchain technology.',
            links: 'Links',
            rules: 'Game Rules',
            faq: 'FAQ',
            contact: 'Contact',
            legal: 'Legal Notices',
            terms: 'Terms of Use',
            privacy: 'Privacy Policy',
            responsibleGaming: 'Responsible Gaming',
            rights: 'All rights reserved.',
          },
          // Authentication page
          auth: {
            tagline: 'Your online bingo platform',
            login: 'Login',
            register: 'Register',
            username: 'Username',
            email: 'Email',
            password: 'Password',
            confirmPassword: 'Confirm Password',
            language: 'Preferred Language',
            loggingIn: 'Logging in...',
            registering: 'Registering...',
            launchProgress: 'Launch Progress',
            heroTitle: 'Welcome to MS BINGO',
            heroDescription: 'The online bingo platform revolutionizing social gaming with blockchain technology, secure payments, and advanced user experience.',
            feature1Title: '24/7 Automated Games',
            feature1Description: 'Regular games every hour and special games every 4 hours.',
            feature2Title: 'Transparent Distribution',
            feature2Description: '50% for Bingo (full card), 20% for Line, 10% for jackpot, 20% for the platform.',
            feature3Title: 'Immersive Experience',
            feature3Description: 'Voice announcements of numbers, intuitive interface, and automatic card verification.',
          },
          // Validation messages
          validation: {
            required: 'This field is required',
            minLength: 'Must contain at least {{count}} characters',
            email: 'Invalid email address',
            passwordMatch: 'Passwords do not match',
          },
          // Home page
          home: {
            nextGame: 'Next Game',
            startsIn: 'Starts in',
            buyCards: 'Buy Cards',
            gameInfo: 'Game Information',
            type: 'Type',
            standardGame: 'Standard Game',
            specialGame: 'Special Game',
            players: 'Players',
            registered: 'registered',
            prize: 'Prize Pool',
            latestGames: 'Latest Games',
            date: 'Date',
            winner: 'Winner',
            calledNumbers: 'Numbers',
            launchProgress: 'Launch Progress',
            registeredUsers: 'Registered Users',
            progressInfo: 'MS BINGO will officially launch when we reach 1000 registered users',
            jackpotInfo: 'Current Jackpot',
            jackpotRule: 'To win the jackpot, complete your card in less than 40 numbers.',
          },
          // 404 page
          notFound: {
            title: 'Page Not Found',
            description: 'The page you\'re looking for doesn\'t exist or has been moved.',
            goHome: 'Return Home',
          },
          // Language selection
          language: {
            french: 'French',
            english: 'English',
          },
        },
      },
    },
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
    },
  });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>
);