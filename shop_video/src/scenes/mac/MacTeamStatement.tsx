import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { MAC_STATEMENTS } from "../../config/macContent";
import { MAC_COLORS as C } from "../../config/macTheme";
import { MacFontFaces } from "../../components/mac/MacFontFaces";

const WINDOWS = [[0, 75], [65, 145], [135, 210]] as const;
const GRAD = `linear-gradient(92deg, ${C.violet} 0%, ${C.gold} 35%, ${C.brightGold} 65%, ${C.violet} 100%)`;
const PAD = 90;
const at = (percent: number) => `calc(${PAD}px + (100% - ${PAD * 2}px) * ${Math.max(-20, Math.min(120, percent)) / 100})`;
const seeded = Array.from({ length: 12 }, (_, i) => ({ x: 14 + ((i * 73) % 72), y: 20 + ((i * 47) % 60), dx: ((i * 19) % 13) - 6, delay: (i * 11) % 55, left: i % 2 === 0 }));

export const MacTeamStatement: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: `radial-gradient(ellipse 72% 70% at 50% 47%, #1b1127, ${C.background} 72%)`, fontFamily: "Manrope, sans-serif", overflow: "hidden" }}>
    <MacFontFaces />
    <div style={{ position: "absolute", width: 900, height: 340, left: 510, top: 365, borderRadius: "50%", background: `radial-gradient(closest-side, ${C.violet}38, ${C.gold}18 55%, transparent 80%)`, filter: "blur(28px)" }} />
    <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + .025 * interpolate(f, [0, 210], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease) })})`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 30, padding: "0 120px" }}>
      {MAC_STATEMENTS.map((line, i) => {
        const [a, b] = WINDOWS[i];
        const enter = interpolate(f, [a, a + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
        const fill = interpolate(f, [a + 10, a + 35], [-24, 124], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
        const glow = f > a + 35 ? .7 + .08 * Math.sin((f - a) * .12) : .6;
        const fillMask = `linear-gradient(90deg, #000 0%, #000 ${at(fill - 5)}, transparent ${at(fill + 5)})`;
        const headMask = `linear-gradient(90deg, transparent 0%, transparent ${at(fill - 12)}, #000 ${at(fill - 6)}, #000 ${at(fill - 1)}, transparent ${at(fill + 3)})`;
        const trailFade = interpolate(f, [a + 35, a + 45], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const textStyle: React.CSSProperties = { fontWeight: 800, fontSize: 88, lineHeight: 1.18, letterSpacing: "-.035em", whiteSpace: "nowrap", textAlign: "center", color: "transparent", backgroundImage: GRAD, backgroundSize: "100% 100%", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" };
        return <div key={line} style={{ position: "relative", width: 1380, textAlign: "center", whiteSpace: "nowrap", opacity: enter, transform: `translateY(${(1-enter)*34}px)`, fontFamily: "inherit", fontWeight: 800, fontSize: 88, lineHeight: 1.18, letterSpacing: "-.035em", color: "transparent", backgroundImage: GRAD, backgroundSize: "100% 100%", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", WebkitMaskImage: `linear-gradient(90deg, #000 ${fill-12}%, transparent ${fill+4}%)`, maskImage: `linear-gradient(90deg, #000 ${fill-12}%, transparent ${fill+4}%)`, filter: `blur(${(1-enter)*10}px) drop-shadow(0 0 ${12*glow}px rgba(213,175,99,.32))` }}>{line}
          <span aria-hidden style={{ position: "absolute", left: -PAD, right: -PAD, top: -PAD, bottom: -PAD, padding: PAD, pointerEvents: "none", opacity: glow * trailFade * .5, WebkitMaskImage: fillMask, maskImage: fillMask }}><span style={{ ...textStyle, display: "block", filter: "blur(20px)" }}>{line}</span></span>
          <span aria-hidden style={{ position: "absolute", left: -PAD, right: -PAD, top: -PAD, bottom: -PAD, padding: PAD, pointerEvents: "none", opacity: trailFade * (f >= a + 10 && f <= a + 42 ? .82 : 0), WebkitMaskImage: headMask, maskImage: headMask }}><span style={{ ...textStyle, display: "block", filter: `drop-shadow(0 0 8px ${C.brightGold})` }}>{line}</span></span>
        </div>;
      })}
    </div>
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }}>
      <defs><filter id="boltGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      {seeded.map((bolt, i) => { const age = f - (35 + bolt.delay); const alpha = age >= 0 && age < 5 ? Math.sin((age / 5) * Math.PI) * .5 : 0; const x = bolt.x * 19.2; const y = bolt.y * 10.8; return alpha > 0 ? <path key={i} d={bolt.left ? `M${x} ${y} l${bolt.dx} -26 l${-bolt.dx*1.5} 17 l${bolt.dx} -21` : `M${x} ${y} l${bolt.dx} 25 l${-bolt.dx} -14 l${bolt.dx*1.5} 23`} fill="none" stroke={i%2 ? C.violet : C.brightGold} strokeWidth="2" opacity={alpha} filter="url(#boltGlow)"/> : null; })}
    </svg>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,.35) 100%)", pointerEvents: "none" }} />
  </AbsoluteFill>;
};
