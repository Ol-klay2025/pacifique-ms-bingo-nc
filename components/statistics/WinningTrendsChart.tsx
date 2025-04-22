import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { formatCurrency } from '../../lib/gameUtils';

interface WinningTrendsChartProps {
  winningData: Array<{ date: string; amount: number }>;
  className?: string;
}

/**
 * Graphique d'évolution des gains dans le temps
 */
const WinningTrendsChart: React.FC<WinningTrendsChartProps> = ({ 
  winningData,
  className = ''
}) => {
  const { t, i18n } = useTranslation();
  
  // Préparer les données pour le graphique en calculant un total cumulé
  const prepareChartData = () => {
    let cumulativeSum = 0;
    
    // Regrouper par date (au cas où il y a plusieurs gains dans la même journée)
    const groupedByDate = winningData.reduce((acc: Record<string, number>, curr) => {
      acc[curr.date] = (acc[curr.date] || 0) + curr.amount;
      return acc;
    }, {});
    
    // Convertir en tableau avec somme cumulative
    return Object.entries(groupedByDate).map(([date, amount]) => {
      cumulativeSum += amount;
      return {
        date,
        dailyAmount: amount,
        cumulativeAmount: cumulativeSum
      };
    });
  };
  
  const chartData = prepareChartData();
  
  // Formater le tooltip
  const renderTooltip = (props: any) => {
    const { active, payload, label } = props;
    
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border shadow-md rounded-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            <span className="text-green-600">{t('statistics.dailyWinnings')}</span>: {
              formatCurrency(payload[0].value, i18n.language)
            }
          </p>
          <p className="text-sm">
            <span className="text-blue-600">{t('statistics.totalWinnings')}</span>: {
              formatCurrency(payload[1].value, i18n.language)
            }
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  // Si aucune donnée, affiche un message
  if (winningData.length === 0) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-semibold mb-4">
          {t('statistics.winningTrends')}
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {t('statistics.noWinningData')}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <h3 className="text-lg font-semibold mb-4">
        {t('statistics.winningTrends')}
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={renderTooltip} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="dailyAmount" 
            stackId="1"
            stroke="#82ca9d" 
            fill="#82ca9d"
            name={t('statistics.dailyWinnings')} 
          />
          <Area 
            type="monotone" 
            dataKey="cumulativeAmount" 
            stackId="2"
            stroke="#8884d8" 
            fill="#8884d8"
            name={t('statistics.totalWinnings')} 
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {chartData.length > 1 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">{t('statistics.lastWin')}</p>
            <p className="text-lg font-semibold">
              {formatCurrency(chartData[chartData.length - 1].dailyAmount, i18n.language)}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(chartData[chartData.length - 1].date).toLocaleDateString(i18n.language)}
            </p>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">{t('statistics.totalWinnings')}</p>
            <p className="text-lg font-semibold">
              {formatCurrency(chartData[chartData.length - 1].cumulativeAmount, i18n.language)}
            </p>
            <p className="text-xs text-gray-500">
              {t('statistics.allTime')}
            </p>
          </div>
        </div>
      )}
      
      <p className="mt-4 text-sm text-gray-600">
        {t('statistics.winningTrendsDescription')}
      </p>
    </div>
  );
};

export default WinningTrendsChart;