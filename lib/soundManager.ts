/**
 * Gestionnaire de sons pour le jeu de bingo
 * Gère le chargement, la lecture et les paramètres des sons du jeu
 */

export interface Sound {
  id: string;
  url: string;
  audio?: HTMLAudioElement;
  volume: number;
  preload: boolean;
}

class SoundManager {
  private sounds: Map<string, Sound> = new Map();
  private muted: boolean = false;
  private globalVolume: number = 0.7; // Volume global par défaut (70%)
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  /**
   * Initialise le gestionnaire de sons
   */
  init(): void {
    if (this.initialized) return;

    // Définir les sons disponibles
    this.register('number-called', '/sounds/number-called.mp3');
    this.register('marked', '/sounds/marked.mp3');
    this.register('quine-win', '/sounds/quine-win.mp3');
    this.register('bingo-win', '/sounds/bingo-win.mp3');
    this.register('card-purchased', '/sounds/card-purchased.mp3');
    this.register('jackpot-win-1', '/sounds/jackpot-win-1.mp3');
    this.register('jackpot-win-2', '/sounds/jackpot-win-2.mp3');
    this.register('jackpot-win-3', '/sounds/jackpot-win-3.mp3');
    this.register('jackpot-win-final', '/sounds/jackpot-win-final.mp3');

    // Récupérer les préférences utilisateur du localStorage
    this.loadPreferences();

    // Vérifier la compatibilité du navigateur avec l'API Audio
    if (typeof window !== 'undefined' && !window.Audio) {
      console.warn('API Audio non prise en charge par ce navigateur');
    }

    this.initialized = true;
  }

  /**
   * Enregistre un nouveau son
   * @param id Identifiant unique du son
   * @param url URL du fichier son
   * @param volume Volume spécifique (0-1)
   * @param preload Précharger le son
   */
  register(id: string, url: string, volume: number = 1, preload: boolean = true): void {
    const sound: Sound = { id, url, volume, preload };
    this.sounds.set(id, sound);

    if (preload && typeof window !== 'undefined') {
      this.preload(id);
    }
  }

  /**
   * Précharge un son pour une lecture instantanée
   * @param id Identifiant du son
   */
  preload(id: string): void {
    const sound = this.sounds.get(id);
    if (!sound) return;

    if (typeof window !== 'undefined' && !sound.audio) {
      sound.audio = new Audio(sound.url);
      sound.audio.preload = 'auto';
      sound.audio.volume = this.muted ? 0 : sound.volume * this.globalVolume;
      
      // Précharger le son
      sound.audio.load();
    }
  }

  /**
   * Joue un son
   * @param id Identifiant du son
   * @param loop Lecture en boucle
   * @returns Promise qui se résout quand le son est terminé
   */
  async play(id: string, loop: boolean = false): Promise<void> {
    if (this.muted) return Promise.resolve();

    const sound = this.sounds.get(id);
    if (!sound) {
      console.warn(`Son "${id}" non trouvé`);
      return Promise.resolve();
    }

    // Si le son n'est pas préchargé, le faire maintenant
    if (!sound.audio) {
      this.preload(id);
    }

    if (!sound.audio) return Promise.resolve();

    try {
      // Réinitialiser l'audio pour permettre de rejouer le son
      sound.audio.currentTime = 0;
      sound.audio.loop = loop;
      sound.audio.volume = this.muted ? 0 : sound.volume * this.globalVolume;

      // Jouer le son
      const playPromise = sound.audio.play();
      
      if (playPromise !== undefined) {
        return playPromise.then(() => {
          // Son joué avec succès
          return new Promise<void>((resolve) => {
            if (!sound.audio) return resolve();
            
            if (loop) {
              resolve(); // Résoudre immédiatement pour les sons en boucle
            } else {
              sound.audio.onended = () => resolve();
            }
          });
        }).catch(error => {
          console.error(`Erreur lors de la lecture du son "${id}":`, error);
        });
      }
    } catch (error) {
      console.error(`Erreur lors de la lecture du son "${id}":`, error);
    }

    return Promise.resolve();
  }

  /**
   * Arrête un son en cours de lecture
   * @param id Identifiant du son
   */
  stop(id: string): void {
    const sound = this.sounds.get(id);
    if (!sound || !sound.audio) return;

    sound.audio.pause();
    sound.audio.currentTime = 0;
  }

  /**
   * Arrête tous les sons en cours de lecture
   */
  stopAll(): void {
    this.sounds.forEach(sound => {
      if (sound.audio) {
        sound.audio.pause();
        sound.audio.currentTime = 0;
      }
    });
  }

  /**
   * Joue une séquence de sons jackpot
   * Joue plusieurs sons consécutifs pour un effet de récompense croissant
   */
  async playJackpotSequence(): Promise<void> {
    if (this.muted) return;

    // Jouer la séquence de jackpot
    await this.play('jackpot-win-1');
    await new Promise(resolve => setTimeout(resolve, 150));
    await this.play('jackpot-win-2');
    await new Promise(resolve => setTimeout(resolve, 150));
    await this.play('jackpot-win-3');
    await new Promise(resolve => setTimeout(resolve, 200));
    await this.play('jackpot-win-final');
  }

  /**
   * Récupère l'état actuel du mode silencieux
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Active ou désactive le mode silencieux
   * @param value Nouvel état
   */
  setMuted(value: boolean): void {
    this.muted = value;
    
    // Mettre à jour le volume de tous les sons
    this.sounds.forEach(sound => {
      if (sound.audio) {
        sound.audio.volume = this.muted ? 0 : sound.volume * this.globalVolume;
      }
    });

    // Sauvegarder la préférence
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('sound_muted', value.toString());
    }
  }

  /**
   * Bascule le mode silencieux
   * @returns Nouvel état
   */
  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Récupère le volume global actuel
   */
  getVolume(): number {
    return this.globalVolume;
  }

  /**
   * Définit le volume global
   * @param value Nouveau volume (0-1)
   */
  setVolume(value: number): void {
    this.globalVolume = Math.max(0, Math.min(1, value));
    
    // Mettre à jour le volume de tous les sons
    this.sounds.forEach(sound => {
      if (sound.audio) {
        sound.audio.volume = this.muted ? 0 : sound.volume * this.globalVolume;
      }
    });

    // Sauvegarder la préférence
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('sound_volume', this.globalVolume.toString());
    }
  }

  /**
   * Définit le volume d'un son spécifique
   * @param id Identifiant du son
   * @param value Nouveau volume (0-1)
   */
  setSoundVolume(id: string, value: number): void {
    const sound = this.sounds.get(id);
    if (!sound) return;

    sound.volume = Math.max(0, Math.min(1, value));
    
    if (sound.audio) {
      sound.audio.volume = this.muted ? 0 : sound.volume * this.globalVolume;
    }
  }

  /**
   * Charge les préférences utilisateur depuis le localStorage
   */
  private loadPreferences(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Charger l'état du mode silencieux
      const mutedPref = localStorage.getItem('sound_muted');
      if (mutedPref !== null) {
        this.muted = mutedPref === 'true';
      }

      // Charger le volume global
      const volumePref = localStorage.getItem('sound_volume');
      if (volumePref !== null) {
        const volume = parseFloat(volumePref);
        if (!isNaN(volume)) {
          this.globalVolume = Math.max(0, Math.min(1, volume));
        }
      }
    }
  }
}

// Créer et exporter une instance unique
export const soundManager = new SoundManager();