import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '@/lib/soundManager';

interface SoundToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: number;
  initialValue?: boolean;
}

/**
 * Bouton de contrôle du son (activer/désactiver)
 * Peut être utilisé seul ou dans un panneau de contrôle
 */
const SoundToggle: React.FC<SoundToggleProps> = ({
  className = '',
  showLabel = false,
  size = 5,
  initialValue
}) => {
  const [muted, setMuted] = useState<boolean>(initialValue ?? false);

  // Synchroniser avec soundManager au chargement du composant
  useEffect(() => {
    if (initialValue === undefined) {
      const initialMuted = soundManager.isMuted();
      setMuted(initialMuted);
    } else {
      soundManager.setMuted(initialValue);
    }
  }, [initialValue]);

  // Basculer le mode silencieux
  const toggleMute = () => {
    const newMutedState = soundManager.toggleMute();
    setMuted(newMutedState);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <button
        onClick={toggleMute}
        className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={muted ? "Activer le son" : "Désactiver le son"}
      >
        {muted ? (
          <VolumeX style={{ width: `${size * 4}px`, height: `${size * 4}px` }} />
        ) : (
          <Volume2 style={{ width: `${size * 4}px`, height: `${size * 4}px` }} />
        )}
        
        {showLabel && (
          <span className="text-sm font-medium ml-1">
            {muted ? "Son désactivé" : "Son activé"}
          </span>
        )}
      </button>
    </div>
  );
};

export default SoundToggle;