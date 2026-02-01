"use client";
import React from "react";
import { useRouter } from "next/navigation";

const ModeSelect: React.FC = () => {
  const router = useRouter();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
      <button
        style={{
          padding: "16px 32px",
          fontSize: 24,
          borderRadius: 8,
          background: "#4caf50",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          marginBottom: 16,
          width: 260,
        }}
        onClick={() => router.push("/levels")}
      >
        Single Player Mode
      </button>
      <button
        style={{
          padding: "16px 32px",
          fontSize: 24,
          borderRadius: 8,
          background: "#888",
          color: "#fff",
          border: "none",
          cursor: "not-allowed",
          opacity: 0.6,
          width: 260,
        }}
        disabled
      >
        Multiplayer Mode (Locked)
      </button>
    </div>
  );
};

export default ModeSelect;
