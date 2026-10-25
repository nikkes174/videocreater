import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const hash = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const DEPTH_PARTICLES = Array.from({ length: 36 }, (_, index) => ({
  x: hash(index * 3 + 1) * 1920,
  y: 110 + hash(index * 3 + 2) * 690,
  size: 0.8 + hash(index * 3 + 3) * 1.15,
  depth: 0.2 + hash(index * 3 + 4) * 0.8,
  opacity: 0.055 + hash(index * 3 + 5) * 0.085,
  phase: hash(index * 3 + 6) * Math.PI * 2,
  period: 74 + hash(index * 3 + 7) * 100,
}));

export const CardStackLuxuryBackground: React.FC<{ fanProgress: number }> = ({ fanProgress }) => {
  const frame = useCurrentFrame();
  const fan = Math.max(0, Math.min(1, fanProgress));
  const lightGain = 0.72 + fan * 0.28;
  const driftX = Math.sin(frame / 96) * 20;
  const driftY = Math.cos(frame / 118) * 12;
  const hazePulse = 0.84 + Math.sin(frame / 51) * 0.08;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#03080D", pointerEvents: "none" }}>
      {/* Deep graphite space: broad falloff, with the darkest values held at the edges. */}
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

      {/* Perspective ground catches a soft spill beneath the moving card reflections. */}
      <div
        style={{
          position: "absolute",
          left: "-12%",
          top: 700,
          width: "124%",
          height: 470,
          transform: `perspective(1100px) rotateX(64deg) translate3d(0, ${(-driftY * 0.3).toFixed(2)}px, 0)`,
          transformOrigin: "50% 0%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse 58% 42% at 50% 20%, rgba(57,213,199,0.18) 0%, rgba(38,112,123,0.1) 38%, rgba(7,17,24,0.03) 68%, transparent 100%)",
          filter: "blur(24px)",
          opacity: 0.5 + fan * 0.22,
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.48) 48%, transparent 100%)",
        }}
      />

      {/* Sweeping, blurred SVG strokes act as broad volumetric sources rather than hard beams. */}
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: lightGain }}
      >
        <defs>
          <linearGradient id="card-stack-key-light" x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0" stopColor="#EAF6F5" stopOpacity="0" />
            <stop offset="0.38" stopColor="#B6F3F0" stopOpacity="0.21" />
            <stop offset="0.72" stopColor="#39D5C7" stopOpacity="0.12" />
            <stop offset="1" stopColor="#39D5C7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="card-stack-rim-light" x1="1" y1="0" x2="0.25" y2="1">
            <stop offset="0" stopColor="#9AD8E9" stopOpacity="0" />
            <stop offset="0.42" stopColor="#9AD8E9" stopOpacity="0.16" />
            <stop offset="0.78" stopColor="#72DEDB" stopOpacity="0.08" />
            <stop offset="1" stopColor="#72DEDB" stopOpacity="0" />
          </linearGradient>
          <filter id="card-stack-volumetric-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="62" />
          </filter>
        </defs>
        <path
          d={`M -130 -80 C 150 38, 355 185, 525 340 C 700 500, 890 558, 1085 670`}
          fill="none"
          stroke="url(#card-stack-key-light)"
          strokeWidth="350"
          strokeLinecap="round"
          filter="url(#card-stack-volumetric-blur)"
          opacity={0.58 + fan * 0.24}
          transform={`translate(${driftX.toFixed(2)} ${driftY.toFixed(2)})`}
        />
        <path
          d="M 2080 40 C 1840 176, 1690 348, 1510 480 C 1375 579, 1230 615, 1050 690"
          fill="none"
          stroke="url(#card-stack-rim-light)"
          strokeWidth="310"
          strokeLinecap="round"
          filter="url(#card-stack-volumetric-blur)"
          opacity={0.72}
          transform={`translate(${(-driftX * 0.6).toFixed(2)} ${(driftY * 0.65).toFixed(2)})`}
        />
      </svg>

      {/* Restrained haze layers drift independently and remain behind the copy and cards. */}
      <div
        style={{
          position: "absolute",
          left: -130,
          top: 170 + driftY,
          width: 850,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(92,176,184,0.13) 0%, rgba(54,129,139,0.055) 40%, transparent 74%)",
          filter: "blur(58px)",
          opacity: hazePulse,
          transform: `translateX(${driftX.toFixed(2)}px) rotate(-10deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -160,
          top: 250 - driftY,
          width: 780,
          height: 470,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(82,153,179,0.12) 0%, rgba(42,89,111,0.05) 43%, transparent 75%)",
          filter: "blur(64px)",
          opacity: 0.82 + Math.sin(frame / 63 + 1.4) * 0.07,
          transform: `translateX(${(-driftX * 0.65).toFixed(2)}px) rotate(12deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "24%",
          top: 520 + driftY * 0.4,
          width: "58%",
          height: 350,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(44,132,139,0.1), rgba(26,82,92,0.035) 46%, transparent 76%)",
          filter: "blur(52px)",
          opacity: 0.72 + fan * 0.16,
        }}
      />

      {/* Distant glass architecture: broad refractive planes, not UI panels or cards. */}
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.82,
          transform: `translate3d(${(driftX * 0.42).toFixed(2)}px, ${(driftY * 0.32).toFixed(2)}px, 0)`,
        }}
      >
        <defs>
          <linearGradient id="card-stack-glass-left" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#EAF6F5" stopOpacity="0.09" />
            <stop offset="0.36" stopColor="#72DEDB" stopOpacity="0.035" />
            <stop offset="1" stopColor="#0D1C25" stopOpacity="0.008" />
          </linearGradient>
          <linearGradient id="card-stack-glass-right" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A9DDE8" stopOpacity="0.075" />
            <stop offset="0.45" stopColor="#72DEDB" stopOpacity="0.022" />
            <stop offset="1" stopColor="#071119" stopOpacity="0.004" />
          </linearGradient>
          <linearGradient id="card-stack-glass-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#EAF6F5" stopOpacity="0" />
            <stop offset="0.45" stopColor="#B6F3F0" stopOpacity="0.28" />
            <stop offset="1" stopColor="#72DEDB" stopOpacity="0" />
          </linearGradient>
          <filter id="card-stack-glass-softness" x="-25%" y="-20%" width="150%" height="145%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
        </defs>
        <g filter="url(#card-stack-glass-softness)">
          <path d="M -170 248 L 252 148 L 520 847 L -180 976 Z" fill="url(#card-stack-glass-left)" stroke="url(#card-stack-glass-edge)" strokeWidth="3" />
          <path d="M 1672 168 L 2070 246 L 2108 927 L 1515 820 Z" fill="url(#card-stack-glass-right)" stroke="url(#card-stack-glass-edge)" strokeWidth="3" />
          <path d="M 125 196 L 213 176 L 435 854" fill="none" stroke="#D9F5F3" strokeOpacity="0.12" strokeWidth="2" />
          <path d="M 1790 216 L 1712 205 L 1548 810" fill="none" stroke="#C5EEF0" strokeOpacity="0.1" strokeWidth="2" />
        </g>
      </svg>

      {/* A sparse deterministic dust layer adds depth without a star-field look. */}
      {DEPTH_PARTICLES.map((particle, index) => {
        const phase = frame / particle.period + particle.phase;
        const x = particle.x + Math.sin(phase) * 11 * particle.depth;
        const y = particle.y + Math.cos(phase * 0.78) * 8 * particle.depth;
        const opacity = particle.opacity * (0.76 + 0.24 * Math.sin(phase + 1.2));
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: particle.size,
              height: particle.size,
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
