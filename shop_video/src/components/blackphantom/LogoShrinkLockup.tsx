import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BLACKPHANTOM_COLORS as C } from "../../config/blackphantom";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (v: number, from: number, to: number) => from + (to - from) * v;
const seg = (t: number, from: number, to: number, ease: (v: number) => number = (v) => v) => ease(clamp01((t - from) / (to - from)));
const outCubic = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);
const inOutCubic = (v: number) => v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
const inOutQuad = (v: number) => v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2;
const outQuad = (v: number) => 1 - (1 - v) * (1 - v);

const arcPath = (cx: number, cy: number, radius: number, start: number, end: number) => {
  const point = (angle: number) => [cx + radius * Math.cos((angle * Math.PI) / 180), cy + radius * Math.sin((angle * Math.PI) / 180)];
  const [x0, y0] = point(start);
  const [x1, y1] = point(end);
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${radius},${radius} 0 ${Math.abs(end - start) > 180 ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
};

const Arcs: React.FC<{ rotation: number; opacity: number; width: number; blur?: number; color: string }> = ({ rotation, opacity, width, blur = 0, color }) => (
  <svg viewBox="0 0 30 30" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", transform: `rotate(${rotation}deg)` }}>
    {[[-32, 122], [148, 302]].map(([start, end], index) => <path key={index} d={arcPath(15, 15, 10.5, start, end)} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} style={blur ? { filter: `blur(${blur}px)` } : undefined} />)}
  </svg>
);

export const LogoShrinkLockup: React.FC<{ logoSrc: string }> = ({ logoSrc }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 89;
  const DT = 1 / 89;
  const designScale = Math.min(width / 480, height / 270);
  const iconSize = 30 * designScale;
  const gap = 8 * designScale;
  const wordmark = "BLACKPHANTOM";
  const STAGGER = (0.7 - 0.46) / wordmark.length;

  // Direct timing/easing port of video-shotcraft's 132-frame source, expressed in normalized time.
  const scaleAt = (time: number) => {
    const k = seg(time, 0.02, 0.28, inOutCubic);
    const brake = Math.sin(seg(time, 0.26, 0.37) * Math.PI) * 0.06;
    return lerp(k, 5.4, 1) * (1 + brake);
  };
  const spinAt = (time: number) => -150 * outCubic(time / 0.3);
  const s = scaleAt(t);
  const spin = spinAt(t);
  const shiftProgress = seg(t, 0.34, 0.47, inOutCubic);
  const heal = seg(t, 0.1, 0.28, inOutQuad);
  const markIn = seg(t, 0.24, 0.32, inOutQuad);
  const ds = Math.abs(scaleAt(t) - scaleAt(t - DT));
  const trail = Math.min(1, ds / 0.35);
  const wave = seg(t, 0.28, 0.46, outCubic);
  const haloR = lerp(seg(t, 0.02, 0.3, inOutCubic), 150, 34) * designScale;
  const haloA = 0.5 - 0.32 * seg(t, 0.3, 0.5, outCubic);

  // A flex lockup supplies its actual word width; the icon shift is derived from that measured width.
  // 22px/700 Manrope source size, scaled with the design stage.
  const wordFontSize = 22 * designScale;
  // Manrope 700 uppercase average advance plus tracking gives a predictable pre-layout estimate.
  const approximateWordWidth = (wordFontSize * 9.1) + 11 * 0.66 * designScale;
  const shift = shiftProgress * (-(iconSize + gap + approximateWordWidth) / 2 + iconSize / 2);
  const lockupWidth = iconSize + gap + approximateWordWidth;
  const wordLeft = -(lockupWidth / 2) + iconSize + gap;

  const icon = (scale: number, rotation: number, opacity: number, ghost = false) => (
    <div style={{ position: "absolute", left: "50%", top: "50%", width: iconSize, height: iconSize, margin: `${-iconSize / 2}px 0 0 ${-iconSize / 2}px`, transform: `translateX(${shift}px) scale(${scale})`, opacity }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", inset: 0, transform: `rotate(${rotation}deg)` }}>
          <Arcs rotation={0} opacity={1 - heal} width={6.5 * designScale} blur={2.5 * designScale} color={C.gold} />
          {!ghost && <Arcs rotation={0} opacity={(1 - heal * 0.75) * (1 - markIn)} width={3.4 * designScale} color={C.platinum} />}
          {!ghost && <div style={{ position: "absolute", inset: "15%", border: `${5.5 * designScale}px solid ${C.platinum}`, borderRadius: "50%", opacity: heal * (1 - markIn) }} />}
        </div>
        {!ghost && <Img src={logoSrc} style={{ position: "absolute", left: "-22.5%", top: "-22.5%", width: "145%", height: "145%", objectFit: "contain", opacity: markIn }} />}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: `radial-gradient(ellipse 48% 52% at 50% 47%, rgba(182,190,200,0.055), transparent 75%), linear-gradient(180deg, ${C.backgroundTop} 0%, ${C.background} 72%)` }}>
      <style>{`@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-800-cyrillic.woff2")}") format("woff2");font-weight:800;unicode-range:U+0400-052F,U+2000-206F,U+20B4,U+2DE0-2DFF,U+A640-A69F}@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-800-latin.woff2")}") format("woff2");font-weight:800;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-500-cyrillic.woff2")}") format("woff2");font-weight:500;unicode-range:U+0400-052F,U+2000-206F,U+20B4,U+2DE0-2DFF,U+A640-A69F}`}</style>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 85% 82% at 50% 48%, transparent 42%, rgba(0,0,0,0.5) 100%)" }} />
      <div style={{ position: "absolute", left: `calc(50% + ${shift}px - ${haloR}px)`, top: `calc(50% - ${haloR}px)`, width: haloR * 2, height: haloR * 2, borderRadius: "50%", opacity: haloA, background: `radial-gradient(circle, ${C.goldGlow} 0%, rgba(200,166,106,0.12) 38%, transparent 70%)` }} />
      {wave > 0 && wave < 1 && <div style={{ position: "absolute", left: `calc(50% - ${lerp(wave, 16, 70) * designScale}px)`, top: `calc(50% - ${lerp(wave, 16, 70) * designScale}px)`, width: lerp(wave, 32, 140) * designScale, height: lerp(wave, 32, 140) * designScale, borderRadius: "50%", boxSizing: "border-box", border: `${lerp(wave, 0.9, 0.25) * designScale}px solid rgba(241,242,244,${(0.55 * (1 - wave)).toFixed(3)})`, boxShadow: `0 0 ${lerp(wave, 4, 10) * designScale}px rgba(200,166,106,${(0.3 * (1 - wave)).toFixed(3)})` }} />}
      {trail > 0.02 && icon(scaleAt(t - 2 * DT), spinAt(t - 2 * DT), 0.16 * trail, true)}
      {trail > 0.02 && icon(scaleAt(t - DT), spinAt(t - DT), 0.3 * trail, true)}
      {icon(s, spin, 1)}

      <div style={{ position: "absolute", left: `calc(50% + ${wordLeft}px)`, top: "50%", height: iconSize, marginTop: -iconSize / 2, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
        {[...wordmark].map((letter, index) => {
          const lk = seg(t, 0.46 + index * STAGGER, 0.46 + index * STAGGER + 0.1, outCubic);
          return <span key={index} style={{ color: C.platinum, font: `700 ${wordFontSize}px/1 Manrope, sans-serif`, letterSpacing: 0.66 * designScale, opacity: lk, transform: `translateX(${lerp(lk, 8 * designScale, 0)}px)`, filter: lk < 0.999 ? `blur(${lerp(lk, 2.5 * designScale, 0).toFixed(2)}px)` : undefined, textShadow: "0 0 12px rgba(241,242,244,0.12)" }}>{letter}</span>;
        })}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: `calc(50% + ${34 * designScale}px)`, textAlign: "center", color: C.gold, font: `600 ${12.5 * designScale}px/1 Manrope, sans-serif`, letterSpacing: 2.6 * designScale, opacity: seg(t, 0.72, 0.84, outQuad), transform: `translateY(${lerp(seg(t, 0.72, 0.86, outCubic), 3 * designScale, 0)}px)` }}>IT-КОМПАНИЯ</div>
    </AbsoluteFill>
  );
};
