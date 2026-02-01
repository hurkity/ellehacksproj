import Leaderboard from "../components/score/Leaderboard";
import RecentScore from "../components/score/RecentScore";
import ModeSelect from "../components/home/ModeSelect";

export default function HomePage() {
  return (
    <>
      <div style={{ width: 800, margin: '0 auto', paddingLeft: 32, paddingRight: 32, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src="/logo.png" alt="Meowbility Logo" style={{ width: 340, height: 'auto', marginTop: 24, display: 'block' }} />
      </div>
      <div style={{ position: 'relative', minHeight: '80vh', width: '100vw', overflow: 'hidden', paddingLeft: 80, paddingRight: 48, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30, position: 'relative', zIndex: 1, marginLeft: -320 }}>
          {/* Leaderboard on the left */}
          <div style={{ transform: 'scale(0.9)', marginTop: -20  }}>
            <Leaderboard />
          </div>
          {/* RecentScore to the right of Leaderboard, wrapped and styled */}
          <div style={{ transform: 'scale(0.9)', marginLeft: -60, marginTop: -50 }}>
            <RecentScore />
          </div>
        </div>
        {/* ModeSelect at bottom right, bigger buttons */}
        <div style={{
          position: 'fixed',
          right: 0,
          top: 520,
          width: '40vw',
          height: '30vh',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          pointerEvents: 'auto',
          zIndex: 2,
        }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
            <ModeSelect buttonSize={"large"} />
            <img src="/mascot.png" alt="Mascot" style={{ width: 400, height: 'auto', marginRight: 36, filter: 'drop-shadow(0 4px 16px #ff69b4aa)' }} />
          </div>
        </div>
      </div>
    </>
  );
}
