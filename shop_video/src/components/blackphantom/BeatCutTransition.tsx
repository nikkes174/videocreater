import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const hash = (n: number) => { const x = Math.sin(n * 127.3 + 11.7) * 43758.5453; return x - Math.floor(x); };
export const getBeatCutMotion = (frame: number) => {
  const settle = interpolate(frame, [0, 6], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const flash = interpolate(frame, [0, 4], [0.95, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const active = frame >= 0 && frame < 4 ? 1 : 0;
  const brackets = interpolate(frame, [0, 2, 8, 12], [0, 0.8, 0.6, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const bloom = interpolate(frame, [0, 7], [0.2, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  return { scale: 1.03 - settle * 0.03, translateY: -16 * (1 - settle), flash, shakeX: active * 2 * (hash(frame * 7 + 1) * 2 - 1), shakeY: active * 2 * (hash(frame * 13 + 5) * 2 - 1), brackets, bloom };
};

export type CameraView = { scale: number; x: number; y: number };
export type ServiceCameraConfig = { wide: CameraView; detail: CameraView; closeup: CameraView };

export const SERVICE_CAMERAS: Record<string, ServiceCameraConfig> = {
  web: { wide: { scale: 1, x: 480, y: 540 }, detail: { scale: 1.24, x: 438, y: 475 }, closeup: { scale: 1.48, x: 500, y: 400 } },
  automation: { wide: { scale: 1, x: 480, y: 540 }, detail: { scale: 1.22, x: 505, y: 525 }, closeup: { scale: 1.48, x: 680, y: 620 } },
  commerce: { wide: { scale: 1, x: 480, y: 540 }, detail: { scale: 1.24, x: 342, y: 385 }, closeup: { scale: 1.48, x: 660, y: 675 } },
  software: { wide: { scale: 1, x: 480, y: 540 }, detail: { scale: 1.22, x: 485, y: 450 }, closeup: { scale: 1.46, x: 320, y: 650 } },
};

export const getServiceCamera = (frame: number, config: ServiceCameraConfig) => {
  const cuts = [22, 42];
  const shotIndex = frame < cuts[0] ? 0 : frame < cuts[1] ? 1 : 2;
  const shotStart = shotIndex === 0 ? 0 : cuts[shotIndex - 1];
  const localFrame = frame - shotStart;
  const current = [config.wide, config.detail, config.closeup][shotIndex];
  const pullback = interpolate(frame, [65, 82], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const x = current.x + (config.wide.x - current.x) * pullback;
  const y = current.y + (config.wide.y - current.y) * pullback;
  const scale = current.scale + (config.wide.scale - current.scale) * pullback;
  const cutStart = shotIndex === 0 ? -100 : shotStart;
  const settle = shotIndex === 0 ? interpolate(frame, [0, 6], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : interpolate(localFrame, [0, 6], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const cutMotion = shotIndex === 0 ? { flash: 0, shakeX: 0, shakeY: 0, bloom: 0 } : getBeatCutMotion(localFrame);
  const nextShotStart = shotIndex === 0 ? 22 : shotIndex === 1 ? 42 : 200;
  const focus = nextShotStart < 100 ? interpolate(frame, [nextShotStart - 8, nextShotStart - 2, nextShotStart], [0, 1, 0.7], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0;
  return {
    shotIndex, shotStart, localFrame,
    transform: `translate(${(480 - x * scale + cutMotion.shakeX).toFixed(2)}px,${(540 - y * scale - 16 * (1 - settle) + cutMotion.shakeY).toFixed(2)}px) scale(${(scale * (1.03 - settle * 0.03)).toFixed(5)})`,
    flash: cutMotion.flash, bloom: cutMotion.bloom, focus,
  };
};

export const BeatCutTransition: React.FC<{ flash: number; focus: number; focusScale?: number }> = ({ flash, focus, focusScale = 1 }) => <>
  {focus > 0 && <svg viewBox="0 0 960 1080" style={{ position: "absolute", left: 960, top: 0, width: 960, height: 1080, pointerEvents: "none", opacity: focus }}>
    <path d={`M${480-210*focusScale} ${540-150*focusScale+44}V${540-150*focusScale}H${480-210*focusScale+44} M${480+210*focusScale-44} ${540-150*focusScale}H${480+210*focusScale}V${540-150*focusScale+44} M${480+210*focusScale} ${540+150*focusScale-44}V${540+150*focusScale}H${480+210*focusScale-44} M${480-210*focusScale+44} ${540+150*focusScale}H${480-210*focusScale}V${540+150*focusScale-44}`} fill="none" stroke="#C8A66A" strokeWidth="3" />
  </svg>}
  {flash > 0.004 && <AbsoluteFill style={{ pointerEvents: "none", opacity: flash, background: "radial-gradient(ellipse 78% 86% at 50% 46%, #fff 0%, rgba(255,255,255,.96) 42%, rgba(241,242,244,.66) 100%)" }} />}
</>;
