"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import PoseCamera from "./PoseCamera";

// Define available poses (must match PoseCamera TARGET_STRETCHES keys)
const POSE_OPTIONS = ["ARMS_UP", "T_POSE", "WARRIOR", "SIDE_BEND"] as const;

type PoseType = typeof POSE_OPTIONS[number];

interface PoseEvent {
  time: number; // seconds or beat count
  pose: PoseType; // key from POSE_OPTIONS
}

const defaultRoutine: PoseEvent[] = [
  { time: 4, pose: "ARMS_UP" },
  { time: 8, pose: "T_POSE" },
  { time: 12, pose: "WARRIOR" },
  { time: 16, pose: "SIDE_BEND" },
];

const RhythmGame: React.FC = () => {
  const [routine, setRoutine] = useState<PoseEvent[]>(defaultRoutine);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
    // Keep scoreRef in sync with score
    React.useEffect(() => {
      scoreRef.current = score;
    }, [score]);
  const [gameActive, setGameActive] = useState(false);
  const [poseMatch, setPoseMatch] = useState(false);
  const [poseWindow, setPoseWindow] = useState<{start: number, end: number} | null>(null);
  const [routineIdx, setRoutineIdx] = useState(0);
  const [sessionScores, setSessionScores] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const postedScoreRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();

  // For manual routine editing (admin/creator)
  const [editTime, setEditTime] = useState(4);
  const [editPose, setEditPose] = useState<PoseType>(POSE_OPTIONS[0]);

  // Helper to get the next routine index based on beat
  const getNextRoutineIdx = (beat: number) => {
    for (let i = 0; i < routine.length; i++) {
      if (beat < routine[i].time) return i - 1 >= 0 ? i - 1 : 0;
    }
    return routine.length - 1;
  };

  // Start the rhythm game
  const startGame = () => {
    setScore(0);
    setCurrentBeat(0);
    setRoutineIdx(0);
    setGameActive(true);
    setSessionScores([]);
    setPoseWindow(null);
    setPoseMatch(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    let beat = 0;
    postedScoreRef.current = false;
    intervalRef.current = setInterval(() => {
      beat++;
      setCurrentBeat((prev) => {
        const nextBeat = prev + 1;
        setRoutineIdx(getNextRoutineIdx(nextBeat));
        // Open pose window if at a pose time
        if (routine[getNextRoutineIdx(nextBeat)] && nextBeat === routine[getNextRoutineIdx(nextBeat)].time) {
          setPoseWindow({ start: nextBeat, end: nextBeat + 2 });
          setPoseMatch(false); // Reset poseMatch for new window
        } else if (poseWindow && nextBeat > poseWindow.end) {
          setPoseWindow(null);
        }
        // End game after last beat
        if (nextBeat >= (routine[routine.length - 1]?.time || 0) + 4) {
          setGameActive(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          setSessionScores((prev) => [...prev, scoreRef.current]);
          // Save score to backend (API route) using latest score, only once
          if (!postedScoreRef.current) {
            postedScoreRef.current = true;
            fetch('/api/score', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ score: scoreRef.current }),
            })
              .then(() => {
                router.push('/score');
              });
          }
        }
        return nextBeat;
      });
    }, 1000);
    // Play music
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  // Start music on mount (when navigating to /game)
  React.useEffect(() => {
    if (audioRef.current && !gameActive) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {}); // ignore autoplay errors
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Stop music when game ends (do not reset time)
  React.useEffect(() => {
    if (!gameActive && audioRef.current) {
      audioRef.current.pause();
    }
  }, [gameActive]);

  // PoseCamera callback
  const handlePoseMatch = (isMatch: boolean, _score: number) => {
    // Only increment score once per pose window (every 2 beats)
    if (
      gameActive &&
      poseWindow &&
      !poseMatch &&
      isMatch &&
      currentBeat >= poseWindow.start &&
      currentBeat <= poseWindow.end
    ) {
      setScore((prev) => prev + 1);
      setPoseMatch(true); // Prevent multiple increments in same window
    }
  };

  // Manual routine editing UI
  const addPoseEvent = () => {
    setRoutine([...routine, { time: editTime, pose: editPose }]);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <audio ref={audioRef} src="/audio/Mark Ronson - Uptown Funk (Lyrics) ft. Bruno Mars.mp3" preload="auto" />
      <PoseCamera
        targetStretch={gameActive && poseWindow ? routine[routineIdx]?.pose : undefined}
        onPoseMatch={handlePoseMatch}
        showDebug={false}
      />
      {/* Overlay: Score and Start Button */}
      <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 10, background: 'rgba(255, 182, 193, 0.92)', borderRadius: 16, padding: '22px 38px', color: '#fff', minWidth: 240, boxShadow: '0 2px 16px #ff69b4', border: '3px solid #ff9800' }}>
        <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: '#ff69b4', textShadow: '0 2px 8px #fff3' }}>Score: {score}</div>
        <button onClick={startGame} disabled={gameActive} style={{ padding: '14px 36px', fontSize: 24, borderRadius: 10, background: '#ff9800', color: '#fff', border: 'none', cursor: gameActive ? 'not-allowed' : 'pointer', marginBottom: 12, fontWeight: 700, boxShadow: '0 2px 8px #ff980055' }}>
          Start Game
        </button>
        {/* Game over UI and navigation handled on /score page */}
      </div>
      {/* Overlay: Current Move Only */}
      <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 10, background: 'rgba(255, 236, 179, 0.95)', borderRadius: 16, padding: '22px 38px', color: '#222', minWidth: 340, boxShadow: '0 2px 16px #ff9800', border: '3px solid #ff69b4' }}>
        <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 14, color: '#ff9800', textShadow: '0 2px 8px #fff6' }}>Current Move</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#ff69b4', marginBottom: 12 }}>
          Beat {routine[routineIdx]?.time}: <strong>{routine[routineIdx]?.pose.replace('_', ' ')}</strong>
          {poseWindow ? ' ← Now' : ''}
        </div>
        <div style={{ marginTop: 16, fontSize: 18 }}>
          <strong>Current Beat:</strong> {currentBeat}
          {poseWindow && (
            <span style={{ marginLeft: 18, color: poseMatch ? '#ff69b4' : '#ff9800', fontWeight: 700, borderBottom: '2px solid #00bfff' }}>
              {poseMatch ? 'Pose Matched!' : `Hit pose: ${routine[routineIdx]?.pose}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RhythmGame;
