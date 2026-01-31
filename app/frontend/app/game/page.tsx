import PoseCamera from "../components/game/PoseCamera";

export default function GamePage() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1>Game Camera</h1>
      <PoseCamera />
    </main>
  );
}
