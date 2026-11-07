import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE, Grain, Vignette, mix, ramp } from "../../vendor/videoShotcraft/demos/_fixtures/Polish";

export const PAPARAZZI_FLASH_DURATION = 150;

export const COLORS = {
  background: "#07090C",
  graphite: "#151B22",
  platinum: "#F1F2F4",
  silver: "#B6BEC8",
  gold: "#C8A66A",
} as const;

export type CameraView = {
  scale: number;
  cx: number;
  cy: number;
};

export type FocusRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type PaparazziSceneProps = {
  title: string;
  description: string;
  brand: string;
  effectsBeforeCopy?: boolean;
  views: readonly [CameraView, CameraView, CameraView];
  focusRect: FocusRect;
  Scene: React.ComponentType<{
    f: number;
    live: boolean;
  }>;
};

export const COPY_STYLE: React.CSSProperties = {
  position: "absolute",
  left: 1440,
  bottom: 52,
  width: 430,
  color: "#F1F2F4",
  fontFamily: "Manrope, sans-serif",
  textShadow: "0 3px 18px rgba(0,0,0,.9)",
};

export const FONT_SIZES = {
  brand: 17,
  title: 40,
  description: 24,
} as const;

export const DESCRIPTION_LINE_HEIGHT = 1.4;

const GOLD = COLORS.gold;
const F1 = 30;
const F2 = 52;
const F3 = 70;
const FLASHES = [F1, F2, F3] as const;
const SETTLE = 6;
const DECAY = 4;
const BLOOM = 7;
const AF = 8;

const hash = (i: number) => {
  const s = Math.sin(i * 127.3 + 11.7) * 43758.5453;
  return s - Math.floor(s);
};

const project = (r: FocusRect, v: CameraView) => ({
  x: (r.x - v.cx) * v.scale + 960,
  y: (r.y - v.cy) * v.scale + 540,
  w: r.w * v.scale,
  h: r.h * v.scale,
});

const viewRect = (v: CameraView) => ({
  x: v.cx - 960 / v.scale,
  y: v.cy - 540 / v.scale,
  w: 1920 / v.scale,
  h: 1080 / v.scale,
});

const Brackets: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  arm?: number;
  width?: number;
  opacity?: number;
}> = ({ x, y, w, h, color, arm = 46, width = 3, opacity = 1 }) => {
  const a = Math.min(arm, w / 3, h / 3);
  const d = `M${x} ${y + a}V${y}H${x + a} M${x + w - a} ${y}H${x + w}V${y + a} M${x + w} ${y + h - a}V${y + h}H${x + w - a} M${x + a} ${y + h}H${x}V${y + h - a}`;
  return <path d={d} stroke={color} strokeWidth={width} fill="none" opacity={opacity} strokeLinecap="square" />;
};

const Still: React.FC<{
  view: CameraView;
  f: number;
  Scene: React.ComponentType<{
    f: number;
    live: boolean;
  }>;
}> = ({ view, f, Scene }) => (
  <div
    style={{
      position: "absolute",
      left: 960 / view.scale - view.cx,
      top: 540 / view.scale - view.cy,
      width: 1920,
      height: 1080,
      zoom: view.scale,
    }}
  >
    <Scene f={f} live={false} />
  </div>
);

export const PaparazziCamera: React.FC<PaparazziSceneProps> = ({
  title,
  description,
  brand,
  effectsBeforeCopy = false,
  views,
  focusRect,
  Scene,
}) => {
  const frame = useCurrentFrame();
  let seg = -1;
  for (let i = 0; i < FLASHES.length; i++) if (frame >= FLASHES[i]) seg = i;
  let settleScale = 1;
  let settleY = 0;
  let bloom = 0;
  if (seg >= 0) {
    const t = 1 - ramp(frame, FLASHES[seg], SETTLE, EASE.out);
    settleScale = 1 + 0.03 * t;
    settleY = -16 * t;
    bloom = 1 - ramp(frame, FLASHES[seg], BLOOM, EASE.out);
  }
  let flash = 0;
  for (const f of FLASHES) if (frame >= f && frame <= f + DECAY) flash = Math.max(flash, 0.95 * (1 - ramp(frame, f, DECAY, EASE.out)));
  const inFlash = FLASHES.some((f) => frame >= f && frame < f + DECAY);
  const jx = inFlash ? 2 * (hash(frame * 7 + 1) * 2 - 1) : 0;
  const jy = inFlash ? 2 * (hash(frame * 13 + 5) * 2 - 1) : 0;
  const liveP = ramp(frame, 0, F1, EASE.smooth);
  const liveScale = mix(1.04, 1.1, liveP);
  const holdPush = seg === 2 ? mix(1, 1.015, ramp(frame, F3 + SETTLE, 64, EASE.smooth)) : 1;

  const curView: CameraView = seg === -1 ? { scale: liveScale, cx: 960, cy: 540 } : views[seg];
  const nextIdx = seg + 1;
  let af: React.ReactNode = null;
  if (nextIdx < FLASHES.length) {
    const fNext = FLASHES[nextIdx];
    const start = nextIdx === 0 ? F1 - 9 : fNext - AF;
    if (frame >= start && frame < fNext) {
      const target: FocusRect = nextIdx === 0
        ? { x: focusRect.x - 30, y: focusRect.y - 30, w: focusRect.w + 60, h: focusRect.h + 60 }
        : viewRect(views[nextIdx]);
      const r = project(target, curView);
      const q = ramp(frame, start, 6, EASE.snappy);
      const k = mix(1.3, 1, q);
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const locked = frame >= fNext - 3;
      af = <Brackets x={cx-(r.w*k)/2} y={cy-(r.h*k)/2} w={r.w*k} h={r.h*k} color={locked ? GOLD : COLORS.platinum} width={locked ? 4 : 3} opacity={locked ? 1 : 0.85} arm={60} />;
    }
  }

  const serviceTitleIn = ramp(frame, 8, 14, EASE.out);
  const serviceDescriptionIn = ramp(frame, 20, 16, EASE.out);
  const serviceCopy = <div style={COPY_STYLE}>
    <div style={{ opacity: serviceTitleIn, transform: `translateY(${(1-serviceTitleIn)*10}px)` }}>
      <div style={{ color: GOLD, fontSize: FONT_SIZES.brand, fontWeight: 800, letterSpacing: 2, marginBottom: 10 }}>{brand}</div>
      <div style={{ fontSize: FONT_SIZES.title, lineHeight: 1.12, fontWeight: 800, letterSpacing: -0.8 }}>{title}</div>
    </div>

    <div style={{ marginTop: 14, maxWidth: 430, color: COLORS.silver, fontSize: FONT_SIZES.description, lineHeight: DESCRIPTION_LINE_HEIGHT, fontWeight: 500, opacity: serviceDescriptionIn, transform: `translateY(${(1 - serviceDescriptionIn) * 10}px)` }}>
      {description}
    </div>
  </div>;
  const cinematicEffects = <>
    <Vignette strength={[0.5,0.5,0.56,0.62][seg+1]} inner={0.42} color="#000000" />
    <Grain opacity={0.07} blend="soft-light" />
  </>;

  return <AbsoluteFill style={{ background: COLORS.background, overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, transformOrigin: "960px 540px", transform: `translate(${jx.toFixed(2)}px,${(jy+settleY).toFixed(2)}px) scale(${(settleScale*holdPush*1.012).toFixed(5)})`, filter: seg >= 0 ? `brightness(${(1+0.22*bloom).toFixed(3)}) contrast(${(1.06-0.14*bloom).toFixed(3)}) saturate(${(0.82-0.2*bloom).toFixed(3)})` : undefined }}>
      {seg === -1
        ? <div style={{ position: "absolute", inset: 0, transformOrigin: "960px 540px", transform: `scale(${liveScale.toFixed(5)})` }}><Scene f={frame} live /></div>
        : <Still view={views[seg]} f={FLASHES[seg]} Scene={Scene} />}
    </div>

    {effectsBeforeCopy && cinematicEffects}
    {serviceCopy}
    {!effectsBeforeCopy && cinematicEffects}
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{af}</svg>
    {flash > 0.004 && <AbsoluteFill style={{ opacity: flash, pointerEvents: "none", background: "radial-gradient(ellipse 80% 90% at 50% 45%, #ffffff 0%, #ffffff 45%, rgba(250,250,255,0.86) 100%)" }} />}
  </AbsoluteFill>;
};
