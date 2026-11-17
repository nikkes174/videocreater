import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BLACKPHANTOM_SERVICES, type BlackPhantomService } from "../../../config/blackphantomServices";
import { BLACKPHANTOM_STORIES } from "../../../config/blackphantomStories";
import { EASE, Grain, Vignette, mix, ramp } from "../../../vendor/videoShotcraft/demos/_fixtures/Polish";
import type { CameraView, FocusRect } from "../PaparazziCamera";
import { COLORS } from "../PaparazziCamera";

const CUTS = [30, 52, 70] as const;
const SETTLE = 6;
const SHAKE_DURATION = 4;
const AF = 8;
const VIEWPORT_TOP = 620;
const VIEWPORT_HEIGHT = 1040;
const VIEWPORT_CENTER_X = BLACKPHANTOM_STORIES.width / 2;
const VIEWPORT_CENTER_Y = VIEWPORT_HEIGHT / 2;

const VIEWS: readonly [CameraView, CameraView, CameraView] = [
  { scale: 0.82, cx: 960, cy: 566 },
  { scale: 1.02, cx: 960, cy: 566 },
  { scale: 1.23, cx: 960, cy: 566 },
];

const FOCUS_RECT: FocusRect = { x: 590, y: 176, w: 740, h: 780 };

const hash = (i: number) => {
  const s = Math.sin(i * 127.3 + 11.7) * 43758.5453;
  return s - Math.floor(s);
};

const project = (rect: FocusRect, view: CameraView) => ({
  x: (rect.x - view.cx) * view.scale + VIEWPORT_CENTER_X,
  y: (rect.y - view.cy) * view.scale + VIEWPORT_CENTER_Y + VIEWPORT_TOP,
  w: rect.w * view.scale,
  h: rect.h * view.scale,
});

const viewRect = (view: CameraView): FocusRect => ({
  x: view.cx - VIEWPORT_CENTER_X / view.scale,
  y: view.cy - VIEWPORT_CENTER_Y / view.scale,
  w: (BLACKPHANTOM_STORIES.width / view.scale),
  h: VIEWPORT_HEIGHT / view.scale,
});

const Brackets: React.FC<{ x: number; y: number; w: number; h: number; color: string; locked: boolean }> = ({ x, y, w, h, color, locked }) => {
  const arm = Math.min(50, w / 3, h / 3);
  const path = `M${x} ${y + arm}V${y}H${x + arm} M${x + w - arm} ${y}H${x + w}V${y + arm} M${x + w} ${y + h - arm}V${y + h}H${x + w - arm} M${x + arm} ${y + h}H${x}V${y + h - arm}`;
  return <path d={path} stroke={color} strokeWidth={locked ? 4 : 3} fill="none" opacity={locked ? 1 : 0.82} strokeLinecap="square" />;
};

type MobilePaparazziCameraProps = {
  service: BlackPhantomService;
  Scene: React.ComponentType<{ f: number; live: boolean }>;
};

export const MobilePaparazziCamera: React.FC<MobilePaparazziCameraProps> = ({ service, Scene }) => {
  const frame = useCurrentFrame();
  let segment = -1;
  for (let i = 0; i < CUTS.length; i++) if (frame >= CUTS[i]) segment = i;

  const settleProgress = segment < 0 ? 0 : ramp(frame, CUTS[segment], SETTLE, EASE.out);
  const settleScale = segment < 0 ? 1 : 1 + 0.03 * (1 - settleProgress);
  const settleY = segment < 0 ? 0 : -10 * (1 - settleProgress);
  const inShake = CUTS.some((cut) => frame >= cut && frame < cut + SHAKE_DURATION);
  const jx = inShake ? 2 * (hash(frame * 7 + 1) * 2 - 1) : 0;
  const jy = inShake ? 2 * (hash(frame * 13 + 5) * 2 - 1) : 0;
  const liveProgress = ramp(frame, 0, CUTS[0], EASE.smooth);
  const liveScale = mix(0.62, 0.72, liveProgress);
  const holdPush = segment === 2 ? mix(1, 1.015, ramp(frame, CUTS[2] + SETTLE, 64, EASE.smooth)) : 1;
  const currentView = segment < 0 ? { scale: liveScale, cx: 960, cy: 566 } : VIEWS[segment];
  const titleIn = ramp(frame, 8, 14, EASE.out);
  const descriptionIn = ramp(frame, 20, 16, EASE.out);

  let focusOverlay: React.ReactNode = null;
  const nextIndex = segment + 1;
  if (nextIndex < CUTS.length) {
    const nextCut = CUTS[nextIndex];
    const start = nextIndex === 0 ? CUTS[0] - 9 : nextCut - AF;
    if (frame >= start && frame < nextCut) {
      const target = nextIndex === 0
        ? { x: FOCUS_RECT.x - 30, y: FOCUS_RECT.y - 30, w: FOCUS_RECT.w + 60, h: FOCUS_RECT.h + 60 }
        : viewRect(VIEWS[nextIndex]);
      const rect = project(target, currentView);
      const p = ramp(frame, start, 6, EASE.snappy);
      const scale = mix(1.12, 1, p);
      const x = rect.x + rect.w / 2;
      const y = rect.y + rect.h / 2;
      const locked = frame >= nextCut - 3;
      focusOverlay = <Brackets x={x - (rect.w * scale) / 2} y={y - (rect.h * scale) / 2} w={rect.w * scale} h={rect.h * scale} color={locked ? COLORS.gold : COLORS.platinum} locked={locked} />;
    }
  }

  const layer = segment < 0 ? (
    <div style={{ position: "absolute", left: VIEWPORT_CENTER_X - currentView.cx * currentView.scale, top: VIEWPORT_CENTER_Y - currentView.cy * currentView.scale, width: 1920, height: 1080, transform: `scale(${currentView.scale})`, transformOrigin: "top left" }}>
      <Scene f={frame} live />
    </div>
  ) : (
    <div style={{ position: "absolute", left: VIEWPORT_CENTER_X - currentView.cx * currentView.scale, top: VIEWPORT_CENTER_Y - currentView.cy * currentView.scale, width: 1920, height: 1080, transform: `scale(${currentView.scale})`, transformOrigin: "top left" }}>
      <Scene f={CUTS[segment]} live={false} />
    </div>
  );

  return (
    <AbsoluteFill style={{ background: COLORS.background, color: COLORS.platinum, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 146, fontFamily: "Manrope, sans-serif", textShadow: "0 3px 22px rgba(0,0,0,.7)" }}>
        <div style={{ color: COLORS.gold, fontSize: 23, fontWeight: 800, letterSpacing: 2, opacity: titleIn, transform: `translateY(${(1 - titleIn) * 10}px)` }}>
          {service.number} · BLACKPHANTOM
        </div>
        <div style={{ marginTop: 15, maxWidth: 936, fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: -0.8, opacity: titleIn, transform: `translateY(${(1 - titleIn) * 10}px)` }}>
          {service.title}
        </div>
        <div style={{ marginTop: 16, maxWidth: 936, color: COLORS.silver, fontSize: 27, lineHeight: 1.38, fontWeight: 500, opacity: descriptionIn, transform: `translateY(${(1 - descriptionIn) * 10}px)` }}>
          {service.description}
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, top: VIEWPORT_TOP, width: BLACKPHANTOM_STORIES.width, height: VIEWPORT_HEIGHT, overflow: "hidden", borderRadius: 28, background: COLORS.background }}>
        <div style={{ position: "absolute", inset: 0, transformOrigin: `${VIEWPORT_CENTER_X}px ${VIEWPORT_CENTER_Y}px`, transform: `translate(${jx.toFixed(2)}px,${(jy + settleY).toFixed(2)}px) scale(${(settleScale * holdPush).toFixed(5)})` }}>
          {layer}
        </div>
      </div>

      <Vignette strength={[0.42, 0.48, 0.54, 0.6][segment + 1]} inner={0.42} color="#000000" />
      <Grain opacity={0.055} blend="soft-light" />
      <svg width={BLACKPHANTOM_STORIES.width} height={BLACKPHANTOM_STORIES.height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {focusOverlay}
      </svg>
    </AbsoluteFill>
  );
};
