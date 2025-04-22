import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { Game } from '../../../shared/schema';
import { statisticsService } from '../../lib/statisticsService';

interface NumberPairsAnalysisProps {
  games: Game[];
  className?: string;
}

/**
 * Analyse et affiche les paires de numéros qui apparaissent souvent ensemble
 */
const NumberPairsAnalysis: React.FC<NumberPairsAnalysisProps> = ({ 
  games,
  className = '' 
}) => {
  const { t } = useTranslation();
  const [pairLimit, setPairLimit] = useState(10);
  
  // Analyser les paires de numéros
  const pairsData = statisticsService.analyzeNumberPairs(games, pairLimit);
  
  // Convertir les données pour le graphique de dispersion
  const scatterData = pairsData.map(pairInfo => ({
    x: pairInfo.pair[0],
    y: pairInfo.pair[1],
    z: pairInfo.count,
    frequency: pairInfo.count,
    percentage: pairInfo.percentage.toFixed(1)
  }));
  
  // Données pour la liste des paires
  const listData = pairsData.map((pairInfo, index) => ({
    rank: index + 1,
    pair: `${pairInfo.pair[0]}-${pairInfo.pair[1]}`,
    count: pairInfo.count,
    percentage: pairInfo.percentage.toFixed(1)
  }));
  
  // Générer des couleurs en fonction de la fréquence
  const getColor = (frequency: number) => {
    // Trouver min et max pour normaliser
    const counts = pairsData.map(p => p.count);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    
    // Normaliser la fréquence entre 0 et 1
    const normalized = maxCount > minCount
      ? (frequency - minCount) / (maxCount - minCount)
      : 0.5;
    
    // Générer une couleur du bleu au rouge
    const r = Math.floor(normalized * 255);
    const g = Math.floor(Math.max(0, 0.5 - Math.abs(normalized - 0.5)) * 255);
    const b = Math.floor((1 - normalized) * 255);
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Formatage des tooltips
  const renderScatterTooltip = (props: any) => {
    const { active, payload } = props;
    
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border shadow-md rounded-md">
          <p className="font-medium">
            {t('statistics.pairNumbers', { num1: data.x, num2: data.y })}
          </p>
          <p className="text-sm text-primary">
            {t('statistics.occurrences')}: <strong>{data.frequency}</strong>
          </p>
          <p className="text-sm text-gray-600">
            {t('statistics.pairPercentage')}: <strong>{data.percentage}%</strong>
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  // Si aucune donnée, affiche un message
  if (pairsData.length === 0) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-semibold mb-4">
          {t('statistics.numberPairsAnalysis')}
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {t('statistics.noPairsData')}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {t('statistics.numberPairsAnalysis')}
        </h3>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">{t('statistics.showTopPairs')}</span>
          <select
            value={pairLimit}
            onChange={(e) => setPairLimit(Number(e.target.value))}
            className="p-1 border rounded text-sm"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Graphique de dispersion */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="Numéro 1" domain={[1, 90]} />
              <YAxis type="number" dataKey="y" name="Numéro 2" domain={[1, 90]} />
              <ZAxis type="number" dataKey="z" range={[50, 400]} />
              <Tooltip content={renderScatterTooltip} />
              <Scatter name={t('statistics.numberPairs')} data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.frequency)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        {/* Liste des paires */}
        <div className="overflow-auto max-h-[300px] border rounded">
          <table className="min-w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('statistics.rank')}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('statistics.pair')}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('statistics.count')}
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('statistics.percent')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {listData.map((item) => (
                <tr key={item.pair} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {item.rank}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    {item.pair}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {item.count}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {item.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <p className="mt-4 text-sm text-gray-600">
        {t('statistics.pairsDescription')}
      </p>
    </div>
  );
};

export default NumberPairsAnalysis;