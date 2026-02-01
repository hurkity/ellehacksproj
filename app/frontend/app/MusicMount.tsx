"use client";
import GameSongPlayer from "./components/game/GameSongPlayer";
import { usePathname } from "next/navigation";
import React from "react";

const MusicMount: React.FC = () => {
  const pathname = usePathname();
  const showMusic = pathname.startsWith("/game") || pathname.startsWith("/score");
  return showMusic ? <GameSongPlayer /> : null;
};

export default MusicMount;
