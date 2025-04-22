import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { getBingoColumnLetter } from '../../lib/gameUtils';

interface NumberFrequencyChartProps {
  frequencyData: Record<number, number>;
  className?: string;
}

/**
 * Graphique de fréquence d'appel des numéros
 */
const NumberFrequencyChart: React.FC<NumberFrequencyChartProps> = ({ 
  frequencyData,
  className = '' 
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'all' | 'columns'>('all');
  
  // Préparer les données pour le graphique
  const prepareChartData = () => {
    // Si mode "tous les numéros"
    if (viewMode === 'all') {
      return Object.entries(frequencyData).map(([num, freq]) => ({
        number: parseInt(num),
        frequency: freq,
        column: getBingoColumnLetter(parseInt(num))
      }));
    }
    
    // Si mode "par colonne"
    const columnData: Record<string, { count: number; sum: number }> = {};
    
    Object.entries(frequencyData).forEach(([num, freq]) => {
      const column = getBingoColumnLetter(parseInt(num));
      if (!columnData[column]) {
        columnData[column] = { count: 0, sum: 0 };
      }
      columnData[column].count++;
      columnData[column].sum += freq;
    });
    
    return Object.entries(columnData).map(([col, data]) => ({
      number: col,
      frequency: data.sum / data.count, // Moyenne par colonne
      column: col
    }));
  };
  
  const chartData = prepareChartData();
  
  // Obtenir la couleur pour une colonne spécifique
  const getColumnColor = (column: string) => {
    switch(column) {
      case 'B': return '#3b82f6'; // blue-500
      case 'I': return '#ef4444'; // red-500
      case 'N': return '#22c55e'; // green-500
      case 'G': return '#eab308'; // yellow-500
      case 'O': return '#ec4899'; // pink-500
      default: return '#8b5cf6'; // violet-500
    }
  };
  
  // Formater le tooltip
  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border shadow-md rounded-md">
          <p className="font-medium">
            {typeof data.number === 'string' 
              ? t('statistics.column', { column: data.number }) 
              : t('statistics.number', { number: data.number })}
          </p>
          <p className="text-sm" style={{ color: getColumnColor(data.column) }}>
            {t('statistics.frequency')}: <strong>{data.frequency.toFixed(1)}</strong>
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  // Si aucune donnée, affiche un message
  if (Object.keys(frequencyData).length === 0) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-semibold mb-4">
          {t('statistics.numberFrequency')}
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {t('statistics.noFrequencyData')}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {t('statistics.numberFrequency')}
        </h3>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {t('statistics.allNumbers')}
          </button>
          
          <button
            onClick={() => setViewMode('columns')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'columns' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {t('statistics.byColumn')}
          </button>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="number" 
            angle={-45} 
            textAnchor="end" 
            tick={{ fontSize: 12 }}
            interval={viewMode === 'columns' ? 0 : 4}
          />
          <YAxis />
          <Tooltip content={renderTooltip} />
          <Bar dataKey="frequency" name={t('statistics.frequency')}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColumnColor(entry.column)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <p className="mt-4 text-sm text-gray-600">
        {viewMode === 'all' 
          ? t('statistics.frequencyDescription') 
          : t('statistics.columnFrequencyDescription')}
      </p>
    </div>
  );
};

export default NumberFrequencyChart;