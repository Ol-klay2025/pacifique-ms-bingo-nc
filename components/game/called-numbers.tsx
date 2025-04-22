import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface CalledNumbersProps {
  numbers: number[];
  lastCalled?: number | null;
  highlightLast?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Composant pour afficher la grille des numéros appelés dans une partie de bingo
 */
const CalledNumbers: React.FC<CalledNumbersProps> = ({
  numbers,
  lastCalled = null,
  highlightLast = true,
  compact = false,
  className = '',
}) => {
  const { t } = useTranslation();
  
  // Créer un tableau de tous les numéros de 1 à 90
  const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
  
  // Déterminer la classe CSS pour un numéro
  const getNumberClass = (num: number) => {
    const isCalled = numbers.includes(num);
    const isLastCalled = num === lastCalled;
    
    return cn(
      'flex items-center justify-center rounded-full aspect-square font-medium transition-all',
      compact ? 'text-xs w-7 h-7' : 'text-sm w-9 h-9',
      isCalled && 'bg-primary text-white shadow-sm',
      !isCalled && 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
      isLastCalled && highlightLast && 'ring-2 ring-amber-400 dark:ring-amber-500 animate-pulse'
    );
  };

  return (
    <div className={className}>
      {/* Titre et compteur */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">{t('bingo.calledNumbers')}</h3>
        <span className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
          {numbers.length}/90
        </span>
      </div>
      
      {/* Dernier numéro appelé */}
      {lastCalled && (
        <div className="mb-4 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t('bingo.lastCalled')}
          </div>
          <div className="mx-auto bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
            {lastCalled}
          </div>
        </div>
      )}
      
      {/* Grille des numéros */}
      <div className="grid grid-cols-10 gap-1">
        {allNumbers.map(num => (
          <div key={num} className={getNumberClass(num)}>
            {num}
          </div>
        ))}
      </div>
      
      {/* Légende */}
      <div className="flex justify-center mt-3 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 rounded-full bg-primary mr-1"></div>
          {t('bingo.called')}
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-100 dark:bg-gray-800 mr-1"></div>
          {t('bingo.notCalled')}
        </div>
      </div>
    </div>
  );
};

export default CalledNumbers;