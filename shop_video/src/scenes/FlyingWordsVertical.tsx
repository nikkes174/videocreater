/*
 * Vertical adaptation of the video-shotcraft FlyingWords demo.
 * Copyright 2026 Wei Yihao. Modified for a 1080x1920 frame and the UnlimitSub service list.
 * The projection, lifecycle curve, golden-angle phase distribution, streak construction,
 * tunnel motion, deterministic seed, and drift formula remain from the source demo.
 * Licensed under Apache-2.0; see ../vendor/videoShotcraft/LICENSE.
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import {
  alpha,
  BRAND,
  FONT,
  LOOKS,
  PITCH,
  SERIF,
  ShotcraftMark,
  Stage,
} from "../vendor/videoShotcraft/FlyingWordsFixture";

const WIDTH = 1080;
const HEIGHT = 1920;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const P = 4400;
const Z0 = -7000;
const Z1 = 3200;
const SOURCE_DURATION = 180;
const CYCLES = 2;
const TAU = Math.PI * 2;

const ORIGINAL_WORDS = [
  "Timeline", "Keyframes", "Easing", "Camera", "Depth", "Parallax", "Motion blur", "Springs",
  "Layers", "Shot cards", "Typography", "Lighting", "Grain", "Remotion", "Beat grid", "Stagger",
  "Transitions", "Color", "Workbench", "Audio sync", "Storyboard", "Orbit",
];

const SERVICES = [
  "Steam", "Telegram Premium", "Telegram Stars", "Roblox", "PUBG Mobile", "Apple Gift Card",
  "CapCut Pro", "ChatGPT", "Claude", "Steam Wallet", "Robux", "PUBG UC", "Gift Cards",
  "Subscriptions", "Digital Services", "Gaming", "Premium", "Entertainment", "Online Services",
  "Digital Freedom", "UnlimitSub", "Your World",
];

const SERVICE_ACCENTS = new Set([1, 2, 6, 7]);
const SERVICE_SERIFS = new Set([2, 5, 8, 12, 17, 20]);
const ORIGINAL_ACCENTS = new Set([3, 7, 12, 19]);
const ORIGINAL_SERIFS = new Set([1, 5, 10, 14, 17, 21]);
const ORIGINAL_INKS = ["#f2f5ff", "#c3cbe2", "#8a95b5"];
const SERVICE_INKS = ["#EAF6F5", "#C3DEDE", "#8FAAAF"];

const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const rollAt = (time: number) => (2.5 * Math.PI / 180) * Math.sin(time * TAU);

const curve = (u: number) => {
  const OP = [0, 1, 0.5, 0.2, 0];
  const OT = [0, 0.25, 0.6, 0.85, 1];
  for (let k = 0; k < 4; k++) {
    if (u <= OT[k + 1]) return OP[k] + ((OP[k + 1] - OP[k]) * (u - OT[k])) / (OT[k + 1] - OT[k]);
  }
  return 0;
};

const project = (x: number, y: number, u: number, roll: number, drift = true) => {
  const z = Z0 + (Z1 - Z0) * u;
  const d = drift ? 0.5 + u * 1.35 : 1;
  const s = P / (P - z);
  const c = Math.cos(roll);
  const sn = Math.sin(roll);
  const rx = x * c - y * sn;
  const ry = x * sn + y * c;
  return { sx: CX + rx * d * s, sy: CY + ry * d * s, s };
};

type FlyingItem = {
  text: string;
  accent: boolean;
  serif: boolean;
  size: number;
  color: string;
  x: number;
  y: number;
  rz: number;
  ph: number;
};

const makeItems = (services: boolean): FlyingItem[] => {
  const words = services ? SERVICES : ORIGINAL_WORDS;
  return words.map((text, i) => {
    // Keep the source's golden-angle phase arrangement, reshape only its ellipse for portrait.
    const angle = i * 2.39996 + rand(i * 7 + 1) * 0.8;
    const radius = 320 + rand(i * 13 + 2) * 700;
    const accent = services ? SERVICE_ACCENTS.has(i) : ORIGINAL_ACCENTS.has(i);
    const size = services ? 44 + rand(i + 3) * 38 : 64 + rand(i + 3) * 56;
    const colors = services ? SERVICE_INKS : ORIGINAL_INKS;
    return {
      text,
      accent,
      serif: services ? SERVICE_SERIFS.has(i) : ORIGINAL_SERIFS.has(i),
      size,
      color: accent ? (services ? "#39D5C7" : "#86a8ff") : colors[Math.floor(rand(i + 5) * colors.length)],
      x: Math.cos(angle) * radius * 0.58,
      y: Math.sin(angle) * radius * 1.05,
      rz: (rand(i + 21) - 0.5) * 12,
      ph: i / words.length,
    };
  });
};

type DustItem = { x: number; y: number; ph: number; w: number };

const makeDust = (): DustItem[] => Array.from({ length: 56 }, (_, i) => {
  const angle = i * 2.39996 + rand(i * 5 + 77) * 1.2;
  const radius = 180 + rand(i * 3 + 91) * 1250;
  return {
    x: Math.cos(angle) * radius * 0.52,
    y: Math.sin(angle) * radius * 1.02,
    ph: rand(i * 9 + 13),
    w: 1 + rand(i + 50) * 1.6,
  };
});

const DUST = makeDust();
const RINGS = Array.from({ length: 10 }, (_, index) => ({ ph: index / 10 }));

const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

type SceneVariant = "vertical" | "services";

const FlyingWordsPortrait: React.FC<{ variant: SceneVariant }> = ({ variant }) => {
  const frame = useCurrentFrame();
  const services = variant === "services";
  const items = services ? SERVICE_ITEMS : ORIGINAL_ITEMS;
  const t = frame / SOURCE_DURATION;
  const du = CYCLES / SOURCE_DURATION;
  const roll = rollAt(t);
  const previousRoll = rollAt(t - du);
  const streakRoll = rollAt(t - du * 2.6);
  const glowB = 0.82 + 0.14 * Math.sin(t * Math.PI * 4);
  const centerGlowColor = services ? "#39D5C7" : LOOKS.midnight.light;
  const headlineOpacity = services
    ? interpolate(frame, [15, 39, 129, 150], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      })
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: LOOKS.midnight.bg[2], overflow: "hidden" }}>
      <Stage look={LOOKS.midnight} keyLight={{ x: 0.5, y: 0.5 }} fill={null} intensity={0.5} vignette={0.7} grain={0.08}>
        <div
          style={{
            position: "absolute",
            left: CX - (services ? 420 : 520),
            top: CY - (services ? 610 : 360),
            width: services ? 840 : 1040,
            height: services ? 1220 : 720,
            borderRadius: "50%",
            opacity: glowB,
            background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${alpha(centerGlowColor, 0.42)} 0%, ${alpha(centerGlowColor, 0.12)} 38%, ${alpha(centerGlowColor, 0)} 70%)`,
          }}
        />
      </Stage>

      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", inset: 0 }}>
        {RINGS.map((ring, index) => {
          const u = (t * CYCLES + ring.ph) % 1;
          const p = project(0, 0, u, roll, false);
          const rx = (services ? 475 : 520) * p.s;
          const ry = (services ? 815 : 865) * p.s;
          const opacity = Math.min(1, u / 0.3) * (1 - Math.min(1, Math.max(0, (u - 0.55) / 0.3)));
          if (opacity <= 0.01) return null;
          return (
            <ellipse
              key={`ring-${index}`}
              cx={CX}
              cy={CY}
              rx={rx}
              ry={ry}
              fill="none"
              stroke={services ? "#39D5C7" : LOOKS.midnight.accent}
              strokeOpacity={opacity * 0.16}
              strokeWidth={1 + p.s * 0.8}
              transform={`rotate(${(roll * 180) / Math.PI} ${CX} ${CY})`}
            />
          );
        })}
        {DUST.map((dust, index) => {
          const u = (t * CYCLES + dust.ph) % 1;
          const previousU = Math.max(0, u - du * 2.6);
          const previous = project(dust.x, dust.y, previousU, streakRoll);
          const current = project(dust.x, dust.y, u, roll);
          const opacity = curve(u) * 0.75;
          if (opacity <= 0.01) return null;
          return (
            <line
              key={`dust-${index}`}
              x1={previous.sx}
              y1={previous.sy}
              x2={current.sx}
              y2={current.sy}
              stroke={services ? "#C3DEDE" : "#cfdcff"}
              strokeOpacity={opacity}
              strokeWidth={dust.w * Math.min(2.4, current.s)}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {items.map((item, index) => {
        const u = (t * CYCLES + item.ph) % 1;
        const current = project(item.x, item.y, u, roll);
        const previous = project(item.x, item.y, Math.max(0, u - du), previousRoll);
        const vx = current.sx - previous.sx;
        const vy = current.sy - previous.sy;
        const centerMask = services
          ? ((current.sx - CX) / 450) ** 2 + ((current.sy - CY) / 245) ** 2
          : ((current.sx - CX) / 760) ** 2 + ((current.sy - CY) / 190) ** 2;
        const occlusion = services
          ? centerMask <= 0.72 ? 0 : centerMask >= 1.5 ? 1 : smooth((centerMask - 0.72) / 0.78)
          : centerMask < 1 ? 0.2 + 0.8 * centerMask * centerMask : 1;
        const opacity = curve(u) * occlusion;
        if (opacity <= 0.005) return null;
        const farFog = u < 0.22 ? (1 - u / 0.22) * 2.2 : 0;
        const nearBlur = u > 0.86 ? (u - 0.86) * 60 : 0;
        const blur = farFog + nearBlur;
        const speed = Math.hypot(vx, vy);
        const trail = speed > 6
          ? [1, 2, 3, 4, 5, 6].map((layer) => {
              const distance = (layer / 6) * 0.9 / current.s;
              return `${(-vx * distance).toFixed(1)}px ${(-vy * distance).toFixed(1)}px ${(layer * 0.8).toFixed(1)}px ${alpha(item.color, 0.2 - layer * 0.026)}`;
            }).join(", ")
          : "";
        const glow = item.accent
          ? `0 0 18px ${alpha(services ? "#39D5C7" : LOOKS.midnight.accent, 0.55)}, 0 0 48px ${alpha(services ? "#39D5C7" : LOOKS.midnight.accent, 0.3)}`
          : "";

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: current.sx,
              top: current.sy,
              whiteSpace: "nowrap",
              lineHeight: 1,
              transform: `translate(-50%,-50%) scale(${current.s.toFixed(4)}) rotate(${item.rz + (roll * 180) / Math.PI}deg)`,
              fontFamily: item.serif ? SERIF : FONT.sans,
              fontStyle: item.serif ? "italic" : undefined,
              fontWeight: item.serif ? 500 : 700,
              fontSize: item.size,
              letterSpacing: item.serif ? "-0.01em" : "-0.03em",
              color: item.color,
              opacity,
              textShadow: [glow, trail].filter(Boolean).join(", ") || undefined,
              filter: blur > 0.05 ? `blur(${(blur / Math.max(0.6, current.s)).toFixed(2)}px)` : undefined,
            }}
          >
            {item.text}
          </div>
        );
      })}

      {services ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              width: 1010,
              height: 620,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              opacity: headlineOpacity,
              background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(2, 7, 12, 0.90) 0%, rgba(2, 7, 12, 0.67) 47%, rgba(2, 7, 12, 0) 76%)",
            }}
          />
          <div
            style={{
              position: "relative",
              textAlign: "center",
              color: "#EAF6F5",
              fontFamily: FONT.sans,
              fontSize: 74,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.08,
              opacity: headlineOpacity,
              textShadow: "0 3px 30px rgba(0,0,0,0.65), 0 0 48px rgba(57,213,199,0.18)",
            }}
          >
            <div>Свобода цифровых</div>
            <div>возможностей</div>
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              width: 920,
              height: 420,
              borderRadius: "50%",
              background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${alpha("#04060d", 0.7)} 0%, ${alpha("#04060d", 0.38)} 45%, ${alpha("#04060d", 0)} 72%)`,
            }}
          />
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: FONT.mono, fontSize: 15, letterSpacing: "0.3em", color: LOOKS.midnight.accent, marginBottom: 20 }}>
              <ShotcraftMark size={26} tone="dark" />
              <span>{BRAND.name}</span>
            </div>
            <div style={{ fontFamily: FONT.sans, fontSize: 54, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1, color: LOOKS.midnight.ink, textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}>
              {PITCH.en.motto}
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const ORIGINAL_ITEMS = makeItems(false);
const SERVICE_ITEMS = makeItems(true);

export const FlyingWordsVertical: React.FC = () => <FlyingWordsPortrait variant="vertical" />;
export const FlyingServicesScene: React.FC = () => <FlyingWordsPortrait variant="services" />;
