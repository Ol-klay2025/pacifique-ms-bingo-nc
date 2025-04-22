import { useTranslation } from 'react-i18next';
import { DifficultyRecommendation } from '../../hooks/use-difficulty-recommendation';
import { formatShortDate } from '../../lib/utils';
import { Badge } from '../ui/badge';

interface DifficultyRecommendationHistoryProps {
  history?: DifficultyRecommendation[];
  getDifficultyLabel: (level: string) => string;
}

const DifficultyRecommendationHistory = ({ 
  history = [], 
  getDifficultyLabel 
}: DifficultyRecommendationHistoryProps) => {
  const { t } = useTranslation();

  if (!history || history.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-2">{t('difficulty.history')}</h3>
        <p className="text-gray-500 dark:text-gray-400 italic py-4 text-center">
          {t('difficulty.noHistoryAvailable')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">{t('difficulty.history')}</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('date')}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('difficulty.level')}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('difficulty.cardCount')}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('difficulty.confidence')}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('difficulty.change')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {history.map((recommendation, index) => {
              // Determine if there was a change from previous recommendation
              const previousLevel = recommendation.previousLevel || (index < history.length - 1 ? history[index + 1].recommendedLevel : null);
              const hasChanged = previousLevel && previousLevel !== recommendation.recommendedLevel;
              
              return (
                <tr key={recommendation.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {formatShortDate(recommendation.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant="info">
                      {getDifficultyLabel(recommendation.recommendedLevel)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {recommendation.recommendedCardCount}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 h-2 rounded-full mr-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${recommendation.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs">{Math.round(recommendation.confidence * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {hasChanged ? (
                      <span className="text-amber-600 dark:text-amber-400">
                        {t('difficulty.changedFrom', { 
                          level: getDifficultyLabel(previousLevel)
                        })}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">
                        {t('difficulty.unchanged')}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DifficultyRecommendationHistory;