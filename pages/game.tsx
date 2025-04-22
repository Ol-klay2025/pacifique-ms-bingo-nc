import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/use-auth';
import { useBingoGame } from '../hooks/use-bingo-game';
import { useBingoCards } from '../hooks/use-bingo-cards';
import { Loader2, AlertCircle, VolumeX, Volume2 } from 'lucide-react';

// Composants de jeu
import GameInfo from '../components/game/game-info';
import CalledNumbers from '../components/game/called-numbers';
import BingoCardGrid from '../components/game/bingo-card-grid';
import CardPurchase from '../components/game/card-purchase';

// Format du prix standard: 50% Bingo, 20% Quine, 10% Jackpot, 20% Plateforme
const PRIZE_DISTRIBUTION = {
  BINGO: 0.5,
  QUINE: 0.2,
  JACKPOT: 0.1,
  PLATFORM: 0.2
};

// Prix d'une carte standard
const STANDARD_CARD_PRICE = 1; // 1€
const SPECIAL_CARD_PRICE = 2.5; // 2.5€

const GamePage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { getGame, getCurrentGame, joinGame } = useBingoGame();
  
  // État pour le son
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Si l'ID est fourni, utiliser cette partie, sinon utiliser la partie actuelle
  const gameId = id ? parseInt(id) : undefined;
  const gameQuery = gameId ? getGame(gameId) : getCurrentGame();
  
  const { data: game, isLoading, error } = gameQuery;
  
  // Rediriger vers la partie en cours si aucun ID n'est fourni et qu'il n'y a pas de partie en cours
  useEffect(() => {
    if (!isLoading && !game && !id) {
      // Pas de partie en cours, rediriger vers la page d'accueil
      setLocation('/');
    }
  }, [isLoading, game, id, setLocation]);
  
  // Rejoindre automatiquement la partie si elle est active
  useEffect(() => {
    if (game && game.status === 'active' && user) {
      joinGame.mutate(game.id);
    }
  }, [game, user]);
  
  // Récupérer le dernier numéro appelé
  const lastCalledNumber = game?.calledNumbers && game.calledNumbers.length > 0
    ? game.calledNumbers[game.calledNumbers.length - 1]
    : null;
  
  // Gérer la synthèse vocale pour annoncer les numéros
  useEffect(() => {
    if (soundEnabled && lastCalledNumber && game?.status === 'active') {
      // TODO: Intégrer avec le système de synthèse vocale
      // Utiliser la fonction de synthèse vocale pour annoncer le numéro
      const announcement = `${lastCalledNumber}`;
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.lang = 'fr-FR'; // Français par défaut, pourrait être basé sur la langue de l'utilisateur
      
      // Voix féminine avec ton chaleureux et professionnel
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => voice.name.includes('female') || voice.name.includes('femme'));
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      // Réglages pour un ton chaleureux
      utterance.pitch = 1.1; // Légèrement plus aigu
      utterance.rate = 0.9; // Légèrement plus lent
      
      window.speechSynthesis.speak(utterance);
    }
  }, [lastCalledNumber, soundEnabled, game?.status]);
  
  // Gérer l'activation/désactivation du son
  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
    
    // Annuler toutes les annonces en cours si on désactive le son
    if (soundEnabled) {
      window.speechSynthesis.cancel();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-start">
          <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
          <div>
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-1">
              {t('error.loadingGame')}
            </h2>
            <p className="text-red-700 dark:text-red-400">
              {error.message || t('error.tryAgain')}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!game) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{t('game.noActiveGame')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('game.checkBackLater')}
          </p>
          <button
            onClick={() => setLocation('/')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            {t('backToHome')}
          </button>
        </div>
      </div>
    );
  }
  
  // Calculer le prix des cartes en fonction du type de partie
  const cardPrice = game.isSpecialGame ? SPECIAL_CARD_PRICE : STANDARD_CARD_PRICE;
  
  // Si un utilisateur n'est pas connecté, montrer un message
  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <GameInfo 
          gameId={game.id}
          status={game.status}
          startTime={game.startTime}
          endTime={game.endTime}
          prize={game.prize}
          quinePrice={game.quinePrice}
          bingoPrice={game.bingoPrice}
          jackpotAmount={game.jackpotAmount}
          jackpotWon={game.jackpotWon}
          isSpecialGame={game.isSpecialGame}
          cardPrice={cardPrice}
          className="mb-6"
        />
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
          <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
            {t('game.loginRequired')}
          </h2>
          <p className="text-blue-700 dark:text-blue-400 mb-4">
            {t('game.loginToPlay')}
          </p>
          <button
            onClick={() => setLocation('/auth')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            {t('login')}
          </button>
        </div>
      </div>
    );
  }
  
  // Interface principale de la partie pour les utilisateurs connectés
  return (
    <div className="container mx-auto py-8 px-4">
      {/* En-tête de la partie avec contrôle du son */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {t('game.title')} #{game.id}
        </h1>
        
        <button
          onClick={toggleSound}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          title={soundEnabled ? t('game.muteAnnouncements') : t('game.enableAnnouncements')}
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Interface principale de la partie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche: Infos de la partie et nombres appelés */}
        <div className="space-y-6">
          <GameInfo 
            gameId={game.id}
            status={game.status}
            startTime={game.startTime}
            endTime={game.endTime}
            prize={game.prize}
            quinePrice={game.quinePrice}
            bingoPrice={game.bingoPrice}
            jackpotAmount={game.jackpotAmount}
            jackpotWon={game.jackpotWon}
            isSpecialGame={game.isSpecialGame}
            cardPrice={cardPrice}
          />
          
          <CalledNumbers 
            numbers={game.calledNumbers || []}
            lastCalled={lastCalledNumber}
          />
        </div>
        
        {/* Colonne centrale et droite: Grille de cartes et achat de cartes */}
        <div className="lg:col-span-2">
          {/* Option d'achat de cartes uniquement pour les parties programmées */}
          {game.status === 'scheduled' && (
            <CardPurchase 
              gameId={game.id}
              cardPrice={cardPrice}
              isSpecialGame={game.isSpecialGame}
              className="mb-6"
            />
          )}
          
          {/* Grille de cartes du joueur */}
          <BingoCardGrid
            gameId={game.id}
            calledNumbers={game.calledNumbers || []}
            quineWinnerIds={game.quineWinnerIds}
            quineCardIds={game.quineCardIds}
            bingoWinnerIds={game.bingoWinnerIds}
            bingoCardIds={game.bingoCardIds}
            userId={user.id}
            disabled={game.status !== 'active'}
          />
        </div>
      </div>
    </div>
  );
};

export default GamePage;