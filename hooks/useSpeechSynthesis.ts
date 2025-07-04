import { useState, useEffect, useCallback, useRef } from "react";

const languages = [
  "English",
  "Spanish", 
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Bengali",
  "Turkish",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Greek",
  "Polish",
  "Czech",
  "Vietnamese",
  "Thai",
  "Indonesian",
  "Malay",
  "Tagalog",
  "Swahili",
  "Persian",
] as const;

type SupportedLanguage = typeof languages[number];

const languageToCode: Record<SupportedLanguage, string> = {
  English: "en",
  Spanish: "es",
  French: "fr", 
  German: "de",
  Italian: "it",
  Portuguese: "pt",
  Russian: "ru",
  Chinese: "zh",
  Japanese: "ja",
  Korean: "ko",
  Arabic: "ar",
  Hindi: "hi",
  Bengali: "bn",
  Turkish: "tr",
  Dutch: "nl",
  Swedish: "sv",
  Norwegian: "no",
  Danish: "da",
  Finnish: "fi",
  Greek: "el",
  Polish: "pl",
  Czech: "cs",
  Vietnamese: "vi",
  Thai: "th",
  Indonesian: "id",
  Malay: "ms",
  Tagalog: "tl",
  Swahili: "sw",
  Persian: "fa",
} as const;


interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  priority?: 'high' | 'normal' | 'low';
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: SpeechSynthesisErrorEvent) => void;
}

interface QueuedSpeech {
  text: string;
  lang: string;
  options: SpeechOptions;
  resolve: () => void;
  reject: (error: Error) => void;
  id: string;
}

interface UseSpeechSynthesisResult {
  speak: (text: string, lang: string, options?: SpeechOptions) => Promise<void>;
  cancel: () => void;
  cancelAll: () => void;
  speaking: boolean;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  isLoading: boolean;
  queueLength: number;
}

export const useSpeechSynthesis = (): UseSpeechSynthesisResult => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechQueueRef = useRef<QueuedSpeech[]>([]);
  const [queueLength, setQueueLength] = useState(0);
  const processingQueueRef = useRef(false);
  
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!supported) return;
    
    // Fast voice loading
    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      setIsLoading(false);
    };

    // Immediate check
    updateVoices();
    
    // Quick fallback for browsers that need time to load voices
    if (voices.length === 0) {
      const timeout = setTimeout(updateVoices, 100);
      window.speechSynthesis.onvoiceschanged = updateVoices;
      
      return () => {
        clearTimeout(timeout);
        window.speechSynthesis.onvoiceschanged = null;
      };
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [supported, voices.length]);

  const getVoiceForLanguage = useCallback(
    (lang: string): SpeechSynthesisVoice | null => {
      if (voices.length === 0) return null;
      
      const langCode = languageToCode[lang as SupportedLanguage] || (lang && lang.slice(0, 2).toLowerCase());
      
      // Create voice quality scoring system
      const scoreVoice = (voice: SpeechSynthesisVoice): number => {
        let score = 0;
        
        // Exact language match gets highest priority
        if (voice.lang.toLowerCase() === langCode?.toLowerCase()) {
          score += 100;
        } else if (voice.lang.toLowerCase().startsWith(langCode?.toLowerCase() || "en")) {
          score += 80;
        } else if (voice.lang.toLowerCase().includes(langCode?.toLowerCase() || "en")) {
          score += 60;
        }
        
        // Prefer local voices over network voices
        if (voice.localService) {
          score += 20;
        }
        
        // Prefer voices with specific regional variants
        if (voice.lang.includes('-')) {
          score += 10;
        }
        
        // Prefer Google voices for quality
        if (voice.name.toLowerCase().includes('google')) {
          score += 15;
        }
        
        // Prefer native/system voices
        if (voice.name.toLowerCase().includes('enhanced') || 
            voice.name.toLowerCase().includes('premium') ||
            voice.name.toLowerCase().includes('neural')) {
          score += 12;
        }
        
        return score;
      };
      
      // Find the best voice based on scoring
      const candidateVoices = voices.filter(voice => {
        const lowerLang = voice.lang.toLowerCase();
        const lowerLangCode = langCode?.toLowerCase() || "en";
        return lowerLang.includes(lowerLangCode) || lowerLang.startsWith(lowerLangCode);
      });
      
      if (candidateVoices.length === 0) {
        return voices.find(voice => voice.lang.toLowerCase().startsWith("en")) || voices[0] || null;
      }
      
      candidateVoices.sort((a, b) => scoreVoice(b) - scoreVoice(a));
      return candidateVoices[0];
    },
    [voices]
  );

  const processQueue = useCallback(async () => {
    if (processingQueueRef.current || speechQueueRef.current.length === 0) {
      return;
    }

    processingQueueRef.current = true;
    
    while (speechQueueRef.current.length > 0) {
      const queuedSpeech = speechQueueRef.current.shift()!;
      setQueueLength(speechQueueRef.current.length);
      
      try {
        await speakImmediately(queuedSpeech.text, queuedSpeech.lang, queuedSpeech.options);
        queuedSpeech.resolve();
      } catch (error) {
        queuedSpeech.reject(error as Error);
      }
    }
    
    processingQueueRef.current = false;
  }, []);

  const speakImmediately = useCallback(
    async (text: string, lang: string, options: SpeechOptions = {}): Promise<void> => {
      return new Promise((resolve) => {
        try {
          // Fast cancellation without delays
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
          }
          
          // Clear previous utterance immediately
          currentUtteranceRef.current = null;
          setSpeaking(false);

          // Create utterance immediately
          const utterance = new SpeechSynthesisUtterance(text);
          currentUtteranceRef.current = utterance;

          // Quick voice selection (use cached voices)
          const voice = getVoiceForLanguage(lang);
          if (voice) {
            utterance.voice = voice;
          }
          
          // Set language code efficiently
          const langCode = languageToCode[lang as SupportedLanguage] || lang;
          utterance.lang = langCode;
          
          // Optimize speech parameters for speed
          utterance.rate = options.rate ?? 1.0; // Faster default rate
          utterance.pitch = options.pitch ?? 1;
          utterance.volume = options.volume ?? 1;

          let hasCompleted = false;

          // Simple, fast event handlers
          utterance.onstart = () => {
            if (!hasCompleted) {
              setSpeaking(true);
              options.onStart?.();
            }
          };
          
          utterance.onend = () => {
            if (!hasCompleted) {
              hasCompleted = true;
              setSpeaking(false);
              currentUtteranceRef.current = null;
              options.onEnd?.();
              resolve();
            }
          };
          
          utterance.onerror = () => {
            if (!hasCompleted) {
              hasCompleted = true;
              setSpeaking(false);
              currentUtteranceRef.current = null;
              options.onError?.(event as SpeechSynthesisErrorEvent);
              resolve(); // Always resolve to prevent crashes
            }
          };

          // Speak immediately - no delays
          window.speechSynthesis.speak(utterance);
          
          // Quick timeout for edge cases (3 seconds max)
          setTimeout(() => {
            if (!hasCompleted) {
              hasCompleted = true;
              window.speechSynthesis.cancel();
              setSpeaking(false);
              currentUtteranceRef.current = null;
              resolve();
            }
          }, 3000);
          
        } catch (error) {
          setSpeaking(false);
          currentUtteranceRef.current = null;
          resolve(); // Always resolve to prevent crashes
        }
      });
    },
    [getVoiceForLanguage, voices.length]
  );

  const speak = useCallback(
    async (text: string, lang: string, options: SpeechOptions = {}): Promise<void> => {
      if (!supported) {
        throw new Error("Speech synthesis is not supported in this browser.");
      }

      if (!text || text.trim() === '') {
        throw new Error("Empty text provided to speech synthesis");
      }

      const priority = options.priority || 'normal';
      const speechId = Math.random().toString(36).substr(2, 9);

      return new Promise((resolve, reject) => {
        const queuedSpeech: QueuedSpeech = {
          text,
          lang,
          options,
          resolve,
          reject,
          id: speechId
        };

        // Handle priority insertion
        if (priority === 'high') {
          speechQueueRef.current.unshift(queuedSpeech);
        } else if (priority === 'low') {
          speechQueueRef.current.push(queuedSpeech);
        } else {
          // Normal priority - insert after high priority items
          const highPriorityCount = speechQueueRef.current.findIndex(
            (item) => item.options.priority !== 'high'
          );
          if (highPriorityCount === -1) {
            speechQueueRef.current.push(queuedSpeech);
          } else {
            speechQueueRef.current.splice(highPriorityCount, 0, queuedSpeech);
          }
        }

        setQueueLength(speechQueueRef.current.length);
        processQueue();
      });
    },
    [supported, processQueue]
  );

  const cancel = useCallback(() => {
    if (!supported) return;
    
    try {
      // Force immediate cancellation
      window.speechSynthesis.cancel();
      
      // Wait a moment and cancel again to ensure it's really stopped
      setTimeout(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      }, 10);
      
      setSpeaking(false);
      currentUtteranceRef.current = null;
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    } catch (error) {
      console.warn("Error canceling speech synthesis:", error);
      setSpeaking(false);
    }
  }, [supported]);

  const cancelAll = useCallback(() => {
    if (!supported) return;
    
    try {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      currentUtteranceRef.current = null;
      
      // Clear the queue and reject all pending promises
      speechQueueRef.current.forEach((queuedSpeech) => {
        queuedSpeech.reject(new Error('Speech synthesis cancelled'));
      });
      speechQueueRef.current = [];
      setQueueLength(0);
      processingQueueRef.current = false;
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    } catch (error) {
      console.warn("Error canceling all speech synthesis:", error);
      setSpeaking(false);
    }
  }, [supported]);

  return { speak, cancel, cancelAll, speaking, supported, voices, isLoading, queueLength };
};

export { languages, languageToCode };
