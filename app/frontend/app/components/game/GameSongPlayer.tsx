// Place your mp3 file in the public/audio/ directory, e.g. public/audio/game-song.mp3
// This component will play the song automatically when the game page loads.

"use client";
import React, { useEffect, useRef } from "react";

const GameSongPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1;
      audioRef.current.play();
    }
    return () => {
      const fadeOut = () => {
        const audio = audioRef.current;
        if (!audio) return;
        let fadeInterval: NodeJS.Timeout | null = null;
        let volume = audio.volume;
        fadeInterval = setInterval(() => {
          if (!audio) {
            if (fadeInterval) clearInterval(fadeInterval);
            return;
          }
          volume -= 0.05;
          if (volume <= 0.01) {
            audio.volume = 0;
            audio.pause();
            audio.currentTime = 0;
            if (fadeInterval) clearInterval(fadeInterval);
          } else {
            audio.volume = volume;
          }
        }, 40);
      };
      fadeOut();
    };
  }, []);

  return (
    <audio ref={audioRef} src="/audio/game-song.mp3" preload="auto" />
  );
};

export default GameSongPlayer;
