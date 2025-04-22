import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../../context/game-context';
import { formatCurrency } from '../../lib/gameUtils';

interface JackpotDisplayProps {
  size?: 'small' | 'medium' | 'large';
  animate?: boolean;
  className?: string;
}

const JackpotDisplay: React.FC<JackpotDisplayProps> = ({ 
  size = 'medium',
  animate = true,
  className = ''
}) => {
  const { t, i18n } = useTranslation();
  const { jackpotAmount } = useGame();
  const [animatedAmount, setAnimatedAmount] = useState(0);
  
  // Size-based styles
  const sizeStyles = {
    small: {
      container: 'p-2 rounded-md',
      title: 'text-sm font-medium mb-1',
      amount: 'text-lg font-bold',
      label: 'text-xs'
    },
    medium: {
      container: 'p-3 rounded-lg',
      title: 'text-base font-medium mb-1',
      amount: 'text-2xl font-bold',
      label: 'text-sm'
    },
    large: {
      container: 'p-4 rounded-xl',
      title: 'text-xl font-medium mb-2',
      amount: 'text-4xl font-bold',
      label: 'text-base'
    }
  };
  
  // Animate the jackpot amount
  useEffect(() => {
    if (!animate || jackpotAmount === 0) {
      setAnimatedAmount(jackpotAmount);
      return;
    }
    
    // Animate from current value to target value
    const start = animatedAmount;
    const end = jackpotAmount;
    const duration = 1500;
    const startTime = Date.now();
    
    const animateValue = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutExpo)
      const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * easing;
      
      setAnimatedAmount(Math.floor(current));
      
      if (progress < 1) {
        requestAnimationFrame(animateValue);
      }
    };
    
    requestAnimationFrame(animateValue);
  }, [jackpotAmount, animate]);
  
  return (
    <div 
      className={`
        bg-gradient-to-r from-primary/90 to-primary
        text-white text-center
        ${sizeStyles[size].container}
        ${className}
      `}
    >
      <div className={sizeStyles[size].title}>
        {t('game.jackpot')}
      </div>
      
      <div className={sizeStyles[size].amount}>
        {formatCurrency(animate ? animatedAmount : jackpotAmount, i18n.language)}
      </div>
      
      <div className={`${sizeStyles[size].label} opacity-80`}>
        {t('game.jackpotDescription')}
      </div>
    </div>
  );
};

export default JackpotDisplay;