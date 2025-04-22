import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/auth-context';
import { formatCurrency } from '../../lib/gameUtils';

interface BuyCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyCards: (quantity: number, price: number) => void;
}

const BuyCardsModal: React.FC<BuyCardsModalProps> = ({ 
  isOpen, 
  onClose, 
  onBuyCards 
}) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  // Card purchase options
  const cardOptions = [1, 3, 6, 12, 24];
  const CARD_PRICE = 100; // 100 cents = €1
  
  // Form state
  const [quantity, setQuantity] = useState(3);
  const [customQuantity, setCustomQuantity] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  
  // Calculate total price
  const totalPrice = (isCustom ? parseInt(customQuantity) || 0 : quantity) * CARD_PRICE;
  const insufficientFunds = user ? totalPrice > user.balance : false;
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuantity = isCustom ? parseInt(customQuantity) : quantity;
    
    if (finalQuantity > 0) {
      onBuyCards(finalQuantity, totalPrice);
      handleClose();
    }
  };
  
  // Reset form on close
  const handleClose = () => {
    setQuantity(3);
    setCustomQuantity('');
    setIsCustom(false);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            {t('game.buyCards')}
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label={t('common.close')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Card pricing info */}
          <div className="bg-muted/20 p-3 rounded text-center">
            <p>{t('game.cardPriceInfo', { price: formatCurrency(CARD_PRICE, i18n.language) })}</p>
          </div>
          
          {/* Quick quantity selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('game.selectQuantity')}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {cardOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setQuantity(option);
                    setIsCustom(false);
                  }}
                  className={`
                    p-2 rounded border text-center
                    ${!isCustom && quantity === option 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary'}
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Custom quantity option */}
          <div>
            <label htmlFor="custom-quantity" className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="custom-checkbox"
                checked={isCustom}
                onChange={(e) => setIsCustom(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                {t('game.customQuantity')}
              </span>
            </label>
            
            {isCustom && (
              <div className="mt-2">
                <input
                  type="number"
                  id="custom-quantity"
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(e.target.value)}
                  placeholder={t('game.enterQuantity')}
                  min="1"
                  max="99"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}
          </div>
          
          {/* Total price info */}
          <div className="bg-primary/10 p-3 rounded flex justify-between items-center">
            <span className="font-medium">{t('game.totalPrice')}</span>
            <span className="font-bold text-lg">
              {formatCurrency(totalPrice, i18n.language)}
            </span>
          </div>
          
          {/* Account balance (if logged in) */}
          {user && (
            <div className="flex justify-between items-center text-sm">
              <span>{t('game.yourBalance')}</span>
              <span className={`font-medium ${insufficientFunds ? 'text-destructive' : ''}`}>
                {formatCurrency(user.balance, i18n.language)}
              </span>
            </div>
          )}
          
          {/* Low balance warning */}
          {insufficientFunds && (
            <div className="bg-destructive/10 p-3 rounded text-destructive text-sm">
              {t('game.insufficientFunds')}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              className="w-full p-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
              disabled={totalPrice <= 0 || insufficientFunds}
            >
              {t('game.confirmPurchase')}
            </button>
            
            {insufficientFunds && user && (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  window.location.href = '/checkout';
                }}
                className="w-full p-2 border border-primary text-primary rounded hover:bg-primary/10 transition-colors"
              >
                {t('game.addFunds')}
              </button>
            )}
            
            {!user && (
              <p className="text-center text-sm text-gray-500">
                {t('game.loginToSave')}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyCardsModal;