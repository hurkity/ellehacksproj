"use client";
import React from "react";
import { useRouter } from "next/navigation";

const LevelSelect: React.FC = () => {
  const router = useRouter();
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{
        fontFamily: 'Racing Sans One, sans-serif',
        fontSize: 44,
        fontWeight: 900,
        letterSpacing: 2,
        color: '#ff69b4',
        textAlign: 'center',
        margin: '0 0 32px 0',
        textShadow: '0 2px 8px #0002',
      }}>
        Select a Level
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center" }}>
        {levels.map((level) => (
          <img
            key={level}
            src={`/levels/${level}.png`}
            alt={`Level ${level}`}
            style={{
              width: 140,
              height: 140,
              objectFit: 'cover',
              borderRadius: 16,
              cursor: level === 1 ? 'pointer' : 'not-allowed',
              transition: 'transform 0.15s',
            }}
            onClick={() => level === 1 && router.push("/game")}
          />
        ))}
      </div>
    </div>
  );
};

export default LevelSelect;
