import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/auth-context';
import { apiRequest } from '../../lib/queryClient';

// Game components
import BingoCard from './bingo-card';
import CalledNumbers from './called-numbers';
import GameInfo from './game-info';
import ClaimActions from './claim-actions';
import VoiceAnnouncer from './voice-announcer';
import GameChat from './chat';
import { useToast } from '../../hooks/use-toast';

// Define the necessary types
interface BingoCardType {
  id: number;
  userId: number;
  gameId: number;
  numbers: number[][];
  createdAt: string;
}

interface Game {
  id: number;
  startTime: Date;
  endTime: Date | null;
  status: string;
  calledNumbers: number[];
  quineWinnerId: number | null;
  quineNumberCount: number | null;
  bingoWinnerId: number | null;
  bingoNumberCount: number | null;
  jackpotWon: boolean;
  prize: number;
  verificationHash: string | null;
  transactionHash: string | null;
  jackpotAmount: number | null;
}

interface GameInterfaceProps {
  gameId: number;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ gameId }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Game state
  const [game, setGame] = useState<Game | null>(null);
  const [userCards, setUserCards] = useState<BingoCardType[]>([]);
  const [lastCalledNumber, setLastCalledNumber] = useState<number | null>(null);
  const [totalCards, setTotalCards] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds by default
  
  // Settings
  const [autoMarkNumbers, setAutoMarkNumbers] = useState(true);
  const [voiceAnnouncementsEnabled, setVoiceAnnouncementsEnabled] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"cards" | "chat">("cards");
  
  // Fetch game data
  const fetchGameData = async () => {
    try {
      const response = await apiRequest('GET', `/api/games/${gameId}`);
      setGame(response.game);
      setTotalCards(response.totalCards || 0);
      
      // Set last called number if there are any
      if (response.game.calledNumbers && response.game.calledNumbers.length > 0) {
        setLastCalledNumber(response.game.calledNumbers[response.game.calledNumbers.length - 1]);
      }
      
      // Set refresh interval based on game status
      if (response.game.status === 'active') {
        setRefreshInterval(3000); // More frequent updates during active game
      } else {
        setRefreshInterval(10000); // Less frequent for waiting/completed
      }
      
      setError(null);
    } catch (error: any) {
      setError(error.message || t('game.fetchError'));
      toast({
        title: t('common.error'),
        description: error.message || t('game.fetchError'),
        variant: 'destructive',
      });
    }
  };
  
  // Fetch user's cards for this game
  const fetchUserCards = async () => {
    if (!user) return;
    
    try {
      const response = await apiRequest('GET', `/api/games/${gameId}/cards`);
      setUserCards(response.cards || []);
      
      // Select the first card by default if no card is selected
      if (response.cards.length > 0 && !selectedCardId) {
        setSelectedCardId(response.cards[0].id);
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('game.fetchCardsError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    setLoading(true);
    fetchGameData();
    fetchUserCards();
  }, [gameId, user]);
  
  // Set up polling for game updates
  useEffect(() => {
    // Only poll if game is in waiting or active status
    if (!game || game.status === 'completed') return;
    
    const interval = setInterval(() => {
      fetchGameData();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [game, refreshInterval]);
  
  // Handle claiming a quine (line)
  const handleClaimQuine = async (gameId: number, cardId: number) => {
    try {
      const response = await apiRequest('POST', `/api/games/${gameId}/claim-quine`, {
        cardId
      });
      
      // Show success toast
      toast({
        title: t('game.quineSuccess'),
        description: t('game.quineSuccessDesc', { prize: response.prize }),
        variant: 'success',
      });
      
      // Refresh game data
      fetchGameData();
    } catch (error: any) {
      throw error;
    }
  };
  
  // Handle claiming a bingo (full card)
  const handleClaimBingo = async (gameId: number, cardId: number) => {
    try {
      const response = await apiRequest('POST', `/api/games/${gameId}/claim-bingo`, {
        cardId
      });
      
      // Show success toast
      toast({
        title: t('game.bingoSuccess'),
        description: response.jackpotWon 
          ? t('game.jackpotSuccessDesc', { prize: response.prize }) 
          : t('game.bingoSuccessDesc', { prize: response.prize }),
        variant: 'success',
      });
      
      // Refresh game data
      fetchGameData();
    } catch (error: any) {
      throw error;
    }
  };
  
  // Handle buying cards for this game
  const handleBuyCards = () => {
    // Navigate to checkout with game ID
    window.location.href = `/checkout?gameId=${gameId}`;
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }
  
  if (error || !game) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
        <h3 className="font-bold">{t('common.error')}</h3>
        <p>{error || t('game.gameNotFound')}</p>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-3 px-3 py-1 bg-primary text-white rounded text-sm"
        >
          {t('common.backToHome')}
        </button>
      </div>
    );
  }
  
  return (
    <div className="game-interface">
      {/* Game information section */}
      <GameInfo 
        game={game} 
        totalCards={totalCards}
        language={i18n.language}
      />
      
      {/* Voice announcer */}
      {game.status === 'active' && (
        <div className="mt-4 bg-white rounded-lg shadow-md p-4">
          <VoiceAnnouncer
            calledNumbers={game.calledNumbers || []}
            lastCalledNumber={lastCalledNumber}
            enabled={voiceAnnouncementsEnabled}
          />
          
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="voice-toggle"
              checked={voiceAnnouncementsEnabled}
              onChange={(e) => setVoiceAnnouncementsEnabled(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="voice-toggle" className="text-sm">
              {t('game.enableVoice')}
            </label>
          </div>
        </div>
      )}
      
      {/* Called numbers grid */}
      {game.calledNumbers && game.calledNumbers.length > 0 && (
        <div className="mt-4">
          <CalledNumbers
            calledNumbers={game.calledNumbers}
            lastCalledNumber={lastCalledNumber}
            columns={9} // European bingo uses 9 columns
          />
        </div>
      )}
      
      {/* User's cards and actions */}
      <div className="mt-6">
        {/* Simple custom tabs implementation */}
        <div className="w-full">
          {/* Tabs header */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex border rounded-md overflow-hidden">
              <button 
                onClick={() => setActiveTab("cards")}
                className={`px-4 py-2 ${activeTab === "cards" ? "bg-primary text-white" : "bg-gray-100"}`}
              >
                {t('game.yourCards')}
              </button>
              <button 
                onClick={() => setActiveTab("chat")}
                className={`px-4 py-2 ${activeTab === "chat" ? "bg-primary text-white" : "bg-gray-100"}`}
              >
                {t('game.chat')}
              </button>
            </div>
            
            <div className="flex items-center">
              {/* Only show auto-mark option in cards tab */}
              {activeTab === "cards" && (
                <div className="cards-options">
                  <input
                    type="checkbox"
                    id="auto-mark"
                    checked={autoMarkNumbers}
                    onChange={(e) => setAutoMarkNumbers(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="auto-mark" className="text-sm mr-4">
                    {t('game.autoMark')}
                  </label>
                </div>
              )}
              
              {game.status === 'waiting' && (
                <button
                  onClick={handleBuyCards}
                  className="px-3 py-1 bg-primary text-white rounded text-sm"
                >
                  {t('game.buyCards')}
                </button>
              )}
            </div>
          </div>
          
          {/* Tab content */}
          <div className="mt-2">
            {/* Cards tab content */}
            {activeTab === "cards" && (
              <>
                {userCards.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {userCards.map(card => (
                        <BingoCard
                          key={card.id}
                          card={card}
                          calledNumbers={game.calledNumbers || []}
                          markableMode={!autoMarkNumbers && game.status === 'active'}
                          autoMarkMode={autoMarkNumbers}
                          highlightQuine={game.status === 'active' && !game.quineWinnerId}
                          highlightBingo={game.status === 'active' && !game.bingoWinnerId}
                        />
                      ))}
                    </div>
                    
                    {game.status === 'active' && (
                      <div className="mt-4">
                        <ClaimActions
                          gameId={game.id}
                          cards={userCards}
                          calledNumbers={game.calledNumbers || []}
                          onClaimQuine={handleClaimQuine}
                          onClaimBingo={handleClaimBingo}
                          disableQuine={!!game.quineWinnerId}
                          disableBingo={!!game.bingoWinnerId}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <p className="text-gray-500 mb-4">{t('game.noCardsMessage')}</p>
                    
                    {game.status !== 'completed' && (
                      <button
                        onClick={handleBuyCards}
                        className="px-4 py-2 bg-primary text-white rounded"
                      >
                        {t('game.buyCardsNow')}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
            
            {/* Chat tab content */}
            {activeTab === "chat" && (
              <GameChat />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInterface;