
"use client";
import Leaderboard from "../components/score/Leaderboard";
import RecentScore from "../components/score/RecentScore";

export default function ScorePage() {
  return (
    <div style={{ minHeight: '100vh', width: '100vw', position: 'relative', overflowX: 'visible', paddingLeft: 48, paddingRight: 48 }}>
      {/* RecentScore: absolutely positioned, can move left */}
      <div style={{ position: 'absolute', left: 200, top: 180, zIndex: 2, transform: 'scale(0.7)', transformOrigin: 'top left' }}>
        <RecentScore />
      </div>
      {/* Leaderboard: fixed column on the left */}
      <div style={{ position: 'absolute', left: 660, top: 60, zIndex: 1, width: 440 }}>
        <Leaderboard />
      </div>
      {/* Buttons: fixed column on the right */}
      <div style={{ position: 'absolute', right: 200, top: 200, display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
        <button
          onClick={() => window.location.href = '/game'}
          style={{
            padding: '16px 36px',
            fontSize: 22,
            borderRadius: 10,
            background: '#ff69b4',
            color: '#fff',
            border: 'none',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 12px #ff69b455',
            letterSpacing: 2,
            fontFamily: 'Racing Sans One, sans-serif',
            width: 180,
          }}
        >
          Retry Level
        </button>
        <button
          onClick={() => window.location.href = '/home'}
          style={{
            padding: '16px 36px',
            fontSize: 22,
            borderRadius: 10,
            background: '#ff9800',
            color: '#fff',
            border: 'none',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 12px #ff980055',
            letterSpacing: 2,
            fontFamily: 'Racing Sans One, sans-serif',
            width: 180,
          }}
        >
          Home
        </button>
      </div>
    </div>
  );
}
