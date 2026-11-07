import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { BlackPhantomService } from "../../config/blackphantomServices";
import { BLACKPHANTOM_COLORS as C } from "../../config/blackphantom";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
export const ServiceTypography: React.FC<{ service: BlackPhantomService }> = ({ service }) => {
  const frame = useCurrentFrame();
  const reveal = (from: number, to: number) => interpolate(frame, [from, to], [0, 1], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 3) });
  const number = reveal(4, 16); const title = reveal(7, 22); const desc = reveal(14, 31);
  return <div style={{ position: "absolute", left: 128, top: 0, bottom: 0, width: 800, display: "flex", flexDirection: "column", justifyContent: "center", color: C.platinum, fontFamily: "Manrope, sans-serif", transform: `translateY(${(1 - title) * 18}px)` }}>
    <style>{`@font-face{font-family:Manrope;src:url("/assets/fonts/manrope-800-cyrillic.woff2") format("woff2");font-weight:800;unicode-range:U+0400-052F,U+2000-206F}@font-face{font-family:Manrope;src:url("/assets/fonts/manrope-500-cyrillic.woff2") format("woff2");font-weight:500;unicode-range:U+0400-052F,U+2000-206F}@font-face{font-family:Manrope;src:url("/assets/fonts/manrope-800-latin.woff2") format("woff2");font-weight:800;unicode-range:U+0000-00FF}@font-face{font-family:Manrope;src:url("/assets/fonts/manrope-500-latin.woff2") format("woff2");font-weight:500;unicode-range:U+0000-00FF}@font-face{font-family:Unbounded;src:url("/assets/fonts/unbounded-700-latin.woff2") format("woff2");font-weight:700;unicode-range:U+0000-00FF}`}</style>
    <div style={{ display: "flex", alignItems: "center", gap: 20, opacity: number, transform: `translateY(${(1-number)*14}px)` }}>
      <span style={{ fontFamily: "Unbounded, sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: 2, color: C.gold }}>{service.number} / 04</span>
      <span style={{ width: 62, height: 1, background: C.gold, opacity: 0.7 }} />
    </div>
    <h1 style={{ fontFamily: "Manrope, sans-serif", fontSize: service.id === "automation" ? 65 : 76, lineHeight: 1.08, letterSpacing: -2.5, fontWeight: 800, maxWidth: 790, margin: "32px 0 24px", opacity: title, textShadow: "0 4px 34px rgba(0,0,0,.28)" }}>{service.title}</h1>
    <p style={{ maxWidth: 735, margin: 0, color: C.silver, fontSize: 31, lineHeight: 1.45, fontWeight: 500, opacity: desc, transform: `translateY(${(1-desc)*14}px)` }}>{service.description}</p>
    <div style={{ position: "absolute", left: 0, bottom: 82, width: 720, opacity: reveal(28, 44) }}>
      <div style={{ height: 1, background: "linear-gradient(90deg, rgba(200,166,106,.75), rgba(200,166,106,0))" }} />
      <div style={{ marginTop: 16, color: "rgba(182,190,200,.58)", fontSize: 14, letterSpacing: 3, fontWeight: 700 }}>BLACKPHANTOM</div>
    </div>
  </div>;
};
