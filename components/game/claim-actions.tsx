import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card as BingoCardType } from '../../../shared/schema';
import { checkForQuine, checkForBingo } from '../../lib/gameUtils';

interface ClaimActionsProps {
  gameId: number;
  cards: BingoCardType[];
  calledNumbers: number[];
  onClaimQuine: (gameId: number, cardId: number) => Promise<void>;
  onClaimBingo: (gameId: number, cardId: number) => Promise<void>;
  disableQuine?: boolean;
  disableBingo?: boolean;
}

const ClaimActions: React.FC<ClaimActionsProps> = ({
  gameId,
  cards,
  calledNumbers,
  onClaimQuine,
  onClaimBingo,
  disableQuine = false,
  disableBingo = false
}) => {
  const { t } = useTranslation();
  const [selectedCard, setSelectedCard] = useState<number | null>(cards.length > 0 ? cards[0].id : null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if any of the user's cards have a quine or bingo
  const hasQuine = cards.some(card => checkForQuine(card.numbers, calledNumbers));
  const hasBingo = cards.some(card => checkForBingo(card.numbers, calledNumbers));
  
  // Check if the selected card has a quine or bingo
  const selectedCardObject = cards.find(card => card.id === selectedCard);
  const selectedCardHasQuine = selectedCardObject ? 
    checkForQuine(selectedCardObject.numbers, calledNumbers) : false;
  const selectedCardHasBingo = selectedCardObject ? 
    checkForBingo(selectedCardObject.numbers, calledNumbers) : false;
  
  // Handle claiming a quine
  const handleClaimQuine = async () => {
    if (!selectedCard || disableQuine || !selectedCardHasQuine) return;
    
    setIsClaiming(true);
    setError(null);
    
    try {
      await onClaimQuine(gameId, selectedCard);
    } catch (error: any) {
      setError(error.message || t('game.claimError'));
    } finally {
      setIsClaiming(false);
    }
  };
  
  // Handle claiming a bingo
  const handleClaimBingo = async () => {
    if (!selectedCard || disableBingo || !selectedCardHasBingo) return;
    
    setIsClaiming(true);
    setError(null);
    
    try {
      await onClaimBingo(gameId, selectedCard);
    } catch (error: any) {
      setError(error.message || t('game.claimError'));
    } finally {
      setIsClaiming(false);
    }
  };
  
  if (cards.length === 0) {
    return (
      <div className="bg-muted/20 rounded-lg p-4 text-center">
        <p className="text-muted-foreground">{t('game.noCardsWarning')}</p>
      </div>
    );
  }
  
  return (
    <div className="claim-actions bg-white rounded-lg shadow-md p-4">
      <h3 className="font-medium mb-3">{t('game.claimWin')}</h3>
      
      {cards.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">{t('game.selectCard')}</label>
          <select
            value={selectedCard || ''}
            onChange={(e) => setSelectedCard(parseInt(e.target.value))}
            className="w-full p-2 border rounded"
            disabled={isClaiming}
          >
            {cards.map(card => (
              <option key={card.id} value={card.id}>
                {t('game.cardNumber')} #{card.id}
                {checkForQuine(card.numbers, calledNumbers) && !checkForBingo(card.numbers, calledNumbers) && 
                  ` - ${t('game.hasQuine')}`}
                {checkForBingo(card.numbers, calledNumbers) && 
                  ` - ${t('game.hasBingo')}`}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleClaimQuine}
          disabled={isClaiming || disableQuine || !selectedCardHasQuine}
          className={`
            px-4 py-2 rounded font-medium flex-1
            ${selectedCardHasQuine && !disableQuine
              ? 'bg-accent text-white hover:bg-accent/90'
              : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
            }
          `}
        >
          {isClaiming ? t('common.processing') : t('game.claimQuine')}
        </button>
        
        <button
          onClick={handleClaimBingo}
          disabled={isClaiming || disableBingo || !selectedCardHasBingo}
          className={`
            px-4 py-2 rounded font-medium flex-1
            ${selectedCardHasBingo && !disableBingo
              ? 'bg-success text-white hover:bg-success/90'
              : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
            }
          `}
        >
          {isClaiming ? t('common.processing') : t('game.claimBingo')}
        </button>
      </div>
      
      {error && (
        <div className="mt-3 p-2 bg-destructive/10 text-destructive text-sm rounded">
          {error}
        </div>
      )}
      
      {!hasQuine && !hasBingo && (
        <div className="mt-3 text-sm text-gray-500 text-center">
          {t('game.noValidClaimsYet')}
        </div>
      )}
    </div>
  );
};

export default ClaimActions;