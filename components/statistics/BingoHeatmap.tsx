import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BingoHeatmapProps {
  frequencyData: Record<number, number>;
  className?: string;
}

/**
 * Affiche une heatmap des numéros de bingo basée sur leur fréquence
 */
const BingoHeatmap: React.FC<BingoHeatmapProps> = ({ 
  frequencyData,
  className = '' 
}) => {
  const { t } = useTranslation();
  const [heatmapMode, setHeatmapMode] = useState<'frequency' | 'probability'>('frequency');
  
  // Trouver les valeurs min et max pour la normalisation des couleurs
  const frequencyValues = Object.values(frequencyData);
  const maxFrequency = Math.max(...frequencyValues);
  const minFrequency = Math.min(...frequencyValues.filter(v => v > 0));
  
  // Générer la grille de bingo standard avec 9 colonnes
  const generateBingoGrid = () => {
    const columns = 9;
    const rows = 10;
    const grid = [];
    
    for (let row = 0; row < rows; row++) {
      const rowNumbers = [];
      
      for (let col = 0; col < columns; col++) {
        // Calculer le numéro à cette position
        const number = col * 10 + row + 1;
        
        // Vérifier si le numéro est valide (1-90)
        if (number <= 90) {
          rowNumbers.push(number);
        } else {
          // Ajouter une cellule vide pour conserver la structure de la grille
          rowNumbers.push(null);
        }
      }
      
      grid.push(rowNumbers);
    }
    
    return grid;
  };
  
  // Calcule la couleur de fond basée sur la fréquence
  const getBackgroundColor = (number: number | null) => {
    if (number === null) return 'transparent';
    
    const frequency = frequencyData[number] || 0;
    
    if (frequency === 0) return 'bg-gray-100';
    
    // Normaliser la fréquence entre 0 et 1
    let normalizedValue: number;
    
    if (heatmapMode === 'frequency') {
      // Plus la fréquence est élevée, plus la couleur est intense
      normalizedValue = (frequency - minFrequency) / (maxFrequency - minFrequency);
    } else {
      // Mode probabilité: inverse de la fréquence (moins appelé = plus probable d'être appelé)
      normalizedValue = 1 - (frequency - minFrequency) / (maxFrequency - minFrequency);
    }
    
    // Palette de couleurs pour les heatmaps
    if (heatmapMode === 'frequency') {
      // Bleu (froid) à rouge (chaud)
      const r = Math.floor(normalizedValue * 255);
      const g = Math.floor(Math.max(0, 1 - normalizedValue * 2) * 150);
      const b = Math.floor(Math.max(0, 1 - normalizedValue) * 255);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Vert (haute probabilité) à jaune (moyenne) à rouge (faible)
      const r = Math.floor(normalizedValue < 0.5 ? 255 : 255 * (1 - (normalizedValue - 0.5) * 2));
      const g = Math.floor(normalizedValue > 0.5 ? 255 : 255 * normalizedValue * 2);
      const b = 0;
      return `rgb(${r}, ${g}, ${b})`;
    }
  };
  
  // Calcule la couleur du texte basée sur la couleur de fond
  const getTextColor = (number: number | null) => {
    if (number === null) return 'text-transparent';
    
    const frequency = frequencyData[number] || 0;
    
    if (frequency === 0) return 'text-gray-400';
    
    let normalizedValue: number;
    
    if (heatmapMode === 'frequency') {
      normalizedValue = (frequency - minFrequency) / (maxFrequency - minFrequency);
    } else {
      normalizedValue = 1 - (frequency - minFrequency) / (maxFrequency - minFrequency);
    }
    
    // Si la couleur de fond est foncée, utiliser un texte clair
    return normalizedValue > 0.6 ? 'text-white' : 'text-black';
  };
  
  const bingoGrid = generateBingoGrid();
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {t('statistics.bingoHeatmap')}
        </h3>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setHeatmapMode('frequency')}
            className={`px-3 py-1 text-sm rounded ${
              heatmapMode === 'frequency' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {t('statistics.frequencyMode')}
          </button>
          
          <button
            onClick={() => setHeatmapMode('probability')}
            className={`px-3 py-1 text-sm rounded ${
              heatmapMode === 'probability' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {t('statistics.probabilityMode')}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-9 gap-1 mb-4">
        {/* Entêtes des colonnes (1-9) */}
        {Array.from({ length: 9 }, (_, i) => i + 1).map(col => (
          <div key={`col-${col}`} className="p-1 text-center text-xs font-medium text-gray-600">
            {col}
          </div>
        ))}
      </div>
      
      <div className="grid gap-1">
        {bingoGrid.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="grid grid-cols-9 gap-1">
            {row.map((number, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={`
                  aspect-square flex items-center justify-center text-sm font-medium 
                  rounded transition-colors duration-200 
                  hover:scale-105 transform hover:shadow-md
                  ${getTextColor(number)}
                `}
                style={{ backgroundColor: getBackgroundColor(number) }}
                title={number ? `${number}: ${frequencyData[number] || 0}` : ''}
              >
                {number || ''}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-center">
        <div className="bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 h-2 w-full rounded-full" />
      </div>
      
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        {heatmapMode === 'frequency' ? (
          <>
            <span>{t('statistics.lowFrequency')}</span>
            <span>{t('statistics.highFrequency')}</span>
          </>
        ) : (
          <>
            <span>{t('statistics.lowProbability')}</span>
            <span>{t('statistics.highProbability')}</span>
          </>
        )}
      </div>
      
      <p className="mt-4 text-sm text-gray-600">
        {heatmapMode === 'frequency'
          ? t('statistics.heatmapFrequencyDescription')
          : t('statistics.heatmapProbabilityDescription')}
      </p>
    </div>
  );
};

export default BingoHeatmap;