import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SCORES_PATH = path.join(process.cwd(), 'app', 'data', 'scores.json');

export async function POST(request: Request) {
  try {
    const { score } = await request.json();
    if (typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }

    // Read current scores
    const data = fs.readFileSync(SCORES_PATH, 'utf-8');
    const scores = JSON.parse(data);

    // Update userScores and userTotalScore
    scores.userScores.push(score);
    scores.userTotalScore += score;

    // Update leaderboard for user 'hurkity' with userTotalScore
    if (Array.isArray(scores.leaderboard)) {
      const idx = scores.leaderboard.findIndex((entry: any) => entry.username === 'hurkity');
      if (idx !== -1) {
        scores.leaderboard[idx].highScore = scores.userTotalScore;
      } else {
        scores.leaderboard.push({ username: 'hurkity', highScore: scores.userTotalScore });
      }
    }

    // Write back to file
    fs.writeFileSync(SCORES_PATH, JSON.stringify(scores, null, 2), 'utf-8');

    return NextResponse.json({ success: true, userScores: scores.userScores, userTotalScore: scores.userTotalScore });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update score', details: String(err) }, { status: 500 });
  }
}
