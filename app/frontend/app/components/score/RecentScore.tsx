"use client";
import React from "react";
import scoresData from "../../data/scores.json";

const RecentScore: React.FC = () => {
  const userScores = scoresData.userScores || [];
  const userTotalScore = scoresData.userTotalScore || 0;
  const recentScore = userScores.length > 0 ? userScores[userScores.length - 1] : 0;

  return (
    <div style={{
      background: "#222",
      color: "#fff",
      borderRadius: 12,
      padding: 24,
      textAlign: "center",
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      maxWidth: 320,
      margin: "0 auto"
    }}>
      <h2 style={{ marginBottom: 16 }}>Your Score</h2>
      <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 8 }}>{recentScore}</div>
      <div style={{ fontSize: 18, color: "#aaa", marginBottom: 16 }}>Most Recent</div>
      <div style={{ fontSize: 20, marginTop: 16 }}>Total Score: <span style={{ fontWeight: 600 }}>{userTotalScore}</span></div>
    </div>
  );
};

export default RecentScore;
