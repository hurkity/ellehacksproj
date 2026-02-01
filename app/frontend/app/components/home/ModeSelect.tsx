"use client";
import React from "react";
import { useRouter } from "next/navigation";

const ModeSelect: React.FC = () => {
  const router = useRouter();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <img
        src="/solostretch.png"
        alt="Solo Stretch"
        style={{ width: 180, height: 'auto', cursor: 'pointer', borderRadius: 12 }}
        onClick={() => router.push("/levels")}
      />
      <img
        src="/coop.png"
        alt="Co-op Mode"
        style={{ width: 180, height: 'auto', opacity: 0.7, borderRadius: 12 }}
      />
    </div>
  );
};

export default ModeSelect;
