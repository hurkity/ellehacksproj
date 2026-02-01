"use client";
import React from "react";
// Add Racing Sans One font import for browser
if (typeof window !== 'undefined') {
  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Racing+Sans+One&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);
}
import scoresData from "../../data/scores.json";

const Leaderboard: React.FC = () => {
  const leaderboard = scoresData.leaderboard;

  return (
    <div style={{ fontFamily: 'Racing Sans One, sans-serif', background: 'none' }}>
      <div style={{ position: 'relative', width: 400, margin: '0 auto' }}>
        <img
          src="/leaderboard.png"
          alt="Leaderboard Background"
          style={{ width: '100%', borderRadius: 18, display: 'block' }}
        />
         <div style={{ position: 'absolute', top: 80, left: 0, width: '100%', height: '100%', padding: '0 120px 18px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', boxSizing: 'border-box' }}>
          <h2 style={{
            color: '#fff',
            marginBottom: 18,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: 2,
            fontFamily: 'Racing Sans One, sans-serif',
          }}>
            Leaderboard
          </h2>
          <table style={{ width: '98%', borderCollapse: 'collapse', borderRadius: 10, overflow: 'hidden', marginLeft: 0, marginRight: 10, fontSize: 18 }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '2px solid #ff69b4', textAlign: 'left', padding: '4px 12px', color: '#ff69b4', fontSize: 18 }}>Rank</th>
              <th style={{ borderBottom: '2px solid #ff69b4', textAlign: 'left', padding: '4px 12px', color: '#ff69b4', fontSize: 18 }}>User</th>
              <th style={{ borderBottom: '2px solid #ff69b4', textAlign: 'left', padding: '4px 12px', color: '#ff69b4', fontSize: 18 }}>High Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry: any, idx: number) => (
              <tr key={entry.username}>
                <td style={{ padding: '4px 8px', fontWeight: 600 }}>{idx + 1}</td>
                <td style={{ padding: '4px 8px' }}>{entry.username}</td>
                <td style={{ padding: '4px 8px', color: '#ff9800', fontWeight: 600 }}>{entry.highScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
