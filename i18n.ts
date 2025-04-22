import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Ressources de traduction
const resources = {
  en: {
    translation: {
      app: {
        name: "PACIFIQUE MS BINGO",
        description: "The cutting-edge online Bingo platform",
        loading: "Loading..."
      },
      auth: {
        login: "Login",
        register: "Register",
        username: "Username",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        dontHaveAccount: "Don't have an account?",
        alreadyHaveAccount: "Already have an account?",
        passwordMismatch: "Passwords do not match"
      },
      home: {
        title: "Welcome to PACIFIQUE MS BINGO",
        subtitle: "The cutting-edge online Bingo platform that combines blockchain technology, social gaming, and advanced user experience",
        cta: "Start Playing Now",
        launch: "Official Launch Progress",
        currentlyRegistered: "Currently registered",
        users: "users",
        features: "Key Features",
        feature1: "European 90-number format with automated games",
        feature2: "Voice announcements with 1 number per second",
        feature3: "Regular games hourly (€1) and special games every 4 hours (€2.5)",
        feature4: "Transparent prize distribution with blockchain verification",
        feature5: "Multilingual support starting with English and French"
      },
      dashboard: {
        title: "Dashboard",
        balance: "Balance",
        deposit: "Deposit",
        withdraw: "Withdraw",
        games: {
          upcoming: "Upcoming Games",
          live: "Live Game",
          previous: "Previous Games"
        }
      },
      profile: {
        title: "Profile",
        language: "Language",
        save: "Save Changes"
      }
    }
  },
  fr: {
    translation: {
      app: {
        name: "PACIFIQUE MS BINGO",
        description: "La plateforme de Bingo en ligne de pointe",
        loading: "Chargement..."
      },
      auth: {
        login: "Connexion",
        register: "Inscription",
        username: "Nom d'utilisateur",
        email: "Email",
        password: "Mot de passe",
        confirmPassword: "Confirmer le mot de passe",
        dontHaveAccount: "Vous n'avez pas de compte ?",
        alreadyHaveAccount: "Vous avez déjà un compte ?",
        passwordMismatch: "Les mots de passe ne correspondent pas"
      },
      home: {
        title: "Bienvenue sur PACIFIQUE MS BINGO",
        subtitle: "La plateforme de Bingo en ligne de pointe qui combine technologie blockchain, jeux sociaux et expérience utilisateur avancée",
        cta: "Commencer à jouer",
        launch: "Progression vers le lancement officiel",
        currentlyRegistered: "Actuellement inscrits",
        users: "utilisateurs",
        features: "Caractéristiques principales",
        feature1: "Format européen à 90 numéros avec parties automatisées",
        feature2: "Annonces vocales avec 1 numéro par seconde",
        feature3: "Parties régulières toutes les heures (1€) et parties spéciales toutes les 4 heures (2,5€)",
        feature4: "Distribution transparente des prix avec vérification blockchain",
        feature5: "Support multilingue commençant par l'anglais et le français"
      },
      dashboard: {
        title: "Tableau de bord",
        balance: "Solde",
        deposit: "Dépôt",
        withdraw: "Retrait",
        games: {
          upcoming: "Parties à venir",
          live: "Partie en direct",
          previous: "Parties précédentes"
        }
      },
      profile: {
        title: "Profil",
        language: "Langue",
        save: "Enregistrer les modifications"
      }
    }
  }
};

// Initialisation de i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // React escape déjà par défaut
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    }
  });

export default i18n;