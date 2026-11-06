import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BLACKPHANTOM_COLORS as C } from "../../config/blackphantom";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = (value: number) => value * value * (3 - 2 * value);
const outCubic = (value: number) => 1 - Math.pow(1 - value, 3);
const smooth = (frame: number, from: number, to: number) =>
  ease(interpolate(frame, [from, to], [0, 1], clamp));

const arcPath = (cx: number, cy: number, radius: number, start: number, end: number) => {
  const point = (angle: number) => [cx + radius * Math.cos((angle * Math.PI) / 180), cy + radius * Math.sin((angle * Math.PI) / 180)];
  const [x0, y0] = point(start);
  const [x1, y1] = point(end);
  return `M${x0},${y0} A${radius},${radius} 0 ${Math.abs(end - start) > 180 ? 1 : 0} 1 ${x1},${y1}`;
};

const ArcPair: React.FC<{ rotation: number; opacity: number; stroke: string; width: number; blur?: number }> = ({ rotation, opacity, stroke, width, blur = 0 }) => (
  <svg viewBox="0 0 30 30" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", transform: `rotate(${rotation}deg)` }}>
    {[[-32, 122], [148, 302]].map(([start, end], index) => (
      <path key={index} d={arcPath(15, 15, 10.5, start, end)} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" opacity={opacity} style={blur ? { filter: `blur(${blur}px)` } : undefined} />
    ))}
  </svg>
);

export const LogoShrinkLockup: React.FC<{ logoSrc: string }> = ({ logoSrc }) => {
  const frame = useCurrentFrame();
  const t = frame / 89;
  const scaleAt = (time: number) => {
    const progress = smooth(time * 89, 2, 25);
    const brake = Math.sin(smooth(time * 89, 23, 33) * Math.PI) * 0.06;
    return interpolate(progress, [0, 1], [5.4, 1]) * (1 + brake);
  };
  const scale = scaleAt(t);
  const spin = -150 * outCubic(Math.min(1, Math.max(0, t / (0.3 * 89))));
  const settle = smooth(frame, 30, 43);
  const wordProgress = (frame - 39) / 21;
  const brandWidth = 960;
  const logoSize = 196;
  const gap = 34;
  const shift = settle * (-(brandWidth + gap) / 2 + logoSize / 2);
  const ringOut = 1 - smooth(frame, 8, 26);
  const markIn = smooth(frame, 22, 30);
  const wave = outCubic(Math.min(1, Math.max(0, (frame - 24) / 17)));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: `radial-gradient(ellipse 48% 52% at 50% 47%, rgba(182,190,200,0.055), transparent 75%), linear-gradient(180deg, ${C.backgroundTop} 0%, ${C.background} 72%)` }}>
      <style>{`@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-800-cyrillic.woff2")}") format("woff2");font-weight:800;unicode-range:U+0400-052F,U+2000-206F,U+20B4,U+2DE0-2DFF,U+A640-A69F}@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-800-latin.woff2")}") format("woff2");font-weight:800;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-500-cyrillic.woff2")}") format("woff2");font-weight:500;unicode-range:U+0400-052F,U+2000-206F,U+20B4,U+2DE0-2DFF,U+A640-A69F}`}</style>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 85% 82% at 50% 48%, transparent 42%, rgba(0,0,0,0.5) 100%)" }} />
      <div style={{ position: "absolute", left: `calc(50% + ${shift}px - 150px)`, top: "calc(50% - 150px)", width: 300, height: 300, borderRadius: "50%", opacity: 0.28 - 0.17 * smooth(frame, 30, 52), background: `radial-gradient(circle, ${C.goldGlow}, rgba(200,166,106,0.08) 38%, transparent 72%)`, filter: "blur(8px)" }} />
      {frame >= 24 && frame < 42 && <div style={{ position: "absolute", left: `calc(50% - ${16 + wave * 58}px)`, top: `calc(50% - ${16 + wave * 58}px)`, width: 32 + wave * 116, height: 32 + wave * 116, borderRadius: "50%", boxSizing: "border-box", border: `1px solid rgba(241,242,244,${0.38 * (1 - wave)})`, boxShadow: `0 0 14px rgba(200,166,106,${0.22 * (1 - wave)})` }} />}

      <div style={{ position: "absolute", left: "50%", top: "50%", width: 30, height: 30, margin: "-15px 0 0 -15px", transform: `translateX(${shift}px) scale(${scale})`, opacity: 1 - markIn }}>
        <div style={{ position: "absolute", inset: 0, transform: `rotate(${spin}deg)` }}>
          <ArcPair rotation={0} opacity={ringOut} stroke={C.gold} width={6} blur={3} />
          <ArcPair rotation={0} opacity={ringOut} stroke={C.platinum} width={2.3} />
          <div style={{ position: "absolute", inset: 4.5, border: `5px solid ${C.platinum}`, borderRadius: "50%", opacity: smooth(frame, 9, 26) * (1 - markIn) }} />
        </div>
      </div>

      <div style={{ position: "absolute", left: "50%", top: "50%", width: logoSize, height: logoSize, margin: `${-logoSize / 2}px 0 0 ${-logoSize / 2}px`, transform: `translateX(${shift}px)`, opacity: markIn, filter: "drop-shadow(0 0 20px rgba(200,166,106,0.12))" }}>
        <Img src={logoSrc} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>

      <div style={{ position: "absolute", left: `calc(50% + ${-(brandWidth + gap) / 2 + logoSize + gap}px)`, top: "50%", width: brandWidth - logoSize - gap, height: logoSize, marginTop: -logoSize / 2, display: "flex", alignItems: "center", justifyContent: "flex-start", whiteSpace: "nowrap", gap: 1 }}>
        {[..."BLACKPHANTOM"].map((letter, index) => {
          const progress = outCubic(Math.min(1, Math.max(0, (wordProgress - index / 12) * 2.1)));
          return <span key={index} style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 82, letterSpacing: 3.5, color: C.platinum, opacity: progress, transform: `translateX(${(1 - progress) * 12}px)`, filter: `blur(${(1 - progress) * 2}px)`, textShadow: "0 0 24px rgba(241,242,244,0.08)" }}>{letter}</span>;
        })}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: "calc(50% + 153px)", textAlign: "center", fontFamily: "Manrope, sans-serif", fontSize: 27, fontWeight: 500, letterSpacing: 9, color: C.gold, opacity: smooth(frame, 60, 70), transform: `translateY(${(1 - smooth(frame, 60, 71)) * 7}px)` }}>IT-КОМПАНИЯ</div>
    </div>
  );
};
