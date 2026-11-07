import React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import type { BlackPhantomService } from "../../config/blackphantomServices";
import { ServiceIllustration } from "./ServiceIllustration";
import { getServiceCamera, getServiceFlash } from "./BeatCutTransition";

export const SERVICE_LAYOUT = {
  text: { x: 112, y: 260, width: 770 },
  visual: { x: 1000, y: 185, width: 820, height: 680 },
} as const;

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const easeOut = Easing.out(Easing.cubic);
const progress = (frame: number, start: number, end: number) => interpolate(frame, [start, end], [0, 1], { ...clamp, easing: easeOut });

export const ServiceCard: React.FC<{ service: BlackPhantomService; index: number }> = ({ service, index }) => {
  const frame = useCurrentFrame();
  const camera = getServiceCamera(frame);
  const flash = getServiceFlash(frame, index === 0);
  const titleIn = progress(frame, 5, 20);
  const descriptionIn = progress(frame, 16, 36);
  const visualIn = progress(frame, 3, 22);

  return <AbsoluteFill style={{ overflow: "hidden", background: "linear-gradient(115deg,#07090C 0%,#11151B 65%,#07090C 100%)", color: "#F1F2F4", fontFamily: "Manrope, sans-serif" }}>
    <style>{`@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-800-cyrillic.woff2")}") format("woff2");font-weight:800;unicode-range:U+0400-052F,U+2000-206F}@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-800-latin.woff2")}") format("woff2");font-weight:800;unicode-range:U+0000-00FF}@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-500-cyrillic.woff2")}") format("woff2");font-weight:500;unicode-range:U+0400-052F,U+2000-206F}@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-500-latin.woff2")}") format("woff2");font-weight:500;unicode-range:U+0000-00FF}`}</style>
    <div style={{ position: "absolute", left: 930, top: 160, width: 870, height: 750, background: "radial-gradient(ellipse,rgba(200,166,106,.09),transparent 70%)", pointerEvents: "none" }} />

    <div style={{ position: "absolute", left: SERVICE_LAYOUT.text.x, top: SERVICE_LAYOUT.text.y, width: SERVICE_LAYOUT.text.width }}>
      <div style={{ fontSize: 25, fontWeight: 700, color: "#C8A66A", letterSpacing: 4, opacity: titleIn }}>{service.number} / 04</div>
      <h1 style={{ margin: "30px 0 26px", fontSize: service.id === "automation" ? 62 : 75, fontWeight: 800, letterSpacing: -2, lineHeight: 1.13, overflowWrap: "normal", opacity: titleIn, transform: `translateY(${(1-titleIn)*22}px)` }}>{service.title}</h1>
      <p style={{ margin: 0, maxWidth: 745, fontSize: 29, fontWeight: 500, lineHeight: 1.48, color: "#B6BEC8", opacity: descriptionIn, transform: `translateY(${(1-descriptionIn)*18}px)` }}>{service.description}</p>
    </div>

    <div style={{ position: "absolute", left: SERVICE_LAYOUT.visual.x, top: SERVICE_LAYOUT.visual.y, width: SERVICE_LAYOUT.visual.width, height: SERVICE_LAYOUT.visual.height, overflow: "hidden", opacity: visualIn }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%", transform: `translateY(${camera.translateY}px) scale(${camera.scale})` }}>
        <ServiceIllustration id={service.id} frame={frame} />
      </div>
    </div>

    <div style={{ position: "absolute", left: 112, bottom: 78, fontSize: 18, fontWeight: 700, letterSpacing: 3, color: "#C8A66A" }}>BLACKPHANTOM</div>
    {flash > 0.002 && <AbsoluteFill style={{ background: "radial-gradient(ellipse at 65% 50%,white 0%,rgba(241,242,244,.85) 50%,rgba(241,242,244,.25) 100%)", opacity: flash, pointerEvents: "none" }} />}
  </AbsoluteFill>;
};
