import { useTranslation } from 'react-i18next';
import { useDifficultyRecommendation, DifficultyRecommendation } from '../../hooks/use-difficulty-recommendation';
import { Badge } from '../ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { useState } from 'react';
import { useToast } from '../../hooks/use-toast';

import DifficultyRecommendationHistory from './difficulty-recommendation-history';
import DifficultyFactorsAnalysis from './difficulty-factors-analysis';

interface DifficultyRecommendationComponentProps {
  userId: number;
}

const DifficultyRecommendationComponent = ({ userId }: DifficultyRecommendationComponentProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  
  const { 
    recommendation, 
    history, 
    isLoading, 
    error, 
    generateRecommendation, 
    isGenerating,
    applyRecommendation,
    isApplying,
    getFactorLabel,
    getDifficultyLabel,
    getConfidenceLabel
  } = useDifficultyRecommendation(userId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-300">{t('error')}</h3>
        <p className="mt-2 text-sm text-red-700 dark:text-red-400">{error.message}</p>
        <button
          onClick={() => generateRecommendation()}
          disabled={isGenerating}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 inline-flex items-center"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('difficulty.generating')}
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('retry')}
            </>
          )}
        </button>
      </div>
    );
  }

  const handleGenerateRecommendation = () => {
    generateRecommendation();
  };

  const handleApplyRecommendation = () => {
    if (!recommendation) return;
    
    applyRecommendation();
    toast({
      title: t('success'),
      description: t('difficulty.recommendationApplied', {
        level: getDifficultyLabel(recommendation.recommendedLevel),
        cards: recommendation.recommendedCardCount
      }),
      variant: 'success'
    });
  };

  if (!recommendation) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">{t('difficulty.noRecommendation')}</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">{t('difficulty.generateExplanation')}</p>
        
        <button
          onClick={handleGenerateRecommendation}
          disabled={isGenerating}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 inline-flex items-center"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('difficulty.generating')}
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('difficulty.generateRecommendation')}
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold">{t('difficulty.yourRecommendation')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('difficulty.lastUpdated', { date: formatDate(recommendation.createdAt) })}
            </p>
          </div>
          <Badge variant="info">{getDifficultyLabel(recommendation.recommendedLevel)}</Badge>
        </div>
        
        <div className="mb-6 grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="font-medium mb-2">{t('difficulty.recommendedSettings')}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('difficulty.level')}</p>
                <p className="font-medium">{getDifficultyLabel(recommendation.recommendedLevel)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('difficulty.cardCount')}</p>
                <p className="font-medium">{recommendation.recommendedCardCount} {t('cards')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('difficulty.confidence')}</p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mr-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${recommendation.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{Math.round(recommendation.confidence * 100)}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{getConfidenceLabel(recommendation.confidence)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="font-medium mb-2">{t('difficulty.whatThisMeans')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('difficulty.recommendationExplanation', { 
                level: getDifficultyLabel(recommendation.recommendedLevel),
                cards: recommendation.recommendedCardCount
              })}
            </p>
            
            <button
              onClick={handleApplyRecommendation}
              disabled={isApplying}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 w-full flex items-center justify-center"
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('applying')}
                </>
              ) : (
                t('difficulty.applyRecommendation')
              )}
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-primary hover:underline text-sm font-medium"
          >
            {showDetails ? t('difficulty.hideDetails') : t('difficulty.showDetails')}
          </button>
          
          <button
            onClick={handleGenerateRecommendation}
            disabled={isGenerating}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? t('difficulty.regenerating') : t('difficulty.regenerate')}
          </button>
        </div>
      </div>
      
      {showDetails && (
        <>
          <DifficultyFactorsAnalysis 
            factors={recommendation.factorsAnalysis}
            getFactorLabel={getFactorLabel}
          />
          
          <DifficultyRecommendationHistory 
            history={history}
            getDifficultyLabel={getDifficultyLabel}
          />
        </>
      )}
    </div>
  );
};

export default DifficultyRecommendationComponent;