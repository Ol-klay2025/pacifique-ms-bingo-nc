import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useState } from 'react';
import { useToast } from './use-toast';
import { useTranslation } from 'react-i18next';
import { Card } from '@shared/schema';

export interface BingoCardPurchaseParams {
  gameId: number;
  count: number;
  asComplete: boolean;
}

/**
 * Hook personnalisé pour gérer les cartes de bingo
 */
export function useBingoCards() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [error, setError] = useState<Error | null>(null);

  // Récupérer les cartes de l'utilisateur pour une partie spécifique
  const getCardsForGame = (gameId: number) => {
    return useQuery<Card[]>({
      queryKey: ['/api/cards/game', gameId],
      enabled: Boolean(gameId),
    });
  };

  // Récupérer toutes les cartes de l'utilisateur
  const getUserCards = () => {
    return useQuery<Card[]>({
      queryKey: ['/api/cards/user'],
    });
  };

  // Récupérer une carte spécifique par son ID
  const getCardById = (cardId: number) => {
    return useQuery<Card>({
      queryKey: ['/api/cards', cardId],
      enabled: Boolean(cardId),
    });
  };

  // Acheter des cartes pour une partie
  const purchaseCards = useMutation({
    mutationFn: async ({ gameId, count, asComplete = false }: BingoCardPurchaseParams) => {
      setError(null);
      try {
        const response = await apiRequest('POST', '/api/cards/purchase', {
          gameId,
          count,
          asComplete,
        });
        return await response.json();
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refresh the card lists
      queryClient.invalidateQueries({ queryKey: ['/api/cards/game', variables.gameId] });
      queryClient.invalidateQueries({ queryKey: ['/api/cards/user'] });
      
      // Also invalidate user data as the balance might have changed
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      toast({
        title: t('bingo.cardsPurchased.title'),
        description: t('bingo.cardsPurchased.description', { count: variables.count }),
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

  // Fonction utilitaire pour vérifier si une carte a une quine
  const checkQuine = (card: number[][], calledNumbers: number[]): boolean => {
    // Une quine est une ligne complète
    for (let row = 0; row < card.length; row++) {
      const rowCompleted = card[row].every(num => num === 0 || calledNumbers.includes(num));
      if (rowCompleted) {
        return true;
      }
    }
    return false;
  };

  // Fonction utilitaire pour vérifier si une carte a un bingo
  const checkBingo = (card: number[][], calledNumbers: number[]): boolean => {
    // Un bingo est toute la carte complétée
    return card.every(row => 
      row.every(num => num === 0 || calledNumbers.includes(num))
    );
  };

  // Soumettre une revendication de quine
  const claimQuine = useMutation({
    mutationFn: async ({ gameId, cardId }: { gameId: number; cardId: number }) => {
      const response = await apiRequest('POST', '/api/games/claim-quine', {
        gameId,
        cardId,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('bingo.quineClaimed.title'),
        description: t('bingo.quineClaimed.description'),
        variant: 'success',
      });
      
      // Rafraîchir les données du jeu
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
    },
    onError: (err: Error) => {
      toast({
        title: t('error'),
        description: err.message,
        variant: 'error',
      });
    },
  });

  // Soumettre une revendication de bingo
  const claimBingo = useMutation({
    mutationFn: async ({ gameId, cardId }: { gameId: number; cardId: number }) => {
      const response = await apiRequest('POST', '/api/games/claim-bingo', {
        gameId,
        cardId,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('bingo.bingoClaimed.title'),
        description: t('bingo.bingoClaimed.description'),
        variant: 'success',
      });
      
      // Rafraîchir les données du jeu et les données utilisateur (solde)
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (err: Error) => {
      toast({
        title: t('error'),
        description: err.message,
        variant: 'error',
      });
    },
  });

  return {
    getCardsForGame,
    getUserCards,
    getCardById,
    purchaseCards,
    checkQuine,
    checkBingo,
    claimQuine,
    claimBingo,
    error,
  };
}