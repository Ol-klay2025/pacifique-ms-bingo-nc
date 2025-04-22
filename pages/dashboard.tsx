import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/auth-context';
import { useGame } from '../context/game-context';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';
import { Card, Transaction } from '../../shared/schema';
import { 
  User, 
  CreditCard, 
  Calendar, 
  Trophy, 
  History, 
  Settings, 
  ChevronRight, 
  Activity, 
  Award,
  DollarSign
} from 'lucide-react';

// Types pour les data du dashboard
interface DashboardData {
  // Stats générales
  totalGamesPlayed: number;
  totalCardsPlayed: number;
  totalSpent: number;
  totalWon: number;
  winRate: number;
  
  // Historique
  recentTransactions: Transaction[];
  upcomingGames: any[];
  recentGames: any[];
  userCards: Card[];
}

const UserDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { recentGames, upcomingGames } = useGame();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalGamesPlayed: 0,
    totalCardsPlayed: 0,
    totalSpent: 0,
    totalWon: 0,
    winRate: 0,
    recentTransactions: [],
    upcomingGames: [],
    recentGames: [],
    userCards: []
  });
  
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'games' | 'settings'>('overview');
  
  // Récupérer les données du dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Récupérer les transactions de l'utilisateur
        const transactionsResponse = await apiRequest<{ transactions: Transaction[] }>('GET', '/api/transactions');
        
        // Récupérer les cartes de l'utilisateur
        const cardsResponse = await apiRequest<{ cards: Card[] }>('GET', '/api/cards');
        
        // Calculer les statistiques
        const transactions = transactionsResponse.transactions || [];
        const cards = cardsResponse.cards || [];
        
        // Total dépensé (achats de cartes, etc.)
        const totalSpent = transactions
          .filter(t => t.type === 'purchase' && t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        // Total gagné (quines, bingos, etc.)
        const totalWon = transactions
          .filter(t => t.type === 'win' && t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0);
        
        // Nombre de jeux uniques joués
        const uniqueGameIds = [...new Set(cards.map(card => card.gameId))];
        const totalGamesPlayed = uniqueGameIds.length;
        
        // Total de cartes achetées
        const totalCardsPlayed = cards.length;
        
        // Taux de victoire (au moins une victoire / nombre de jeux joués)
        const gamesWithWins = uniqueGameIds.filter(gameId => {
          return transactions.some(t => 
            t.type === 'win' && 
            t.description?.includes(`Game #${gameId}`)
          );
        });
        
        const winRate = totalGamesPlayed > 0 
          ? (gamesWithWins.length / totalGamesPlayed) * 100 
          : 0;
        
        setDashboardData({
          totalGamesPlayed,
          totalCardsPlayed,
          totalSpent,
          totalWon,
          winRate,
          recentTransactions: transactions.slice(0, 10),
          upcomingGames,
          recentGames,
          userCards: cards
        });
        
        setLoading(false);
      } catch (error: any) {
        setError(error.message || t('dashboard.fetchError'));
        toast({
          title: t('common.error'),
          description: error.message || t('dashboard.fetchError'),
          variant: 'destructive',
        });
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-muted p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-2">{t('dashboard.notLoggedIn')}</h2>
          <p className="mb-4">{t('dashboard.loginPrompt')}</p>
          <a href="/login" className="inline-block px-4 py-2 bg-primary text-white rounded-md">
            {t('common.login')}
          </a>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">{t('common.error')}</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  // Formatter les montants en euros
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount / 100); // Convertir les centimes en euros
  };
  
  // Formatter une date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-gray-600 mt-2">
          {t('dashboard.welcome', { username: user.username })}
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
            {t('dashboard.overview')}
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-2 px-4 font-medium relative ${
              activeTab === 'transactions'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t('dashboard.transactions')}
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`py-2 px-4 font-medium relative ${
              activeTab === 'games'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t('dashboard.games')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-4 font-medium relative ${
              activeTab === 'settings'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t('dashboard.settings')}
          </button>
        </div>
      </div>
      
      {/* Contenu de l'onglet Aperçu */}
      {activeTab === 'overview' && (
        <div>
          {/* Solde actuel */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">{t('dashboard.currentBalance')}</h2>
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full mr-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-bold">{formatAmount(user.balance)}</div>
                <div className="text-sm text-gray-500">{t('dashboard.availableBalance')}</div>
              </div>
              
              <div className="ml-auto">
                <a 
                  href="/checkout" 
                  className="inline-block px-4 py-2 bg-primary text-white rounded-md"
                >
                  {t('dashboard.addFunds')}
                </a>
              </div>
            </div>
          </div>
          
          {/* Statistiques */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">{t('dashboard.statistics')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-lg shadow flex items-center">
                <div className="bg-violet-100 p-3 rounded-full mr-3">
                  <Calendar className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <div className="text-xl font-bold">{dashboardData.totalGamesPlayed}</div>
                  <div className="text-sm text-gray-500">{t('dashboard.gamesPlayed')}</div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-3">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-xl font-bold">{dashboardData.totalCardsPlayed}</div>
                  <div className="text-sm text-gray-500">{t('dashboard.cardsPlayed')}</div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow flex items-center">
                <div className="bg-amber-100 p-3 rounded-full mr-3">
                  <Trophy className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-xl font-bold">{dashboardData.winRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">{t('dashboard.winRate')}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Récapitulatif financier */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">{t('dashboard.financialSummary')}</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="text-sm text-gray-500 mb-1">{t('dashboard.totalSpent')}</div>
                  <div className="text-2xl font-bold">{formatAmount(dashboardData.totalSpent)}</div>
                  <div className="mt-4 h-1 bg-gray-200 rounded-full">
                    <div className="h-1 bg-red-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-1">{t('dashboard.totalWon')}</div>
                  <div className="text-2xl font-bold">{formatAmount(dashboardData.totalWon)}</div>
                  <div className="mt-4 h-1 bg-gray-200 rounded-full">
                    <div 
                      className="h-1 bg-green-500 rounded-full" 
                      style={{ 
                        width: `${dashboardData.totalSpent > 0 
                          ? Math.min(100, (dashboardData.totalWon / dashboardData.totalSpent) * 100) 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500">{t('dashboard.profitLoss')}</div>
                    <div className={`text-xl font-bold ${
                      dashboardData.totalWon - dashboardData.totalSpent >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {formatAmount(dashboardData.totalWon - dashboardData.totalSpent)}
                    </div>
                  </div>
                  
                  <div>
                    <a 
                      href="/statistics" 
                      className="text-primary flex items-center hover:underline"
                    >
                      {t('dashboard.viewFullStats')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Transactions récentes et jeux à venir */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Transactions récentes */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{t('dashboard.recentTransactions')}</h2>
                <button 
                  onClick={() => setActiveTab('transactions')}
                  className="text-primary text-sm hover:underline flex items-center"
                >
                  {t('dashboard.viewAll')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {dashboardData.recentTransactions.length > 0 ? (
                  <div className="divide-y">
                    {dashboardData.recentTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                              transaction.type === 'win' 
                                ? 'bg-green-100' 
                                : transaction.type === 'purchase' 
                                  ? 'bg-blue-100' 
                                  : 'bg-gray-100'
                            }`}>
                              {transaction.type === 'win' ? (
                                <Trophy className="h-5 w-5 text-green-600" />
                              ) : transaction.type === 'purchase' ? (
                                <CreditCard className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Activity className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                {transaction.description || 
                                  (transaction.type === 'win' 
                                    ? t('dashboard.winningTransaction') 
                                    : transaction.type === 'purchase' 
                                      ? t('dashboard.purchaseTransaction') 
                                      : t('dashboard.otherTransaction')
                                  )
                                }
                              </div>
                              <div className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</div>
                            </div>
                          </div>
                          <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    {t('dashboard.noTransactions')}
                  </div>
                )}
              </div>
            </div>
            
            {/* Jeux à venir */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{t('dashboard.upcomingGames')}</h2>
                <button 
                  onClick={() => setActiveTab('games')}
                  className="text-primary text-sm hover:underline flex items-center"
                >
                  {t('dashboard.viewAll')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {dashboardData.upcomingGames.length > 0 ? (
                  <div className="divide-y">
                    {dashboardData.upcomingGames.slice(0, 5).map((game) => (
                      <div key={game.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                              <Calendar className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {t('dashboard.game')} #{game.id}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(game.startTime).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <a 
                              href={`/game/${game.id}`} 
                              className="px-3 py-1 bg-primary text-white text-sm rounded"
                            >
                              {t('dashboard.joinGame')}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    {t('dashboard.noUpcomingGames')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Contenu de l'onglet Transactions */}
      {activeTab === 'transactions' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">{t('dashboard.allTransactions')}</h2>
            <div className="flex gap-2">
              {/* Filtres - Pourrait être implémenté ultérieurement */}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {dashboardData.recentTransactions.length > 0 ? (
              <div className="divide-y">
                {dashboardData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          transaction.type === 'win' 
                            ? 'bg-green-100' 
                            : transaction.type === 'purchase' 
                              ? 'bg-blue-100' 
                              : 'bg-gray-100'
                        }`}>
                          {transaction.type === 'win' ? (
                            <Trophy className="h-5 w-5 text-green-600" />
                          ) : transaction.type === 'purchase' ? (
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Activity className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {transaction.description || 
                              (transaction.type === 'win' 
                                ? t('dashboard.winningTransaction') 
                                : transaction.type === 'purchase' 
                                  ? t('dashboard.purchaseTransaction') 
                                  : t('dashboard.otherTransaction')
                              )
                            }
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)}
                        </div>
                        
                        <div className={`ml-3 px-2 py-1 rounded-full text-xs ${
                          transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status === 'completed' 
                            ? t('dashboard.completed') 
                            : transaction.status === 'pending' 
                              ? t('dashboard.pending') 
                              : t('dashboard.failed')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                {t('dashboard.noTransactions')}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Contenu de l'onglet Jeux */}
      {activeTab === 'games' && (
        <div>
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">{t('dashboard.upcomingGames')}</h2>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {dashboardData.upcomingGames.length > 0 ? (
                <div className="divide-y">
                  {dashboardData.upcomingGames.map((game) => (
                    <div key={game.id} className="p-4 hover:bg-gray-50">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                            <Calendar className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div>
                            <div className="font-medium text-lg">
                              {t('dashboard.game')} #{game.id}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(game.startTime).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 items-center">
                          <div className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                            {game.status === 'scheduled' 
                              ? t('dashboard.scheduled') 
                              : game.status === 'waiting' 
                                ? t('dashboard.waiting') 
                                : t('dashboard.active')}
                          </div>
                          
                          {/* Nombre de cartes pour ce jeu */}
                          <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center">
                            <CreditCard className="h-3 w-3 mr-1" />
                            {dashboardData.userCards.filter(card => card.gameId === game.id).length} {t('dashboard.cards')}
                          </div>
                          
                          <a 
                            href={`/game/${game.id}`} 
                            className="px-4 py-2 bg-primary text-white rounded-md text-sm"
                          >
                            {t('dashboard.joinGame')}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  {t('dashboard.noUpcomingGames')}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4">{t('dashboard.recentGames')}</h2>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {dashboardData.recentGames.length > 0 ? (
                <div className="divide-y">
                  {dashboardData.recentGames.map((game) => (
                    <div key={game.id} className="p-4 hover:bg-gray-50">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                            <History className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-lg">
                              {t('dashboard.game')} #{game.id}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(game.endTime || game.startTime).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 items-center">
                          {/* Résultat pour l'utilisateur */}
                          <div className={`px-3 py-1 rounded-full text-sm ${
                            game.quineWinnerId === user.id || game.bingoWinnerId === user.id
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {game.quineWinnerId === user.id 
                              ? t('dashboard.quineWin')
                              : game.bingoWinnerId === user.id
                                ? t('dashboard.bingoWin')
                                : t('dashboard.noWin')}
                          </div>
                          
                          {/* Nombre de cartes pour ce jeu */}
                          <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center">
                            <CreditCard className="h-3 w-3 mr-1" />
                            {dashboardData.userCards.filter(card => card.gameId === game.id).length} {t('dashboard.cards')}
                          </div>
                          
                          <a 
                            href={`/game/${game.id}`} 
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm"
                          >
                            {t('dashboard.viewDetails')}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  {t('dashboard.noRecentGames')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Contenu de l'onglet Paramètres */}
      {activeTab === 'settings' && (
        <div>
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">{t('dashboard.userProfile')}</h2>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{user.username}</div>
                  <div className="text-gray-500">{user.email || t('dashboard.noEmail')}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">{t('dashboard.accountCreated')}</div>
                  <div>{formatDate(user.createdAt)}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">{t('dashboard.preferredLanguage')}</div>
                  <div>{user.language === 'fr' ? 'Français' : 'English'}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">{t('dashboard.subscriptionStatus')}</div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    user.subscriptionStatus === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.subscriptionStatus === 'active' 
                      ? t('dashboard.active') 
                      : t('dashboard.none')}
                  </div>
                </div>
                
                {user.subscriptionEndDate && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">{t('dashboard.subscriptionEnd')}</div>
                    <div>{formatDate(user.subscriptionEndDate)}</div>
                  </div>
                )}
              </div>
              
              {/* Boutons d'action */}
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/account" className="px-4 py-2 bg-primary text-white rounded-md">
                  {t('dashboard.editProfile')}
                </a>
                
                <a href="/customization" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">
                  {t('dashboard.customizeTheme')}
                </a>
                
                {!user.subscriptionStatus && (
                  <a href="/subscribe" className="px-4 py-2 bg-indigo-600 text-white rounded-md">
                    {t('dashboard.upgradeAccount')}
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Réalisations */}
          <div>
            <h2 className="text-xl font-bold mb-4">{t('dashboard.achievements')}</h2>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border p-4 rounded-lg flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                    <Award className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="font-medium">{t('dashboard.firstGame')}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {dashboardData.totalGamesPlayed > 0 
                      ? t('dashboard.completed') 
                      : t('dashboard.notYet')}
                  </div>
                </div>
                
                <div className="border p-4 rounded-lg flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                    <Award className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="font-medium">{t('dashboard.firstWin')}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {dashboardData.totalWon > 0 
                      ? t('dashboard.completed') 
                      : t('dashboard.notYet')}
                  </div>
                </div>
                
                <div className="border p-4 rounded-lg flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="font-medium">{t('dashboard.firstJackpot')}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {t('dashboard.notYet')}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t text-center text-sm text-gray-500">
                {t('dashboard.achievementsNote')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboardPage;