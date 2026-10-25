import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

type SupportLuxuryBackgroundProps = {
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

const hash = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const PARTICLES: Particle[] = Array.from({ length: 24 }, (_, index) => ({
  x: 24 + hash(index * 4.17 + 1) * 1872,
  y: 22 + hash(index * 8.31 + 7) * 1036,
  size: 1.2 + hash(index * 2.73 + 9) * 2.1,
  phase: hash(index * 5.91 + 11) * Math.PI * 2,
  speed: 0.06 + hash(index * 7.13 + 15) * 0.12,
  opacity: 0.13 + hash(index * 6.37 + 20) * 0.22,
}));

/** Deterministic cinematic studio layers for the support window and the hero copy. */
export const SupportLuxuryBackground: React.FC<SupportLuxuryBackgroundProps> = ({ responsePulse = 0 }) => {
  const frame = useCurrentFrame();
  const glowStrength = 0.2 + responsePulse * 0.12;
  const hazeStrength = 0.14 + responsePulse * 0.045;
  const lightDrift = Math.sin(frame / 74) * 18;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#03080D" }}>
      {/* Deep graphite field with a broad, directional cold key behind the glass panel. */}
      <AbsoluteFill
        style={{
          background:
            `radial-gradient(ellipse 46% 62% at calc(72% + ${lightDrift.toFixed(2)}px) 47%, rgba(23,103,111,${glowStrength.toFixed(3)}) 0%, rgba(9,47,58,0.18) 42%, transparent 78%), ` +
            "radial-gradient(ellipse 42% 44% at 17% 42%, rgba(37,69,76,0.12) 0%, transparent 76%), " +
            "linear-gradient(116deg, #03080D 0%, #081116 48%, #03080D 100%)",
        }}
      />

      {/* Subtle atmospheric volumes, all drifting from the same upper-left key light. */}
      <div
        style={{
          position: "absolute",
          left: "44%",
          top: "-29%",
          width: 900,
          height: 1130,
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
          left: "58%",
          top: "-18%",
          width: 250,
          height: 930,
          background: "linear-gradient(180deg, rgba(139,220,218,0.075), rgba(74,154,163,0.025) 54%, transparent 100%)",
          filter: "blur(66px)",
          transform: `rotate(-23deg) translateY(${(Math.sin(frame / 88) * 12).toFixed(2)}px)`,
          opacity: 0.82 + responsePulse * 0.12,
          pointerEvents: "none",
        }}
      />

      {/* Large, cropped glass architecture planes; their faint rims suggest depth, not UI cards. */}
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.72 }}
        aria-hidden
      >
        <defs>
          <linearGradient id="support-glass-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#D9F7F5" stopOpacity="0.08" />
            <stop offset="0.48" stopColor="#3D8C91" stopOpacity="0.018" />
            <stop offset="1" stopColor="#03080D" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="support-glass-rim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#C5F3EF" stopOpacity="0.25" />
            <stop offset="0.54" stopColor="#77C9C7" stopOpacity="0.07" />
            <stop offset="1" stopColor="#77C9C7" stopOpacity="0.015" />
          </linearGradient>
          <filter id="support-glass-soften" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
        </defs>
        <path
          d="M-200 232 L438 82 L628 854 L-112 1004 Z"
          fill="url(#support-glass-a)"
          stroke="url(#support-glass-rim)"
          strokeWidth="1.2"
          filter="url(#support-glass-soften)"
        />
        <path d="M-110 292 L348 180 L488 746" fill="none" stroke="#D5F5F2" strokeOpacity="0.07" strokeWidth="1" />
        <path
          d="M1510 -166 L2036 -42 L1888 555 L1390 422 Z"
          fill="url(#support-glass-a)"
          stroke="url(#support-glass-rim)"
          strokeWidth="1.1"
          opacity="0.6"
        />
        <path d="M1484 -88 L1938 22 L1826 456" fill="none" stroke="#BDEBE8" strokeOpacity="0.055" strokeWidth="1" />
        <path d="M1020 940 C1260 890 1560 894 1880 962" fill="none" stroke="#76C9C8" strokeOpacity="0.055" strokeWidth="2" />
      </svg>

      {/* A soft floor reflection anchors the floating window without adding a second light source. */}
      <div
        style={{
          position: "absolute",
          left: "42%",
          right: "-8%",
          bottom: "-9%",
          height: "28%",
          background: `radial-gradient(ellipse 52% 48% at 57% 24%, rgba(57,213,199,${(0.095 + responsePulse * 0.045).toFixed(3)}) 0%, rgba(24,93,102,0.045) 44%, transparent 80%)`,
          filter: "blur(25px)",
          transform: "perspective(800px) rotateX(57deg)",
          transformOrigin: "50% 0%",
          pointerEvents: "none",
        }}
      />

      {/* Sparse deterministic dust stays in the far plane and never competes with the copy. */}
      {PARTICLES.map((particle, index) => {
        const x = particle.x + Math.sin(frame * particle.speed + particle.phase) * 9;
        const y = ((particle.y + frame * particle.speed * 0.32) % 1120) - 20;
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
