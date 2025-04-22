import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { useTranslation } from 'react-i18next';

// Types d'une partie de bingo
export interface BingoGame {
  id: number;
  startTime: string | Date;
  endTime: string | Date | null;
  status: 'scheduled' | 'active' | 'completed' | 'canceled';
  calledNumbers: number[];
  quineWinnerIds: number[] | null;
  quineCardIds: number[] | null;
  quineNumberCount: number | null;
  bingoWinnerIds: number[] | null;
  bingoCardIds: number[] | null;
  bingoNumberCount: number | null;
  jackpotWon: boolean;
  prize: number;
  quinePrice: number | null;
  bingoPrice: number | null;
  jackpotAmount: number | null;
  isSpecialGame?: boolean;
  cardPrice?: number;
}

// Interface pour le hook useBingoGame
export function useBingoGame() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [error, setError] = useState<Error | null>(null);

  // Récupérer une partie spécifique par son ID
  const getGame = (gameId: number) => {
    return useQuery<BingoGame>({
      queryKey: ['/api/games', gameId],
      enabled: Boolean(gameId),
      refetchInterval: (data) => {
        // Refetch toutes les 5 secondes si la partie est active
        return data?.status === 'active' ? 5000 : false;
      },
    });
  };

  // Récupérer la partie actuelle
  const getCurrentGame = () => {
    return useQuery<BingoGame>({
      queryKey: ['/api/games/current'],
      refetchInterval: (data) => {
        // Refetch toutes les 5 secondes si la partie est active
        return data?.status === 'active' ? 5000 : false;
      },
    });
  };

  // Récupérer les parties récentes
  const getRecentGames = (limit: number = 5) => {
    return useQuery<BingoGame[]>({
      queryKey: ['/api/games/recent', limit],
    });
  };

  // Récupérer les parties à venir
  const getUpcomingGames = (limit: number = 5) => {
    return useQuery<BingoGame[]>({
      queryKey: ['/api/games/upcoming', limit],
    });
  };

  // Se connecter à une partie (signaler que le joueur participe)
  const joinGame = useMutation({
    mutationFn: async (gameId: number) => {
      const response = await apiRequest('POST', `/api/games/${gameId}/join`);
      return await response.json();
    },
    onSuccess: (_, gameId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId] });
      toast({
        title: t('game.joined.title'),
        description: t('game.joined.description'),
        variant: 'success',
      });
    },
    onError: (err: Error) => {
      toast({
        title: t('error'),
        description: err.message,
        variant: 'error',
      });
    },
  });

  // Vérifier si une partie a un gagnant (callback optionnel)
  const checkGameWinner = (game: BingoGame, userId: number): 'none' | 'quine' | 'bingo' => {
    if (!game) return 'none';
    
    if (game.bingoWinnerIds && game.bingoWinnerIds.includes(userId)) {
      return 'bingo';
    }
    
    if (game.quineWinnerIds && game.quineWinnerIds.includes(userId)) {
      return 'quine';
    }
    
    return 'none';
  };

  return {
    getGame,
    getCurrentGame,
    getRecentGames,
    getUpcomingGames,
    joinGame,
    checkGameWinner,
    error,
  };
}