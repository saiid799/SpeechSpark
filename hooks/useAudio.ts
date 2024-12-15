import { useState, useRef, useCallback, useEffect } from "react";

interface AudioHookResult {
  isPlaying: boolean;
  play: (text: string, lang: string) => void;
  pause: () => void;
  stop: () => void;
  setSpeed: (speed: number) => void;
  audioData: number[];
}

export const useAudio = (): AudioHookResult => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<number[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const cleanupAudio = useCallback(() => {
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  useEffect(() => {
    return () => cleanupAudio();
  }, [cleanupAudio]);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      // Use a type assertion here instead of 'any'
      const AudioContextClass = (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext) as typeof AudioContext;
      audioContextRef.current = new AudioContextClass();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }
  }, []);

  const visualize = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVisualizer = () => {
      if (!isPlaying) return;

      analyserRef.current!.getByteFrequencyData(dataArray);
      setAudioData(Array.from(dataArray));

      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    updateVisualizer();
  }, [isPlaying]);

  const play = useCallback(
    (text: string, lang: string) => {
      cleanupAudio();
      initAudioContext();

      utteranceRef.current = new SpeechSynthesisUtterance(text);
      utteranceRef.current.lang = lang;

      utteranceRef.current.onstart = () => {
        setIsPlaying(true);
        visualize();
      };

      utteranceRef.current.onend = () => {
        setIsPlaying(false);
        setAudioData([]);
      };

      window.speechSynthesis.speak(utteranceRef.current);
    },
    [cleanupAudio, initAudioContext, visualize]
  );

  const pause = useCallback(() => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const stop = useCallback(() => {
    cleanupAudio();
    setIsPlaying(false);
    setAudioData([]);
  }, [cleanupAudio]);

  const setSpeed = useCallback((speed: number) => {
    if (utteranceRef.current) {
      utteranceRef.current.rate = speed;
    }
  }, []);

  return { isPlaying, play, pause, stop, setSpeed, audioData };
};
