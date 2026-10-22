import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CSSProperties } from "react";
import { VolumetricLights } from "./VolumetricLights";

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

type Bokeh = {
  x: number;
  y: number;
  diameter: number;
  blur: number;
  opacity: number;
  phase: number;
  speed: number;
  drift: number;
};

const randomAt = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
};

const PARTICLES: Particle[] = Array.from({ length: 40 }, (_, index) => {
  const band = index % 4;
  const r1 = randomAt(index + 1);
  const r2 = randomAt(index + 101);
  const r3 = randomAt(index + 201);
  const r4 = randomAt(index + 301);

  // Keep all points outside the wordmark's central silhouette.
  let x: number;
  let y: number;
  if (band === 0) {
    x = 3 + r1 * 21;
    y = r2 > 0.5 ? 10 + r2 * 28 : 62 + r2 * 28;
  } else if (band === 1) {
    x = 76 + r1 * 21;
    y = r2 > 0.5 ? 9 + r2 * 28 : 62 + r2 * 28;
  } else if (band === 2) {
    x = 25 + r1 * 50;
    y = 8 + r2 * 25;
  } else {
    x = 25 + r1 * 50;
    y = 70 + r2 * 18;
  }

  return {
    x,
    y,
    radius: 1.8 + r3 * 3.7,
    blur: r4 > 0.56 ? 0.7 + r4 * 2.4 : r4 * 0.45,
    opacity: 0.25 + randomAt(index + 401) * 0.4,
    phase: randomAt(index + 501) * Math.PI * 2,
    speed: 0.32 + randomAt(index + 601) * 0.48,
    drift: 5 + randomAt(index + 701) * 13,
    color: index % 6 === 0 ? "#c8eff0" : index % 4 === 0 ? "#8ce0df" : "#5fc9d0",
  };
});

const BOKEH: Bokeh[] = Array.from({ length: 6 }, (_, index) => {
  const r1 = randomAt(index + 801);
  const r2 = randomAt(index + 901);
  const r3 = randomAt(index + 1001);
  const r4 = randomAt(index + 1101);
  const zones = [
    { x: 10 + r1 * 14, y: 17 + r2 * 18 },
    { x: 75 + r1 * 12, y: 15 + r2 * 19 },
    { x: 8 + r1 * 13, y: 66 + r2 * 17 },
    { x: 79 + r1 * 12, y: 65 + r2 * 18 },
    { x: 32 + r1 * 24, y: 9 + r2 * 12 },
    { x: 40 + r1 * 21, y: 77 + r2 * 10 },
  ];

  return {
    ...zones[index],
    diameter: 12 + r3 * 20,
    blur: 4 + r4 * 8,
    opacity: 0.12 + randomAt(index + 1201) * 0.13,
    phase: randomAt(index + 1301) * Math.PI * 2,
    speed: 0.18 + randomAt(index + 1401) * 0.24,
    drift: 6 + randomAt(index + 1501) * 12,
  };
});

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const AtmosphereTexture: React.FC<{ opacity: number; drift: number }> = ({ opacity, drift }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 1080 1920"
    preserveAspectRatio="none"
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      opacity,
      mixBlendMode: "screen",
      transform: `translate(${drift}px, ${drift * -0.32}px)`,
      pointerEvents: "none",
    }}
  >
    <defs>
      <filter id="cinematic-haze-noise" x="-12%" y="-12%" width="124%" height="124%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.004 0.012"
          numOctaves="2"
          seed="17"
          stitchTiles="stitch"
          result="noise"
        />
        <feColorMatrix
          in="noise"
          type="matrix"
          values="0.12 0.12 0.12 0 0.00
                  0.31 0.31 0.31 0 0.06
                  0.34 0.34 0.34 0 0.08
                  0.26 0.26 0.26 0 0"
          result="tealNoise"
        />
        <feGaussianBlur in="tealNoise" stdDeviation="24" />
      </filter>
      <radialGradient id="cinematic-haze-mask">
        <stop offset="0%" stopColor="white" stopOpacity="0.9" />
        <stop offset="38%" stopColor="white" stopOpacity="0.65" />
        <stop offset="76%" stopColor="white" stopOpacity="0.14" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
      <mask id="cinematic-haze-zones">
        <rect width="1080" height="1920" fill="url(#cinematic-haze-mask)" />
      </mask>
    </defs>
    <rect
      width="1080"
      height="1920"
      fill="#62bfc1"
      filter="url(#cinematic-haze-noise)"
      mask="url(#cinematic-haze-zones)"
    />
  </svg>
);

export const CinematicBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const endFrame = Math.max(1, durationInFrames - 1);
  const progress = frame / endFrame;
  const lightRise = interpolate(
    frame,
    [0, Math.round(0.4 * fps), Math.round(1.2 * fps), Math.round(2.4 * fps), endFrame],
    [0.012, 0.025, 0.84, 1, 1.08],
    { ...clamp, easing: Easing.inOut(Easing.sin) },
  );
  const detailRise = interpolate(
    frame,
    [0, Math.round(1.2 * fps), Math.round(1.8 * fps), Math.round(2.4 * fps), endFrame],
    [0.01, 0.2, 0.76, 1, 1.08],
    { ...clamp, easing: Easing.inOut(Easing.sin) },
  );
  const floorRise = interpolate(
    frame,
    [0, Math.round(0.4 * fps), Math.round(1.2 * fps), Math.round(2.1 * fps), endFrame],
    [0, 0, 0.58, 0.88, 1],
    { ...clamp, easing: Easing.inOut(Easing.sin) },
  );
  const mainDrift = Math.sin(progress * Math.PI * 0.72) * 2.4;
  const rightDrift = Math.sin(progress * Math.PI * 0.86 + 0.35) * 25;
  const hazeDrift = Math.sin(progress * Math.PI * 0.82) * 13;
  const fullFrame: CSSProperties = {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
  };

  return (
    <AbsoluteFill
      style={{ backgroundColor: "#03080D", overflow: "hidden", pointerEvents: "none" }}
    >
      <div
        style={{
          ...fullFrame,
          background:
            "radial-gradient(ellipse 76% 52% at 50% 46%, rgba(9, 20, 25, 0.36) 0%, rgba(5, 13, 18, 0.22) 50%, rgba(3, 8, 13, 0) 78%), radial-gradient(ellipse 92% 72% at 50% 44%, rgba(3, 8, 13, 0) 30%, rgba(0, 2, 6, 0.72) 100%), linear-gradient(157deg, #080f15 0%, #03080d 42%, #060d12 70%, #020509 100%)",
        }}
      />

      <div
        style={{
          ...fullFrame,
          opacity: lightRise,
          background: `radial-gradient(ellipse 55% 32% at ${50 + mainDrift}% 47%, rgba(17, 155, 163, 0.38) 0%, rgba(11, 80, 94, 0.22) 38%, rgba(3, 8, 13, 0) 78%)`,
          filter: "blur(10px)",
        }}
      />
      <div
        style={{
          ...fullFrame,
          opacity: lightRise * 0.9,
          background: `radial-gradient(ellipse 30% 27% at ${66 + rightDrift * 0.025}% 47%, rgba(40, 180, 185, 0.25) 0%, rgba(17, 100, 112, 0.16) 39%, rgba(3, 8, 13, 0) 79%)`,
          filter: "blur(22px)",
        }}
      />

      <VolumetricLights />
      <AtmosphereTexture opacity={0.7 * lightRise} drift={hazeDrift} />

      <div style={{ ...fullFrame, opacity: detailRise }}>
        {PARTICLES.map((particle, index) => {
          const angle = progress * Math.PI * 2 * particle.speed + particle.phase;
          const x = particle.x + (Math.sin(angle) * particle.drift) / width * 100;
          const y = particle.y + (Math.cos(angle * 0.72) * particle.drift * 0.42) / height * 100;
          const breathe = 0.76 + 0.24 * Math.sin(angle * 0.8);

          return (
            <div
              key={`particle-${index}`}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: particle.radius * 2,
                height: particle.radius * 2,
                borderRadius: "50%",
                backgroundColor: particle.color,
                opacity: particle.opacity * breathe,
                filter: `blur(${particle.blur}px)`,
                boxShadow: `0 0 ${particle.radius * 3}px ${particle.color}`,
              }}
            />
          );
        })}
        {BOKEH.map((light, index) => {
          const angle = progress * Math.PI * 2 * light.speed + light.phase;
          const x = light.x + (Math.sin(angle) * light.drift) / width * 100;
          const y = light.y + (Math.cos(angle * 0.72) * light.drift * 0.4) / height * 100;
          const pulse = 0.78 + 0.22 * Math.sin(angle * 0.65);

          return (
            <div
              key={`bokeh-${index}`}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: light.diameter,
                height: light.diameter,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(183, 224, 225, 0.42) 0%, rgba(90, 177, 183, 0.2) 34%, rgba(42, 117, 128, 0.04) 66%, transparent 82%)",
                opacity: light.opacity * pulse,
                filter: `blur(${light.blur}px) saturate(0.58)`,
                transform: `translate(-50%, -50%) scale(${0.94 + pulse * 0.08})`,
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          ...fullFrame,
          opacity: floorRise,
          background:
            "radial-gradient(ellipse 55% 18% at 50% 71%, rgba(39, 201, 204, 0.24) 0%, rgba(13, 85, 103, 0.10) 45%, rgba(3, 8, 13, 0) 80%), linear-gradient(180deg, rgba(3, 8, 13, 0) 63%, rgba(4, 12, 17, 0.42) 70%, rgba(2, 5, 9, 0.94) 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "16%",
            top: "65.5%",
            width: "68%",
            height: "19%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(66, 214, 211, 0.22) 0%, rgba(29, 139, 150, 0.12) 36%, rgba(9, 40, 51, 0.02) 69%, transparent 84%)",
            filter: "blur(34px)",
            transform: `translateX(${Math.sin(progress * Math.PI * 0.64) * 22}px) scaleY(0.5)`,
          }}
        />
        {[0, 1, 2].map((index) => {
          const phase = progress * Math.PI * (0.9 + index * 0.12) + index * 1.1;
          const widthPercent = 42 + index * 12;
          const x = (100 - widthPercent) / 2 + Math.sin(phase) * (1.4 + index * 0.5);
          const y = 68.5 + index * 4.2 + Math.cos(phase * 0.7) * 0.6;

          return (
            <div
              key={`reflection-${index}`}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: `${widthPercent}%`,
                height: 42 + index * 17,
                borderRadius: "50%",
                background: `radial-gradient(ellipse 78% 38% at 50% 50%, rgba(74, 207, 205, ${0.16 - index * 0.035}) 0%, rgba(35, 132, 145, ${0.085 - index * 0.018}) 45%, rgba(9, 39, 49, 0.015) 72%, transparent 88%)`,
                filter: `blur(${10 + index * 4}px)`,
                transform: `scaleY(${0.52 - index * 0.08})`,
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "68%",
            height: 2,
            background:
              "linear-gradient(90deg, transparent 3%, rgba(66, 179, 184, 0.02) 22%, rgba(114, 223, 220, 0.16) 50%, rgba(66, 179, 184, 0.02) 78%, transparent 97%)",
            filter: "blur(2px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "20%",
            top: "69%",
            width: "60%",
            height: "12%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(64, 190, 190, 0.13), rgba(15, 61, 72, 0.045) 48%, transparent 78%)",
            filter: "blur(42px)",
            transform: `translateX(${Math.sin(progress * Math.PI * 0.55 + 0.4) * 27}px) scaleY(0.48)`,
          }}
        />
      </div>

      <div
        style={{
          ...fullFrame,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 46%, rgba(0, 0, 0, 0) 34%, rgba(0, 3, 8, 0.2) 73%, rgba(0, 2, 5, 0.54) 100%)",
          opacity: 0.84,
        }}
      />
    </AbsoluteFill>
  );
};
