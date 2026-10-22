import { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const SERVICES = [
  "Steam",
  "Telegram Premium",
  "Telegram Stars",
  "Roblox",
  "PUBG Mobile",
  "Apple Gift Card",
  "CapCut Pro",
  "Gaming",
  "Digital",
  "Subscriptions",
  "Gift Cards",
  "Premium",
  "UnlimitSub",
  "Digital World",
  "Game Currency",
  "Entertainment",
  "Steam Wallet",
  "PUBG UC",
  "Robux",
  "Digital Freedom",
  "Online Services",
  "Your World",
];

const WIDTH = 1080;
const HEIGHT = 1920;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const PERSPECTIVE = 4400;
const Z_START = -7000;
const Z_END = 3200;

const OP = [0, 1, 0.5, 0.2, 0];
const OT = [0, 0.25, 0.6, 0.85, 1];

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const seeded = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
};

type Word = {
  id: number;
  text: string;
  angle: number;
  radius: number;
  phase: number;
  fontSize: number;
  color: string;
  weight: number;
};

const COLORS = ["#EAF6F5", "#39D5C7", "#EAF6F5", "#8FAAAF"];

const buildWords = (): Word[] =>
  SERVICES.map((text, index) => {
    const r1 = seeded(index * 17 + 1);
    const r2 = seeded(index * 31 + 2);
    const r3 = seeded(index * 43 + 3);
    return {
      id: index,
      text,
      angle: index * GOLDEN_ANGLE,
      radius: 760 + r1 * 480 + (index % 4) * 60,
      phase: (index / Math.max(1, SERVICES.length)) % 1,
      fontSize: 20 + r2 * 10,
      color: COLORS[Math.floor(r3 * COLORS.length)] ?? "#EAF6F5",
      weight: r3 > 0.5 ? 700 : 600,
    };
  });

type Particle = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
  phase: number;
  color: string;
};

const PARTICLE_COUNT = 48;

const buildParticles = (): Particle[] =>
  Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const r1 = seeded(index * 101 + 11);
    const r2 = seeded(index * 137 + 23);
    const r3 = seeded(index * 173 + 37);
    const r4 = seeded(index * 199 + 53);
    return {
      x: r1 * 100,
      y: r2 * 100,
      radius: 1 + r3 * 2.6,
      opacity: 0.15 + r4 * 0.35,
      speed: 0.1 + seeded(index * 211 + 71) * 0.22,
      phase: seeded(index * 233 + 89) * Math.PI * 2,
      color: index % 3 === 0 ? "#EAF6F5" : "#39D5C7",
    };
  });

export const FlyingServices: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const words = useMemo(() => buildWords(), []);
  const particles = useMemo(() => buildParticles(), []);

  const lastFrame = Math.max(1, durationInFrames - 1);
  const globalProgress = frame / lastFrame;

  const sloganOpacity = interpolate(
    frame,
    [0, 15, 45, 126, 150],
    [0, 0, 1, 1, 0],
    clamp,
  );
  const sloganY = interpolate(
    frame,
    [0, 15, 45, 126, 150],
    [24, 24, 0, 0, -16],
    clamp,
  );
  const sloganBlur = interpolate(
    frame,
    [0, 15, 45, 126, 150],
    [10, 10, 0, 0, 12],
    clamp,
  );

  const finalOverlay = interpolate(frame, [126, 150], [0, 1], clamp);
  const wordGlobalFade = 1 - finalOverlay;
  const centralGlow = interpolate(
    frame,
    [0, 15, 45, 126, 150],
    [0.12, 0.18, 0.32, 0.32, 0.05],
    clamp,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#03080D", overflow: "hidden" }}>
      {/* 1. Far dark background */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(160deg, #11181B 0%, #03080D 42%, #010306 100%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 46%, rgba(8, 22, 28, 0.55) 0%, transparent 72%), radial-gradient(ellipse 45% 60% at 50% 95%, rgba(0,0,0,0.7) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* 2. Soft central teal light */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 640,
          height: 640,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(57, 213, 199, 0.24) 0%, rgba(57, 213, 199, 0.09) 34%, transparent 72%)",
          filter: "blur(26px)",
          opacity: centralGlow,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      {/* 3. Perspective tunnel rings */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {Array.from({ length: 10 }, (_, index) => {
          const t = index / 9;
          const diameter = 140 + t * 880;
          const opacity =
            (0.06 + (1 - t) * 0.13) *
            (0.85 + 0.15 * Math.sin(globalProgress * Math.PI * 2 + index));
          return (
            <div
              key={`ring-${index}`}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: diameter,
                height: diameter * 0.56,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                border: `1px solid rgba(57, 213, 199, ${opacity})`,
                boxShadow: `0 0 ${6 + t * 10}px rgba(57, 213, 199, ${opacity * 0.45})`,
                opacity: 1 - finalOverlay,
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* 4. Light particles */}
      <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
        {particles.map((particle, index) => {
          const angle = particle.phase + globalProgress * Math.PI * 2 * particle.speed;
          const x = (particle.x / 100) * WIDTH + Math.sin(angle) * 22;
          const y = (particle.y / 100) * HEIGHT + Math.cos(angle * 0.8) * 18;
          const opacity =
            particle.opacity *
            (0.72 + 0.28 * Math.sin(angle)) *
            (1 - finalOverlay);
          return (
            <div
              key={`particle-${index}`}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: particle.radius * 2,
                height: particle.radius * 2,
                borderRadius: "50%",
                backgroundColor: particle.color,
                opacity,
                filter: "blur(1.2px)",
                transform: "translate(-50%, -50%)",
                boxShadow: `0 0 ${particle.radius * 4}px ${particle.color}`,
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* 5. Flying service names */}
      <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
        {words.map((word) => {
          const u = (globalProgress + word.phase) % 1;
          const z = Z_START + (Z_END - Z_START) * u;
          const scale = PERSPECTIVE / (PERSPECTIVE - z);
          const x = CX + Math.cos(word.angle) * word.radius * scale;
          const y = CY + Math.sin(word.angle) * word.radius * scale;

          const lifeOpacity = interpolate(u, OT, OP, clamp);
          const dist = Math.hypot(x - CX, y - CY);
          const centerFactor = interpolate(dist, [120, 300], [0.18, 1], clamp);
          const opacity = lifeOpacity * centerFactor * wordGlobalFade;

          const angleDeg = (Math.atan2(y - CY, x - CX) * 180) / Math.PI;
          const motionBlur = Math.min(14, Math.max(0, (scale - 1) * 2.2));
          const streakOpacity =
            lifeOpacity *
            centerFactor *
            0.35 *
            Math.min(1, scale / 1.4) *
            wordGlobalFade;

          return (
            <div
              key={word.id}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`,
                opacity,
                filter: `blur(${motionBlur * 0.35}px)`,
                willChange: "transform, opacity",
              }}
            >
              {streakOpacity > 0.01 && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: word.fontSize * 5,
                    height: Math.max(1, word.fontSize * 0.16),
                    background: `linear-gradient(90deg, transparent 0%, ${word.color} 100%)`,
                    opacity: streakOpacity,
                    transform: `translate(-100%, -50%) rotate(${angleDeg + 180}deg)`,
                    transformOrigin: "0 50%",
                    filter: "blur(2px)",
                    pointerEvents: "none",
                  }}
                />
              )}
              <span
                style={{
                  position: "relative",
                  fontSize: word.fontSize,
                  fontWeight: word.weight,
                  color: word.color,
                  whiteSpace: "nowrap",
                  textShadow: `0 0 ${6 * scale}px ${word.color}55`,
                  letterSpacing: "0.02em",
                }}
              >
                {word.text}
              </span>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* 6. Radial darkening behind slogan */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 560,
          height: 340,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(3, 8, 13, 0.78) 0%, rgba(3, 8, 13, 0.4) 46%, transparent 78%)",
          filter: "blur(18px)",
          opacity: 0.75 * (1 - finalOverlay * 0.5),
          pointerEvents: "none",
        }}
      />

      {/* 7. Main slogan */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, calc(-50% + ${sloganY}px))`,
          opacity: sloganOpacity,
          filter: `blur(${sloganBlur}px)`,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: 17,
            letterSpacing: 4,
            color: "#8FAAAF",
            marginBottom: 14,
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          UnlimitSub
        </div>
        <div
          style={{
            fontSize: 72,
            lineHeight: 1.08,
            fontWeight: 700,
            color: "#EAF6F5",
            textShadow:
              "0 0 24px rgba(57, 213, 199, 0.3), 0 0 60px rgba(57, 213, 199, 0.12)",
          }}
        >
          Свобода цифровых
          <br />
          возможностей
        </div>
      </div>

      {/* 8. Final fade overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: "#03080D",
          opacity: finalOverlay,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};