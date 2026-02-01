import Leaderboard from "../components/score/Leaderboard";
import RecentScore from "../components/score/RecentScore";
import ModeSelect from "../components/home/ModeSelect";

export default function HomePage() {
  return (
    <main style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 40 }}>
      <RecentScore />
      <Leaderboard />
      <ModeSelect />
    </main>
  );
}
