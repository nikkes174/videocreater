import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CSSProperties } from "react";

type Particle = {
  x: number;
  y: number;
  radius: number;
  blur: number;
  opacity: number;
  phase: number;
  speed: number;
  drift: number;
  color: string;
};

const randomAt = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
};

const PARTICLES: Particle[] = Array.from({ length: 44 }, (_, index) => {
  const band = index % 4;
  const r1 = randomAt(index + 1);
  const r2 = randomAt(index + 101);
  const r3 = randomAt(index + 201);
  const r4 = randomAt(index + 301);

  let x: number;
  let y: number;
  if (band === 0) {
    x = 2 + r1 * 22;
    y = 12 + r2 * 72;
  } else if (band === 1) {
    x = 76 + r1 * 22;
    y = 10 + r2 * 74;
  } else if (band === 2) {
    x = 27 + r1 * 46;
    y = 9 + r2 * 24;
  } else {
    x = 27 + r1 * 46;
    y = 69 + r2 * 21;
  }

  return {
    x,
    y,
    radius: 1.1 + r3 * 2.2,
    blur: r4 > 0.7 ? 1.5 + r4 * 2.5 : r4 * 1.2,
    opacity: 0.12 + randomAt(index + 401) * 0.22,
    phase: randomAt(index + 501) * Math.PI * 2,
    speed: 0.45 + randomAt(index + 601) * 0.6,
    drift: 4 + randomAt(index + 701) * 13,
    color: index % 5 === 0 ? "#e3f8f7" : "#72dedb",
  };
});

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const LegacyCinematicBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const darkIntroEnd = Math.round(0.4 * fps);
  const glowStart = Math.round(0.4 * fps);
  const glowEnd = Math.round(1.2 * fps);
  const detailEnd = Math.round(2.4 * fps);
  const lightRise = interpolate(
    frame,
    [0, darkIntroEnd, glowEnd, detailEnd, durationInFrames - 1],
    [0.012, 0.025, 0.62, 0.79, 0.94],
    { ...clamp, easing: Easing.inOut(Easing.sin) },
  );
  const atmosphereOpacity = interpolate(
    frame,
    [0, darkIntroEnd, glowEnd, detailEnd, durationInFrames - 1],
    [0, 0.012, 0.42, 0.62, 0.7],
    { ...clamp, easing: Easing.inOut(Easing.sin) },
  );
  const floorOpacity = interpolate(
    frame,
    [0, darkIntroEnd, glowEnd, detailEnd, durationInFrames - 1],
    [0, 0, 0.34, 0.58, 0.67],
    { ...clamp, easing: Easing.inOut(Easing.sin) },
  );
  const progress = frame / Math.max(1, durationInFrames - 1);
  const leftDrift = Math.sin(progress * Math.PI * 0.7) * 20;
  const rightDrift = Math.sin(progress * Math.PI * 0.8 + 0.7) * 24;

  const fullFrame: CSSProperties = {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#03080D",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          ...fullFrame,
          background:
            "radial-gradient(ellipse 78% 55% at 51% 47%, rgba(12, 26, 30, 0.48) 0%, rgba(7, 14, 18, 0.2) 48%, rgba(3, 8, 13, 0) 78%), radial-gradient(ellipse 96% 68% at 50% 45%, rgba(12, 19, 24, 0) 38%, rgba(0, 2, 5, 0.68) 100%), linear-gradient(156deg, #0a1015 0%, #03080d 42%, #080d12 68%, #020609 100%)",
        }}
      />

      <div
        style={{
          ...fullFrame,
          opacity: lightRise,
          background: `radial-gradient(ellipse 42% 25% at ${43 + leftDrift * 0.025}% 48%, rgba(30, 185, 184, 0.17) 0%, rgba(15, 120, 128, 0.08) 38%, rgba(4, 20, 26, 0) 76%), radial-gradient(ellipse 33% 29% at ${63 + rightDrift * 0.025}% 46%, rgba(34, 185, 184, 0.13) 0%, rgba(12, 81, 91, 0.07) 44%, rgba(3, 8, 13, 0) 78%)`,
          filter: "blur(24px)",
        }}
      />

      <div
        style={{
          ...fullFrame,
          opacity: atmosphereOpacity,
          background:
            "radial-gradient(ellipse 52% 18% at 20% 33%, rgba(71, 139, 146, 0.11) 0%, rgba(49, 92, 101, 0.045) 43%, transparent 78%), radial-gradient(ellipse 45% 19% at 82% 57%, rgba(54, 137, 142, 0.09) 0%, rgba(40, 89, 98, 0.035) 46%, transparent 80%), radial-gradient(ellipse 48% 12% at 43% 69%, rgba(54, 117, 125, 0.055) 0%, transparent 78%)",
          filter: "blur(38px)",
          transform: `translate(${Math.sin(progress * Math.PI * 0.9) * 13}px, ${Math.cos(progress * Math.PI * 0.6) * 8}px)`,
        }}
      />

      <div style={{ ...fullFrame, opacity: lightRise * 0.82 }}>
        <div
          style={{
            position: "absolute",
            left: `${10 + leftDrift * 0.1}%`,
            top: "16%",
            width: width * 0.58,
            height: height * 0.31,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(65, 194, 194, 0.1) 0%, rgba(28, 91, 100, 0.04) 40%, transparent 74%)",
            filter: "blur(62px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: `${-5 + rightDrift * 0.08}%`,
            top: "31%",
            width: width * 0.53,
            height: height * 0.27,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(44, 172, 178, 0.1) 0%, rgba(16, 81, 91, 0.04) 42%, transparent 75%)",
            filter: "blur(68px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "38%",
            top: "43%",
            width: "25%",
            height: "17%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(53, 167, 170, 0.07) 0%, rgba(20, 75, 82, 0.035) 43%, transparent 78%)",
            filter: "blur(54px)",
          }}
        />
      </div>

      <div
        style={{
          ...fullFrame,
          opacity: interpolate(frame, [glowStart, glowEnd], [0.02, 1], {
            ...clamp,
            easing: Easing.inOut(Easing.sin),
          }),
        }}
      >
        {PARTICLES.map((particle, index) => {
          const angle = progress * Math.PI * 2 * particle.speed + particle.phase;
          const x = particle.x + (Math.sin(angle) * particle.drift) / width * 100;
          const y = particle.y + (Math.cos(angle * 0.72) * particle.drift * 0.42) / height * 100;
          const breathe = 0.82 + 0.18 * Math.sin(angle * 0.8);
          const opacity = particle.opacity * breathe * lightRise;

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: particle.radius * 2,
                height: particle.radius * 2,
                borderRadius: "50%",
                backgroundColor: particle.color,
                opacity,
                filter: `blur(${particle.blur}px)`,
                boxShadow: `0 0 ${particle.radius * 5}px ${particle.color}`,
              }}
            />
          );
        })}
      </div>

      <div style={{ ...fullFrame, opacity: floorOpacity }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "73%",
            bottom: 0,
            background:
              "linear-gradient(180deg, rgba(7, 17, 21, 0) 0%, rgba(5, 13, 17, 0.36) 18%, rgba(2, 6, 10, 0.92) 100%), linear-gradient(90deg, rgba(2, 5, 8, 0.62), rgba(11, 28, 33, 0.16) 48%, rgba(2, 5, 8, 0.64))",
            borderTop: "1px solid rgba(87, 170, 171, 0.055)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "16%",
            top: "73.5%",
            width: "68%",
            height: "15%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(51, 195, 193, 0.14) 0%, rgba(26, 118, 127, 0.075) 32%, rgba(8, 35, 43, 0.025) 58%, transparent 78%)",
            filter: "blur(31px)",
            transform: `translateX(${Math.sin(progress * Math.PI * 0.65) * 16}px) scaleY(0.62)`,
          }}
        />
        {[0, 1, 2].map((index) => {
          const lineOpacity = [0.34, 0.22, 0.12][index];
          const lineY = 77 + index * 4.4;
          const lineWidth = 35 + index * 15;
          const lineShift = Math.sin(progress * Math.PI * 0.75 + index * 0.9) * (12 + index * 6);

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${(100 - lineWidth) / 2 + lineShift * 0.08}%`,
                top: `${lineY}%`,
                width: `${lineWidth}%`,
                height: index === 0 ? 2 : 1,
                background: `linear-gradient(90deg, transparent, rgba(83, 204, 199, ${lineOpacity}) 50%, transparent)`,
                filter: `blur(${index + 1}px)`,
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            left: "25%",
            top: "81%",
            width: "50%",
            height: "13%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(54, 171, 173, 0.09), rgba(11, 46, 55, 0.035) 45%, transparent 77%)",
            filter: "blur(37px)",
            transform: `translateX(${Math.sin(progress * Math.PI * 0.5 + 0.5) * 18}px) scaleY(0.42)`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
