import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BingoCard from './bingo-card';
import { useBingoCards } from '../../hooks/use-bingo-cards';
import { Card } from '@shared/schema';
import { Loader2, AlertCircle } from 'lucide-react';

interface BingoCardGridProps {
  gameId: number;
  calledNumbers: number[];
  quineWinnerIds?: number[] | null;
  quineCardIds?: number[] | null;
  bingoWinnerIds?: number[] | null;
  bingoCardIds?: number[] | null;
  userId: number;
  onQuineClaim?: (cardId: number) => void;
  onBingoClaim?: (cardId: number) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Grille de cartes de bingo pour un joueur dans une partie spécifique
 */
const BingoCardGrid: React.FC<BingoCardGridProps> = ({
  gameId,
  calledNumbers,
  quineWinnerIds = null,
  quineCardIds = null,
  bingoWinnerIds = null,
  bingoCardIds = null,
  userId,
  onQuineClaim,
  onBingoClaim,
  disabled = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const { getCardsForGame, checkQuine, checkBingo, claimQuine, claimBingo } = useBingoCards();
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  
  // Récupérer les cartes du joueur pour cette partie
  const { data: cards, isLoading, error } = getCardsForGame(gameId);
  
  // Vérifier si le joueur a gagné une quine
  const hasQuine = quineWinnerIds?.includes(userId) || false;
  
  // Vérifier si le joueur a gagné un bingo
  const hasBingo = bingoWinnerIds?.includes(userId) || false;
  
  // Gérer le clic sur une carte
  const handleCardClick = (cardId: number) => {
    if (disabled) return;
    
    setSelectedCard(cardId === selectedCard ? null : cardId);
  };
  
  // Vérifier et réclamer une quine
  const handleQuineClaim = async (cardId: number) => {
    if (disabled || !onQuineClaim) return;
    
    // Vérifier si la quine est valide
    const card = cards?.find(c => c.id === cardId);
    if (card && checkQuine(card.numbers, calledNumbers)) {
      // Réclamer la quine
      await claimQuine.mutateAsync({ gameId, cardId });
      
      if (onQuineClaim) {
        onQuineClaim(cardId);
      }
    }
  };
  
  // Vérifier et réclamer un bingo
  const handleBingoClaim = async (cardId: number) => {
    if (disabled || !onBingoClaim) return;
    
    // Vérifier si le bingo est valide
    const card = cards?.find(c => c.id === cardId);
    if (card && checkBingo(card.numbers, calledNumbers)) {
      // Réclamer le bingo
      await claimBingo.mutateAsync({ gameId, cardId });
      
      if (onBingoClaim) {
        onBingoClaim(cardId);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center">
        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
        <span>{t('error.loadingCards')}</span>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-2">{t('bingo.noCards')}</p>
        <p className="text-sm">{t('bingo.purchaseCardPrompt')}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Grille de cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card: Card) => {
          // Déterminer si cette carte a une quine ou un bingo
          const hasQuineWin = quineCardIds?.includes(card.id) || false;
          const hasBingoWin = bingoCardIds?.includes(card.id) || false;
          
          // Vérifier si cette carte peut potentiellement gagner
          const canClaimQuine = !hasQuine && 
                               !disabled && 
                               checkQuine(card.numbers, calledNumbers);
          
          const canClaimBingo = !hasBingo && 
                               !disabled && 
                               checkBingo(card.numbers, calledNumbers);
          
          return (
            <div key={card.id} className="flex flex-col space-y-2">
              <BingoCard
                numbers={card.numbers}
                calledNumbers={calledNumbers}
                cardId={card.id}
                highlight={hasBingoWin ? 'bingo' : hasQuineWin ? 'quine' : null}
                disabled={disabled}
                onCardClick={() => handleCardClick(card.id)}
                className={selectedCard === card.id ? 'ring-2 ring-primary' : ''}
              />
              
              {/* Actions pour la carte sélectionnée */}
              {selectedCard === card.id && (
                <div className="flex space-x-2">
                  {canClaimQuine && (
                    <button
                      onClick={() => handleQuineClaim(card.id)}
                      disabled={claimQuine.isPending}
                      className="flex-1 py-1 px-3 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 rounded hover:bg-amber-200 dark:hover:bg-amber-800/50"
                    >
                      {claimQuine.isPending ? (
                        <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
                      ) : null}
                      {t('bingo.claimQuine')}
                    </button>
                  )}
                  
                  {canClaimBingo && (
                    <button
                      onClick={() => handleBingoClaim(card.id)}
                      disabled={claimBingo.isPending}
                      className="flex-1 py-1 px-3 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800/50"
                    >
                      {claimBingo.isPending ? (
                        <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
                      ) : null}
                      {t('bingo.claimBingo')}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Instructions */}
      {cards.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            {t('bingo.cardInstructions')}
          </p>
        </div>
      )}
    </div>
  );
};

export default BingoCardGrid;