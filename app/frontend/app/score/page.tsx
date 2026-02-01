import Leaderboard from "../components/score/Leaderboard";
import RecentScore from "../components/score/RecentScore";

export default function ScorePage() {
  return (
    <main style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 40 }}>
      <RecentScore />
      <Leaderboard />
    </main>
  );
}
