import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';
import { soundManager } from '@/lib/soundManager';

interface JackpotWinNotificationProps {
  show: boolean;
  amount: number;
  gameId: number;
  onClose: () => void;
  duration?: number; // Durée d'affichage en ms
}

const JackpotWinNotification: React.FC<JackpotWinNotificationProps> = ({
  show,
  amount,
  gameId,
  onClose,
  duration = 8000 // 8 secondes par défaut
}) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [countUp, setCountUp] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);

  // Lancer l'animation d'entrée lorsque le composant est visible
  useEffect(() => {
    if (show && !visible) {
      setVisible(true);
      soundManager.playJackpotSequence();
      triggerConfetti();
      
      // Animation de comptage du montant du jackpot
      let startValue = 0;
      const increment = amount / 30; // Incrémenter sur 30 étapes
      const interval = setInterval(() => {
        startValue += increment;
        if (startValue >= amount) {
          startValue = amount;
          clearInterval(interval);
        }
        setCountUp(Math.floor(startValue));
      }, 50);
      
      // Afficher les feux d'artifice après un délai
      setTimeout(() => {
        setShowFireworks(true);
        triggerConfetti('fireworks');
      }, 1000);
      
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
  }, [show, visible, amount, onClose, duration]);

  // Déclencher les confettis
  const triggerConfetti = (type: 'basic' | 'fireworks' = 'basic') => {
    if (typeof window === 'undefined') return;
    
    if (type === 'basic') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      // Feux d'artifice plus complexes (plusieurs explosions)
      const duration = 5000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Confettis aux quatre coins
        confetti({
          ...defaults,
          particleCount,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        });
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        });
      }, 250);
    }
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
          <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-auto" />
          
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="bg-gradient-to-b from-yellow-500 to-amber-600 text-white p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 text-center relative overflow-hidden pointer-events-auto"
          >
            {/* Effet de brillance */}
            <div className="absolute inset-0 overflow-hidden">
              {showFireworks && (
                <>
                  <div className="absolute top-10 left-10 animate-ping">
                    <Sparkles className="w-6 h-6 text-yellow-200" />
                  </div>
                  <div className="absolute top-20 right-20 animate-ping delay-300">
                    <Sparkles className="w-8 h-8 text-yellow-200" />
                  </div>
                  <div className="absolute bottom-10 left-1/4 animate-ping delay-700">
                    <Sparkles className="w-5 h-5 text-yellow-200" />
                  </div>
                </>
              )}
            </div>
            
            <h2 className="text-3xl font-bold mb-2">{t('notification.jackpotWon')}</h2>
            
            <div className="relative flex justify-center py-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-6xl font-bold relative"
              >
                <span className="absolute -left-5 top-1 opacity-75">€</span>
                <span className="text-shadow-glow">{countUp.toLocaleString()}</span>
              </motion.div>
            </div>
            
            <p className="text-lg mb-4">
              {t('notification.jackpotWonDetail', { gameId })}
            </p>
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
              onClick={() => {
                setVisible(false);
                setTimeout(onClose, 500);
              }}
              className="mt-4 bg-white text-amber-600 py-2 px-6 rounded-full font-semibold hover:bg-yellow-100 transition-colors"
            >
              {t('common.awesome')}!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JackpotWinNotification;