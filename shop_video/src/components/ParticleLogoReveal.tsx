import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { VIDEO_CONFIG } from "../config/video";
import { PARTICLE_MAP, PARTICLE_MAP_SIZE } from "../data/particleMap";

type RGB = [number, number, number];
type Box = { x: number; y: number; w: number; h: number };
type Field = { cx: number; cy: number; rx: number; ry: number };
type Blob = { rgb: RGB; a: number; fx: number; fy: number; fw: number; fh: number };
type Palette = { ink: RGB; page: RGB; blobs: Blob[] };
type Cell = {
  hx: number;
  hy: number;
  nx: number;
  ny: number;
  r1: number;
  r2: number;
  r3: number;
  size: number;
  fx: number;
  fy: number;
  fc: RGB;
  color: RGB;
  pixelAlpha: number;
  delay: number;
  bend: number;
};

export type ParticleLogoRevealProps = {
  logoSrc?: string;
  particleCount?: number;
  vortexStrength?: number;
  glowIntensity?: number;
  /** Number of frames used for the vortex gathering phase. */
  gatherDuration?: number;
  /** Number of frames used to settle the gathered fragments. */
  settleDuration?: number;
};

const PARTICLE_PALETTE: Palette = {
  ink: [94, 219, 222],
  page: [5, 10, 15],
  blobs: [
    { rgb: [26, 143, 158], a: 0.58, fx: 0.08, fy: 0.08, fw: 0.64, fh: 0.78 },
    { rgb: [143, 228, 229], a: 0.42, fx: 0.42, fy: 0.18, fw: 0.54, fh: 0.72 },
    { rgb: [42, 124, 151], a: 0.36, fx: 0.22, fy: 0.42, fw: 0.48, fh: 0.56 },
  ],
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => {
  const c = clamp(t);
  return c * c * (3 - 2 * c);
};
// Same cubic-in-out easing used by start.html's ease() and bowAt().
const ease = (t: number) => {
  const c = clamp(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};

// Mulberry32 port from start.html. A fixed seed makes every particle plan repeatable.
function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blobStrength(blob: Blob, area: Box, x: number, y: number) {
  const width = blob.fw * area.w;
  const height = blob.fh * area.h;
  const cx = area.x + blob.fx * area.w + width / 2;
  const cy = area.y + blob.fy * area.h + height / 2;
  return Math.max(0, 1 - Math.hypot((x - cx) / (width / 2), (y - cy) / (height / 2))) * blob.a;
}

function rimMask(area: Box, x: number, y: number) {
  const radius = Math.hypot((x - (area.x + area.w / 2)) / (area.w / 2), (y - (area.y + area.h / 2)) / (area.h / 2));
  return radius < 0.55 ? 1 : radius >= 1 ? 0 : 1 - (radius - 0.55) / 0.45;
}

function glowAt(palette: Palette, area: Box, x: number, y: number): { color: RGB; strength: number } {
  let [r, g, b] = palette.page;
  let strength = 0;
  const rim = rimMask(area, x, y);
  for (const blob of palette.blobs) {
    const current = blobStrength(blob, area, x, y) * rim;
    r = mix(r, blob.rgb[0], current);
    g = mix(g, blob.rgb[1], current);
    b = mix(b, blob.rgb[2], current);
    strength = Math.max(strength, current);
  }
  return { color: [r, g, b], strength };
}

// Candidate selection and glow scoring are ported from start.html.
function sampleFieldPoint(palette: Palette, rand: () => number, field: Field, area: Box) {
  let best: { x: number; y: number; color: RGB; strength: number } | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const angle = rand() * 6.2832;
    const radius = Math.pow(rand(), 0.6);
    const x = field.cx + Math.cos(angle) * field.rx * radius;
    const y = field.cy + Math.sin(angle) * field.ry * radius;
    const glow = glowAt(palette, area, x, y);
    if (!best || glow.strength > best.strength) {
      best = { x, y, color: glow.color, strength: glow.strength };
    }
  }
  return best as { x: number; y: number; color: RGB; strength: number };
}

// The vortex delay and signed bend are the original plan("vortex") equations.
function planVortex(cell: Cell, width: number, height: number) {
  return {
    delay: (Math.hypot(cell.hx - width / 2, cell.hy - height / 2) / Math.max(1, width)) * 0.9 + cell.r3 * 0.15,
    bend: (cell.r2 > 0.5 ? 1 : -1) * (90 + cell.r1 * 140),
  };
}

// Exact bowAt() curve from start.html; gather uses the inverse bend direction.
function bowAt(a: [number, number], b: [number, number], bend: number, t: number) {
  const eased = ease(t);
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const length = Math.hypot(dx, dy) || 1;
  const bow = Math.sin(eased * Math.PI) * bend;
  return [
    mix(a[0], b[0], eased) + (-dy / length) * bow,
    mix(a[1], b[1], eased) + (dx / length) * bow,
    eased,
  ] as const;
}

function rgbMix(a: RGB, b: RGB, t: number) {
  const channel = (index: number) => Math.max(0, Math.min(255, Math.round(mix(a[index], b[index], t))));
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

function buildParticlePlan(
  particleCount: number,
  width: number,
  height: number,
  logoWidth: number,
  logoTop: number,
) {
  const count = Math.min(2500, PARTICLE_MAP.length, Math.max(1, Math.round(particleCount)));
  const logoHeight = (logoWidth * PARTICLE_MAP_SIZE.height) / PARTICLE_MAP_SIZE.width;
  const logoLeft = (width - logoWidth) / 2;
  const logoBox: Box = { x: logoLeft, y: logoTop, w: logoWidth, h: logoHeight };
  const fullFrame: Box = { x: 0, y: 0, w: width, h: height };
  const field: Field = {
    cx: width / 2,
    cy: height / 2,
    rx: Math.min(560, width * 0.4),
    ry: Math.min(260, height * 0.3),
  };
  const sequence = createRng(7);
  const fieldSequence = createRng(0x5a5a);
  const displayCellSize = (PARTICLE_MAP_SIZE.cellSize * logoWidth) / PARTICLE_MAP_SIZE.width;
  const scaleFromStartGrid = displayCellSize / 3;
  const minX = Math.min(...PARTICLE_MAP.map((pixel) => pixel[0]));
  const maxX = Math.max(...PARTICLE_MAP.map((pixel) => pixel[0]));
  const minY = Math.min(...PARTICLE_MAP.map((pixel) => pixel[1]));
  const maxY = Math.max(...PARTICLE_MAP.map((pixel) => pixel[1]));

  return Array.from({ length: count }, (_, index) => {
    // Evenly select across the precomputed map when a smaller particle count is requested.
    const mapIndex = Math.min(PARTICLE_MAP.length - 1, Math.floor((index * PARTICLE_MAP.length) / count));
    const [sourceX, sourceY, red, green, blue, alpha] = PARTICLE_MAP[mapIndex];
    const hx = logoLeft + (sourceX / PARTICLE_MAP_SIZE.width) * logoWidth;
    const hy = logoTop + (sourceY / PARTICLE_MAP_SIZE.height) * logoHeight;
    const r1 = sequence();
    const r2 = sequence();
    const r3 = sequence();
    const sizeRoll = sequence();
    const size = sizeRoll < 0.62 ? 0.9 + sequence() * 0.8 : sizeRoll < 0.9 ? 1.8 + sequence() * 1.4 : 3.4 + sequence() * 3.2;
    const fieldPoint = sampleFieldPoint(PARTICLE_PALETTE, fieldSequence, field, fullFrame);
    const cell: Cell = {
      hx,
      hy,
      nx: (hx - logoLeft) / Math.max(1, logoWidth),
      ny: (hy - logoTop) / Math.max(1, logoHeight),
      r1,
      r2,
      r3,
      size,
      fx: fieldPoint.x,
      fy: fieldPoint.y,
      fc: fieldPoint.color,
      color: [red, green, blue],
      pixelAlpha: alpha / 255,
      delay: 0,
      bend: 0,
    };
    const vortex = planVortex(cell, width, height);
    cell.delay = vortex.delay;
    cell.bend = vortex.bend;
    // start.html samples 3px cells and then sizes dots relative to that grid.
    cell.size *= scaleFromStartGrid;
    return cell;
  });
}

export const ParticleLogoReveal: React.FC<ParticleLogoRevealProps> = ({
  logoSrc = staticFile("assets/unlimitsub-logo.png"),
  particleCount = 2200,
  vortexStrength = 1,
  glowIntensity = 1,
  gatherDuration = 43,
  settleDuration = 20,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const logoWidth = Math.min(850, width - VIDEO_CONFIG.safeArea.horizontal * 2);
  const logoHeight = (logoWidth * PARTICLE_MAP_SIZE.height) / PARTICLE_MAP_SIZE.width;
  const logoTop = (height - logoHeight) / 2;
  const gatherStart = 12;
  const gatherEnd = gatherStart + Math.max(1, gatherDuration);
  const settleEnd = gatherEnd + Math.max(1, settleDuration);
  const pngRevealEnd = settleEnd + 15;
  const logoOpacity = interpolate(frame, [settleEnd, pngRevealEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const settleProgress = smooth((frame - gatherEnd) / Math.max(1, settleDuration));
  const cameraScale = interpolate(frame, [pngRevealEnd, pngRevealEnd + 15], [1, 1.035], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const particles = useMemo(
    () => buildParticlePlan(particleCount, width, height, logoWidth, logoTop),
    [particleCount, width, height, logoWidth, logoTop],
  );
  const progress = clamp((frame - gatherStart) / Math.max(1, gatherDuration));
  const ambientOpacity = interpolate(frame, [0, gatherStart, gatherStart + 8], [0.08, 0.19, 0.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const glowOpacity = interpolate(frame, [0, gatherStart, gatherEnd, settleEnd, pngRevealEnd], [0.03, 0.08, 0.34, 0.42, 0.16], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  }) * glowIntensity;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "visible" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${cameraScale})`,
          transformOrigin: "50% 50%",
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: logoWidth * 1.28,
            height: logoHeight * 2.1,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(42, 201, 207, 0.42) 0%, rgba(14, 91, 109, 0.16) 42%, transparent 76%)",
            filter: "blur(36px)",
            opacity: glowOpacity,
          }}
        />
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
          aria-hidden="true"
        >
          {particles.map((particle, index) => {
            const localProgress = clamp((progress - particle.delay * 0.55) / 0.45);
            const curve = bowAt(
              [particle.fx, particle.fy],
              [particle.hx, particle.hy],
              -particle.bend * vortexStrength,
              localProgress,
            );
            const e = 1 - curve[2];
            const gatheringAlpha = (0.1 + 0.9 * (1 - smooth((e - 0.45) / 0.55))) * smooth(localProgress / 0.15);
            const ambientAlpha = frame < gatherStart ? ambientOpacity : ambientOpacity * (1 - progress);
            const isGathering = frame >= gatherStart && frame <= gatherEnd;
            const x = frame < gatherStart ? particle.fx : isGathering ? curve[0] : particle.hx;
            const y = frame < gatherStart ? particle.fy : isGathering ? curve[1] : particle.hy;
            const colorMix = frame < gatherStart ? 0 : isGathering ? smooth(e / 0.6) : 1;
            const fill = rgbMix(particle.fc, particle.color, colorMix);
            const sourceRadius = (particle.size * mix(1, 1.7, e)) / 2;
            const settledRadius = (PARTICLE_MAP_SIZE.cellSize * logoWidth / PARTICLE_MAP_SIZE.width * 0.62) / 2;
            const radius = frame < gatherStart
              ? sourceRadius
              : frame <= gatherEnd
                ? sourceRadius
                : mix(sourceRadius, settledRadius, settleProgress);
            const fadeDuringPngSwap = frame < settleEnd ? 1 : 1 - logoOpacity;
            const opacity = Math.max(ambientAlpha, gatheringAlpha) * particle.pixelAlpha * fadeDuringPngSwap;

            return <circle key={index} cx={x} cy={y} r={radius} fill={fill} opacity={opacity} />;
          })}
        </svg>
        <Img
          src={logoSrc}
          style={{
            position: "absolute",
            left: "50%",
            top: logoTop,
            width: logoWidth,
            height: logoHeight,
            transform: "translateX(-50%)",
            opacity: logoOpacity,
            filter: `drop-shadow(0 0 ${26 * glowIntensity}px rgba(44, 215, 218, 0.34)) drop-shadow(0 0 ${58 * glowIntensity}px rgba(12, 126, 147, 0.18))`,
            imageRendering: "auto",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
