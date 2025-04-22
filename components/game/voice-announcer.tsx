import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getNumberCallEnglish, getNumberCallFrench, getVoiceForLanguage } from '../../lib/gameUtils';

interface VoiceAnnouncerProps {
  calledNumbers: number[];
  lastCalledNumber: number | null;
  enabled?: boolean;
  volume?: number;
  speed?: number;
  onAnnouncementStart?: () => void;
  onAnnouncementEnd?: () => void;
}

const VoiceAnnouncer: React.FC<VoiceAnnouncerProps> = ({
  calledNumbers,
  lastCalledNumber,
  enabled = true,
  volume = 1,
  speed = 1,
  onAnnouncementStart,
  onAnnouncementEnd
}) => {
  const { t, i18n } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const previousNumberRef = useRef<number | null>(null);
  
  // Handle announcing the last called number
  useEffect(() => {
    if (!enabled || !lastCalledNumber || previousNumberRef.current === lastCalledNumber) {
      return;
    }
    
    previousNumberRef.current = lastCalledNumber;
    announceNumber(lastCalledNumber);
  }, [lastCalledNumber, enabled, i18n.language]);
  
  // Cancel any speech when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Announce a number
  const announceNumber = (number: number) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported by browser');
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Determine what to announce based on language
    let announcement = '';
    if (i18n.language === 'fr') {
      announcement = getNumberCallFrench(number);
    } else {
      announcement = getNumberCallEnglish(number);
    }
    
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.lang = getVoiceForLanguage(i18n.language);
    utterance.volume = volume;
    utterance.rate = speed;
    
    // Set up event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      if (onAnnouncementStart) onAnnouncementStart();
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onAnnouncementEnd) onAnnouncementEnd();
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      if (onAnnouncementEnd) onAnnouncementEnd();
    };
    
    // Get the appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => voice.lang === getVoiceForLanguage(i18n.language));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Speak
    window.speechSynthesis.speak(utterance);
  };
  
  // Toggle pause/resume speech
  const togglePause = () => {
    if (!('speechSynthesis' in window)) return;
    
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };
  
  // Cancel speech
  const cancelSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    if (onAnnouncementEnd) onAnnouncementEnd();
  };
  
  // Replay the last number
  const replayLastNumber = () => {
    if (lastCalledNumber) {
      announceNumber(lastCalledNumber);
    }
  };
  
  return (
    <div className="voice-announcer relative overflow-hidden rounded-lg shadow-sm border bg-card p-4">
      {/* Fond d'onde sonore animé */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <svg
          viewBox="0 0 800 600"
          preserveAspectRatio="none"
          className="w-full h-full object-cover"
        >
          <path
            d="M 0 300 Q 200 150 400 300 Q 600 450 800 300 L 800 600 L 0 600 Z"
            fill="url(#sound-gradient)"
            className="animate-wave"
          >
            <animate
              attributeName="d"
              dur="7s"
              repeatCount="indefinite"
              values="
                M 0 300 Q 200 150 400 300 Q 600 450 800 300 L 800 600 L 0 600 Z;
                M 0 300 Q 200 450 400 300 Q 600 150 800 300 L 800 600 L 0 600 Z;
                M 0 300 Q 200 150 400 300 Q 600 450 800 300 L 800 600 L 0 600 Z"
            />
          </path>
        </svg>
        <defs>
          <linearGradient id="sound-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="50%" stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </linearGradient>
        </defs>
      </div>
      
      {/* Contenu de l'annonceur */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <div className="text-sm font-medium">
              {enabled ? t('game.voiceEnabled') : t('game.voiceDisabled')}
            </div>
          </div>
          
          {enabled && (
            <div className="flex space-x-2">
              {isSpeaking && (
                <button
                  onClick={togglePause}
                  className="p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all hover-lift text-primary"
                  aria-label={isPaused ? t('game.resume') : t('game.pause')}
                >
                  {isPaused ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )}
              
              {isSpeaking && (
                <button
                  onClick={cancelSpeech}
                  className="p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all hover-lift text-red-500"
                  aria-label={t('game.stopAnnouncement')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              
              {!isSpeaking && lastCalledNumber && (
                <button
                  onClick={replayLastNumber}
                  className="p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all hover-lift text-primary"
                  aria-label={t('game.replayNumber')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
        
        {enabled && (
          <div className={`rounded-lg ${isSpeaking ? 'bg-primary/10' : 'bg-muted/10'} p-3 transition-all duration-300`}>
            {isSpeaking ? (
              <div className="flex items-center justify-center">
                <div className="voice-animation flex space-x-2 mr-3">
                  <div className="circle"></div>
                  <div className="circle"></div>
                  <div className="circle"></div>
                </div>
                <span className="text-sm font-medium">{t('game.announcingNumber')} {lastCalledNumber}</span>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                {lastCalledNumber ? (
                  <div>
                    <div className="text-sm mb-1">{t('game.lastAnnouncedNumber')}</div>
                    <div className="text-xl font-semibold text-foreground">{lastCalledNumber}</div>
                  </div>
                ) : (
                  <div>{t('game.waitingForNumbers')}</div>
                )}
              </div>
            )}
          </div>
        )}
        
        {enabled && lastCalledNumber && !isSpeaking && (
          <button
            onClick={replayLastNumber}
            className="mt-3 text-xs bg-primary/5 hover:bg-primary/10 text-primary-foreground rounded-full px-3 py-1 w-full transition-colors flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            {t('game.replayLastNumber')}
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceAnnouncer;