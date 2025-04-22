import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/auth-context';
import { useGame } from '../context/game-context';
import { statisticsService } from '../lib/statisticsService';

// Composants statistiques
import NumberFrequencyChart from '../components/statistics/NumberFrequencyChart';
import HotColdNumbers from '../components/statistics/HotColdNumbers';
import WinningTrendsChart from '../components/statistics/WinningTrendsChart';
import CardSuccessRate from '../components/statistics/CardSuccessRate';
import NumberPredictions from '../components/statistics/NumberPredictions';
import BingoHeatmap from '../components/statistics/BingoHeatmap';
import NumberPatternAnalysis from '../components/statistics/NumberPatternAnalysis';
import WinningTimeStats from '../components/statistics/WinningTimeStats';
import NumberPairsAnalysis from '../components/statistics/NumberPairsAnalysis';

// Types
import { Game, Card, Transaction } from '../../shared/schema';

/**
 * Page d'analyse statistique des jeux
 */
const StatisticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { recentGames } = useGame();
  
  // États
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [userCards, setUserCards] = useState<Card[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'numbers' | 'patterns' | 'personal'>('overview');
  
  // Données calculées
  const [numberFrequency, setNumberFrequency] = useState<Record<number, number>>({});
  const [hotColdNumbers, setHotColdNumbers] = useState<{ hot: number[]; cold: number[] }>({ hot: [], cold: [] });
  const [winningTrends, setWinningTrends] = useState<Array<{ date: string; amount: number }>>([]);
  const [cardSuccessRate, setCardSuccessRate] = useState<{
    totalCards: number;
    quineWins: number;
    bingoWins: number;
    quineRate: number;
    bingoRate: number;
  }>({
    totalCards: 0,
    quineWins: 0,
    bingoWins: 0,
    quineRate: 0,
    bingoRate: 0
  });
  const [predictedNumbers, setPredictedNumbers] = useState<number[]>([]);
  const [numberPatterns, setNumberPatterns] = useState<any>(null);
  const [timePatterns, setTimePatterns] = useState<any>(null);
  const [numberDistribution, setNumberDistribution] = useState<any>(null);
  
  // Chargement des données et calcul des statistiques
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Utiliser les jeux récents comme ensemble de données
        // Dans une version future, récupérer les données réelles de l'utilisateur
        if (recentGames.length === 0) {
          setError(t('statistics.noGamesAvailable'));
          setIsLoading(false);
          return;
        }
        
        // Calculer les statistiques de base
        const frequency = statisticsService.calculateNumberFrequency(recentGames);
        setNumberFrequency(frequency);
        
        const hotCold = statisticsService.getHotColdNumbers(frequency, 8);
        setHotColdNumbers(hotCold);
        
        const predictions = statisticsService.predictLikelyNumbers(frequency, 6);
        setPredictedNumbers(predictions);
        
        // Analyser les modèles et tendances
        const patterns = statisticsService.analyzeNumberPatterns(recentGames);
        setNumberPatterns(patterns);
        
        const times = statisticsService.analyzeTimePatterns(recentGames);
        setTimePatterns(times);
        
        const distribution = statisticsService.analyzeNumberDistribution(frequency);
        setNumberDistribution(distribution);
        
        // Simuler des données pour les graphiques de tendance et taux de réussite
        // Note: Dans une implémentation réelle, ces données viendraient de l'API
        const mockWinnings = recentGames
          .filter(game => game.bingoWinnerId || game.quineWinnerId)
          .map(game => {
            const amount = game.bingoWinnerId ? game.prize || 1000 : (game.prize ? game.prize * 0.4 : 400);
            return {
              date: new Date(game.endTime || game.startTime).toISOString().split('T')[0],
              amount
            };
          });
        setWinningTrends(mockWinnings);
        
        const mockSuccessRate = {
          totalCards: 50,
          quineWins: 4,
          bingoWins: 1,
          quineRate: 4 / 50,
          bingoRate: 1 / 50
        };
        setCardSuccessRate(mockSuccessRate);
        
        setIsLoading(false);
      } catch (error: any) {
        setError(error.message || t('common.error'));
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [recentGames]);
  
  // Affichage d'erreur
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">{t('statistics.title')}</h1>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }
  
  // Affichage de chargement
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">{t('statistics.title')}</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{t('statistics.title')}</h1>
        <p className="text-gray-600">
          {t('statistics.description')}
        </p>
      </div>
      
      {/* Navigation par onglets */}
      <div className="mb-8 border-b">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-4 font-medium relative ${
              activeTab === 'overview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t('statistics.overview')}
          </button>
          <button
            onClick={() => setActiveTab('numbers')}
            className={`py-2 px-4 font-medium relative ${
              activeTab === 'numbers'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t('statistics.numberAnalysis')}
          </button>
          <button
            onClick={() => setActiveTab('patterns')}
            className={`py-2 px-4 font-medium relative ${
              activeTab === 'patterns'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t('statistics.patternAnalysis')}
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-2 px-4 font-medium relative ${
              activeTab === 'personal'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t('statistics.personalPerformance')}
          </button>
        </div>
      </div>
      
      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <>
          {/* Section aperçu et prédictions */}
          <section className="mb-10">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6 mb-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">🎮</span>
                {t('statistics.gameInsights')}
              </h2>
              <p>
                {t('statistics.insightDescription')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <NumberPredictions 
                predictedNumbers={predictedNumbers}
              />
              
              <HotColdNumbers 
                hotNumbers={hotColdNumbers.hot}
                coldNumbers={hotColdNumbers.cold}
                numberFrequency={numberFrequency}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <BingoHeatmap 
                frequencyData={numberFrequency}
              />
            </div>
          </section>
          
          {/* Statistiques saillantes */}
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">
              {t('statistics.keyMetrics')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Statistique 1: Pairs vs Impairs */}
              {numberPatterns && (
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">{t('statistics.evenVsOdd')}</div>
                  <div className="flex justify-center mb-2">
                    <div className="w-1/2 border-r px-2">
                      <div className="text-xl font-bold text-blue-500">{numberPatterns.evenOddPatterns.percentage.even}%</div>
                      <div className="text-xs text-gray-500">{t('statistics.even')}</div>
                    </div>
                    <div className="w-1/2 px-2">
                      <div className="text-xl font-bold text-red-500">{numberPatterns.evenOddPatterns.percentage.odd}%</div>
                      <div className="text-xs text-gray-500">{t('statistics.odd')}</div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${numberPatterns.evenOddPatterns.percentage.even}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Statistique 2: Appels pour Quine/Bingo */}
              {timePatterns && (
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">{t('statistics.averageCalls')}</div>
                  <div className="flex justify-center mb-2">
                    <div className="w-1/2 border-r px-2">
                      <div className="text-xl font-bold text-purple-500">
                        {(() => {
                          const avg = statisticsService.calculateAverageCallsToWin(recentGames);
                          return Math.round(avg.quine);
                        })()}
                      </div>
                      <div className="text-xs text-gray-500">{t('statistics.quine')}</div>
                    </div>
                    <div className="w-1/2 px-2">
                      <div className="text-xl font-bold text-green-500">
                        {(() => {
                          const avg = statisticsService.calculateAverageCallsToWin(recentGames);
                          return Math.round(avg.bingo);
                        })()}
                      </div>
                      <div className="text-xs text-gray-500">{t('statistics.bingo')}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {t('statistics.outOf90Numbers')}
                  </div>
                </div>
              )}
              
              {/* Statistique 3: Temps de jeu moyen */}
              {timePatterns && (
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">{t('statistics.gameTime')}</div>
                  <div className="text-xl font-bold text-indigo-500">
                    {timePatterns.averageGameDuration} {t('statistics.minutes')}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <div>
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
                      {t('statistics.quineAt')} {Math.round(timePatterns.quineTimePercentage)}%
                    </div>
                    <div>
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                      {t('statistics.bingoAt')} 100%
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-purple-400" 
                      style={{ width: `${timePatterns.quineTimePercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}
      
      {/* Onglet Analyse des numéros */}
      {activeTab === 'numbers' && (
        <section className="mb-10">
          <div className="grid grid-cols-1 gap-8">
            <NumberFrequencyChart 
              frequencyData={numberFrequency}
            />
            
            <BingoHeatmap 
              frequencyData={numberFrequency}
            />
            
            <NumberPairsAnalysis 
              games={recentGames}
            />
            
            {/* Distribution par dizaine */}
            {numberDistribution && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">
                  {t('statistics.numberDistribution')}
                </h3>
                
                <div className="grid grid-cols-9 gap-2">
                  {Object.entries(numberDistribution).map(([range, data]: [string, any]) => (
                    <div key={range} className="text-center">
                      <div className="mb-2 text-xs font-medium">{range}</div>
                      <div 
                        className="mx-auto bg-primary rounded-t-lg"
                        style={{ 
                          width: '100%', 
                          height: `${Math.max(10, data.percentage * 2)}px`
                        }}
                      ></div>
                      <div className="mt-1 text-sm font-bold">{data.percentage}%</div>
                      <div className="text-xs text-gray-500">{data.count} {t('statistics.calls')}</div>
                    </div>
                  ))}
                </div>
                
                <p className="mt-4 text-sm text-gray-600">
                  {t('statistics.distributionDescription')}
                </p>
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Onglet Analyse de patterns */}
      {activeTab === 'patterns' && (
        <section className="mb-10">
          <div className="grid grid-cols-1 gap-8">
            <NumberPatternAnalysis 
              games={recentGames}
            />
            
            <WinningTimeStats 
              games={recentGames}
            />
            
            {/* Statistiques de pattern */}
            {numberPatterns && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">
                  {t('statistics.numberPatternsStats')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Numéros consécutifs */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      {t('statistics.consecutiveNumbers')}
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {numberPatterns.consecutivePatterns.percentage}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {numberPatterns.consecutivePatterns.count} {t('statistics.occurrences')}
                    </div>
                  </div>
                  
                  {/* Pairs/Impairs */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      {t('statistics.evenOddRatio')}
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <div className="text-xl font-bold text-blue-500">
                          {numberPatterns.evenOddPatterns.percentage.even}%
                        </div>
                        <div className="text-xs text-gray-500">{t('statistics.even')}</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-red-500">
                          {numberPatterns.evenOddPatterns.percentage.odd}%
                        </div>
                        <div className="text-xs text-gray-500">{t('statistics.odd')}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bas/Hauts */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      {t('statistics.lowHighRatio')}
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <div className="text-xl font-bold text-green-500">
                          {numberPatterns.lowHighPatterns.percentage.low}%
                        </div>
                        <div className="text-xs text-gray-500">{t('statistics.lowNumbers')} (1-45)</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-yellow-500">
                          {numberPatterns.lowHighPatterns.percentage.high}%
                        </div>
                        <div className="text-xs text-gray-500">{t('statistics.highNumbers')} (46-90)</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="mt-4 text-sm text-gray-600">
                  {t('statistics.patternsExplanation')}
                </p>
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Onglet Performance personnelle */}
      {activeTab === 'personal' && (
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <WinningTrendsChart 
              winningData={winningTrends}
            />
            
            <CardSuccessRate 
              successRateData={cardSuccessRate}
            />
          </div>
          
          {/* Résumé des performances */}
          <div className="bg-white p-4 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold mb-4">
              {t('statistics.performanceSummary')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-600">{t('statistics.gamesPlayed')}</div>
                <div className="text-2xl font-bold text-primary">
                  {(() => {
                    // Calculer le nombre de jeux joués à partir des cartes
                    const uniqueGameIds = [...new Set(userCards.map(card => card.gameId))];
                    return uniqueGameIds.length;
                  })()}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-600">{t('statistics.cardsPlayed')}</div>
                <div className="text-2xl font-bold text-primary">
                  {cardSuccessRate.totalCards}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-600">{t('statistics.winRate')}</div>
                <div className="text-2xl font-bold text-primary">
                  {((cardSuccessRate.quineWins + cardSuccessRate.bingoWins) / 
                    Math.max(1, cardSuccessRate.totalCards) * 100).toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-600">{t('statistics.totalWinnings')}</div>
                <div className="text-2xl font-bold text-primary">
                  {(() => {
                    // Calculer les gains totaux
                    const total = winningTrends.reduce((sum, item) => sum + item.amount, 0);
                    return total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                  })()}€
                </div>
              </div>
            </div>
            
            <p className="mt-4 text-sm text-gray-600">
              {t('statistics.personalStatsDescription')}
            </p>
          </div>
        </section>
      )}
      
      {/* Note légale */}
      <section className="text-center text-sm text-gray-500 p-4 border-t">
        <p>
          {t('statistics.disclaimer')}
        </p>
      </section>
    </div>
  );
};

export default StatisticsPage;