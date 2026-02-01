"use client";
import React from "react";
import { useRouter } from "next/navigation";


interface ModeSelectProps {
  buttonSize?: "large" | "default";
}

const ModeSelect: React.FC<ModeSelectProps> = ({ buttonSize = "default" }) => {
  const router = useRouter();
  const imgSize = buttonSize === "large" ? 240 : 180;
  const gapSize = 4;

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: gapSize }}>
      <img
        src="/solostretch.png"
        alt="Solo Stretch"
        style={{ width: imgSize, height: 'auto', cursor: 'pointer', borderRadius: 18}}
        onClick={() => router.push("/levels")}
      />
      <img
        src="/coop.png"
        alt="Co-op Mode"
        style={{ width: imgSize, height: 'auto', opacity: 0.7, borderRadius: 18}}
      />
    </div>
  );
};

export default ModeSelect;
