import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check, Trophy } from 'lucide-react';
import { soundManager } from '@/lib/soundManager';

interface BingoWinNotificationProps {
  show: boolean;
  amount: number;
  gameId: number;
  type: 'bingo' | 'quine';
  onClose: () => void;
  duration?: number; // Durée d'affichage en ms
}

const BingoWinNotification: React.FC<BingoWinNotificationProps> = ({
  show,
  amount,
  gameId,
  type,
  onClose,
  duration = 5000 // 5 secondes par défaut
}) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [countUp, setCountUp] = useState(0);

  // Lancer l'animation d'entrée lorsque le composant est visible
  useEffect(() => {
    if (show && !visible) {
      setVisible(true);
      
      // Jouer le son approprié
      if (type === 'bingo') {
        soundManager.play('bingo-win');
      } else {
        soundManager.play('quine-win');
      }
      
      // Lancer les confettis
      if (type === 'bingo') {
        triggerConfetti();
      }
      
      // Animation de comptage du montant gagné
      let startValue = 0;
      const increment = amount / 20; // Incrémenter sur 20 étapes
      const interval = setInterval(() => {
        startValue += increment;
        if (startValue >= amount) {
          startValue = amount;
          clearInterval(interval);
        }
        setCountUp(Math.floor(startValue));
      }, 50);
      
      // Fermer après la durée spécifiée
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 500); // Attendre la fin de l'animation de sortie
      }, duration);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [show, visible, amount, type, onClose, duration]);

  // Déclencher les confettis
  const triggerConfetti = () => {
    if (typeof window === 'undefined') return;
    
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Couleurs selon le type de victoire
  const colors = type === 'bingo' 
    ? {
        gradient: 'from-green-500 to-emerald-600',
        button: 'text-emerald-600',
        hover: 'hover:bg-green-50'
      }
    : {
        gradient: 'from-blue-500 to-blue-600',
        button: 'text-blue-600',
        hover: 'hover:bg-blue-50'
      };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-auto" />
          
          <motion.div
            initial={{ y: 30 }}
            animate={{ y: 0 }}
            className={`bg-gradient-to-b ${colors.gradient} text-white p-5 rounded-xl shadow-xl max-w-sm w-full mx-4 text-center relative overflow-hidden pointer-events-auto`}
          >
            <div className="absolute top-3 right-3 p-1 bg-white bg-opacity-20 rounded-full">
              {type === 'bingo' ? (
                <Trophy className="w-5 h-5" />
              ) : (
                <Check className="w-5 h-5" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold mb-2">
              {type === 'bingo' 
                ? t('notification.bingoWon') 
                : t('notification.quineWon')}
            </h2>
            
            <div className="relative flex justify-center py-6">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-4xl font-bold relative"
              >
                <span className="absolute -left-4 top-1 opacity-75">€</span>
                <span>{countUp.toLocaleString()}</span>
              </motion.div>
            </div>
            
            <p className="text-sm mb-3 opacity-90">
              {type === 'bingo'
                ? t('notification.bingoWonDetail', { gameId })
                : t('notification.quineWonDetail', { gameId })}
            </p>
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              onClick={() => {
                setVisible(false);
                setTimeout(onClose, 500);
              }}
              className={`mt-2 bg-white ${colors.button} py-2 px-5 rounded-full font-medium ${colors.hover} transition-colors text-sm`}
            >
              {t('common.great')}!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BingoWinNotification;