import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { apiRequest } from '../lib/queryClient';
import { Game, Card as BingoCardType } from '../../shared/schema';

interface GameContextType {
  currentGame: Game | null;
  selectedGame: Game | null;
  upcomingGames: Game[];
  recentGames: Game[];
  jackpotAmount: number;
  userCards: BingoCardType[];
  recentWins: any[]; // For the home page display
  isLoadingGame: boolean;
  isLoadingCards: boolean;
  error: string | null;
  fetchGame: (gameId?: number) => Promise<void>;
  fetchUserCards: (gameId: number) => Promise<void>;
  fetchUpcomingGames: () => Promise<void>;
  fetchRecentGames: () => Promise<void>;
  fetchJackpot: () => Promise<void>;
  buyCards: (gameId: number, quantity: number) => Promise<void>;
  claimQuine: (gameId: number, cardId: number) => Promise<any>;
  claimBingo: (gameId: number, cardId: number) => Promise<any>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [jackpotAmount, setJackpotAmount] = useState(0);
  const [userCards, setUserCards] = useState<BingoCardType[]>([]);
  const [recentWins, setRecentWins] = useState<any[]>([]);
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch game data (current game if no ID is provided)
  const fetchGame = useCallback(async (gameId?: number) => {
    setIsLoadingGame(true);
    setError(null);

    try {
      let endpoint = gameId ? `/api/games/${gameId}` : '/api/games/current';
      const response = await apiRequest('GET', endpoint);

      if (gameId) {
        setSelectedGame(response.game);
      } else {
        setCurrentGame(response.game);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch game data');
      console.error('Game fetch error:', error);
    } finally {
      setIsLoadingGame(false);
    }
  }, []);

  // Fetch user's cards for a specific game
  const fetchUserCards = useCallback(async (gameId: number) => {
    setIsLoadingCards(true);

    try {
      const response = await apiRequest('GET', `/api/games/${gameId}/cards`);
      setUserCards(response.cards || []);
    } catch (error: any) {
      console.error('Cards fetch error:', error);
    } finally {
      setIsLoadingCards(false);
    }
  }, []);

  // Fetch upcoming games
  const fetchUpcomingGames = useCallback(async () => {
    try {
      const response = await apiRequest('GET', '/api/games/upcoming');
      setUpcomingGames(response.games || []);
    } catch (error: any) {
      console.error('Upcoming games fetch error:', error);
    }
  }, []);

  // Fetch recent games
  const fetchRecentGames = useCallback(async () => {
    try {
      const response = await apiRequest('GET', '/api/games/recent');
      setRecentGames(response.games || []);
      
      // Process recent winners for the home page
      const wins = [];
      for (const game of response.games) {
        if (game.quineWinnerId) {
          wins.push({
            id: `quine-${game.id}`,
            gameId: game.id,
            userId: game.quineWinnerId,
            winType: 'quine',
            numbersCalled: game.quineNumberCount,
            amount: Math.floor((game.totalCards || 0) * 80 * 0.2), // 20% of prize pool
            timestamp: game.endTime
          });
        }
        
        if (game.bingoWinnerId) {
          wins.push({
            id: `bingo-${game.id}`,
            gameId: game.id,
            userId: game.bingoWinnerId,
            winType: 'bingo',
            numbersCalled: game.bingoNumberCount,
            amount: Math.floor((game.totalCards || 0) * 80 * 0.5) + (game.jackpotWon ? (game.jackpotAmount || 0) : 0),
            jackpotWon: game.jackpotWon,
            timestamp: game.endTime
          });
        }
      }
      
      // Sort by timestamp descending
      wins.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentWins(wins);
    } catch (error: any) {
      console.error('Recent games fetch error:', error);
    }
  }, []);

  // Fetch current jackpot
  const fetchJackpot = useCallback(async () => {
    try {
      const response = await apiRequest('GET', '/api/jackpot');
      setJackpotAmount(response.jackpot.amount);
    } catch (error: any) {
      console.error('Jackpot fetch error:', error);
    }
  }, []);

  // Buy cards for a game
  const buyCards = useCallback(async (gameId: number, quantity: number) => {
    try {
      await apiRequest('POST', `/api/games/${gameId}/buy-cards`, { quantity });
      // Refresh user's cards after purchase
      fetchUserCards(gameId);
    } catch (error: any) {
      throw error;
    }
  }, [fetchUserCards]);

  // Claim a quine (line)
  const claimQuine = useCallback(async (gameId: number, cardId: number) => {
    try {
      const response = await apiRequest('POST', `/api/games/${gameId}/claim-quine`, {
        cardId
      });
      
      // Refresh game data
      fetchGame(gameId);
      return response;
    } catch (error: any) {
      throw error;
    }
  }, [fetchGame]);

  // Claim a bingo (full card)
  const claimBingo = useCallback(async (gameId: number, cardId: number) => {
    try {
      const response = await apiRequest('POST', `/api/games/${gameId}/claim-bingo`, {
        cardId
      });
      
      // Refresh game data
      fetchGame(gameId);
      return response;
    } catch (error: any) {
      throw error;
    }
  }, [fetchGame]);

  const value = {
    currentGame,
    selectedGame,
    upcomingGames,
    recentGames,
    jackpotAmount,
    userCards,
    recentWins,
    isLoadingGame,
    isLoadingCards,
    error,
    fetchGame,
    fetchUserCards,
    fetchUpcomingGames,
    fetchRecentGames,
    fetchJackpot,
    buyCards,
    claimQuine,
    claimBingo
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};