import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBingoCards } from '../../hooks/use-bingo-cards';
import { useAuth } from '../../hooks/use-auth';
import { Loader2, Plus, Minus, ShoppingCart, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface CardPurchaseProps {
  gameId: number;
  cardPrice: number;
  isSpecialGame?: boolean;
  onPurchaseComplete?: () => void;
  className?: string;
}

/**
 * Composant pour acheter des cartes de bingo pour une partie
 */
const CardPurchase: React.FC<CardPurchaseProps> = ({
  gameId,
  cardPrice,
  isSpecialGame = false,
  onPurchaseComplete,
  className = '',
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { purchaseCards } = useBingoCards();
  
  const [cardCount, setCardCount] = useState(1);
  const [asCompleteSeries, setAsCompleteSeries] = useState(false);
  
  const totalCost = cardCount * cardPrice;
  const userCanAfford = user ? user.balance >= totalCost : false;
  
  // Déterminer des limites raisonnables pour le nombre de cartes
  const maxCards = 30; // Maximum 30 cartes par utilisateur par partie
  
  // Augmenter le nombre de cartes
  const incrementCardCount = () => {
    if (asCompleteSeries) {
      // Si on achète des séries complètes, incrémenter par 6
      setCardCount(prev => Math.min(prev + 6, maxCards));
    } else {
      setCardCount(prev => Math.min(prev + 1, maxCards));
    }
  };
  
  // Diminuer le nombre de cartes
  const decrementCardCount = () => {
    if (asCompleteSeries) {
      // Si on achète des séries complètes, décrémenter par 6
      setCardCount(prev => Math.max(prev - 6, 6));
    } else {
      setCardCount(prev => Math.max(prev - 1, 1));
    }
  };
  
  // Gérer le changement de mode d'achat (cartes individuelles vs séries complètes)
  const handleAsCompleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isComplete = e.target.checked;
    setAsCompleteSeries(isComplete);
    
    // Ajuster le nombre de cartes au changement de mode
    if (isComplete) {
      // Arrondir au multiple de 6 supérieur
      setCardCount(Math.ceil(cardCount / 6) * 6);
    }
  };
  
  // Effectuer l'achat des cartes
  const handlePurchase = async () => {
    if (!userCanAfford) return;
    
    await purchaseCards.mutateAsync({
      gameId,
      count: cardCount,
      asComplete: asCompleteSeries,
    });
    
    if (onPurchaseComplete) {
      onPurchaseComplete();
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-3">{t('bingo.purchaseCards')}</h3>
      
      <div className="space-y-4">
        {/* Informations de prix */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('bingo.cardPrice')}</p>
            <p className="font-medium">{formatCurrency(cardPrice)}</p>
          </div>
          {isSpecialGame && (
            <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 text-xs font-medium rounded">
              {t('bingo.specialGame')}
            </span>
          )}
        </div>
        
        {/* Sélecteur de quantité */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
            {t('bingo.cardCount')}
          </label>
          <div className="flex items-center">
            <button
              onClick={decrementCardCount}
              disabled={cardCount <= (asCompleteSeries ? 6 : 1)}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-l hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-center min-w-[60px] border-y">
              {cardCount}
            </div>
            <button
              onClick={incrementCardCount}
              disabled={cardCount >= maxCards}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-r hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Option série complète */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="asComplete"
            checked={asCompleteSeries}
            onChange={handleAsCompleteChange}
            className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="asComplete" className="text-sm">
            {t('bingo.completeSeries')}
          </label>
        </div>
        
        {/* Récapitulatif de l'achat */}
        <div className="pt-3 border-t">
          <div className="flex justify-between mb-1">
            <span>{t('bingo.totalCost')}:</span>
            <span className="font-semibold">{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span>{t('bingo.balance')}:</span>
            <span className={`font-semibold ${!userCanAfford ? 'text-red-600 dark:text-red-400' : ''}`}>
              {user ? formatCurrency(user.balance) : '—'}
            </span>
          </div>
          
          {!userCanAfford && (
            <div className="flex items-center text-sm text-red-600 dark:text-red-400 mb-3">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {t('bingo.insufficientFunds')}
            </div>
          )}
          
          <button
            onClick={handlePurchase}
            disabled={!userCanAfford || purchaseCards.isPending}
            className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary/90 disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 flex items-center justify-center"
          >
            {purchaseCards.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('processing')}
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                {t('bingo.buyCards')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardPurchase;