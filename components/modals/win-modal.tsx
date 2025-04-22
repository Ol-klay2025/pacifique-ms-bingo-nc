import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  winType: 'quine' | 'bingo';
  onConfirm: () => void;
}

const WinModal: React.FC<WinModalProps> = ({ 
  isOpen, 
  onClose, 
  winType, 
  onConfirm 
}) => {
  const { t } = useTranslation();
  
  // Run confetti effect when modal opens
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      // Load confetti dynamically
      import('canvas-confetti').then((confettiModule) => {
        const confetti = confettiModule.default;
        
        // Create a confetti effect
        const duration = 3 * 1000;
        const end = Date.now() + duration;
        
        const colors = winType === 'bingo' 
          ? ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#4B0082', '#EE82EE']
          : ['#FFA500', '#FFFF00', '#FFBF00'];
        
        function frame() {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
          });
          
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
          });
          
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }
        
        frame();
        
        // For big wins (Bingo), add a big burst
        if (winType === 'bingo') {
          setTimeout(() => {
            confetti({
              particleCount: 200,
              spread: 100,
              origin: { y: 0.6 },
              colors: colors
            });
          }, 500);
        }
      });
    }
  }, [isOpen, winType]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div 
        className={`bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 ${
          winType === 'bingo' ? 'border-4 border-success' : 'border-4 border-accent'
        }`}
      >
        <div 
          className={`p-6 text-center ${
            winType === 'bingo' ? 'bg-success text-white' : 'bg-accent text-white'
          }`}
        >
          <h2 className="text-2xl font-bold mb-2">
            {winType === 'bingo' 
              ? t('game.bingoWin') 
              : t('game.quineWin')
            }
          </h2>
          <p>
            {winType === 'bingo' 
              ? t('game.bingoWinDesc') 
              : t('game.quineWinDesc')
            }
          </p>
        </div>
        
        <div className="p-6 text-center">
          <div className={`mb-4 text-6xl ${winType === 'bingo' ? 'text-success' : 'text-accent'}`}>
            {winType === 'bingo' 
              ? '🎊' 
              : '🎉'
            }
          </div>
          
          <h3 className="text-xl font-bold mb-2">
            {winType === 'bingo' 
              ? t('game.bingoWinTitle') 
              : t('game.quineWinTitle')
            }
          </h3>
          
          <p className="text-gray-600 mb-6">
            {winType === 'bingo' 
              ? t('game.bingoWinMessage')
              : t('game.quineWinMessage')
            }
          </p>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={onConfirm}
              className={`w-full p-3 rounded font-medium text-white ${
                winType === 'bingo' ? 'bg-success hover:bg-success/90' : 'bg-accent hover:bg-accent/90'
              }`}
            >
              {t('game.claimPrize')}
            </button>
            
            <button
              onClick={onClose}
              className="w-full p-3 rounded font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {t('game.continuePlaying')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinModal;