import RhythmGame from "../components/game/RhythmGame";

export default function GamePage() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1>Rhythm Pose Game</h1>
      <RhythmGame />
    </main>
  );
}
