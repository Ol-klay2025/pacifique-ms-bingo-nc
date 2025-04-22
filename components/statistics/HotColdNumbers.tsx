import React from 'react';
import { useTranslation } from 'react-i18next';
import { getBingoColumnLetter } from '../../lib/gameUtils';

interface HotColdNumbersProps {
  hotNumbers: number[];
  coldNumbers: number[];
  numberFrequency: Record<number, number>;
  className?: string;
}

/**
 * Affiche les numéros chauds (fréquemment appelés) et froids (rarement appelés)
 */
const HotColdNumbers: React.FC<HotColdNumbersProps> = ({ 
  hotNumbers, 
  coldNumbers, 
  numberFrequency,
  className = '' 
}) => {
  const { t } = useTranslation();
  
  const renderNumberBall = (number: number, isHot: boolean) => {
    const column = getBingoColumnLetter(number);
    const frequency = numberFrequency[number];
    
    // Déterminer la couleur en fonction de la colonne
    const getColumnColor = (col: string) => {
      switch(col) {
        case 'B': return 'bg-blue-500';
        case 'I': return 'bg-red-500';
        case 'N': return 'bg-green-500';
        case 'G': return 'bg-yellow-500';
        case 'O': return 'bg-pink-500';
        default: return 'bg-purple-500';
      }
    };
    
    return (
      <div 
        key={number}
        className={`
          relative w-14 h-14 rounded-full flex items-center justify-center 
          text-white font-bold ${getColumnColor(column)} 
          transform transition-transform hover:scale-110
          ${isHot ? 'border-2 border-amber-300' : 'border-2 border-blue-300'}
        `}
        title={`${number} - ${t('statistics.frequency')}: ${frequency}`}
      >
        <div className="absolute -top-1 -left-1 bg-white text-xs w-6 h-6 rounded-full flex items-center justify-center text-gray-800 border">
          {column}
        </div>
        <span className="text-lg">{number}</span>
      </div>
    );
  };
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-amber-600 mb-3 flex items-center">
          <span className="mr-2">🔥</span>
          {t('statistics.hotNumbers')}
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {hotNumbers.map(number => renderNumberBall(number, true))}
        </div>
        
        <p className="mt-2 text-sm text-gray-600">
          {t('statistics.hotNumbersDescription')}
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-blue-600 mb-3 flex items-center">
          <span className="mr-2">❄️</span>
          {t('statistics.coldNumbers')}
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {coldNumbers.map(number => renderNumberBall(number, false))}
        </div>
        
        <p className="mt-2 text-sm text-gray-600">
          {t('statistics.coldNumbersDescription')}
        </p>
      </div>
    </div>
  );
};

export default HotColdNumbers;