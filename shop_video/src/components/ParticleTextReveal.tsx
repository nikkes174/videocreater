import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const FONT_FAMILY = "UnlimitSubManrope";
const INK: RGB = [234, 246, 245];
const ACCENT: RGB = [114, 222, 219];
const PAGE: RGB = [3, 8, 13];

const UNICODE_RANGES = {
  latin: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  latinExt: "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
  cyrillic: "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F",
} as const;

const FONT_FILES = [
  { weight: "500", subset: "latin", range: UNICODE_RANGES.latin },
  { weight: "500", subset: "latin-ext", range: UNICODE_RANGES.latinExt },
  { weight: "500", subset: "cyrillic", range: UNICODE_RANGES.cyrillic },
  { weight: "800", subset: "latin", range: UNICODE_RANGES.latin },
  { weight: "800", subset: "latin-ext", range: UNICODE_RANGES.latinExt },
  { weight: "800", subset: "cyrillic", range: UNICODE_RANGES.cyrillic },
] as const;

type RGB = [number, number, number];
type Point = { x: number; y: number };
type Field = { cx: number; cy: number; rx: number; ry: number };
type Particle = {
  rx: number;
  ry: number;
  rw: number;
  rh: number;
  hx: number;
  hy: number;
  nx: number;
  ny: number;
  r1: number;
  r2: number;
  r3: number;
  fx: number;
  fy: number;
  fc: RGB;
  size: number;
  alpha: number;
  delay: number;
  bend: number;
};
type ParticleMap = { canvas: HTMLCanvasElement; particles: Particle[] };

export type ParticleTextRevealProps = {
  text: string;
  fontSize?: number;
  x?: number;
  y?: number;
  color?: string;
  startFrame?: number;
  travelStartFrame?: number;
  gatherEndFrame?: number;
  settleStartFrame?: number;
  settleDuration?: number;
  maxParticles?: number;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const ease = (value: number) => {
  const t = clamp(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Mulberry32 and the curve geometry are ported from start.html. A fixed seed makes
// both the mask sampling and each particle's curved path repeatable on every frame.
function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function bowAt(a: Point, b: Point, bend: number, t: number): Point {
  const progress = ease(t);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const bow = Math.sin(progress * Math.PI) * bend;
  return {
    x: mix(a.x, b.x, progress) + (-dy / length) * bow,
    y: mix(a.y, b.y, progress) + (dx / length) * bow,
  };
}

function sampleFieldPoint(rand: () => number, field: Field): { point: Point; color: RGB } {
  let best: { point: Point; color: RGB; score: number } | undefined;
  const sources = [
    { x: field.cx - field.rx * 0.36, y: field.cy - field.ry * 0.12, rx: field.rx * 0.82, ry: field.ry * 0.8, rgb: ACCENT, strength: 0.58 },
    { x: field.cx + field.rx * 0.28, y: field.cy + field.ry * 0.12, rx: field.rx * 0.72, ry: field.ry * 0.76, rgb: INK, strength: 0.34 },
  ];

  for (let attempt = 0; attempt < 4; attempt++) {
    const angle = rand() * Math.PI * 2;
    const radius = Math.pow(rand(), 0.6);
    const point = {
      x: field.cx + Math.cos(angle) * field.rx * radius,
      y: field.cy + Math.sin(angle) * field.ry * radius,
    };
    let red = PAGE[0];
    let green = PAGE[1];
    let blue = PAGE[2];
    let score = 0;
    for (const source of sources) {
      const strength = Math.max(0, 1 - Math.hypot((point.x - source.x) / source.rx, (point.y - source.y) / source.ry)) * source.strength;
      red = mix(red, source.rgb[0], strength);
      green = mix(green, source.rgb[1], strength);
      blue = mix(blue, source.rgb[2], strength);
      score = Math.max(score, strength);
    }
    if (!best || score > best.score) best = { point, color: [red, green, blue], score };
  }

  return best as { point: Point; color: RGB };
}

function createTextMask(
  text: string,
  width: number,
  height: number,
  fontSize: number,
  x: number,
  y: number,
  color: string,
  maxParticles: number,
): ParticleMap {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas 2D is unavailable for the particle title mask.");

  context.clearRect(0, 0, width, height);
  context.font = `800 ${fontSize}px "${FONT_FAMILY}"`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = color;
  const letterSpacingContext = context as CanvasRenderingContext2D & { letterSpacing?: string };
  if ("letterSpacing" in letterSpacingContext) letterSpacingContext.letterSpacing = `${(-fontSize * 0.035).toFixed(2)}px`;
  context.fillText(text, x, y, width - 180);

  const image = context.getImageData(0, 0, width, height).data;
  const field: Field = { cx: x, cy: y, rx: Math.min(width * 0.4, 760), ry: Math.min(height * 0.25, 260) };
  const rand = createRng(7);
  let cellSize = 3;
  let cells: Array<{ x: number; y: number; alpha: number; rx: number; ry: number; rw: number; rh: number }> = [];

  for (;;) {
    cells = [];
    const x0 = Math.max(0, Math.floor(x - width * 0.46));
    const x1 = Math.min(width, Math.ceil(x + width * 0.46));
    const y0 = Math.max(0, Math.floor(y - fontSize * 1.1));
    const y1 = Math.min(height, Math.ceil(y + fontSize * 1.1));
    for (let py = y0; py < y1; py += cellSize) {
      for (let px = x0; px < x1; px += cellSize) {
        let maxAlpha = 0;
        for (let yy = py; yy < Math.min(py + cellSize, y1); yy++) {
          for (let xx = px; xx < Math.min(px + cellSize, x1); xx++) {
            maxAlpha = Math.max(maxAlpha, image[(yy * width + xx) * 4 + 3]);
          }
        }
        if (maxAlpha > 24) {
          cells.push({
            x: px + cellSize / 2,
            y: py + cellSize / 2,
            alpha: maxAlpha / 255,
            rx: px,
            ry: py,
            rw: Math.min(cellSize, width - px),
            rh: Math.min(cellSize, y1 - py),
          });
        }
      }
    }
    if (cells.length <= maxParticles || cellSize >= 10) break;
    cellSize++;
  }

  const minX = cells.reduce((value, cell) => Math.min(value, cell.x), Number.POSITIVE_INFINITY);
  const maxX = cells.reduce((value, cell) => Math.max(value, cell.x), Number.NEGATIVE_INFINITY);
  const minY = cells.reduce((value, cell) => Math.min(value, cell.y), Number.POSITIVE_INFINITY);
  const maxY = cells.reduce((value, cell) => Math.max(value, cell.y), Number.NEGATIVE_INFINITY);

  const particles = cells.map((cell) => {
    const r1 = rand();
    const r2 = rand();
    const r3 = rand();
    const sizeSeed = rand();
    const size = sizeSeed < 0.62 ? 0.9 + rand() * 0.8 : sizeSeed < 0.9 ? 1.8 + rand() * 1.4 : 3.4 + rand() * 3.2;
    const sampled = sampleFieldPoint(rand, field);
    const nx = (cell.x - minX) / Math.max(1, maxX - minX);
    const ny = (cell.y - minY) / Math.max(1, maxY - minY);
    const centerDistance = Math.hypot(cell.x - x, cell.y - y) / Math.max(1, width);

    return {
      rx: cell.rx,
      ry: cell.ry,
      rw: cell.rw,
      rh: cell.rh,
      hx: cell.x,
      hy: cell.y,
      nx,
      ny,
      r1,
      r2,
      r3,
      fx: sampled.point.x,
      fy: sampled.point.y,
      fc: sampled.color,
      size,
      alpha: cell.alpha,
      delay: centerDistance * 0.9 + r3 * 0.15,
      bend: (r2 > 0.5 ? 1 : -1) * (90 + r1 * 140) * 0.62,
    };
  });

  return { canvas, particles };
}

function hexRgb(hex: string): RGB {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
  const number = Number.parseInt(normalized, 16);
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
}

function rgbString(from: RGB, to: RGB, progress: number) {
  const channels = from.map((channel, index) => Math.round(mix(channel, to[index], progress)));
  return `rgb(${channels[0]},${channels[1]},${channels[2]})`;
}

function drawFrame(
  target: HTMLCanvasElement,
  map: ParticleMap,
  frame: number,
  ink: RGB,
  startFrame: number,
  travelStartFrame: number,
  gatherEndFrame: number,
  settleStartFrame: number,
  settleDuration: number,
) {
  const context = target.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, target.width, target.height);

  const sharpMix = smooth((frame - settleStartFrame) / settleDuration);
  if (sharpMix < 1) {
    for (const particle of map.particles) {
      const spawnFrame = startFrame + particle.r3 * 7;
      const travelFrame = travelStartFrame + particle.delay * 9;
      const localT = clamp((frame - travelFrame) / Math.max(1, gatherEndFrame - travelFrame));
      const path = bowAt({ x: particle.fx, y: particle.fy }, { x: particle.hx, y: particle.hy }, particle.bend, localT);
      const fadeIn = smooth((frame - spawnFrame) / 8);
      const particleOpacity = fadeIn * particle.alpha * (0.18 + 0.82 * localT) * (1 - sharpMix);

      // start.html restores each source-mask fragment near its destination while
      // the matching dust particle finishes the last part of its curved path.
      const fragmentOpacity = smooth((localT - 0.76) / 0.24) * particle.alpha * (1 - sharpMix);
      if (fragmentOpacity > 0.004) {
        context.globalAlpha = Math.min(1, fragmentOpacity);
        context.shadowBlur = 0;
        context.drawImage(map.canvas, particle.rx, particle.ry, particle.rw, particle.rh, particle.rx, particle.ry, particle.rw, particle.rh);
      }

      if (particleOpacity < 0.004) continue;

      const colorProgress = smooth(localT * 0.85);
      const color = rgbString(particle.fc, ink, colorProgress);
      const radius = Math.max(0.55, (particle.size * mix(1, 1.35, smooth(localT))) / 2);
      context.globalAlpha = Math.min(1, particleOpacity);
      context.fillStyle = color;
      context.shadowColor = color;
      context.shadowBlur = (1 - sharpMix) * (frame < settleStartFrame ? 3.2 : 1.4);
      context.beginPath();
      context.arc(path.x, path.y, radius, 0, Math.PI * 2);
      context.fill();
    }
  }

  context.shadowBlur = 0;
  context.globalAlpha = sharpMix;
  context.drawImage(map.canvas, 0, 0);
  context.globalAlpha = 1;
}

export const ParticleTextReveal: React.FC<ParticleTextRevealProps> = ({
  text,
  fontSize = 62,
  x,
  y,
  color = "#EAF6F5",
  startFrame = 0,
  travelStartFrame = 8,
  gatherEndFrame = 40,
  settleStartFrame = 48,
  settleDuration = 6,
  maxParticles = 2400,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const releasedRef = useRef(false);
  const [renderHandle] = useState(() => delayRender("Loading bundled Manrope and building deterministic text mask"));
  const [map, setMap] = useState<ParticleMap | null>(null);
  const centerX = x ?? width / 2;
  const centerY = y ?? 154;
  const ink = hexRgb(color);

  useEffect(() => {
    let cancelled = false;
    const loadMask = async () => {
      const faces = FONT_FILES.map(({ weight, subset, range }) => new FontFace(
        FONT_FAMILY,
        `url("${staticFile(`assets/fonts/manrope-${weight}-${subset}.woff2`)}") format("woff2")`,
        { weight, style: "normal", unicodeRange: range, display: "block" },
      ));
      const loadedFaces = await Promise.all(faces.map((face) => face.load()));
      const fontSet = document.fonts as FontFaceSet & { add: (face: FontFace) => FontFaceSet };
      loadedFaces.forEach((face) => fontSet.add(face));
      await document.fonts.load(`800 ${fontSize}px "${FONT_FAMILY}"`, text);
      if (cancelled) return;
      const nextMap = createTextMask(text, width, height, fontSize, centerX, centerY, color, maxParticles);
      setMap(nextMap);
    };

    loadMask().catch((error: unknown) => {
      if (!cancelled) cancelRender(error instanceof Error ? error : new Error(String(error)));
    });
    return () => {
      cancelled = true;
    };
  }, [centerX, centerY, color, fontSize, height, maxParticles, text, width]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;
    drawFrame(canvas, map, frame, ink, startFrame, travelStartFrame, gatherEndFrame, settleStartFrame, settleDuration);
    if (!releasedRef.current) {
      releasedRef.current = true;
      continueRender(renderHandle);
    }
  }, [frame, gatherEndFrame, ink, map, renderHandle, settleDuration, settleStartFrame, startFrame, travelStartFrame]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      aria-label={text}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
};
