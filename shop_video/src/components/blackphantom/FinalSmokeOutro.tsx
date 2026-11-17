// Adapted from CardFlockTumble by Wei Yihao, video-shotcraft.
// Copyright 2026 Wei Yihao. Licensed under Apache-2.0; see src/vendor/videoShotcraft/LICENSE.
// Modified for BLACKPHANTOM branding and the graphite / platinum / gold palette.
import React, { useId } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { EASE, Grain, mix, ramp, Vignette } from "../../vendor/videoShotcraft/demos/_fixtures/Polish";
import { alpha } from "../../vendor/videoShotcraft/demos/_fixtures/Look";
import { ManropeFontFaces } from "./scenes/ManropeFontFaces";

export const BLACKPHANTOM_FINAL_DURATION = 105;

const RING_T0 = 0;
const TEXT_T0 = 4;
const CY_OFF = 0;

const COLORS = {
  background: "#07090C",
  graphite: "#151B22",
  platinum: "#F1F2F4",
  silver: "#B6BEC8",
  gold: "#C8A66A",
  lightGold: "#E8D6AD",
  darkGold: "#80663F",
} as const;

const Backdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      overflow: "hidden",
      background: `linear-gradient(180deg, ${COLORS.graphite} 0%, #0D1116 48%, ${COLORS.background} 100%)`,
    }}
  >
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 48% 42% at 50% 50%, ${alpha(COLORS.gold, 0.13)} 0%, ${alpha(COLORS.darkGold, 0.08)} 42%, ${alpha(COLORS.background, 0)} 74%)`,
      }}
    />
  </AbsoluteFill>
);

const CoreFlash: React.FC<{ frame: number; centerX: number; centerY: number }> = ({ frame, centerX, centerY }) => {
  const t = frame - RING_T0;
  if (t < -1 || t > 14) return null;
  const a = t < 0 ? 0.4 : Math.exp(-t / 3.2);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <div
        style={{
          position: "absolute",
          left: centerX - 420,
          top: centerY + CY_OFF - 420,
          width: 840,
          height: 840,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,250,244,${a.toFixed(3)}) 0%, rgba(255,239,213,${(0.85 * a).toFixed(3)}) 9%, ${alpha(COLORS.lightGold, 0.45 * a)} 22%, ${alpha(COLORS.gold, 0.22 * a)} 44%, ${alpha(COLORS.gold, 0)} 70%)`,
        }}
      />
      <AbsoluteFill style={{ background: alpha(COLORS.lightGold, 0.12 * a) }} />
    </AbsoluteFill>
  );
};

const SmokeRing: React.FC<{ frame: number; centerX: number; centerY: number; designWidth: number; designHeight: number }> = ({ frame, centerX, centerY, designWidth, designHeight }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const t = frame - RING_T0;
  if (t < 0) return null;

  const grow = Easing.out(Easing.cubic)(Math.min(1, t / 52));
  const radius = 46 + 330 * grow + Math.max(0, t - 52) * 1.6;
  const opacity = interpolate(t, [0, 4, 30, 60], [0, 1, 0.94, 0.76], { extrapolateRight: "clamp" });
  const width = radius * interpolate(t, [0, 52], [0.36, 0.27], { extrapolateRight: "clamp" });
  const displacement = 60 + grow * 90;
  const rotation = t * 0.35;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", mixBlendMode: "screen" }}>
      <svg width={designWidth} height={designHeight} viewBox={`0 0 ${designWidth} ${designHeight}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <filter id={`smokeA-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
            <feTurbulence type="fractalNoise" baseFrequency="0.013 0.016" numOctaves={4} seed={11} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={displacement} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id={`smokeB-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
            <feTurbulence type="fractalNoise" baseFrequency="0.021 0.018" numOctaves={4} seed={37} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={displacement * 0.85} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id={`smokeC-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
            <feTurbulence type="fractalNoise" baseFrequency="0.019 0.023" numOctaves={3} seed={73} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={displacement * 1.1} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <linearGradient id={`ringGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F1E6CC" stopOpacity={0.92} />
            <stop offset="42%" stopColor="#C8A66A" stopOpacity={0.88} />
            <stop offset="100%" stopColor="#80663F" stopOpacity={0.72} />
          </linearGradient>
        </defs>
        <g transform={`rotate(${rotation} ${centerX} ${centerY + CY_OFF})`} opacity={opacity}>
          <g style={{ filter: `url(#smokeA-${uid})` }}>
            <circle
              cx={centerX}
              cy={centerY + CY_OFF}
              r={radius}
              fill="none"
              stroke={alpha(COLORS.darkGold, 0.42)}
              strokeWidth={width * 1.9}
              style={{ filter: "blur(22px)" }}
            />
          </g>
          <g style={{ filter: `url(#smokeA-${uid})` }}>
            <circle
              cx={centerX}
              cy={centerY + CY_OFF}
              r={radius}
              fill="none"
              stroke={`url(#ringGrad-${uid})`}
              strokeWidth={width}
              style={{ filter: "blur(9px)" }}
              opacity={0.88}
            />
          </g>
          <g style={{ filter: `url(#smokeB-${uid})` }}>
            <circle
              cx={centerX}
              cy={centerY + CY_OFF}
              r={radius * 0.99}
              fill="none"
              stroke={alpha(COLORS.lightGold, 0.62)}
              strokeWidth={width * 0.42}
              style={{ filter: "blur(6px)" }}
            />
          </g>
          <g style={{ filter: `url(#smokeC-${uid})` }}>
            <circle
              cx={centerX}
              cy={centerY + CY_OFF}
              r={radius * 1.005}
              fill="none"
              stroke={alpha(COLORS.darkGold, 0.4)}
              strokeWidth={width * 0.4}
              style={{ filter: "blur(7px)" }}
            />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const TITLE_FONT_SIZE = 172;

const TITLE_STYLE: React.CSSProperties = {
  fontFamily: "Manrope, sans-serif",
  fontSize: TITLE_FONT_SIZE,
  fontWeight: 800,
  lineHeight: 1,
  letterSpacing: "-0.025em",
  whiteSpace: "nowrap",
  color: COLORS.platinum,
  textAlign: "center",
};

const BrandTitle: React.FC<{ frame: number; designWidth: number }> = ({ frame, designWidth }) => {
  const slam = ramp(frame, TEXT_T0, 14, EASE.snappy);
  const textScale = mix(1.22, 1, slam) + Math.max(0, frame - TEXT_T0 - 14) * 0.0008;
  const textOpacity = ramp(frame, TEXT_T0, 5, EASE.out);
  const tracking = mix(0.06, -0.025, slam);
  const glowK = 0.6 + 0.4 * Math.exp(-Math.max(0, frame - TEXT_T0) / 10);
  const titleFontSize = designWidth < 1920
    ? Math.min(TITLE_FONT_SIZE, (designWidth - 160) / (10.8 * 1.22))
    : TITLE_FONT_SIZE;
  const glowWidth = designWidth < 1920 ? designWidth * 0.9 : 1320;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          width: glowWidth,
          height: 420,
          background: `radial-gradient(ellipse 50% 32% at 50% 50%, ${alpha(COLORS.gold, 0.14 * glowK)} 0%, ${alpha(COLORS.darkGold, 0.06 * glowK)} 42%, ${alpha(COLORS.gold, 0)} 76%)`,
        }}
      />
      <div
        style={{
          ...TITLE_STYLE,
          fontSize: titleFontSize,
          position: "relative",
          opacity: textOpacity,
          letterSpacing: `${tracking.toFixed(4)}em`,
          transform: `scale(${textScale.toFixed(4)})`,
          backgroundImage: `linear-gradient(180deg, ${COLORS.platinum} 0%, ${COLORS.platinum} 50%, #EFE4CD 76%, ${COLORS.lightGold} 100%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: `drop-shadow(0 2px ${(8 * glowK).toFixed(1)}px ${alpha(COLORS.gold, 0.18 * glowK)})`,
        }}
      >
        BLACKPHANTOM
      </div>
    </AbsoluteFill>
  );
};

export const FinalSmokeOutro: React.FC<{ designWidth?: number; designHeight?: number }> = ({ designWidth = 1920, designHeight = 1080 }) => {
  const frame = useCurrentFrame();
  const centerX = designWidth / 2;
  const centerY = designHeight / 2;

  return (
    <AbsoluteFill>
      <ManropeFontFaces />
      <Backdrop />
      <SmokeRing frame={frame} centerX={centerX} centerY={centerY} designWidth={designWidth} designHeight={designHeight} />
      <CoreFlash frame={frame} centerX={centerX} centerY={centerY} />
      <BrandTitle frame={frame} designWidth={designWidth} />
      <Vignette strength={0.45} inner={0.48} color="#000000" />
      <Grain opacity={0.06} blend="soft-light" />
    </AbsoluteFill>
  );
};
