import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

const hash = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const DUST = Array.from({ length: 36 }, (_, index) => ({
  x: hash(index * 3 + 1),
  y: 0.1 + hash(index * 3 + 2) * 0.68,
  size: 0.8 + hash(index * 3 + 3) * 1.15,
  depth: 0.2 + hash(index * 3 + 4) * 0.8,
  opacity: 0.055 + hash(index * 3 + 5) * 0.085,
  phase: hash(index * 3 + 6) * Math.PI * 2,
  period: 74 + hash(index * 3 + 7) * 100,
}));

/**
 * Portrait geometry adaptation of the original CardStack luxury environment.
 * Light sweeps, glass planes, haze, floor spill and deterministic dust remain
 * frame-driven; only their anchor points and extents follow the 9:16 canvas.
 */
export const CardStackLuxuryBackgroundVertical: React.FC<{ fanProgress: number }> = ({ fanProgress }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fan = Math.max(0, Math.min(1, fanProgress));
  const lightGain = 0.72 + fan * 0.28;
  const driftX = Math.sin(frame / 96) * width * 0.0104;
  const driftY = Math.cos(frame / 118) * height * 0.00625;
  const hazePulse = 0.84 + Math.sin(frame / 51) * 0.08;
  const beamWidth = width * 0.182;
  const beamBlur = width * 0.032;
  const dustSizeScale = Math.sqrt((width / 1920) * (height / 1080));

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#03080D", pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(145deg, #14272F 0%, #0D1C25 24%, #071119 58%, #03080D 100%), " +
            "radial-gradient(ellipse 68% 66% at 50% 43%, rgba(27,67,74,0.56) 0%, rgba(9,27,35,0.35) 46%, rgba(3,8,13,0) 82%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 76% 68% at 50% 46%, transparent 38%, rgba(0,3,6,0.6) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "-12%",
          top: height * 0.67,
          width: "124%",
          height: height * 0.35,
          transform: `perspective(${width * 1.02}px) rotateX(64deg) translate3d(0, ${(-driftY * 0.3).toFixed(2)}px, 0)`,
          transformOrigin: "50% 0%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse 58% 42% at 50% 20%, rgba(57,213,199,0.18) 0%, rgba(38,112,123,0.1) 38%, rgba(7,17,24,0.03) 68%, transparent 100%)",
          filter: `blur(${(width * 0.0125).toFixed(2)}px)`,
          opacity: 0.5 + fan * 0.22,
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.48) 48%, transparent 100%)",
        }}
      />

      <svg viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: lightGain }}>
        <defs>
          <linearGradient id="card-stack-vertical-key-light" x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0" stopColor="#EAF6F5" stopOpacity="0" />
            <stop offset="0.38" stopColor="#B6F3F0" stopOpacity="0.21" />
            <stop offset="0.72" stopColor="#39D5C7" stopOpacity="0.12" />
            <stop offset="1" stopColor="#39D5C7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="card-stack-vertical-rim-light" x1="1" y1="0" x2="0.25" y2="1">
            <stop offset="0" stopColor="#9AD8E9" stopOpacity="0" />
            <stop offset="0.42" stopColor="#9AD8E9" stopOpacity="0.16" />
            <stop offset="0.78" stopColor="#72DEDB" stopOpacity="0.08" />
            <stop offset="1" stopColor="#72DEDB" stopOpacity="0" />
          </linearGradient>
          <filter id="card-stack-vertical-volumetric-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={beamBlur.toFixed(2)} />
          </filter>
        </defs>
        <path
          d={`M ${-width * 0.07} ${-height * 0.08} C ${width * 0.08} ${height * 0.035}, ${width * 0.185} ${height * 0.17}, ${width * 0.273} ${height * 0.315} C ${width * 0.365} ${height * 0.463}, ${width * 0.463} ${height * 0.517}, ${width * 0.565} ${height * 0.62}`}
          fill="none"
          stroke="url(#card-stack-vertical-key-light)"
          strokeWidth={beamWidth}
          strokeLinecap="round"
          filter="url(#card-stack-vertical-volumetric-blur)"
          opacity={0.58 + fan * 0.24}
          transform={`translate(${driftX.toFixed(2)} ${driftY.toFixed(2)})`}
        />
        <path
          d={`M ${width * 1.08} ${height * 0.04} C ${width * 0.958} ${height * 0.163}, ${width * 0.88} ${height * 0.322}, ${width * 0.786} ${height * 0.444} C ${width * 0.716} ${height * 0.536}, ${width * 0.641} ${height * 0.57}, ${width * 0.55} ${height * 0.639}`}
          fill="none"
          stroke="url(#card-stack-vertical-rim-light)"
          strokeWidth={beamWidth * 0.89}
          strokeLinecap="round"
          filter="url(#card-stack-vertical-volumetric-blur)"
          opacity={0.72}
          transform={`translate(${(-driftX * 0.6).toFixed(2)} ${(driftY * 0.65).toFixed(2)})`}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          left: -width * 0.07,
          top: height * 0.157 + driftY,
          width: width * 0.443,
          height: height * 0.481,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(92,176,184,0.13) 0%, rgba(54,129,139,0.055) 40%, transparent 74%)",
          filter: `blur(${(width * 0.03).toFixed(2)}px)`,
          opacity: hazePulse,
          transform: `translateX(${driftX.toFixed(2)}px) rotate(-10deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -width * 0.083,
          top: height * 0.231 - driftY,
          width: width * 0.406,
          height: height * 0.435,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(82,153,179,0.12) 0%, rgba(42,89,111,0.05) 43%, transparent 75%)",
          filter: `blur(${(width * 0.033).toFixed(2)}px)`,
          opacity: 0.82 + Math.sin(frame / 63 + 1.4) * 0.07,
          transform: `translateX(${(-driftX * 0.65).toFixed(2)}px) rotate(12deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "21%",
          top: height * 0.481 + driftY * 0.4,
          width: "58%",
          height: height * 0.324,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(44,132,139,0.1), rgba(26,82,92,0.035) 46%, transparent 76%)",
          filter: `blur(${(width * 0.027).toFixed(2)}px)`,
          opacity: 0.72 + fan * 0.16,
        }}
      />

      <svg viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.82, transform: `translate3d(${(driftX * 0.42).toFixed(2)}px, ${(driftY * 0.32).toFixed(2)}px, 0)` }}>
        <defs>
          <linearGradient id="card-stack-vertical-glass-left" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#EAF6F5" stopOpacity="0.09" />
            <stop offset="0.36" stopColor="#72DEDB" stopOpacity="0.035" />
            <stop offset="1" stopColor="#0D1C25" stopOpacity="0.008" />
          </linearGradient>
          <linearGradient id="card-stack-vertical-glass-right" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A9DDE8" stopOpacity="0.075" />
            <stop offset="0.45" stopColor="#72DEDB" stopOpacity="0.022" />
            <stop offset="1" stopColor="#071119" stopOpacity="0.004" />
          </linearGradient>
          <linearGradient id="card-stack-vertical-glass-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#EAF6F5" stopOpacity="0" />
            <stop offset="0.45" stopColor="#B6F3F0" stopOpacity="0.28" />
            <stop offset="1" stopColor="#72DEDB" stopOpacity="0" />
          </linearGradient>
          <filter id="card-stack-vertical-glass-softness" x="-25%" y="-20%" width="150%" height="145%">
            <feGaussianBlur stdDeviation={Math.max(1, width * 0.0018).toFixed(2)} />
          </filter>
        </defs>
        <g filter="url(#card-stack-vertical-glass-softness)">
          <path d={`M ${-width * 0.09} ${height * 0.23} L ${width * 0.13} ${height * 0.138} L ${width * 0.27} ${height * 0.785} L ${-width * 0.094} ${height * 0.904} Z`} fill="url(#card-stack-vertical-glass-left)" stroke="url(#card-stack-vertical-glass-edge)" strokeWidth={width * 0.0016} />
          <path d={`M ${width * 0.871} ${height * 0.156} L ${width * 1.078} ${height * 0.228} L ${width * 1.087} ${height * 0.858} L ${width * 0.789} ${height * 0.759} Z`} fill="url(#card-stack-vertical-glass-right)" stroke="url(#card-stack-vertical-glass-edge)" strokeWidth={width * 0.0016} />
          <path d={`M ${width * 0.065} ${height * 0.181} L ${width * 0.111} ${height * 0.163} L ${width * 0.227} ${height * 0.791}`} fill="none" stroke="#D9F5F3" strokeOpacity="0.12" strokeWidth={width * 0.001} />
          <path d={`M ${width * 0.932} ${height * 0.2} L ${width * 0.892} ${height * 0.19} L ${width * 0.806} ${height * 0.75}`} fill="none" stroke="#C5EEF0" strokeOpacity="0.1" strokeWidth={width * 0.001} />
        </g>
      </svg>

      {DUST.map((particle, index) => {
        const phase = frame / particle.period + particle.phase;
        const depth = particle.depth;
        const x = particle.x * width + Math.sin(phase) * width * 0.0058 * depth;
        const y = particle.y * height + Math.cos(phase * 0.78) * height * 0.0074 * depth;
        const size = particle.size * dustSizeScale;
        const opacity = particle.opacity * (0.76 + 0.24 * Math.sin(phase + 1.2));
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: index % 4 === 0 ? "#BDEDEA" : "#B5C9CF",
              opacity,
              boxShadow: index % 7 === 0 ? "0 0 5px rgba(114,222,219,0.18)" : undefined,
            }}
          />
        );
      })}

    </AbsoluteFill>
  );
};
