import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import JackpotWinNotification from '@/components/notifications/JackpotWinNotification';
import BingoWinNotification from '@/components/notifications/BingoWinNotification';

// Types de notifications
type NotificationType = 
  | { type: 'jackpot'; amount: number; gameId: number }
  | { type: 'bingo'; amount: number; gameId: number }
  | { type: 'quine'; amount: number; gameId: number };

interface NotificationContextType {
  showNotification: (notification: NotificationType) => void;
  clearNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentNotification, setCurrentNotification] = useState<NotificationType | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Afficher une notification
  const showNotification = useCallback((notification: NotificationType) => {
    // Si une notification est déjà visible, la nettoyer d'abord
    if (isVisible) {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentNotification(notification);
        setIsVisible(true);
      }, 500);
    } else {
      setCurrentNotification(notification);
      setIsVisible(true);
    }
  }, [isVisible]);

  // Nettoyer la notification actuelle
  const clearNotification = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentNotification(null);
    }, 500);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, clearNotification }}>
      {children}
      
      {/* Notification de jackpot */}
      {currentNotification?.type === 'jackpot' && (
        <JackpotWinNotification
          show={isVisible}
          amount={currentNotification.amount}
          gameId={currentNotification.gameId}
          onClose={clearNotification}
        />
      )}
      
      {/* Notification de bingo */}
      {currentNotification?.type === 'bingo' && (
        <BingoWinNotification
          show={isVisible}
          type="bingo"
          amount={currentNotification.amount}
          gameId={currentNotification.gameId}
          onClose={clearNotification}
        />
      )}
      
      {/* Notification de quine */}
      {currentNotification?.type === 'quine' && (
        <BingoWinNotification
          show={isVisible}
          type="quine"
          amount={currentNotification.amount}
          gameId={currentNotification.gameId}
          onClose={clearNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};

// Hook pour utiliser le contexte de notification
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};