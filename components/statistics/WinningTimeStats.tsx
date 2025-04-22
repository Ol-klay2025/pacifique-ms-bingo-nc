import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Gauge,
  GaugeChart,
  Rectangle
} from 'recharts';
import { Game } from '../../../shared/schema';

interface WinningTimeStatsProps {
  games: Game[];
  className?: string;
}

/**
 * Affiche les statistiques de temps nécessaire pour obtenir quine et bingo
 */
const WinningTimeStats: React.FC<WinningTimeStatsProps> = ({ 
  games,
  className = '' 
}) => {
  const { t } = useTranslation();
  
  // Filtrer les jeux terminés avec des résultats
  const completedGames = games.filter(game => 
    game.status === 'completed' && 
    (game.quineNumberCount !== null || game.bingoNumberCount !== null)
  );
  
  // Calculer les statistiques de nombre d'appels pour quine et bingo
  const calculateStats = () => {
    if (completedGames.length === 0) {
      return {
        quineAvg: 0,
        bingoAvg: 0,
        quineMin: 0,
        quineMax: 0,
        bingoMin: 0, 
        bingoMax: 0,
        jackpotThreshold: 40, // Seuil pour le jackpot (nombre maximum d'appels)
        jackpotPercentage: 0, // Pourcentage de jeux où le jackpot a été gagné
        callCounts: {
          "1-20": 0,
          "21-30": 0,
          "31-40": 0,
          "41-50": 0,
          "51+": 0
        }
      };
    }
    
    // Collecter et filtrer les données valides
    const quineNumbers = completedGames
      .filter(game => game.quineNumberCount !== null)
      .map(game => game.quineNumberCount!);
    
    const bingoNumbers = completedGames
      .filter(game => game.bingoNumberCount !== null)
      .map(game => game.bingoNumberCount!);
    
    // Calculer les moyennes et limites
    const quineAvg = quineNumbers.length > 0 
      ? quineNumbers.reduce((sum, val) => sum + val, 0) / quineNumbers.length
      : 0;
    
    const bingoAvg = bingoNumbers.length > 0
      ? bingoNumbers.reduce((sum, val) => sum + val, 0) / bingoNumbers.length
      : 0;
    
    // Calculer le nombre de jeux où le jackpot a été gagné
    const jackpotThreshold = 40;
    const jackpotGames = completedGames.filter(game => 
      game.jackpotWon === true || 
      (game.bingoNumberCount !== null && game.bingoNumberCount <= jackpotThreshold)
    );
    
    const jackpotPercentage = bingoNumbers.length > 0
      ? (jackpotGames.length / bingoNumbers.length) * 100
      : 0;
    
    // Catégoriser les jeux par nombre d'appels de bingo
    const callCounts = {
      "1-20": 0,
      "21-30": 0,
      "31-40": 0,
      "41-50": 0,
      "51+": 0
    };
    
    bingoNumbers.forEach(count => {
      if (count <= 20) callCounts["1-20"]++;
      else if (count <= 30) callCounts["21-30"]++;
      else if (count <= 40) callCounts["31-40"]++;
      else if (count <= 50) callCounts["41-50"]++;
      else callCounts["51+"]++;
    });
    
    return {
      quineAvg: parseFloat(quineAvg.toFixed(1)),
      bingoAvg: parseFloat(bingoAvg.toFixed(1)),
      quineMin: quineNumbers.length > 0 ? Math.min(...quineNumbers) : 0,
      quineMax: quineNumbers.length > 0 ? Math.max(...quineNumbers) : 0,
      bingoMin: bingoNumbers.length > 0 ? Math.min(...bingoNumbers) : 0,
      bingoMax: bingoNumbers.length > 0 ? Math.max(...bingoNumbers) : 0,
      jackpotThreshold,
      jackpotPercentage: parseFloat(jackpotPercentage.toFixed(1)),
      callCounts
    };
  };
  
  const stats = calculateStats();
  
  // Préparer les données pour le graphique radar
  const radarData = [
    {
      subject: t('statistics.quickWin'),
      quine: stats.quineMin,
      bingo: stats.bingoMin,
      fullMark: 90
    },
    {
      subject: t('statistics.averageWin'),
      quine: stats.quineAvg,
      bingo: stats.bingoAvg,
      fullMark: 90
    },
    {
      subject: t('statistics.slowWin'),
      quine: stats.quineMax,
      bingo: stats.bingoMax,
      fullMark: 90
    },
    {
      subject: t('statistics.variability'),
      quine: stats.quineMax - stats.quineMin,
      bingo: stats.bingoMax - stats.bingoMin,
      fullMark: 90
    }
  ];
  
  // Préparer les données pour le graphique de distribution
  const distributionData = Object.entries(stats.callCounts).map(([range, count]) => ({
    range,
    count,
    percentage: completedGames.length > 0
      ? ((count / completedGames.filter(g => g.bingoNumberCount !== null).length) * 100).toFixed(1)
      : 0
  }));
  
  // Données pour la jauge de jackpot
  const gaugeData = [
    { name: t('statistics.unlikely'), value: 100 - stats.jackpotPercentage },
    { name: t('statistics.jackpotChance'), value: stats.jackpotPercentage }
  ];
  
  // Couleurs pour les graphiques
  const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];
  
  // Si aucune donnée, affiche un message
  if (completedGames.length === 0) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-semibold mb-4">
          {t('statistics.winningTimeStats')}
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {t('statistics.noTimeStats')}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <h3 className="text-lg font-semibold mb-4">
        {t('statistics.winningTimeStats')}
      </h3>
      
      {/* Statistiques générales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-blue-600 font-medium">{t('statistics.quineStats')}</div>
          <div className="text-2xl font-bold">{stats.quineAvg}</div>
          <div className="text-sm text-gray-600">{t('statistics.averageCalls')}</div>
          <div className="text-xs text-gray-500 mt-1">
            {t('statistics.minMaxCalls', { min: stats.quineMin, max: stats.quineMax })}
          </div>
        </div>
        
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-red-600 font-medium">{t('statistics.bingoStats')}</div>
          <div className="text-2xl font-bold">{stats.bingoAvg}</div>
          <div className="text-sm text-gray-600">{t('statistics.averageCalls')}</div>
          <div className="text-xs text-gray-500 mt-1">
            {t('statistics.minMaxCalls', { min: stats.bingoMin, max: stats.bingoMax })}
          </div>
        </div>
      </div>
      
      {/* Graphique radar - Comparaison des stats */}
      <div className="mb-6 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis />
            <Tooltip />
            <Radar 
              name={t('statistics.quine')} 
              dataKey="quine" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.6} 
            />
            <Radar 
              name={t('statistics.bingo')} 
              dataKey="bingo" 
              stroke="#ef4444" 
              fill="#ef4444" 
              fillOpacity={0.6} 
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Jauge de probabilité du jackpot */}
      <div className="mb-6">
        <div className="text-center mb-2 font-medium text-gray-700">
          {t('statistics.jackpotChanceTitle')}
        </div>
        <div className="flex justify-center">
          <div 
            className="relative w-64 h-6 rounded-full overflow-hidden bg-gray-200"
            title={`${stats.jackpotPercentage}% ${t('statistics.jackpotChance')}`}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
              style={{ width: `${stats.jackpotPercentage}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
              {stats.jackpotPercentage}% {t('statistics.jackpotChance')}
            </div>
          </div>
        </div>
        <div className="text-center mt-2 text-xs text-gray-600">
          {t('statistics.jackpotThreshold', { threshold: stats.jackpotThreshold })}
        </div>
      </div>
      
      {/* Données de distribution */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="font-medium mb-2">{t('statistics.bingoCallDistribution')}</div>
        <div className="flex justify-between">
          {distributionData.map((item, index) => (
            <div key={item.range} className="text-center">
              <div 
                className="w-full h-16 flex items-end justify-center mx-1"
                title={`${item.range}: ${item.count} (${item.percentage}%)`}
              >
                <div 
                  className="w-6 rounded-t-lg" 
                  style={{ 
                    height: `${Math.max(5, (parseInt(item.percentage as string) * 16) / 100)}px`,
                    backgroundColor: COLORS[index % COLORS.length]
                  }}
                ></div>
              </div>
              <div className="text-xs mt-1">{item.range}</div>
              <div className="text-xs text-gray-500">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </div>
      
      <p className="mt-4 text-sm text-gray-600">
        {t('statistics.winningTimeDescription')}
      </p>
    </div>
  );
};

export default WinningTimeStats;