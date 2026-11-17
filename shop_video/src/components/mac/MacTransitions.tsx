import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { MAC_COLORS } from "../../config/macTheme";

export type MacTransitionKind = "aurora" | "threads" | "paper" | "violet";

export const MacTransition: React.FC<{ kind: MacTransitionKind }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 29], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = interpolate(frame, [0, 14, 29], [0, 0.72, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gradients: Record<MacTransitionKind, string> = {
    aurora: `linear-gradient(105deg, transparent 15%, rgba(148,98,200,${glow}) 42%, rgba(240,209,140,${glow}) 52%, transparent 78%)`,
    threads: `linear-gradient(100deg, transparent 10%, rgba(213,175,99,${glow}) 50%, transparent 90%)`,
    paper: `radial-gradient(ellipse at ${20 + p * 60}% 50%, rgba(243,239,247,${p}) 0%, rgba(243,239,247,${p * 0.45}) 38%, transparent 74%)`,
    violet: `linear-gradient(100deg, rgba(9,6,18,${p}) 0%, rgba(23,13,41,${p}) 100%)`,
  };
  return <AbsoluteFill style={{ pointerEvents: "none", background: gradients[kind], mixBlendMode: kind === "paper" ? "screen" : "normal", boxShadow: kind === "paper" ? `inset 0 0 120px ${MAC_COLORS.brightGold}22` : undefined }} />;
};
