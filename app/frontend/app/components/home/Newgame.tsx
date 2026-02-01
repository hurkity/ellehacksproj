"use client";
import React from "react";
import { useRouter } from "next/navigation";

const LevelSelect: React.FC = () => {
  const router = useRouter();
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center", maxWidth: 500, margin: "0 auto" }}>
      {levels.map((level) => (
        <button
          key={level}
          style={{
            padding: "20px 32px",
            fontSize: 22,
            borderRadius: 8,
            background: level === 1 ? "#2196f3" : "#888",
            color: "#fff",
            border: "none",
            cursor: level === 1 ? "pointer" : "not-allowed",
            opacity: level === 1 ? 1 : 0.6,
            minWidth: 120,
            marginBottom: 16,
          }}
          disabled={level !== 1}
          onClick={() => level === 1 && router.push("/game")}
        >
          Level {level}
        </button>
      ))}
    </div>
  );
};

export default LevelSelect;
