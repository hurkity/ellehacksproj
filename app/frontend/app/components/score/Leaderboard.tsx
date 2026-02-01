"use client";
import React from "react";
import scoresData from "../../data/scores.json";

const Leaderboard: React.FC = () => {
  const leaderboard = scoresData.leaderboard;

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>Leaderboard</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Rank</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>User</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>High Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry: any, idx: number) => (
            <tr key={entry.username}>
              <td style={{ padding: "4px 8px" }}>{idx + 1}</td>
              <td style={{ padding: "4px 8px" }}>{entry.username}</td>
              <td style={{ padding: "4px 8px" }}>{entry.highScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
