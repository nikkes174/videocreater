import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { EASE, Grain, Vignette, mix, ramp } from "../../_fixtures/Polish";

/**
 * Adapted from video-shotcraft PaparazziFlash.tsx.
 * Keeps its three hard-cut stills, focus projection/brackets, flash decay,
 * deterministic shutter shake, exposure bloom, settle, and hold push.
 * Website artwork and all BLACKPHANTOM copy are project-specific.
 */
export const PAPARAZZI_FLASH_DURATION = 150;

const COLORS = {
  background: "#07090C",
  graphite: "#151B22",
  platinum: "#F1F2F4",
  silver: "#B6BEC8",
  gold: "#C8A66A",
} as const;
const GOLD = COLORS.gold;
const F1 = 30;
const F2 = 52;
const F3 = 70;
const FLASHES = [F1, F2, F3];
const SETTLE = 6;
const DECAY = 4;
const BLOOM = 7;
const AF = 8;

const hash = (i: number) => {
  const s = Math.sin(i * 127.3 + 11.7) * 43758.5453;
  return s - Math.floor(s);
};

type View = { scale: number; cx: number; cy: number };
const VIEW_WIDE: View = { scale: 1.0, cx: 960, cy: 540 };
const VIEW_CARD: View = { scale: 1.6, cx: 960, cy: 466 };
const VIEW_DETAIL: View = { scale: 2.8, cx: 1161, cy: 517 };
const STILLS = [VIEW_WIDE, VIEW_CARD, VIEW_DETAIL];

const project = (r: { x: number; y: number; w: number; h: number }, v: View) => ({
  x: (r.x - v.cx) * v.scale + 960,
  y: (r.y - v.cy) * v.scale + 540,
  w: r.w * v.scale,
  h: r.h * v.scale,
});
const viewRect = (v: View) => ({
  x: v.cx - 960 / v.scale,
  y: v.cy - 540 / v.scale,
  w: 1920 / v.scale,
  h: 1080 / v.scale,
});

const Brackets: React.FC<{ x: number; y: number; w: number; h: number; color: string; arm?: number; width?: number; opacity?: number }> = ({ x, y, w, h, color, arm = 46, width = 3, opacity = 1 }) => {
  const a = Math.min(arm, w / 3, h / 3);
  const d = `M${x} ${y + a}V${y}H${x + a} M${x + w - a} ${y}H${x + w}V${y + a} M${x + w} ${y + h - a}V${y + h}H${x + w - a} M${x + a} ${y + h}H${x}V${y + h - a}`;
  return <path d={d} stroke={color} strokeWidth={width} fill="none" opacity={opacity} strokeLinecap="square" />;
};

const WebsiteScene: React.FC<{ f: number; live: boolean }> = ({ f, live }) => {
  const imageReveal = ramp(f, 8, 20, EASE.out);
  const contentReveal = ramp(f, 15, 22, EASE.snappy);
  return <div style={{ position: "absolute", inset: 0, overflow: "hidden", fontFamily: "Manrope, sans-serif", color: COLORS.platinum, background: `radial-gradient(ellipse 60% 72% at 50% 28%, ${COLORS.graphite} 0%, #0b0e12 58%, ${COLORS.background} 100%)` }}>
    <style>{`@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-800-cyrillic.woff2")}") format("woff2");font-weight:800;unicode-range:U+0400-052F,U+2000-206F}@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-500-cyrillic.woff2")}") format("woff2");font-weight:500;unicode-range:U+0400-052F,U+2000-206F}@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-800-latin.woff2")}") format("woff2");font-weight:800;unicode-range:U+0000-00FF}@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-500-latin.woff2")}") format("woff2");font-weight:500;unicode-range:U+0000-00FF}`}</style>

    {/* Layered graphite backdrop; the live pass has a restrained, deterministic parallax push. */}
    <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(182,190,200,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(182,190,200,.035) 1px,transparent 1px)", backgroundSize: "80px 80px", opacity: 0.38 }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 36% 58% at 50% 43%,rgba(200,166,106,.12),transparent 74%)" }} />
    <div style={{ position: "absolute", left: 245, top: 116, width: 1430, height: 850, border: "1px solid rgba(182,190,200,.08)", transform: `scale(${live ? (1.01 + 0.015 * ramp(f, 0, F1, EASE.smooth)) : 1})`, transformOrigin: "center", opacity: 0.6 }} />

    {/* Main website window: same scene at three camera crops. */}
    <div style={{ position: "absolute", left: 590, top: 176, width: 740, height: 780, borderRadius: 28, overflow: "hidden", background: "linear-gradient(160deg,#202831 0%,#151B22 54%,#10151A 100%)", boxShadow: "inset 0 0 0 1.5px rgba(241,242,244,.16), inset 0 2px 0 rgba(255,255,255,.12), 0 60px 120px -40px rgba(0,0,0,.92)" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 78% 42% at 24% 0%,rgba(241,242,244,.09),transparent 72%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 64, display: "flex", alignItems: "center", gap: 10, padding: "0 28px", background: "rgba(241,242,244,.055)", borderBottom: "1px solid rgba(241,242,244,.09)" }}>
        {[0,1,2].map((i) => <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: i === 0 ? GOLD : "rgba(182,190,200,.42)" }} />)}
        <div style={{ marginLeft: 24, width: 300, height: 22, borderRadius: 12, background: "rgba(7,9,12,.42)", border: "1px solid rgba(182,190,200,.08)" }} />
      </div>
      <div style={{ position: "absolute", left: 46, right: 46, top: 94, height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(182,190,200,.14)" }}>
        <strong style={{ fontSize: 20, letterSpacing: 2 }}>BLACKPHANTOM</strong>
        <span style={{ fontSize: 15, letterSpacing: 1.5, color: COLORS.silver }}>РЕШЕНИЯ　　О КОМПАНИИ</span>
        <span style={{ color: GOLD, fontSize: 20 }}>↗</span>
      </div>

      <div style={{ position: "absolute", left: 22, top: 188, width: 630, height: 330 }}>
        <div style={{ position: "absolute", left: 0, top: 8, width: 190, opacity: contentReveal, transform: `translateY(${(1-contentReveal)*16}px)` }}>
          <div style={{ fontSize: 13, color: GOLD, letterSpacing: 3, fontWeight: 700 }}>ЦИФРОВАЯ СРЕДА БИЗНЕСА</div>
          <div style={{ marginTop: 24, fontSize: 35, lineHeight: 1.14, fontWeight: 800, letterSpacing: -1.1 }}>Ваш бизнес<br/>онлайн</div>
          <div style={{ marginTop: 16, width: 190, fontSize: 17, lineHeight: 1.55, color: COLORS.silver }}>Платформа, которая помогает бренду расти.</div>
          <div style={{ marginTop: 22, width: 166, height: 42, display: "grid", placeItems: "center", borderRadius: 6, background: GOLD, color: "#11151B", fontSize: 15, fontWeight: 800 }}>Подробнее　↗</div>
        </div>
        <div style={{ position: "absolute", right: -50, top: 0, width: 276, height: 306, opacity: imageReveal, transform: `translateY(${(1-imageReveal)*20}px) scale(${.96+.04*imageReveal})` }}>
          <div style={{ position: "absolute", inset: 12, border: "1px solid rgba(200,166,106,.35)", transform: "rotate(30deg)", boxShadow: "0 0 55px rgba(200,166,106,.1)" }} />
          <div style={{ position: "absolute", inset: 45, border: "1px solid rgba(241,242,244,.28)", transform: "rotate(30deg)" }} />
          <div style={{ position: "absolute", left: 89, top: 78, width: 112, height: 144, clipPath: "polygon(50% 0,100% 28%,82% 100%,18% 100%,0 28%)", background: "linear-gradient(145deg,#e3cf9e,#9d804d 64%,#55472e)", filter: "drop-shadow(0 24px 28px rgba(0,0,0,.52))" }} />
          <div style={{ position: "absolute", left: 48, right: 48, bottom: 20, height: 1, background: "linear-gradient(90deg,transparent,rgba(200,166,106,.72),transparent)" }} />
        </div>
      </div>

      <div style={{ position: "absolute", left: 54, right: 54, top: 560, height: 1, background: "rgba(241,242,244,.14)" }} />
      <div style={{ position: "absolute", left: 54, top: 592, display: "flex", gap: 16 }}>
        {[0,1,2].map((i) => <div key={i} style={{ width: 180, height: 132, padding: 14, borderRadius: 10, background: "rgba(241,242,244,.045)", border: "1px solid rgba(182,190,200,.15)", opacity: ramp(f, 18+i*5, 15, EASE.out), transform: `translateY(${(1-ramp(f,18+i*5,15,EASE.out))*18}px)` }}>
          <div style={{ height: 62, borderRadius: 6, background: i === 1 ? "linear-gradient(135deg,rgba(200,166,106,.36),rgba(200,166,106,.06))" : "linear-gradient(135deg,rgba(182,190,200,.18),rgba(182,190,200,.04))" }} />
          <div style={{ width: 96, height: 6, marginTop: 13, borderRadius: 4, background: "rgba(241,242,244,.5)" }} />
          <div style={{ width: 138, height: 4, marginTop: 8, borderRadius: 3, background: "rgba(182,190,200,.25)" }} />
        </div>)}
      </div>
    </div>
  </div>;
};

const Still: React.FC<{ view: View; f: number; live: boolean }> = ({ view, f, live }) => (
  <div style={{ position: "absolute", left: 960 / view.scale - view.cx, top: 540 / view.scale - view.cy, width: 1920, height: 1080, zoom: view.scale }}>
    <WebsiteScene f={f} live={live} />
  </div>
);

export const PaparazziFlash: React.FC = () => {
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

  const curView: View = seg === -1 ? { scale: liveScale, cx: 960, cy: 540 } : STILLS[seg];
  const nextIdx = seg + 1;
  let af: React.ReactNode = null;
  if (nextIdx < FLASHES.length) {
    const fNext = FLASHES[nextIdx];
    const start = nextIdx === 0 ? F1 - 9 : fNext - AF;
    if (frame >= start && frame < fNext) {
      const target = nextIdx === 0 ? { x: 610 - 30, y: 176 - 30, w: 760, h: 840 } : viewRect(STILLS[nextIdx]);
      const r = project(target, curView);
      const q = ramp(frame, start, 6, EASE.snappy);
      const k = mix(1.3, 1, q);
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const locked = frame >= fNext - 3;
      af = <Brackets x={cx-(r.w*k)/2} y={cy-(r.h*k)/2} w={r.w*k} h={r.h*k} color={locked ? GOLD : COLORS.platinum} width={locked ? 4 : 3} opacity={locked ? 1 : 0.85} arm={60} />;
    }
  }

  const serviceCopyIn = ramp(frame, F3 + DECAY, 8, EASE.out);
  return <AbsoluteFill style={{ background: COLORS.background, overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, transformOrigin: "960px 540px", transform: `translate(${jx.toFixed(2)}px,${(jy+settleY).toFixed(2)}px) scale(${(settleScale*holdPush*1.012).toFixed(5)})`, filter: seg >= 0 ? `brightness(${(1+0.22*bloom).toFixed(3)}) contrast(${(1.06-0.14*bloom).toFixed(3)}) saturate(${(0.82-0.2*bloom).toFixed(3)})` : undefined }}>
      {seg === -1
        ? <div style={{ position: "absolute", inset: 0, transformOrigin: "960px 540px", transform: `scale(${liveScale.toFixed(5)})` }}><WebsiteScene f={frame} live /></div>
        : <Still view={STILLS[seg]} f={FLASHES[seg]} live={false} />}
    </div>

    {/* Fixed screen-space service copy stays readable through the detail hold. */}
    <div style={{ position: "absolute", left: 112, bottom: 108, width: 480, opacity: serviceCopyIn, transform: `translateY(${(1-serviceCopyIn)*10}px)`, color: COLORS.platinum, fontFamily: "Manrope, sans-serif", textShadow: "0 2px 12px rgba(0,0,0,.85)" }}>
      <div style={{ color: GOLD, fontSize: 18, fontWeight: 800, letterSpacing: 4, marginBottom: 12 }}>BLACKPHANTOM</div>
      <div style={{ fontSize: 54, lineHeight: 1.08, fontWeight: 800, letterSpacing: -1.5 }}>Веб-разработка</div>
      <div style={{ marginTop: 14, maxWidth: 460, color: COLORS.silver, fontSize: 23, lineHeight: 1.4, fontWeight: 500 }}>Создаём сайты и цифровые платформы, которые привлекают клиентов, автоматизируют процессы и усиливают бренд.</div>
    </div>

    <Vignette strength={[0.5,0.5,0.56,0.62][seg+1]} inner={0.42} color="#000000" />
    <Grain opacity={0.07} blend="soft-light" />
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{af}</svg>
    {flash > 0.004 && <AbsoluteFill style={{ opacity: flash, pointerEvents: "none", background: "radial-gradient(ellipse 80% 90% at 50% 45%, #ffffff 0%, #ffffff 45%, rgba(250,250,255,0.86) 100%)" }} />}
  </AbsoluteFill>;
};

