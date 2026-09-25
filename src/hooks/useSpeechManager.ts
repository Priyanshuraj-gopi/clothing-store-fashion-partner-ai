import { useCallback, useEffect, useRef, useState } from 'react';

type BrowserRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};
type BrowserRecognitionConstructor = new () => BrowserRecognition;

declare global { interface Window { webkitSpeechRecognition?: BrowserRecognitionConstructor; SpeechRecognition?: BrowserRecognitionConstructor; } }

export function useSpeechManager() {
  const [muted, setMuted] = useState(false);
  const [listening, setListening] = useState(false);
  const recognition = useRef<BrowserRecognition | null>(null);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback((message: string) => {
    stop();
    if (muted || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.96;
    utterance.pitch = 1.04;
    window.speechSynthesis.speak(utterance);
  }, [muted, stop]);

  const listen = useCallback((onText: (text: string) => void) => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) return false;
    stop();
    recognition.current?.stop();
    const instance = new Recognition();
    instance.continuous = false;
    instance.interimResults = false;
    instance.lang = 'en-IN';
    instance.onresult = (event) => onText(event.results[0][0].transcript);
    instance.onerror = () => setListening(false);
    instance.onend = () => setListening(false);
    recognition.current = instance;
    instance.start();
    setListening(true);
    return true;
  }, [stop]);

  useEffect(() => () => {
    stop();
    recognition.current?.stop();
  }, [stop]);

  return { muted, setMuted, listening, stop, speak, listen, voiceSupported: Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition) };
}
