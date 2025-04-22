import React, { useEffect, useState } from 'react';
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { Slider } from './slider';
import { soundManager } from '@/lib/soundManager';

interface VolumeControlProps {
  className?: string;
  showValue?: boolean;
  compact?: boolean;
}

/**
 * Contrôle de volume avec slider et icône
 * Permet d'ajuster le volume global du jeu
 */
const VolumeControl: React.FC<VolumeControlProps> = ({ 
  className = '',
  showValue = false,
  compact = false
}) => {
  const [volume, setVolume] = useState<number>(0.7);
  const [muted, setMuted] = useState<boolean>(false);

  // Synchroniser avec soundManager au chargement du composant
  useEffect(() => {
    const initialVolume = soundManager.getVolume();
    const initialMuted = soundManager.isMuted();
    setVolume(initialVolume);
    setMuted(initialMuted);
  }, []);

  // Mettre à jour le volume
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    soundManager.setVolume(newVolume);
    
    // Si le volume est augmenté depuis 0, désactiver automatiquement le mode silencieux
    if (newVolume > 0 && muted) {
      toggleMute();
    }
  };

  // Basculer le mode silencieux
  const toggleMute = () => {
    const newMutedState = soundManager.toggleMute();
    setMuted(newMutedState);
  };

  // Choisir l'icône en fonction du volume et du statut silencieux
  const getVolumeIcon = () => {
    if (muted || volume === 0) return <VolumeX className="h-5 w-5" />;
    if (volume < 0.33) return <Volume className="h-5 w-5" />;
    if (volume < 0.66) return <Volume1 className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button 
        onClick={toggleMute}
        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={muted ? "Activer le son" : "Désactiver le son"}
      >
        {getVolumeIcon()}
      </button>
      
      <div className={compact ? "w-24" : "w-32"}>
        <Slider
          value={[muted ? 0 : volume]} 
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          aria-label="Volume"
        />
      </div>
      
      {showValue && (
        <span className="text-xs font-medium min-w-[2.5rem]">
          {Math.round(volume * 100)}%
        </span>
      )}
    </div>
  );
};

export default VolumeControl;