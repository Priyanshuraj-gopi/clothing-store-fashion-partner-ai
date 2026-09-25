import { useCallback, useEffect, useRef, useState } from 'react';

type BrowserRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type BrowserRecognitionConstructor = new () => BrowserRecognition;

declare global {
  interface Window {
    webkitSpeechRecognition?: BrowserRecognitionConstructor;
    SpeechRecognition?: BrowserRecognitionConstructor;
  }
}

export function useSpeechManager() {
  const [muted, setMuted] = useState(false);
  const [listening, setListening] = useState(false);
  const recognition = useRef<BrowserRecognition | null>(null);

  const stop = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // Ignored
    }
  }, []);

  const speak = useCallback(
    (message: string) => {
      stop();
      if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (!message.trim()) return;

      try {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.98;
        utterance.pitch = 1.02;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) => (v.lang.startsWith('en') && v.name.includes('Natural')) || v.lang === 'en-IN' || v.lang === 'en-US'
        );
        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
      } catch {
        // Silently degrade if speech synthesis unavailable
      }
    },
    [muted, stop]
  );

  const listen = useCallback(
    (onText: (text: string) => void) => {
      if (typeof window === 'undefined') return false;
      const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (!Recognition) return false;

      stop();
      try {
        recognition.current?.abort();
      } catch {
        // Ignored
      }

      try {
        const instance = new Recognition();
        instance.continuous = false;
        instance.interimResults = false;
        instance.lang = 'en-IN';

        instance.onresult = (event) => {
          const transcript = event.results?.[0]?.[0]?.transcript;
          if (transcript) onText(transcript);
        };

        instance.onerror = () => {
          setListening(false);
        };

        instance.onend = () => {
          setListening(false);
        };

        recognition.current = instance;
        instance.start();
        setListening(true);
        return true;
      } catch {
        setListening(false);
        return false;
      }
    },
    [stop]
  );

  useEffect(() => {
    return () => {
      stop();
      try {
        recognition.current?.abort();
      } catch {
        // Ignored
      }
    };
  }, [stop]);

  return {
    muted,
    setMuted,
    listening,
    stop,
    speak,
    listen,
    voiceSupported:
      typeof window !== 'undefined' &&
      Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition),
  };
}
