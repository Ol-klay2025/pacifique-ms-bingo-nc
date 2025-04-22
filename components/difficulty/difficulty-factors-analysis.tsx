import { useTranslation } from 'react-i18next';
import { DifficultyFactor } from '../../hooks/use-difficulty-recommendation';

interface DifficultyFactorsAnalysisProps {
  factors: Record<string, DifficultyFactor>;
  getFactorLabel: (factor: string) => string;
}

const DifficultyFactorsAnalysis = ({ 
  factors, 
  getFactorLabel 
}: DifficultyFactorsAnalysisProps) => {
  const { t } = useTranslation();

  // Sort factors by their score in descending order
  const sortedFactors = Object.entries(factors)
    .sort(([, factorA], [, factorB]) => factorB.score - factorA.score);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">{t('difficulty.factorsAnalysis')}</h3>
      
      <div className="space-y-5">
        {sortedFactors.map(([factorKey, factor]) => (
          <div key={factorKey} className="space-y-2">
            <div className="flex justify-between items-baseline">
              <h4 className="font-medium">{getFactorLabel(factorKey)}</h4>
              <span className="text-sm text-gray-500">
                {t('difficulty.impact')}: {Math.round(factor.score * 100)}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${factor.score * 100}%` }}
              />
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {factor.description}
            </p>
          </div>
        ))}
      </div>
      
      {sortedFactors.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 italic text-center py-4">
          {t('difficulty.noFactorsAvailable')}
        </p>
      )}
    </div>
  );
};

export default DifficultyFactorsAnalysis;