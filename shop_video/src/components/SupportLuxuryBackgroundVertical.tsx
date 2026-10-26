import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

type SupportLuxuryBackgroundVerticalProps = {
  responsePulse?: number;
};

type Particle = {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
  opacity: number;
};

const WIDTH = 1080;
const HEIGHT = 1920;

const hash = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const PARTICLES: Particle[] = Array.from({ length: 24 }, (_, index) => ({
  x: 18 + hash(index * 4.17 + 1) * (WIDTH - 36),
  y: 18 + hash(index * 8.31 + 7) * (HEIGHT - 36),
  size: 1.2 + hash(index * 2.73 + 9) * 2.1,
  phase: hash(index * 5.91 + 11) * Math.PI * 2,
  speed: 0.06 + hash(index * 7.13 + 15) * 0.12,
  opacity: 0.13 + hash(index * 6.37 + 20) * 0.22,
}));

/** Portrait version of the original support stage; animation remains frame deterministic. */
export const SupportLuxuryBackgroundVertical: React.FC<SupportLuxuryBackgroundVerticalProps> = ({
  responsePulse = 0,
}) => {
  const frame = useCurrentFrame();
  const glowStrength = 0.2 + responsePulse * 0.12;
  const hazeStrength = 0.14 + responsePulse * 0.045;
  const lightDrift = Math.sin(frame / 74) * 18;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#03080D" }}>
      <AbsoluteFill
        style={{
          background:
            `radial-gradient(ellipse 76% 46% at calc(52% + ${lightDrift.toFixed(2)}px) 56%, rgba(23,103,111,${glowStrength.toFixed(3)}) 0%, rgba(9,47,58,0.18) 42%, transparent 78%), ` +
            "radial-gradient(ellipse 64% 27% at 16% 26%, rgba(37,69,76,0.12) 0%, transparent 76%), " +
            "linear-gradient(180deg, #03080D 0%, #081116 48%, #03080D 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "4%",
          top: "10%",
          width: 850,
          height: 1150,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(83,178,181,${hazeStrength.toFixed(3)}) 0%, rgba(34,98,108,0.065) 38%, transparent 72%)`,
          filter: "blur(74px)",
          transform: `translateX(${(lightDrift * 0.72).toFixed(2)}px) rotate(-16deg)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "57%",
          top: "20%",
          width: 240,
          height: 960,
          background: "linear-gradient(180deg, rgba(139,220,218,0.075), rgba(74,154,163,0.025) 54%, transparent 100%)",
          filter: "blur(66px)",
          transform: `rotate(-23deg) translateY(${(Math.sin(frame / 88) * 12).toFixed(2)}px)`,
          opacity: 0.82 + responsePulse * 0.12,
          pointerEvents: "none",
        }}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.72 }}
        aria-hidden
      >
        <defs>
          <linearGradient id="support-portrait-glass-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#D9F7F5" stopOpacity="0.08" />
            <stop offset="0.48" stopColor="#3D8C91" stopOpacity="0.018" />
            <stop offset="1" stopColor="#03080D" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="support-portrait-glass-rim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#C5F3EF" stopOpacity="0.25" />
            <stop offset="0.54" stopColor="#77C9C7" stopOpacity="0.07" />
            <stop offset="1" stopColor="#77C9C7" stopOpacity="0.015" />
          </linearGradient>
          <filter id="support-portrait-glass-soften" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
        </defs>
        <path
          d="M-180 354 L360 116 L520 1164 L-98 1420 Z"
          fill="url(#support-portrait-glass-a)"
          stroke="url(#support-portrait-glass-rim)"
          strokeWidth="1.2"
          filter="url(#support-portrait-glass-soften)"
        />
        <path d="M-84 430 L296 258 L420 1068" fill="none" stroke="#D5F5F2" strokeOpacity="0.07" strokeWidth="1" />
        <path
          d="M790 -120 L1192 12 L1028 880 L656 774 Z"
          fill="url(#support-portrait-glass-a)"
          stroke="url(#support-portrait-glass-rim)"
          strokeWidth="1.1"
          opacity="0.6"
        />
        <path d="M768 -44 L1118 84 L986 738" fill="none" stroke="#BDEBE8" strokeOpacity="0.055" strokeWidth="1" />
        <path d="M128 1710 C362 1668 720 1676 1040 1732" fill="none" stroke="#76C9C8" strokeOpacity="0.055" strokeWidth="2" />
      </svg>

      <div
        style={{
          position: "absolute",
          left: "10%",
          right: "-12%",
          bottom: "-6%",
          height: "22%",
          background: `radial-gradient(ellipse 55% 48% at 56% 20%, rgba(57,213,199,${(0.095 + responsePulse * 0.045).toFixed(3)}) 0%, rgba(24,93,102,0.045) 44%, transparent 80%)`,
          filter: "blur(25px)",
          transform: "perspective(800px) rotateX(57deg)",
          transformOrigin: "50% 0%",
          pointerEvents: "none",
        }}
      />

      {PARTICLES.map((particle, index) => {
        const x = particle.x + Math.sin(frame * particle.speed + particle.phase) * 9;
        const y = ((particle.y + frame * particle.speed * 0.32) % (HEIGHT + 40)) - 20;
        const twinkle = 0.58 + 0.42 * Math.sin(frame / (20 + index) + particle.phase);
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
              background: "#A7E7E3",
              opacity: particle.opacity * twinkle,
              boxShadow: particle.size > 2.6 ? "0 0 7px rgba(114,222,219,0.16)" : undefined,
              pointerEvents: "none",
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 86% 88% at 50% 48%, transparent 52%, rgba(0,4,8,0.42) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
