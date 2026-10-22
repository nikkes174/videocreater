/*
 * Minimal local fixture subset used by the FlyingWords demo.
 * Derived from video-shotcraft demos/_fixtures/Polish.tsx, Look.tsx, and Brand.tsx.
 * Copyright 2026 Wei Yihao. Localized to this isolated Remotion project.
 * Licensed under Apache-2.0; see src/vendor/videoShotcraft/LICENSE.
 */
import React from "react";
import { useCurrentFrame } from "remotion";

export const FONT = {
  sans: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Inter, Arial, sans-serif',
  mono: '"SF Mono", "JetBrains Mono", Menlo, monospace',
} as const;

export const SERIF = '"Iowan Old Style", "Palatino Linotype", Palatino, "Songti SC", Georgia, serif';

export const LOOKS = {
  midnight: {
    name: "midnight",
    dark: true,
    bg: ["#0d1426", "#090d1a", "#05070e"],
    light: "#3d63ff",
    surface: "#111827",
    surface2: "#172036",
    line: "rgba(160,190,255,0.12)",
    ink: "#f2f5ff",
    ink2: "#a9b4d0",
    ink3: "#5d6883",
    accent: "#5b8cff",
    accent2: "#3ee6d0",
    onAccent: "#050816",
    shadow: "#000208",
  },
} as const;

const rgbOf = (hex: string) => {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(f, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

export const alpha = (hex: string, a: number) => `rgba(${rgbOf(hex)},${a})`;

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const grainCache = new Map<string, string>();
const grainTile = (variant: number, tile: number, freq: number) => {
  const key = `${variant}|${tile}|${freq}`;
  const hit = grainCache.get(key);
  if (hit) return hit;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}'>` +
    `<filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='2' seed='${variant * 17 + 3}' stitchTiles='stitch'/>` +
    `<feColorMatrix type='matrix' values='0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1'/>` +
    `<feComponentTransfer><feFuncR type='linear' slope='2.4' intercept='-0.7'/><feFuncG type='linear' slope='2.4' intercept='-0.7'/>` +
    `<feFuncB type='linear' slope='2.4' intercept='-0.7'/></feComponentTransfer></filter>` +
    `<rect width='100%' height='100%' filter='url(#g)'/></svg>`;
  const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  grainCache.set(key, url);
  return url;
};

const Grain: React.FC<{ opacity: number; step?: number; tile?: number; freq?: number }> = ({
  opacity,
  step = 2,
  tile = 256,
  freq = 0.85,
}) => {
  const frame = useCurrentFrame();
  const k = Math.floor(frame / Math.max(1, step));
  const ox = Math.floor(hash(k * 3 + 1) * tile);
  const oy = Math.floor(hash(k * 7 + 2) * tile);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
        mixBlendMode: "soft-light",
        backgroundImage: grainTile(k % 6, tile, freq),
        backgroundSize: `${tile}px ${tile}px`,
        backgroundPosition: `${ox}px ${oy}px`,
      }}
    />
  );
};

const Vignette: React.FC<{ strength: number; color: string; inner: number }> = ({ strength, color, inner }) => {
  const c = rgbOf(color);
  const mid = inner + (1 - inner) * 0.55;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          `radial-gradient(ellipse 72% 72% at 50% 46%, rgba(${c},0) ${inner * 100}%, ` +
          `rgba(${c},${(strength * 0.32).toFixed(3)}) ${(mid * 100).toFixed(1)}%, rgba(${c},${strength.toFixed(3)}) 100%), ` +
          `radial-gradient(ellipse 100% 100% at 50% 46%, rgba(${c},0) 60%, rgba(${c},${(strength * 0.6).toFixed(3)}) 100%)`,
      }}
    />
  );
};

type Look = typeof LOOKS.midnight;

export const Stage: React.FC<{
  look: Look;
  keyLight?: { x: number; y: number };
  fill?: { x: number; y: number } | null;
  intensity?: number;
  grain?: number;
  vignette?: number;
  children?: React.ReactNode;
}> = ({
  look,
  keyLight = { x: 0.5, y: 0.08 },
  fill = { x: 0.85, y: 0.9 },
  intensity = 1,
  grain,
  vignette,
  children,
}) => {
  const [top, middle, bottom] = look.bg;
  const k = look.dark ? 0.55 * intensity : 0.9 * intensity;
  const f = look.dark ? 0.22 * intensity : 0.1 * intensity;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: `linear-gradient(180deg, ${top} 0%, ${middle} 52%, ${bottom} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            `radial-gradient(ellipse 58% 62% at ${keyLight.x * 100}% ${keyLight.y * 100}%, ${alpha(look.light, Math.min(1, k))} 0%, ${alpha(look.light, 0)} 70%)` +
            (fill
              ? `, radial-gradient(ellipse 50% 46% at ${fill.x * 100}% ${fill.y * 100}%, ${alpha(look.accent2, f)} 0%, ${alpha(look.accent2, 0)} 72%)`
              : ""),
          mixBlendMode: look.dark ? "screen" : "normal",
        }}
      />
      {children}
      <Vignette strength={vignette ?? (look.dark ? 0.55 : 0.16)} color={look.shadow} inner={0.42} />
      {(grain ?? (look.dark ? 0.09 : 0.05)) > 0 && <Grain opacity={grain ?? (look.dark ? 0.09 : 0.05)} />}
    </div>
  );
};

export const BRAND = {
  name: "video-shotcraft",
  paper: "#F5F3EE",
  ink: "#171714",
  amber: "#D3923C",
} as const;

export const PITCH = { en: { motto: "Frame motion. Craft the shot." } } as const;

export const ShotcraftMark: React.FC<{ size?: number; tone?: "dark" | "light" }> = ({ size = 96, tone = "dark" }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" style={{ display: "block", overflow: "visible" }}>
    <path d="M16 16h96v26H42v44h70v26H16V16Z" fill={tone === "dark" ? BRAND.paper : BRAND.ink} />
    <path d="M92 48h28L84 84H56l36-36Z" fill={BRAND.amber} />
  </svg>
);
