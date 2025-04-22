/**
 * Module d'effets sonores pour MS BINGO PACIFIQUE
 * Gère les sons pour les différentes actions du jeu
 */

class BingoAudio {
  constructor(options = {}) {
    // Contexte audio
    this.audioContext = null;
    
    // Options de configuration
    this.options = {
      volume: options.volume ?? 0.8,
      muteMusic: options.muteMusic ?? false,
      muteSoundEffects: options.muteSoundEffects ?? false,
      voiceEnabled: options.voiceEnabled ?? true,
      voiceLanguage: options.voiceLanguage ?? 'fr-FR',
      voiceRate: options.voiceRate ?? 0.8,
      voiceGender: options.voiceGender ?? 'female'
    };
    
    // Buffers pour les sons
    this.soundBuffers = {};
    
    // Répertoire des sons
    this.soundDirectory = 'sounds/';
    
    // Musique de fond
    this.backgroundMusic = null;
    
    // Liste des sons
    this.sounds = {
      drawNumber: { url: 'pop.mp3', buffer: null },
      markNumber: { url: 'click.mp3', buffer: null },
      quine: { url: 'quine.mp3', buffer: null },
      bingo: { url: 'bingo.mp3', buffer: null },
      jackpot: { url: 'jackpot.mp3', buffer: null },
      backgroundMusic: { url: 'tropical.mp3', buffer: null }
    };
    
    // Initialiser le contexte audio lorsque possible
    this.initAudioContext();
  }
  
  /**
   * Initialise le contexte audio de manière sécurisée (nécessite une interaction utilisateur)
   */
  initAudioContext() {
    // AudioContext doit être initialisée après une interaction utilisateur
    const resumeAudio = () => {
      if (!this.audioContext) {
        try {
          // Créer un nouveau contexte audio
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          
          // Charger tous les sons
          this.preloadSounds();
          
          console.log('Contexte audio initialisé avec succès');
        } catch (e) {
          console.error('Erreur lors de l\'initialisation du contexte audio:', e);
        }
      } else if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    };
    
    // Utiliser les événements d'interaction utilisateur pour démarrer l'audio
    const events = ['click', 'touchstart', 'keydown'];
    const handleEvent = () => {
      resumeAudio();
      events.forEach(event => document.removeEventListener(event, handleEvent));
    };
    
    events.forEach(event => document.addEventListener(event, handleEvent));
  }
  
  /**
   * Précharge tous les sons définis
   */
  preloadSounds() {
    // Fonction pour charger un fichier audio
    const loadSound = (name, url) => {
      // Simuler le chargement des sons pour la démo
      // Dans une application réelle, charger les sons depuis les fichiers
      this.createSimulatedSound(name);
      
      // Note: En production, utiliser cette méthode:
      /*
      fetch(this.soundDirectory + url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          this.soundBuffers[name] = audioBuffer;
          console.log(`Son ${name} chargé avec succès`);
        })
        .catch(error => console.error(`Erreur lors du chargement du son ${name}:`, error));
      */
    };
    
    // Charger tous les sons définis
    Object.keys(this.sounds).forEach(key => {
      loadSound(key, this.sounds[key].url);
    });
  }
  
  /**
   * Crée des sons simulés pour la démo (sans fichiers audio réels)
   */
  createSimulatedSound(type) {
    if (!this.audioContext) return null;
    
    let buffer;
    const sampleRate = this.audioContext.sampleRate;
    
    switch (type) {
      case 'drawNumber':
        // Son "pop" doux pour le tirage d'un numéro
        buffer = this.createPopSound(sampleRate);
        break;
      case 'markNumber':
        // Son "clic" pour marquer un numéro
        buffer = this.createClickSound(sampleRate);
        break;
      case 'quine':
        // Son de victoire légère pour une quine
        buffer = this.createQuineSound(sampleRate);
        break;
      case 'bingo':
        // Son de victoire joyeuse pour un bingo
        buffer = this.createBingoSound(sampleRate);
        break;
      case 'jackpot':
        // Son épique pour un jackpot
        buffer = this.createJackpotSound(sampleRate);
        break;
      case 'backgroundMusic':
        // Simple son de fond pour la démo
        buffer = this.createBackgroundMusicSound(sampleRate);
        break;
      default:
        return null;
    }
    
    this.soundBuffers[type] = buffer;
    return buffer;
  }
  
  /**
   * Crée un son "pop" synthétique
   */
  createPopSound(sampleRate) {
    const duration = 0.3;
    const numSamples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Son de pop: attaque rapide, relâchement modéré
      const envelope = Math.exp(-10 * t);
      // Fréquence qui diminue
      const frequency = 800 - 400 * t;
      data[i] = 0.5 * Math.sin(2 * Math.PI * frequency * t) * envelope;
    }
    
    return buffer;
  }
  
  /**
   * Crée un son "clic" synthétique
   */
  createClickSound(sampleRate) {
    const duration = 0.1;
    const numSamples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Son de clic: très court
      const envelope = Math.exp(-30 * t);
      data[i] = 0.5 * (Math.random() * 2 - 1) * envelope;
    }
    
    return buffer;
  }
  
  /**
   * Crée un son de victoire pour une quine
   */
  createQuineSound(sampleRate) {
    const duration = 1.5;
    const numSamples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);
    
    const notes = [523.25, 659.25, 783.99]; // Do, Mi, Sol (C5, E5, G5)
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let val = 0;
      
      // Mélodie ascendante simple
      if (t < 0.5) {
        val = Math.sin(2 * Math.PI * notes[0] * t);
      } else if (t < 1.0) {
        val = Math.sin(2 * Math.PI * notes[1] * t);
      } else {
        val = Math.sin(2 * Math.PI * notes[2] * t);
      }
      
      // Enveloppe qui diminue progressivement
      const envelope = Math.max(0, 1 - t / duration);
      data[i] = 0.3 * val * envelope;
    }
    
    return buffer;
  }
  
  /**
   * Crée un son de victoire pour un bingo
   */
  createBingoSound(sampleRate) {
    const duration = 3.0;
    const numSamples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Accord majeur ascendant suivi d'une fanfare
    const notes = [
      [261.63, 329.63, 392.00], // Do, Mi, Sol
      [293.66, 369.99, 440.00], // Ré, Fa#, La
      [329.63, 415.30, 493.88], // Mi, Sol#, Si
      [349.23, 440.00, 523.25]  // Fa, La, Do
    ];
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let val = 0;
      
      // Mélodie de fanfare
      const noteIndex = Math.min(3, Math.floor(t * 4));
      const chord = notes[noteIndex];
      
      // Mélanger les notes de l'accord
      for (let j = 0; j < chord.length; j++) {
        val += 0.2 * Math.sin(2 * Math.PI * chord[j] * t);
      }
      
      // Ajouter un peu de "brass" avec un bruit harmonique
      if (t > 1.0) {
        val += 0.1 * Math.sin(2 * Math.PI * 800 * t) * Math.sin(2 * Math.PI * 4 * t);
      }
      
      // Enveloppe dynamique
      let envelope;
      if (t < 0.1) {
        envelope = t / 0.1; // Attaque
      } else if (t > duration - 0.5) {
        envelope = (duration - t) / 0.5; // Relâchement
      } else {
        envelope = 1.0; // Sustain
      }
      
      data[i] = 0.3 * val * envelope;
    }
    
    return buffer;
  }
  
  /**
   * Crée un son épique pour un jackpot
   */
  createJackpotSound(sampleRate) {
    const duration = 5.0;
    const numSamples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let val = 0;
      
      // Effet crescendo avec plusieurs fréquences
      const phase = t * (1 + t); // Phase qui augmente de plus en plus vite
      
      // Mélange de fréquences variables
      val += 0.2 * Math.sin(2 * Math.PI * 180 * phase);
      val += 0.2 * Math.sin(2 * Math.PI * 220 * phase);
      val += 0.1 * Math.sin(2 * Math.PI * 440 * phase);
      val += 0.1 * Math.sin(2 * Math.PI * 880 * phase);
      
      // Ajouter un peu de vibration/tremolo
      val *= 1 + 0.2 * Math.sin(2 * Math.PI * 8 * t);
      
      // Enveloppe crescendo
      let envelope;
      if (t < 2.0) {
        envelope = t / 2.0; // Crescendo sur 2 secondes
      } else if (t > duration - 0.5) {
        envelope = (duration - t) / 0.5; // Relâchement
      } else {
        envelope = 1.0; // Sustain
      }
      
      data[i] = 0.3 * val * envelope;
    }
    
    return buffer;
  }
  
  /**
   * Crée une musique de fond simple pour la démo
   */
  createBackgroundMusicSound(sampleRate) {
    // Pour une démo, créons une musique très simple (loop de 4 secondes)
    const duration = 4.0;
    const numSamples = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(2, numSamples, sampleRate);
    const dataLeft = buffer.getChannelData(0);
    const dataRight = buffer.getChannelData(1);
    
    // Accord ukulélé simulé (G-C-E-A)
    const chords = [
      [196.00, 261.63, 329.63, 440.00], // Sol-Do-Mi-La
      [220.00, 277.18, 349.23, 440.00], // La-Do#-Fa-La
      [196.00, 246.94, 311.13, 392.00], // Sol-Si♭-Mi♭-Sol
      [174.61, 233.08, 293.66, 349.23]  // Fa-Si♭-Ré-Fa
    ];
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const chordIndex = Math.floor((t % duration) / duration * chords.length);
      const chord = chords[chordIndex];
      
      let leftVal = 0;
      let rightVal = 0;
      
      // Simulation de grattage d'ukulélé
      for (let j = 0; j < chord.length; j++) {
        const freq = chord[j];
        const amplitude = 0.08; // Volume faible pour la musique de fond
        
        // Effet de grattage
        const strumOffset = j * 0.05;
        const noteTime = (t + strumOffset) % duration;
        
        // Enveloppe simple pour chaque note
        const attack = 0.01;
        const decay = 0.2;
        const sustain = 0.3;
        const release = 0.3;
        
        // Temps dans le cycle de la note (modulo 1 seconde)
        const notePhase = noteTime % 1.0;
        
        let env = 0;
        if (notePhase < attack) {
          env = notePhase / attack; // Attaque
        } else if (notePhase < attack + decay) {
          env = 1.0 - (1.0 - sustain) * ((notePhase - attack) / decay); // Decay
        } else if (notePhase < 1.0 - release) {
          env = sustain; // Sustain
        } else {
          env = sustain * (1.0 - (notePhase - (1.0 - release)) / release); // Release
        }
        
        // Son de la corde
        const stringVal = Math.sin(2 * Math.PI * freq * noteTime) * env;
        
        // Stéréo: répartir les notes entre canaux gauche et droit
        if (j % 2 === 0) {
          leftVal += amplitude * stringVal;
        } else {
          rightVal += amplitude * stringVal;
        }
      }
      
      // Ajouter un peu de réverbération (écho simple)
      if (i > sampleRate * 0.1) {
        leftVal += 0.2 * dataLeft[i - Math.floor(sampleRate * 0.1)];
        rightVal += 0.2 * dataRight[i - Math.floor(sampleRate * 0.1)];
      }
      
      dataLeft[i] = leftVal;
      dataRight[i] = rightVal;
    }
    
    return buffer;
  }
  
  /**
   * Joue un son spécifique
   */
  playSound(type, options = {}) {
    if (!this.audioContext || this.options.muteSoundEffects) return;
    
    const buffer = this.soundBuffers[type];
    if (!buffer) {
      console.warn(`Le son ${type} n'est pas chargé`);
      return;
    }
    
    // Créer une source audio
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    // Créer un gain node pour contrôler le volume
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = options.volume !== undefined ? options.volume : this.options.volume;
    
    // Connecter les nodes
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Jouer le son
    source.start(0);
    
    return source;
  }
  
  /**
   * Joue ou arrête la musique de fond
   */
  toggleBackgroundMusic(play = true) {
    if (!this.audioContext || this.options.muteMusic) return;
    
    if (play) {
      // Si la musique n'est pas encore créée ou est arrêtée
      if (!this.backgroundMusic) {
        const buffer = this.soundBuffers['backgroundMusic'];
        if (!buffer) {
          console.warn('La musique de fond n\'est pas chargée');
          return;
        }
        
        // Créer une source audio
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        // Créer un gain node pour contrôler le volume
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = this.options.volume * 0.5; // Musique plus douce
        
        // Connecter les nodes
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Sauvegarder la référence
        this.backgroundMusic = {
          source: source,
          gainNode: gainNode
        };
        
        // Démarrer la musique
        source.start(0);
      }
    } else if (this.backgroundMusic) {
      // Arrêter la musique progressivement
      const now = this.audioContext.currentTime;
      this.backgroundMusic.gainNode.gain.linearRampToValueAtTime(0, now + 1);
      this.backgroundMusic.source.stop(now + 1);
      this.backgroundMusic = null;
    }
  }
  
  /**
   * Annonce vocale d'un texte quelconque
   * @param {string} text - Texte à annoncer vocalement
   */
  speak(text) {
    if (!this.options.voiceEnabled || !window.speechSynthesis) return;
    
    // Annuler toute annonce en cours
    window.speechSynthesis.cancel();
    
    // Créer une nouvelle annonce
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = this.options.voiceLanguage;
    speech.rate = this.options.voiceRate;
    
    // Sélectionner une voix selon le genre préféré
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const filteredVoices = voices.filter(voice => 
        voice.lang.indexOf(this.options.voiceLanguage.substring(0, 2)) === 0);
      
      if (filteredVoices.length > 0) {
        // Chercher une voix correspondant au genre préféré
        const genderVoices = filteredVoices.filter(voice => 
          this.options.voiceGender === 'female' 
            ? voice.name.toLowerCase().includes('female') || voice.name.includes('f')
            : voice.name.toLowerCase().includes('male') && !voice.name.includes('female'));
        
        speech.voice = genderVoices.length > 0 ? genderVoices[0] : filteredVoices[0];
      }
    }
    
    // Jouer l'annonce
    window.speechSynthesis.speak(speech);
  }
  
  /**
   * Annonce vocale d'un numéro
   * @param {number} number - Numéro à annoncer
   */
  announceNumber(number) {
    // Correction spéciale pour les numéros qui posent des problèmes de prononciation
    if (number === 74) {
      // Prononciation exacte pour le 74
      this.speak("soixante-quatorze");
    } else if (number === 84) {
      // Prononciation exacte pour le 84
      this.speak("quatre-vingt-quatre");
    } else if (number === 81) {
      // Prononciation exacte pour le 81
      this.speak("quatre-vingt-un");
    } else {
      this.speak(`${number}`);
    }
  }
  
  /**
   * Joue un son pour le tirage d'un numéro
   */
  playDrawSound(number) {
    this.playSound('drawNumber');
    if (this.options.voiceEnabled) {
      this.announceNumber(number);
    }
  }
  
  /**
   * Joue un son pour le marquage d'un numéro sur une carte
   */
  playMarkSound() {
    this.playSound('markNumber');
  }
  
  /**
   * Joue un son pour une quine (ligne complète)
   * @param {string|number} cardId - ID du carton gagnant
   * @param {boolean} waitForAnnouncement - Si vrai, attend que l'annonce du numéro soit terminée
   */
  playQuineSound(cardId, waitForAnnouncement = true) {
    // D'abord jouer le son de la quine
    this.playSound('quine');
    
    // Annoncer vocalement la quine
    if (this.options.voiceEnabled && cardId) {
      // Si on doit attendre la fin de l'annonce du numéro
      if (waitForAnnouncement) {
        // Vérifier si la synthèse vocale est en cours
        if (window.speechSynthesis.speaking) {
          // Attendre que l'annonce du numéro soit terminée
          const checkInterval = setInterval(() => {
            if (!window.speechSynthesis.speaking) {
              clearInterval(checkInterval);
              // Faire l'annonce de la quine après un court délai
              setTimeout(() => {
                this.speak(`Quine annoncé du carton numéro ${cardId}`);
              }, 300);
            }
          }, 100);
        } else {
          // Si aucune annonce n'est en cours, annoncer immédiatement
          setTimeout(() => {
            this.speak(`Quine annoncé du carton numéro ${cardId}`);
          }, 300);
        }
      } else {
        // Comportement standard: attendre un peu après le son pour éviter le chevauchement
        setTimeout(() => {
          this.speak(`Quine annoncé du carton numéro ${cardId}`);
        }, 500);
      }
    }
  }
  
  /**
   * Joue un son pour un bingo (carte complète)
   * @param {string|number} cardId - ID du carton gagnant
   */
  playBingoSound(cardId) {
    this.playSound('bingo');
    
    // Annoncer vocalement le bingo
    if (this.options.voiceEnabled && cardId) {
      setTimeout(() => {
        this.speak(`Bingo annoncé du carton numéro ${cardId}`);
      }, 500); // Attendre un peu après le son pour éviter le chevauchement
    }
  }
  
  /**
   * Joue un son pour un jackpot
   */
  playJackpotSound() {
    this.playSound('jackpot');
  }
  
  /**
   * Change le volume général
   */
  setVolume(volume) {
    this.options.volume = Math.max(0, Math.min(1, volume));
    
    // Ajuster le volume de la musique de fond si elle joue
    if (this.backgroundMusic) {
      this.backgroundMusic.gainNode.gain.value = this.options.volume * 0.5;
    }
  }
  
  /**
   * Active/désactive les effets sonores
   */
  toggleSoundEffects(enable) {
    this.options.muteSoundEffects = !enable;
  }
  
  /**
   * Active/désactive la musique de fond
   */
  toggleMusic(enable) {
    this.options.muteMusic = !enable;
    
    if (this.options.muteMusic) {
      this.toggleBackgroundMusic(false);
    } else {
      this.toggleBackgroundMusic(true);
    }
  }
  
  /**
   * Active/désactive les annonces vocales
   */
  toggleVoice(enable) {
    this.options.voiceEnabled = enable;
  }
}

// Export pour utilisation dans différents contextes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BingoAudio;
} else {
  window.BingoAudio = BingoAudio;
}