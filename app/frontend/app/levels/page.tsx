import LevelSelect from "../components/home/Newgame";

export default function LevelsPage() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <LevelSelect />
    </main>
  );
}
