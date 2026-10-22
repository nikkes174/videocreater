import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { useOptionalLayerAsset } from "./useOptionalLayerAsset";

export type ParticleDepth = "back" | "mid" | "front" | "all";

type Particle = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  blur: number;
  phase: number;
  speed: number;
  color: string;
};

const randomAt = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
};

const makeParticles = (depth: Exclude<ParticleDepth, "all">, count: number): Particle[] =>
  Array.from({ length: count }, (_, index) => {
    const base = (depth === "back" ? 1000 : depth === "mid" ? 2000 : 3000) + index;
    const band = index % 4;
    const r1 = randomAt(base + 11);
    const r2 = randomAt(base + 23);
    const r3 = randomAt(base + 37);
    const r4 = randomAt(base + 41);
    let x: number;
    let y: number;

    if (band === 0) {
      x = 4 + r1 * 20;
      y = r2 > 0.5 ? 8 + r2 * 29 : 62 + r2 * 29;
    } else if (band === 1) {
      x = 76 + r1 * 20;
      y = r2 > 0.5 ? 8 + r2 * 29 : 62 + r2 * 29;
    } else if (band === 2) {
      x = 24 + r1 * 52;
      y = 7 + r2 * 23;
    } else {
      x = 24 + r1 * 52;
      y = 70 + r2 * 18;
    }

    const scale = depth === "back" ? 1.2 + r3 * 1.4 : depth === "mid" ? 1.8 + r3 * 2.7 : 4 + r3 * 6;
    const opacity = depth === "back" ? 0.1 + r4 * 0.15 : depth === "mid" ? 0.18 + r4 * 0.22 : 0.08 + r4 * 0.12;
    const blur = depth === "back" ? r4 : depth === "mid" ? 1 + r4 * 2 : 3 + r4 * 5;
    const colors = ["#72DEDB", "#9CEFEA", "#E6FAF8"];

    return {
      x,
      y,
      radius: scale,
      opacity,
      blur,
      phase: randomAt(base + 53) * Math.PI * 2,
      speed: (depth === "back" ? 0.12 : depth === "mid" ? 0.2 : 0.28) + randomAt(base + 67) * 0.22,
      color: colors[index % colors.length],
    };
  });

const PARTICLES: Record<Exclude<ParticleDepth, "all">, Particle[]> = {
  back: makeParticles("back", 32),
  mid: makeParticles("mid", 22),
  front: makeParticles("front", 10),
};

const DEPTH_MOTION = {
  back: { x: 11, y: 14 },
  mid: { x: 17, y: 22 },
  front: { x: 24, y: 18 },
} as const;

export const ParticleLayer: React.FC<{ depth: ParticleDepth }> = ({ depth }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const asset = useOptionalLayerAsset("bg-particles.png");
  const endFrame = Math.max(1, durationInFrames - 1);
  const progress = frame / endFrame;

  if (asset && (depth === "back" || depth === "all")) {
    return (
      <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
        <Img src={asset} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
    );
  }
  if (asset) return null;

  const particles = depth === "all"
    ? ([
        ...PARTICLES.back.map((particle) => ({ particle, depth: "back" as const })),
        ...PARTICLES.mid.map((particle) => ({ particle, depth: "mid" as const })),
        ...PARTICLES.front.map((particle) => ({ particle, depth: "front" as const })),
      ])
    : PARTICLES[depth].map((particle) => ({ particle, depth }));

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {particles.map(({ particle, depth: particleDepth }, index) => {
        const motion = DEPTH_MOTION[particleDepth];
        const angle = progress * Math.PI * 2 * particle.speed + particle.phase;
        const x = particle.x + (Math.sin(angle) * motion.x) / width * 100;
        const y = particle.y + (Math.cos(angle * 0.72) * motion.y) / height * 100;
        const breathe = 0.82 + Math.sin(angle * 0.8) * 0.18;
        const size = particle.radius * 2;

        return (
          <div
              key={`${particleDepth}-${index}`}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: particle.color,
              opacity: particle.opacity * breathe,
              filter: `blur(${particle.blur}px)`,
              boxShadow: `0 0 ${particle.radius * (particleDepth === "front" ? 2.2 : 1.6)}px ${particle.color}`,
              transform: `translate(-50%, -50%) scale(${1 + (particleDepth === "front" ? progress * 0.04 : 0)})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
