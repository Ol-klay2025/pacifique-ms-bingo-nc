import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface BingoCardProps {
  numbers: number[][];
  calledNumbers?: number[];
  cardId?: number;
  highlight?: 'quine' | 'bingo' | null;
  disabled?: boolean;
  onCardClick?: () => void;
  className?: string;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    font: string;
    borderRadius: string;
    numberStyle: string;
    animation: boolean;
  };
}

/**
 * Composant de carte de bingo au format européen (3 lignes x 9 colonnes)
 */
const BingoCard: React.FC<BingoCardProps> = ({
  numbers,
  calledNumbers = [],
  cardId,
  highlight = null,
  disabled = false,
  onCardClick,
  className = '',
  theme = {
    primaryColor: '#ffffff',
    secondaryColor: '#f3f4f6',
    accentColor: '#3b82f6',
    font: 'system-ui',
    borderRadius: '0.5rem',
    numberStyle: 'circle',
    animation: true,
  },
}) => {
  const { t } = useTranslation();

  // Vérifier si une case est marquée (son numéro a été appelé)
  const isMarked = (num: number) => num !== 0 && calledNumbers.includes(num);

  // Vérifier si une ligne entière est complétée
  const isRowCompleted = (rowIndex: number) => {
    return numbers[rowIndex].every(num => num === 0 || isMarked(num));
  };
  
  // Vérifier si la carte entière est complétée
  const isCardCompleted = () => {
    return numbers.every((_row, index) => isRowCompleted(index));
  };

  // Déterminer les couleurs et styles en fonction du thème
  const cardStyle = {
    background: `
      linear-gradient(0deg, rgba(30,144,255,1) 0%, rgba(30,144,255,1) 50%, rgba(135,206,235,1) 50%, rgba(135,206,235,1) 100%),
      radial-gradient(circle at 50% 80%, rgba(210,180,140,1) 0%, rgba(210,180,140,1) 10%, transparent 10.1%),
      radial-gradient(circle at 20% 85%, rgba(210,180,140,1) 0%, rgba(210,180,140,1) 5%, transparent 5.1%),
      radial-gradient(circle at 80% 85%, rgba(210,180,140,1) 0%, rgba(210,180,140,1) 5%, transparent 5.1%)
    `,
    backgroundBlendMode: 'normal, normal, normal, normal',
    fontFamily: theme.font,
    borderRadius: theme.borderRadius,
    boxShadow: highlight 
      ? `0 0 0 2px ${theme.accentColor}, 0 0 15px 5px ${theme.accentColor}` 
      : '0 8px 16px rgba(0, 0, 0, 0.15)',
    transform: disabled ? 'scale(0.98)' : undefined,
    opacity: disabled ? 0.8 : 1,
    border: '2px solid #2e856e',
    position: 'relative' as const,
  };

  const headerStyle = {
    backgroundColor: '#2e856e', // Vert tropical
    color: '#ffffff',
    borderTopLeftRadius: theme.borderRadius,
    borderTopRightRadius: theme.borderRadius,
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
  };

  return (
    <div 
      className={cn(
        'flex flex-col overflow-hidden border transition-all',
        highlight === 'quine' && 'animate-pulse',
        highlight === 'bingo' && 'animate-bounce',
        disabled && 'cursor-not-allowed',
        !disabled && 'hover:shadow-lg cursor-pointer',
        className
      )}
      style={cardStyle}
      onClick={!disabled && onCardClick ? onCardClick : undefined}
      aria-disabled={disabled}
    >
      {/* Palmier 1 */}
      <div style={{
        position: 'absolute',
        bottom: '40%',
        left: '20%',
        width: '5px',
        height: '30px',
        backgroundColor: '#8B4513',
        transform: 'rotate(5deg)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: 'calc(40% + 25px)',
        left: '18%',
        width: '25px',
        height: '15px',
        backgroundColor: '#228B22',
        borderRadius: '50% 50% 0 50%',
        transform: 'rotate(-30deg)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: 'calc(40% + 20px)',
        left: '22%',
        width: '25px',
        height: '15px',
        backgroundColor: '#228B22',
        borderRadius: '50% 0 50% 50%',
        transform: 'rotate(30deg)',
        zIndex: 0
      }} />
      
      {/* Palmier 2 */}
      <div style={{
        position: 'absolute',
        bottom: '45%',
        right: '25%',
        width: '5px',
        height: '25px',
        backgroundColor: '#8B4513',
        transform: 'rotate(-5deg)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: 'calc(45% + 20px)',
        right: '24%',
        width: '20px',
        height: '12px',
        backgroundColor: '#228B22',
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(30deg)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: 'calc(45% + 18px)',
        right: '28%',
        width: '20px',
        height: '12px',
        backgroundColor: '#228B22',
        borderRadius: '0 50% 50% 50%',
        transform: 'rotate(-30deg)',
        zIndex: 0
      }} />
      {/* Entête de la carte */}
      <div className="flex justify-between items-center px-3 py-2" style={headerStyle}>
        <span className="font-bold text-sm">{t('bingo.card')} {cardId || ''}</span>
        {highlight && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-gray-800">
            {highlight === 'quine' ? t('bingo.quine') : t('bingo.bingo')}
          </span>
        )}
      </div>

      {/* Grille de jeu */}
      <div className="grid grid-rows-3 w-full bg-white bg-opacity-80">
        {numbers.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className={cn(
            'grid grid-cols-9',
            isRowCompleted(rowIndex) && 'bg-green-100 dark:bg-green-900/30'
          )}>
            {row.map((num, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={cn(
                  'flex items-center justify-center aspect-square border-2 border-green-700 m-[1px]',
                  num === 0 && 'bg-green-500 bg-opacity-60', // Cases vides en vert
                  num !== 0 && 'font-medium bg-white bg-opacity-70',
                  isMarked(num) && theme.numberStyle === 'circle' && 'relative'
                )}
                style={{
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1) inset',
                  borderRadius: '4px'
                }}
              >
                {num !== 0 && (
                  <>
                    {isMarked(num) ? (
                      <div className={cn(
                        'flex items-center justify-center',
                        theme.numberStyle === 'circle' 
                          ? 'rounded-full bg-red-500 text-white w-7 h-7 font-bold shadow-md'
                          : 'text-red-600 line-through font-bold'
                      )}>
                        {num}
                      </div>
                    ) : (
                      <span className="text-green-900 font-bold text-lg">{num}</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Pied de carte - statut */}
      {isCardCompleted() ? (
        <div className="py-2 px-3 text-center text-sm font-bold bg-green-600 text-white" 
             style={{
               textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
               borderBottomLeftRadius: theme.borderRadius,
               borderBottomRightRadius: theme.borderRadius
             }}>
          {t('bingo.completed')} 🌴
        </div>
      ) : (
        <div className="py-1 px-2 text-center text-xs font-semibold bg-blue-500 bg-opacity-70 text-white"
             style={{
               textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
               borderBottomLeftRadius: theme.borderRadius,
               borderBottomRightRadius: theme.borderRadius  
             }}>
          PACIFIQUE MS BINGO
        </div>
      )}
    </div>
  );
};

export default BingoCard;