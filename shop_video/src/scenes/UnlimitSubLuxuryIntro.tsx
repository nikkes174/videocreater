import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { LogoReveal } from "../components/LogoReveal";

export const UnlimitSubLuxuryIntro: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
    <OffthreadVideo
      src={staticFile("assets/one.mp4")}
      muted
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center center",
      }}
    />
    <LogoReveal showBackground={false} />
  </AbsoluteFill>
);
