import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Clock, Award, Users, Coins, AlertTriangle } from 'lucide-react';

interface GameInfoProps {
  gameId: number;
  status: string;
  startTime: string | Date;
  endTime?: string | Date | null;
  prize: number;
  quinePrice?: number | null;
  bingoPrice?: number | null;
  jackpotAmount?: number | null;
  jackpotWon?: boolean;
  userCount?: number;
  isSpecialGame?: boolean;
  cardPrice?: number;
  className?: string;
}

/**
 * Composant pour afficher les informations d'une partie de bingo
 */
const GameInfo: React.FC<GameInfoProps> = ({
  gameId,
  status,
  startTime,
  endTime = null,
  prize,
  quinePrice = null,
  bingoPrice = null,
  jackpotAmount = null,
  jackpotWon = false,
  userCount = 0,
  isSpecialGame = false,
  cardPrice = 0,
  className = '',
}) => {
  const { t } = useTranslation();
  
  // Formater le statut de la partie
  const getStatusDisplay = (status: string): { label: string; color: string } => {
    switch (status) {
      case 'scheduled':
        return { 
          label: t('game.status.scheduled'), 
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' 
        };
      case 'active':
        return { 
          label: t('game.status.active'), 
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
        };
      case 'completed':
        return { 
          label: t('game.status.completed'), 
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' 
        };
      case 'canceled':
        return { 
          label: t('game.status.canceled'), 
          color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' 
        };
      default:
        return { 
          label: status, 
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        };
    }
  };
  
  const statusDisplay = getStatusDisplay(status);
  const isActiveOrCompleted = status === 'active' || status === 'completed';
  const showEndTime = endTime && isActiveOrCompleted;
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border p-4 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">
          {t('game.title')} #{gameId}
        </h2>
        <span className={`px-2 py-1 text-xs font-medium rounded ${statusDisplay.color}`}>
          {statusDisplay.label}
        </span>
      </div>
      
      {/* Informations temporelles */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-gray-500" />
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('game.startTime')}: </span>
            <span>{formatDate(startTime)}</span>
          </div>
        </div>
        
        {showEndTime && (
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-500" />
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('game.endTime')}: </span>
              <span>{formatDate(endTime)}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Prix et récompenses */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
          <h3 className="font-medium mb-2 flex items-center">
            <Award className="w-4 h-4 mr-1 text-amber-500" />
            {t('game.prizes')}
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('game.totalPrize')}</span>
              <span className="font-medium">{formatCurrency(prize)}</span>
            </div>
            
            {quinePrice !== null && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('game.quinePrice')}</span>
                <span>{formatCurrency(quinePrice)}</span>
              </div>
            )}
            
            {bingoPrice !== null && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('game.bingoPrice')}</span>
                <span>{formatCurrency(bingoPrice)}</span>
              </div>
            )}
          </div>
        </div>
        
        {jackpotAmount !== null && (
          <div className={`border rounded-lg p-3 ${
            jackpotWon 
              ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800' 
              : 'bg-gray-50 dark:bg-gray-900'
          }`}>
            <h3 className="font-medium mb-2 flex items-center">
              <Coins className="w-4 h-4 mr-1 text-amber-500" />
              {t('game.jackpot')}
            </h3>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('game.amount')}</span>
              <span className="font-medium">{formatCurrency(jackpotAmount)}</span>
            </div>
            
            {jackpotWon && (
              <div className="mt-2 text-sm text-amber-600 dark:text-amber-400 font-medium flex items-center">
                <Award className="w-4 h-4 mr-1" />
                {t('game.jackpotWon')}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Informations supplémentaires */}
      <div className="space-y-3">
        {userCount > 0 && (
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">
              {t('game.playersParticipating', { count: userCount })}
            </span>
          </div>
        )}
        
        {isSpecialGame && (
          <div className="flex items-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              {t('game.specialGame')} - {formatCurrency(cardPrice)} {t('game.perCard')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameInfo;