import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  Label
} from 'recharts';

interface CardSuccessRateProps {
  successRateData: {
    totalCards: number;
    quineWins: number;
    bingoWins: number;
    quineRate: number;
    bingoRate: number;
  };
  className?: string;
}

/**
 * Graphique de taux de réussite des cartes
 */
const CardSuccessRate: React.FC<CardSuccessRateProps> = ({ 
  successRateData,
  className = ''
}) => {
  const { t } = useTranslation();
  const { totalCards, quineWins, bingoWins, quineRate, bingoRate } = successRateData;
  
  // Préparer les données pour le graphique
  const prepareChartData = () => {
    const noWinCount = totalCards - quineWins - bingoWins;
    
    return [
      { name: t('statistics.bingoWins'), value: bingoWins, color: '#4CAF50' },
      { name: t('statistics.quineWins'), value: quineWins, color: '#FFC107' },
      { name: t('statistics.noWins'), value: noWinCount, color: '#E0E0E0' }
    ];
  };
  
  const chartData = prepareChartData();
  const COLORS = chartData.map(item => item.color);
  
  // Formater le tooltip
  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border shadow-md rounded-md">
          <p className="font-medium" style={{ color: data.color }}>
            {data.name}
          </p>
          <p className="text-sm">
            {data.value} {t('statistics.cards')} ({Math.round((data.value / totalCards) * 100)}%)
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  // Si aucune donnée, affiche un message
  if (totalCards === 0) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-semibold mb-4">
          {t('statistics.cardSuccessRate')}
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {t('statistics.noCardData')}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <h3 className="text-lg font-semibold mb-4">
        {t('statistics.cardSuccessRate')}
      </h3>
      
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Label
                  value={totalCards}
                  position="center"
                  className="text-xl font-bold"
                  fontSize={22}
                />
              </Pie>
              <Tooltip content={renderTooltip} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="w-full md:w-1/2 grid grid-cols-1 gap-4 mt-4 md:mt-0">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('statistics.bingoSuccessRate')}</p>
                <p className="text-lg font-semibold">
                  {Math.round(bingoRate * 100)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                {bingoWins}
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('statistics.quineSuccessRate')}</p>
                <p className="text-lg font-semibold">
                  {Math.round(quineRate * 100)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                {quineWins}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('statistics.totalCards')}</p>
                <p className="text-lg font-semibold">
                  {totalCards} {t('statistics.cards')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="mt-4 text-sm text-gray-600">
        {t('statistics.cardSuccessRateDescription')}
      </p>
    </div>
  );
};

export default CardSuccessRate;