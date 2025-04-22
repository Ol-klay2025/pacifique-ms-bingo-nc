import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/game-context';
import { useAuth } from '../context/auth-context';
import JackpotDisplay from '../components/ui/jackpot-display';
import { formatCurrency, formatTimeUntilStart } from '../lib/gameUtils';
import AuthModal from '../components/modals/auth-modal';
import { LaunchProgressGauge } from '../components/launch/LaunchProgressGauge';

// Icônes
import { CalendarDays, Trophy, Info, Clock, Users, Gift, Check } from 'lucide-react';

const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { 
    currentGame, 
    upcomingGames, 
    recentGames,
    recentWins,
    jackpotAmount,
    fetchCurrentGame,
    fetchUpcomingGames,
    fetchRecentGames,
    fetchJackpot,
  } = useGame();
  
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Fetch game data on component mount
  useEffect(() => {
    fetchCurrentGame();
    fetchUpcomingGames();
    fetchRecentGames();
    fetchJackpot();
    
    // Set up polling for regular updates (every 30 seconds)
    const interval = setInterval(() => {
      fetchCurrentGame();
      fetchJackpot();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handlePlayNowClick = () => {
    if (!user) {
      setAuthMode('register');
      setAuthModalOpen(true);
    }
  };
  
  return (
    <div className="min-h-screen space-y-12 py-6">
      {/* Hero section amélioré avec animation */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 animate-in fade-in"></div>
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary/80 shadow-xl">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -skew-x-12 transform origin-top"></div>
            <div className="container mx-auto px-6 py-16 md:py-24">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 animate-in zoom-in">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                    {t('home.heroTitle')}
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                    {t('home.heroSubtitle')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    {currentGame && (
                      <Link to={`/game/${currentGame.id}`}>
                        <button className="px-8 py-4 text-lg font-semibold rounded-xl bg-white text-primary hover:bg-white/90 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                          {t('home.playNow')}
                        </button>
                      </Link>
                    )}
                    
                    {!user && (
                      <button 
                        onClick={() => {
                          setAuthMode('register');
                          setAuthModalOpen(true);
                        }}
                        className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-white text-white hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1"
                      >
                        {t('auth.createAccount')}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-center animate-in slide-in-from-right duration-700">
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-8 shadow-2xl border border-white/20 transform hover:scale-105 transition-transform duration-300">
                    <JackpotDisplay size="large" animate={true} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Launch Progress Section - Moved up for better visibility */}
      <section className="container mx-auto px-4 animate-in fade-in duration-500 delay-300">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Users className="w-6 h-6 mr-2 text-primary" />
          {t('home.launchProgress')}
        </h2>
        <LaunchProgressGauge />
      </section>
      
      {/* Current/Upcoming game section */}
      <section className="container mx-auto px-4 animate-in fade-in duration-500 delay-200">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <CalendarDays className="w-6 h-6 mr-2 text-primary" />
          {t('home.nextGames')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentGame && (
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border-l-4 border-primary shadow-md backdrop-blur-sm transform hover:translate-y-[-5px] transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-lg text-primary">{t('game.gameNumber', { number: currentGame.id })}</div>
                <div className={`py-1.5 px-3 rounded-full text-sm font-medium ${currentGame.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {currentGame.status === 'active' ? t('game.active') : t('game.scheduled')}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-primary/20">
                  <span className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {t('game.startTime')}
                  </span>
                  <span className="font-medium">{new Date(currentGame.startTime).toLocaleString(i18n.language)}</span>
                </div>
                
                {currentGame.status === 'waiting' ? (
                  <div className="flex justify-center items-center py-3 mt-2 bg-primary/10 text-primary rounded-lg font-medium animate-pulse">
                    <Clock className="w-5 h-5 mr-2" />
                    {t('game.startsIn')} {formatTimeUntilStart(new Date(currentGame.startTime))}
                  </div>
                ) : (
                  <div className="flex justify-center items-center py-3 mt-2 bg-green-100 text-green-700 rounded-lg font-medium">
                    <Check className="w-5 h-5 mr-2" />
                    {t('game.statusActive')}
                  </div>
                )}
                
                <Link to={`/game/${currentGame.id}`} className="block mt-4">
                  <button className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors flex justify-center items-center">
                    {currentGame.status === 'active' ? (
                      <>
                        <div className="voice-animation mr-2">
                          <div className="circle"></div>
                          <div className="circle"></div>
                          <div className="circle"></div>
                        </div>
                        {t('game.joinNow')}
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5 mr-2" />
                        {t('game.buyCards')}
                      </>
                    )}
                  </button>
                </Link>
              </div>
            </div>
          )}
          
          {upcomingGames.slice(0, currentGame ? 2 : 3).map(game => (
            <div key={game.id} className="bg-white rounded-xl p-6 shadow-md hover-lift">
              <div className="flex justify-between items-center mb-4">
                <div className="font-semibold">{t('game.gameNumber', { number: game.id })}</div>
                <div className="py-1.5 px-3 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {t('game.scheduled')}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {t('game.startTime')}
                  </span>
                  <span className="font-medium">{new Date(game.startTime).toLocaleString(i18n.language)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="flex items-center text-gray-600">
                    <Info className="w-4 h-4 mr-2" />
                    {t('game.startsIn')}
                  </span>
                  <span className="font-medium text-primary">{formatTimeUntilStart(new Date(game.startTime))}</span>
                </div>
                
                <Link to={`/game/${game.id}`} className="block mt-4">
                  <button className="w-full py-3 px-4 bg-primary/80 text-white font-medium rounded-lg hover:bg-primary transition-colors flex justify-center items-center">
                    <Gift className="w-5 h-5 mr-2" />
                    {t('game.buyCards')}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Recent winners section with enhanced styling */}
      {recentWins && recentWins.length > 0 && (
        <section className="container mx-auto px-4 animate-in fade-in duration-500 delay-300">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-primary" />
            {t('home.recentWinners')}
          </h2>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-4 border-b bg-gray-50 font-medium">
              <div className="flex items-center">{t('game.game')}</div>
              <div>{t('game.winType')}</div>
              <div>{t('game.callCount')}</div>
              <div>{t('game.prize')}</div>
            </div>
            
            <div className="divide-y">
              {recentWins.slice(0, 5).map((win, index) => (
                <div 
                  key={win.id} 
                  className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-gray-50 transition-colors duration-150"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div>
                    <Link to={`/game/${win.gameId}`} className="text-primary hover:underline font-medium">
                      #{win.gameId}
                    </Link>
                  </div>
                  <div className="flex items-center">
                    {win.winType === 'quine' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                        {t('common.quine')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        {t('common.bingo')}
                        {win.jackpotWon && (
                          <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                            {t('common.jackpot')}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="font-medium text-gray-600">
                    {win.numbersCalled} {t('game.numbers')}
                  </div>
                  <div className="font-bold text-primary">
                    {formatCurrency(win.amount, i18n.language)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Game schedule section */}
      <section className="container mx-auto px-4 py-4 animate-in fade-in duration-500 delay-400">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-primary" />
          {t('home.gameSchedule')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-md p-8 border-l-4 border-primary hover-lift">
            <h3 className="text-xl font-bold mb-4 text-primary flex items-center">
              <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-full mr-3">
                <Clock className="w-5 h-5" />
              </div>
              {t('home.regularGames')}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Les parties régulières ont lieu toutes les heures avec des cartons à 1€.
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
              Toutes les parties se déroulent automatiquement, avec annonce vocale des numéros.
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-8 border-l-4 border-primary hover-lift">
            <h3 className="text-xl font-bold mb-4 text-primary flex items-center">
              <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-full mr-3">
                <Gift className="w-5 h-5" />
              </div>
              {t('home.specialGames')}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Les parties spéciales ont lieu toutes les 4 heures avec des prix plus élevés et des cartons à 2,5€.
            </p>
            <div className="mt-4 p-3 bg-amber-50 rounded-lg text-amber-700 text-sm">
              Les parties spéciales offrent des prix plus importants et sont proposées toutes les 4 heures.
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-8 border-t-4 border-primary hover-lift">
          <h3 className="text-xl font-bold mb-4 text-primary flex items-center">
            <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-full mr-3">
              <Info className="w-5 h-5" />
            </div>
            {t('home.cardPurchase')}
          </h3>
          <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-gray-700 flex items-start">
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary text-white rounded-full mr-3">1</div>
              <div>
                <p className="font-medium">À la fin d'une partie</p>
                <p className="text-sm text-gray-600">La vente des cartons s'ouvre automatiquement</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-gray-700 flex items-start">
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary text-white rounded-full mr-3">2</div>
              <div>
                <p className="font-medium">Pendant 2 minutes</p>
                <p className="text-sm text-gray-600">Vous pouvez acheter vos cartons pour la prochaine partie</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-gray-700 flex items-start">
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary text-white rounded-full mr-3">3</div>
              <div>
                <p className="font-medium">Début de la partie</p>
                <p className="text-sm text-gray-600">La vente se ferme jusqu'à la fin de la partie</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How to play section with enhanced styling */}
      <section className="container mx-auto px-4 py-4 animate-in fade-in duration-500 delay-400">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Info className="w-6 h-6 mr-2 text-primary" />
          {t('home.howToPlay')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-8 border-t-4 border-primary hover-lift">
            <div className="w-12 h-12 flex items-center justify-center bg-primary text-white text-2xl font-bold rounded-full mb-6">1</div>
            <h3 className="text-xl font-bold mb-4 text-primary">{t('home.step1Title')}</h3>
            <p className="text-gray-600 leading-relaxed">{t('home.step1Desc')}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-8 border-t-4 border-primary hover-lift">
            <div className="w-12 h-12 flex items-center justify-center bg-primary text-white text-2xl font-bold rounded-full mb-6">2</div>
            <h3 className="text-xl font-bold mb-4 text-primary">{t('home.step2Title')}</h3>
            <p className="text-gray-600 leading-relaxed">{t('home.step2Desc')}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-8 border-t-4 border-primary hover-lift">
            <div className="w-12 h-12 flex items-center justify-center bg-primary text-white text-2xl font-bold rounded-full mb-6">3</div>
            <h3 className="text-xl font-bold mb-4 text-primary">{t('home.step3Title')}</h3>
            <p className="text-gray-600 leading-relaxed">{t('home.step3Desc')}</p>
          </div>
        </div>
      </section>
      
      {/* Rules and jackpot section with enhanced styling */}
      <section className="container mx-auto px-4 animate-in fade-in duration-500 delay-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-8 hover-lift">
            <h3 className="text-xl font-bold mb-6 text-primary flex items-center">
              <Info className="w-6 h-6 mr-2" />
              {t('home.rules')}
            </h3>
            <ul className="space-y-4 text-gray-600">
              {[1, 2, 3, 4, 5].map((num) => (
                <li key={num} className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 mt-0.5 font-medium">{num}</span>
                  <span>{t(`home.rule${num}`)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-8 hover-lift">
            <h3 className="text-xl font-bold mb-6 text-primary flex items-center">
              <Gift className="w-6 h-6 mr-2" />
              {t('home.jackpotInfo')}
            </h3>
            <div className="mb-6">
              <JackpotDisplay size="medium" className="mx-auto" />
            </div>
            <p className="text-gray-600 mb-4 leading-relaxed">{t('home.jackpotExplanation')}</p>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="font-medium text-primary text-center">{t('home.jackpotCondition')}</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Auth modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onChangeMode={(mode) => setAuthMode(mode)}
      />
    </div>
  );
};

export default HomePage;