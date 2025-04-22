/**
 * Initialize and load available voices for speech synthesis
 */
export function initVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve, reject) => {
    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported by browser'));
      return;
    }
    
    // Get available voices
    let voices = window.speechSynthesis.getVoices();
    
    // If voices are already available, resolve immediately
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    
    // Otherwise, wait for the voices to be loaded
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };
    
    // Set a timeout in case voices don't load
    setTimeout(() => {
      if (voices.length === 0) {
        reject(new Error('Timed out waiting for voices to load'));
      }
    }, 5000);
  });
}

/**
 * Get a list of available voices for a specific language
 */
export function getVoicesForLanguage(language: string): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) {
    return [];
  }
  
  const voices = window.speechSynthesis.getVoices();
  return voices.filter(voice => voice.lang.startsWith(language));
}

/**
 * Speak a message using speech synthesis
 */
export function speakMessage(
  message: string, 
  options: {
    language?: string;
    volume?: number;
    rate?: number;
    pitch?: number;
    voiceURI?: string;
  } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported by browser'));
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(message);
    
    // Set options
    if (options.language) utterance.lang = options.language;
    if (options.volume !== undefined) utterance.volume = options.volume;
    if (options.rate !== undefined) utterance.rate = options.rate;
    if (options.pitch !== undefined) utterance.pitch = options.pitch;
    
    // Set voice if specified
    if (options.voiceURI) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.voiceURI === options.voiceURI);
      if (voice) {
        utterance.voice = voice;
      }
    }
    
    // Set up event handlers
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
    
    // Speak
    window.speechSynthesis.speak(utterance);
  });
}