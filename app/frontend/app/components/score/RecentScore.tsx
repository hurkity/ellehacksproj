"use client";
import React from "react";
import scoresData from "../../data/scores.json";

const RecentScore: React.FC = () => {
  const userScores = scoresData.userScores || [];
  const userTotalScore = scoresData.userTotalScore || 0;
  const recentScore = userScores.length > 0 ? userScores[userScores.length - 1] : 0;

  return (
    <div style={{
      background: "url('/recent_score.png') center/contain no-repeat",
      color: "#ff69b4",
      borderRadius: 0,
      padding: 0,
      textAlign: "center",
      width: 600,
      height: 520,
      margin: "0 auto",
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Racing Sans One, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <h2 style={{ marginBottom: 18, fontSize: 38, color: '#ff69b4', fontWeight: 900 }}>Your Score</h2>
      <div style={{ fontSize: 72, fontWeight: 900, marginBottom: 10, color: '#ff69b4' }}>{recentScore}</div>
      <div style={{ fontSize: 22, color: "#ff69b4", marginBottom: 20, fontWeight: 100 }}>Most Recent</div>
      <div style={{ fontSize: 28, marginTop: 24, color: '#ff69b4', fontWeight: 700 }}>Total Score: <span style={{ fontWeight: 900 }}>{userTotalScore}</span></div>
    </div>
  );
};

export default RecentScore;
