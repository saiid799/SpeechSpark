// File: hooks/useSpeechSynthesis.ts

import { useState, useEffect, useCallback } from "react";

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
];

const languageToCode: { [key: string]: string } = {
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
};


interface UseSpeechSynthesisResult {
  speak: (text: string, lang: string) => void;
  cancel: () => void;
  speaking: boolean;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
}

export const useSpeechSynthesis = (): UseSpeechSynthesisResult => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (supported) {
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [supported]);

  const getVoiceForLanguage = useCallback(
    (lang: string): SpeechSynthesisVoice | null => {
      const langCode =
        languageToCode[lang] || (lang && lang.slice(0, 2).toLowerCase());
      return (
        voices.find((voice) => voice.lang.startsWith(langCode || "en")) || null
      );
    },
    [voices]
  );

  const speak = useCallback(
    (text: string, lang: string) => {
      if (!supported) {
        console.error("Speech synthesis is not supported in this browser.");
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getVoiceForLanguage(lang);
      if (voice) {
        utterance.voice = voice;
      } else {
        console.warn(
          `No voice found for language: ${lang}. Using default voice.`
        );
      }
      utterance.lang = languageToCode[lang] || lang;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [supported, getVoiceForLanguage]
  );

  const cancel = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [supported]);

  return { speak, cancel, speaking, supported, voices };
};

export { languages, languageToCode };
