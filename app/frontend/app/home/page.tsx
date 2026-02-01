import Leaderboard from "../components/score/Leaderboard";
import RecentScore from "../components/score/RecentScore";
import ModeSelect from "../components/home/ModeSelect";

export default function HomePage() {
  return (
    <>
      <div style={{ width: 800, margin: '0 auto', marginBottom: 18, paddingLeft: 32, paddingRight: 32 }}>
        <h1 style={{
          fontFamily: 'Racing Sans One, sans-serif',
          fontSize: 48,
          fontWeight: 900,
          letterSpacing: 2,
          color: '#ff69b4',
          textAlign: 'center',
          margin: 0,
          marginTop: 24,
        }}>
          Meowbility
        </h1>
      </div>
      <div style={{ position: 'relative', minHeight: '80vh', width: '100vw', overflow: 'hidden', paddingLeft: 80, paddingRight: 48, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40, position: 'relative', zIndex: 1, marginLeft: -320 }}>
          {/* Leaderboard on the left */}
          <Leaderboard />
          {/* RecentScore to the right of Leaderboard, wrapped and styled */}
          <div style={{ transform: 'scale(0.7)', marginLeft: -60, marginTop: -200 }}>
            <RecentScore />
          </div>
        </div>
        {/* Diagonal white triangle at bottom right */}
        <div style={{
          position: 'fixed',
          right: 0,
          bottom: 0,
          width: '60vw',
          height: '60vh',
          pointerEvents: 'none',
          zIndex: 2,
        }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', right: 0, bottom: 0, width: '100%', height: '100%' }}>
            <polygon points="100,0 100,100 0,100" fill="#fff" />
          </svg>
          {/* ModeSelect inside the triangle */}
          <div style={{
            position: 'absolute',
            right: '8%',
            bottom: '8%',
            width: '60%',
            height: '60%',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            pointerEvents: 'auto',
          }}>
            <ModeSelect />
          </div>
        </div>
      </div>
    </>
  );
}
