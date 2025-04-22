import React from 'react';
import { useTranslation } from 'react-i18next';
import { getBingoColumnLetter } from '../../lib/gameUtils';

interface NumberPredictionsProps {
  predictedNumbers: number[];
  className?: string;
}

/**
 * Affiche les prédictions de numéros qui pourraient être appelés prochainement
 */
const NumberPredictions: React.FC<NumberPredictionsProps> = ({ 
  predictedNumbers,
  className = '' 
}) => {
  const { t } = useTranslation();
  
  // Rendu d'une boule de bingo avec animation
  const renderNumberBall = (number: number, index: number) => {
    const column = getBingoColumnLetter(number);
    
    // Déterminer la couleur en fonction de la colonne
    const getColumnColor = (col: string) => {
      switch(col) {
        case 'B': return 'bg-gradient-to-br from-blue-400 to-blue-600';
        case 'I': return 'bg-gradient-to-br from-red-400 to-red-600';
        case 'N': return 'bg-gradient-to-br from-green-400 to-green-600';
        case 'G': return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
        case 'O': return 'bg-gradient-to-br from-pink-400 to-pink-600';
        default: return 'bg-gradient-to-br from-purple-400 to-purple-600';
      }
    };
    
    // Animation pulsante basée sur l'index (pour séquencer l'animation)
    const pulseDelay = index * 0.5;
    
    return (
      <div 
        key={number}
        className={`
          relative w-16 h-16 rounded-full flex items-center justify-center 
          text-white font-bold ${getColumnColor(column)} shadow-lg
          animate-pulse border-2 border-white
        `}
        style={{ animationDelay: `${pulseDelay}s` }}
      >
        <div className="absolute -top-1 -left-1 bg-white text-xs w-6 h-6 rounded-full flex items-center justify-center text-gray-800 border">
          {column}
        </div>
        <span className="text-xl">{number}</span>
      </div>
    );
  };
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">🔮</span>
        {t('statistics.numberPredictions')}
      </h3>
      
      {predictedNumbers.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-4 justify-center py-4">
            {predictedNumbers.map((number, index) => renderNumberBall(number, index))}
          </div>
          
          <div className="mt-4 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h4 className="font-medium text-indigo-700 mb-2">
              {t('statistics.howItWorks')}
            </h4>
            <p className="text-sm text-gray-600">
              {t('statistics.predictionExplanation')}
            </p>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>
              {t('statistics.disclaimerPrediction')}
            </p>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-500">
          {t('statistics.noPredictionData')}
        </div>
      )}
    </div>
  );
};

export default NumberPredictions;