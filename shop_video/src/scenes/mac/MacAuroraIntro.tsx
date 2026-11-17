import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { MAC_COLORS as C } from "../../config/macTheme";
import { MacFontFaces } from "../../components/mac/MacFontFaces";

const p = (f: number, a: number, b: number, easing = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
const DARK = [9, 6, 18]; const LIGHT = [239, 236, 243];

export const MacAuroraIntro: React.FC = () => {
  const f = useCurrentFrame();
  const rise = p(f, 3, 96);
  const flip = p(f, 72, 90, Easing.inOut(Easing.quad));
  const squash = p(f, 72, 90, Easing.inOut(Easing.quad));
  const bg = mix(LIGHT, DARK, flip);
  const layers = [
    { left: "-8%", bottom: "-22%", width: "80%", height: "86%", color: "rgba(88,42,133,.78)", blur: 90, drift: Math.sin(f * 0.035) * 2 },
    { left: "23%", bottom: "-17%", width: "62%", height: "64%", color: "rgba(148,98,200,.6)", blur: 80, drift: Math.sin(f * 0.027 + 1.3) * 5 },
    { left: "41%", bottom: "-10%", width: "45%", height: "52%", color: "rgba(213,175,99,.75)", blur: 70, drift: Math.sin(f * 0.044 + 2.1) * 8 },
    { left: "69%", bottom: "-20%", width: "54%", height: "62%", color: "rgba(240,155,88,.48)", blur: 84, drift: Math.sin(f * 0.031 + 4) * 6 },
  ];
  const title = (text: string, start: number, end: number, color: string, size: number, weight = 700, offsetY = 0) => {
    const enter = p(f, start, start + 8, Easing.out(Easing.cubic));
    const leave = end === 150 ? 1 : 1 - p(f, end - 7, end, Easing.in(Easing.quad));
    const a = enter * leave;
    return <div style={{ position: "absolute", width: "100%", textAlign: "center", opacity: a, filter: `blur(${(1 - a) * 9}px)`, transform: `translateY(${offsetY + (1 - enter) * 13}px) scale(${1 + p(f, start, end) * 0.025})`, color, fontSize: size, lineHeight: 1.16, fontWeight: weight, letterSpacing: text === "М.А.С" ? ".08em" : "-.025em", textShadow: flip > .5 ? `0 0 35px ${C.gold}55` : "none" }}>{text}</div>;
  };
  return <AbsoluteFill style={{ overflow: "hidden", background: bg, color: C.deepPurple, fontFamily: "Manrope, sans-serif", transition: "none" }}>
    <MacFontFaces />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 55% at 50% 8%, rgba(255,255,255,${(1-flip)*.58}), transparent 72%), radial-gradient(ellipse 85% 55% at 50% 0%, rgba(148,98,200,${flip*.16}), transparent 72%)` }} />
    <div style={{ position: "absolute", inset: "-10%", transform: `translateY(${32-rise*38}%) scale(${1+rise*.25-squash*.06})`, opacity: 1-flip*.58, mixBlendMode: flip > .5 ? "screen" : "multiply" }}>
      {layers.map((l, i) => <div key={i} style={{ position: "absolute", borderRadius: "50%", filter: `blur(${l.blur}px)`, left: l.left, bottom: l.bottom, width: l.width, height: l.height, transform: `translateX(${l.drift}%)`, background: `radial-gradient(ellipse, ${l.color} 0%, transparent 68%)` }} />)}
    </div>
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 100px" }}>
      {title("М.А.С", 0, 30, C.deepPurple, 112, 800)}
      {title("Лучшие выбирают лучших", 30, 72, C.deepPurple, 66, 600)}
      {title("Будь рядом с лучшими", 90, 128, C.platinum, 76, 700, -48)}
      {title("Они будут двигать тебя вперёд", 112, 150, C.brightGold, 39, 500, 52)}
    </div>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 38%, rgba(8,5,15,.48) 100%)", pointerEvents: "none" }} />
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .09, mixBlendMode: "soft-light", pointerEvents: "none" }}><filter id="mac-grain"><feTurbulence type="fractalNoise" baseFrequency=".78" numOctaves="2" stitchTiles="stitch" /></filter><rect width="100%" height="100%" filter="url(#mac-grain)" /></svg>
  </AbsoluteFill>;
};
