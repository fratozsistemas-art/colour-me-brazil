import { useEffect, useRef, useState } from 'react';

/**
 * Hook to control Text-to-Speech functionality with word-by-word highlighting
 */
export function useTTS({ text, language = 'en', onWordHighlight, onEnd }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const utteranceRef = useRef(null);
  const wordsRef = useRef([]);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Initialize words array
    if (text) {
      wordsRef.current = text.split(/(\s+)/).filter(word => word.trim().length > 0);
    }
  }, [text]);

  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const speak = () => {
    if (!text || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Set language
    const voices = window.speechSynthesis.getVoices();
    const languageCode = language === 'pt' ? 'pt-BR' : 'en-US';
    const voice = voices.find(v => v.lang.startsWith(languageCode)) || voices[0];
    
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = languageCode;
    utterance.rate = playbackRate;
    utterance.pitch = pitch;

    // Word boundary event for highlighting
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        const textUpToChar = text.substring(0, charIndex);
        const wordIndex = textUpToChar.split(/\s+/).filter(w => w.length > 0).length;
        
        setCurrentWordIndex(wordIndex);
        if (onWordHighlight) {
          onWordHighlight(wordIndex);
        }
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const pause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  };

  const togglePlayPause = () => {
    if (!window.speechSynthesis) return;

    if (isPlaying) {
      pause();
    } else if (window.speechSynthesis.paused) {
      resume();
    } else {
      speak();
    }
  };

  return {
    isPlaying,
    currentWordIndex,
    playbackRate,
    pitch,
    setPlaybackRate,
    setPitch,
    togglePlayPause,
    stop,
    speak,
    pause,
    resume
  };
}

/**
 * Component to render text with word-by-word highlighting
 */
export function HighlightedText({ text, currentWordIndex, className = '' }) {
  if (!text) return null;

  const words = text.split(/(\s+)/);
  let wordIndex = -1;

  return (
    <span className={className}>
      {words.map((segment, i) => {
        const isWord = segment.trim().length > 0;
        if (isWord) {
          wordIndex++;
        }
        
        const isHighlighted = isWord && wordIndex === currentWordIndex;
        
        return (
          <span
            key={i}
            className={`transition-all duration-200 ${
              isHighlighted 
                ? 'bg-yellow-300 text-gray-900 px-1 rounded font-semibold' 
                : ''
            }`}
          >
            {segment}
          </span>
        );
      })}
    </span>
  );
}