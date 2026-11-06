import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const hash = (n: number) => { const x = Math.sin(n * 127.3 + 11.7) * 43758.5453; return x - Math.floor(x); };

export const getBeatCutMotion = (frame: number) => {
  const settle = interpolate(frame, [0, 6], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const flash = interpolate(frame, [0, 4], [0.95, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const shakeOn = frame < 4 ? 1 : 0;
  const brackets = interpolate(frame, [0, 2, 8, 12], [0, 0.8, 0.6, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const bloom = interpolate(frame, [0, 7], [0.2, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  return {
    scale: 1.03 - settle * 0.03,
    translateY: -16 * (1 - settle),
    flash,
    shakeX: shakeOn * 2 * (hash(frame * 7 + 1) * 2 - 1),
    shakeY: shakeOn * 2 * (hash(frame * 13 + 5) * 2 - 1),
    brackets,
    bloom,
  };
};

export const BeatCutTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const motion = getBeatCutMotion(frame);
  const arm = 54;
  return <>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: motion.brackets }}>
      <path d={`M92 ${92 + arm}V92H${92 + arm} M${1828 - arm} 92H1828V${92 + arm} M1828 ${988 - arm}V988H${1828 - arm} M${92 + arm} 988H92V${988 - arm}`} fill="none" stroke="#C8A66A" strokeWidth="3" />
    </svg>
    {motion.flash > 0.004 && <AbsoluteFill style={{ pointerEvents: "none", opacity: motion.flash, background: "radial-gradient(ellipse 78% 86% at 50% 46%, #fff 0%, rgba(255,255,255,0.96) 42%, rgba(241,242,244,0.66) 100%)" }} />}
  </>;
};

