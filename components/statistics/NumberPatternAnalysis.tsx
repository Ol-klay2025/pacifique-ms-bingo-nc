import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Game } from '../../../shared/schema';

interface NumberPatternAnalysisProps {
  games: Game[];
  className?: string;
}

/**
 * Analyse les motifs d'apparition des numéros dans les jeux passés
 */
const NumberPatternAnalysis: React.FC<NumberPatternAnalysisProps> = ({ 
  games,
  className = '' 
}) => {
  const { t } = useTranslation();
  const [analysisType, setAnalysisType] = useState<'sequence' | 'interval' | 'distribution'>('sequence');
  
  // Filtrer les jeux terminés avec des numéros appelés
  const completedGames = useMemo(() => {
    return games.filter(game => 
      game.status === 'completed' && 
      game.calledNumbers && 
      game.calledNumbers.length > 0
    );
  }, [games]);
  
  // Analyse des tendances séquentielles
  const sequenceData = useMemo(() => {
    // Vérifier si nous avons suffisamment de données
    if (completedGames.length === 0) return [];
    
    // Analyser les séquences des 10 premiers numéros appelés dans chaque jeu
    return completedGames.map((game, gameIndex) => {
      const firstNumbers = game.calledNumbers?.slice(0, 10) || [];
      
      // Calculer le nombre de séquences croissantes, décroissantes ou mixtes
      let increasing = 0;
      let decreasing = 0;
      
      for (let i = 0; i < firstNumbers.length - 1; i++) {
        if (firstNumbers[i] < firstNumbers[i + 1]) {
          increasing++;
        } else if (firstNumbers[i] > firstNumbers[i + 1]) {
          decreasing++;
        }
      }
      
      return {
        game: gameIndex + 1, // Indice du jeu
        gameId: game.id, // ID du jeu réel
        date: new Date(game.startTime).toLocaleDateString(),
        increasing,
        decreasing,
        mixed: 9 - increasing - decreasing // Toujours 9 comparaisons possibles avec 10 numéros
      };
    });
  }, [completedGames]);
  
  // Analyse des intervalles entre les numéros consécutifs
  const intervalData = useMemo(() => {
    if (completedGames.length === 0) return [];
    
    const intervals: Record<string, number> = {
      '1-10': 0,   // Intervalles très courts
      '11-20': 0,  // Intervalles courts
      '21-40': 0,  // Intervalles moyens
      '41-70': 0,  // Intervalles longs
      '71+': 0     // Intervalles très longs
    };
    
    // Analyser les intervalles dans chaque jeu
    completedGames.forEach(game => {
      const calledNumbers = game.calledNumbers || [];
      
      for (let i = 0; i < calledNumbers.length - 1; i++) {
        const diff = Math.abs(calledNumbers[i] - calledNumbers[i + 1]);
        
        if (diff <= 10) intervals['1-10']++;
        else if (diff <= 20) intervals['11-20']++;
        else if (diff <= 40) intervals['21-40']++;
        else if (diff <= 70) intervals['41-70']++;
        else intervals['71+']++;
      }
    });
    
    // Convertir en format pour graphique
    return Object.entries(intervals).map(([range, count]) => ({
      range,
      count,
      percentage: completedGames.length > 0 
        ? (count / completedGames.length).toFixed(2) 
        : 0
    }));
  }, [completedGames]);
  
  // Analyse de la distribution par dizaine (1-10, 11-20, etc.)
  const distributionData = useMemo(() => {
    if (completedGames.length === 0) return [];
    
    const distribution: Record<string, number> = {};
    
    // Initialiser les tranches de 10
    for (let i = 0; i < 9; i++) {
      const start = i * 10 + 1;
      const end = Math.min((i + 1) * 10, 90);
      distribution[`${start}-${end}`] = 0;
    }
    
    // Compter les occurrences dans chaque tranche
    completedGames.forEach(game => {
      const calledNumbers = game.calledNumbers || [];
      
      calledNumbers.forEach(num => {
        const decile = Math.floor((num - 1) / 10);
        const start = decile * 10 + 1;
        const end = Math.min((decile + 1) * 10, 90);
        distribution[`${start}-${end}`]++;
      });
    });
    
    // Convertir en format pour graphique
    return Object.entries(distribution).map(([range, count]) => ({
      range,
      count,
      percentage: completedGames.length > 0 
        ? ((count / (completedGames.reduce((sum, game) => 
            sum + (game.calledNumbers?.length || 0), 0))) * 100).toFixed(1) 
        : 0
    }));
  }, [completedGames]);
  
  // Couleurs pour les graphiques
  const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#0ea5e9'];
  
  // Formatage des tooltips pour chaque type de graphique
  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      switch (analysisType) {
        case 'sequence':
          return (
            <div className="bg-white p-2 border shadow-md rounded-md">
              <p className="font-medium">{t('statistics.game')} {data.gameId}</p>
              <p className="text-sm text-green-600">
                {t('statistics.increasingSequences')}: <strong>{data.increasing}</strong>
              </p>
              <p className="text-sm text-red-600">
                {t('statistics.decreasingSequences')}: <strong>{data.decreasing}</strong>
              </p>
              <p className="text-sm text-gray-600">
                {t('statistics.mixedSequences')}: <strong>{data.mixed}</strong>
              </p>
            </div>
          );
        
        case 'interval':
        case 'distribution':
          return (
            <div className="bg-white p-2 border shadow-md rounded-md">
              <p className="font-medium">{t('statistics.range')}: {data.range}</p>
              <p className="text-sm text-primary">
                {t('statistics.count')}: <strong>{data.count}</strong>
              </p>
              <p className="text-sm text-gray-600">
                {analysisType === 'interval' 
                  ? t('statistics.percentageOfGames') 
                  : t('statistics.percentageOfNumbers')}: <strong>{data.percentage}%</strong>
              </p>
            </div>
          );
      }
    }
    
    return null;
  };
  
  // Si aucune donnée, affiche un message
  if (completedGames.length === 0) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-semibold mb-4">
          {t('statistics.patternAnalysis')}
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {t('statistics.noPatternData')}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {t('statistics.patternAnalysis')}
        </h3>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setAnalysisType('sequence')}
            className={`px-3 py-1 text-sm rounded ${
              analysisType === 'sequence' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {t('statistics.sequenceAnalysis')}
          </button>
          
          <button
            onClick={() => setAnalysisType('interval')}
            className={`px-3 py-1 text-sm rounded ${
              analysisType === 'interval' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {t('statistics.intervalAnalysis')}
          </button>
          
          <button
            onClick={() => setAnalysisType('distribution')}
            className={`px-3 py-1 text-sm rounded ${
              analysisType === 'distribution' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {t('statistics.distribution')}
          </button>
        </div>
      </div>
      
      <div className="h-[350px]">
        {/* Graphique pour l'analyse de séquence */}
        {analysisType === 'sequence' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sequenceData}
              margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="game" />
              <YAxis />
              <Tooltip content={renderTooltip} />
              <Legend />
              <Line
                type="monotone"
                dataKey="increasing"
                stroke="#22c55e"
                name={t('statistics.increasingSequences')}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="decreasing"
                stroke="#ef4444"
                name={t('statistics.decreasingSequences')}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="mixed"
                stroke="#8b5cf6"
                name={t('statistics.mixedSequences')}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        
        {/* Graphique pour l'analyse des intervalles */}
        {analysisType === 'interval' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={intervalData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
                nameKey="range"
                label={({ range, percentage }) => `${range}: ${percentage}%`}
              >
                {intervalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={renderTooltip} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
        
        {/* Graphique pour la distribution par dizaine */}
        {analysisType === 'distribution' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={distributionData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip content={renderTooltip} />
              <Legend formatter={(value) => t('statistics.numberCount')} />
              <Bar dataKey="count" name={t('statistics.numberCount')} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <p className="mt-4 text-sm text-gray-600">
        {analysisType === 'sequence'
          ? t('statistics.sequenceDescription')
          : analysisType === 'interval'
            ? t('statistics.intervalDescription')
            : t('statistics.distributionDescription')}
      </p>
    </div>
  );
};

export default NumberPatternAnalysis;