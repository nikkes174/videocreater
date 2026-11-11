// Adapted from DatavizLandscapeOpen by Wei Yihao.
// Copyright 2026 Wei Yihao. Licensed under Apache-2.0; see src/vendor/videoShotcraft/LICENSE.
// Modified for BLACKPHANTOM branding, Russian labels, and the graphite / platinum / gold palette.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE, bezier, mix, ramp } from "../../vendor/videoShotcraft/demos/_fixtures/Polish";
import { Dust, LOOKS, Stage, TextReveal, alpha, type Look } from "../../vendor/videoShotcraft/demos/_fixtures/Look";
import { DATA_LANDSCAPE, DATA_LANDSCAPE_COLORS as COLORS } from "../../config/blackphantomDataLandscape";
import { ManropeFontFaces } from "./scenes/ManropeFontFaces";

const DUR = DATA_LANDSCAPE.durationInFrames;

const L: Look = {
  ...LOOKS.graphite,
  bg: ["#11151A", "#0B0E12", COLORS.background],
  light: COLORS.gold,
  surface: COLORS.graphite,
  surface2: "#202833",
  line: "rgba(182,190,200,0.12)",
  ink: COLORS.platinum,
  ink2: COLORS.silver,
  ink3: "#78818D",
  accent: COLORS.gold,
  accent2: COLORS.silver,
  onAccent: COLORS.background,
  shadow: "#000000",
};

const HY = 420;
const F = 1100;
const CAM_H = 220;
const SLOPE = 0.29;
const VPX = 960 + F * SLOPE;

const camPath = bezier(0.3, 0.3, 0.55, 1);
const CAM_DIST = 950;
const camAt = (frame: number) => {
  const t = Math.min(1, Math.max(0, frame / (DUR - 1)));
  const z = CAM_DIST * camPath(t);
  const lat = mix(-140, 110, EASE.smooth(t));
  return { z, x: SLOPE * z + lat };
};

type P3 = { x: number; z: number };
type Camera = { x: number; z: number };
const project = (p: P3, cam: Camera) => {
  const zr = p.z - cam.z;
  return { sx: 960 + (F * (p.x - cam.x)) / zr, sy: HY + (F * CAM_H) / zr, zr };
};

const trunkX = (z: number) => SLOPE * z - 160 + 150 * Math.sin(z / 950);
const trunkDX = (z: number) => SLOPE + (150 / 950) * Math.cos(z / 950);

const TRUNK: P3[] = Array.from({ length: 261 }, (_, i) => {
  const z = -300 + Math.pow(i / 260, 1.7) * 14300;
  return { x: trunkX(z), z };
});

const bez = (a: P3, b: P3, c: P3, d: P3, t: number): P3 => {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    z: u * u * u * a.z + 3 * u * u * t * b.z + 3 * u * t * t * c.z + t * t * t * d.z,
  };
};

const resample = (at: (t: number) => P3, n: number) => {
  const raw = Array.from({ length: 241 }, (_, i) => at(i / 240));
  const cum = [0];
  for (let i = 1; i < raw.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(raw[i].x - raw[i - 1].x, raw[i].z - raw[i - 1].z));
  }
  const total = cum[cum.length - 1];
  const out: P3[] = [];
  let j = 1;
  for (let k = 0; k <= n; k++) {
    const target = (k / n) * total;
    while (j < raw.length - 1 && cum[j] < target) j++;
    const f = (target - cum[j - 1]) / Math.max(1e-6, cum[j] - cum[j - 1]);
    out.push({ x: mix(raw[j - 1].x, raw[j].x, f), z: mix(raw[j - 1].z, raw[j].z, f) });
  }
  return out;
};

type TribSpec = { side: number; z0: number; off: number; zm: number; lm: number; grow: number; w: number };
const TRIB_SPECS: TribSpec[] = [
  { side: -1, z0: -260, off: 700, zm: 1500, lm: 520, grow: 8, w: 5 },
  { side: 1, z0: -120, off: 900, zm: 2100, lm: 640, grow: 11, w: 5 },
  { side: -1, z0: 500, off: 1500, zm: 2700, lm: 760, grow: 16, w: 4.4 },
  { side: 1, z0: 800, off: 1800, zm: 3300, lm: 820, grow: 20, w: 4.4 },
  { side: -1, z0: 1400, off: 2300, zm: 3900, lm: 900, grow: 25, w: 4.2 },
  { side: 1, z0: 1700, off: 2500, zm: 4600, lm: 980, grow: 29, w: 4.2 },
  { side: -1, z0: 2500, off: 2900, zm: 5300, lm: 1050, grow: 34, w: 4.2 },
  { side: 1, z0: 3100, off: 3200, zm: 6100, lm: 1150, grow: 38, w: 4.2 },
  { side: -1, z0: 4100, off: 3600, zm: 7100, lm: 1250, grow: 43, w: 4.2 },
  { side: 1, z0: 5000, off: 3900, zm: 8200, lm: 1350, grow: 47, w: 4.2 },
  { side: 1, z0: -420, off: 260, zm: 980, lm: 380, grow: 4, w: 6 },
];

const TRIBS = TRIB_SPECS.map((s) => {
  const end: P3 = { x: trunkX(s.zm), z: s.zm };
  const dx = trunkDX(s.zm);
  const dl = Math.hypot(dx, 1);
  const p2: P3 = { x: end.x - (dx / dl) * s.lm, z: end.z - (1 / dl) * s.lm };
  const p0: P3 = { x: trunkX(s.z0) + s.side * s.off, z: s.z0 };
  const p1: P3 = { x: p0.x + (end.x - p0.x) * 0.12, z: p0.z + (end.z - p0.z) * 0.5 };
  return { ...s, pts: resample((t) => bez(p0, p1, p2, end, t), 90) };
});

const smooth01 = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

type Seg = { x1: number; y1: number; x2: number; y2: number; w: number; o: number; c: string };
const hexMix = (from: string, to: string, amount: number) => {
  const channel = (hex: string, shift: number) => (parseInt(hex.slice(1), 16) >> shift) & 255;
  const values = [16, 8, 0].map((shift) => Math.round(mix(channel(from, shift), channel(to, shift), amount)));
  return `#${values.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

const emitLine = (
  pts: P3[],
  g: number,
  cam: Camera,
  opts: { w: number; color: string; base: number; ramp?: boolean; pulse: (u: number) => number },
  sharp: Seg[],
  near: Seg[],
) => {
  const n = pts.length - 1;
  const reach = g * n;
  const kMax = Math.min(n, Math.ceil(reach));
  for (let k = 0; k < kMax; k++) {
    const a = pts[k];
    const b0 = pts[k + 1];
    const f = Math.min(1, reach - k);
    const b = f < 1 ? { x: mix(a.x, b0.x, f), z: mix(a.z, b0.z, f) } : b0;
    if (a.z - cam.z < 70 || b.z - cam.z < 70) continue;
    const pa = project(a, cam);
    const pb = project(b, cam);
    if ((pa.sx < -200 && pb.sx < -200) || (pa.sx > 2120 && pb.sx > 2120) || (pa.sy > 1300 && pb.sy > 1300)) continue;
    const zr = (pa.zr + pb.zr) / 2;
    const u = (k + 0.5 * f) / n;
    const fog = 1 - smooth01(2600, 11000, zr);
    const lift = opts.ramp ? 0.3 + 0.7 * Math.pow(u, 0.8) : 1;
    const pv = opts.pulse(u);
    const o = opts.base * fog * lift * mix(1, pv, smooth01(500, 1400, zr));
    if (o < 0.01) continue;
    const w = Math.max(0.9, Math.min(46, (opts.w * F) / zr));
    const nearW = 1 - smooth01(420, 1050, zr);
    const joinGlow = opts.ramp ? smooth01(0.78, 1, u) * 0.72 : 0;
    const seg = {
      x1: pa.sx,
      y1: pa.sy,
      x2: pb.sx,
      y2: pb.sy,
      w,
      c: joinGlow > 0 ? hexMix(opts.color, COLORS.gold, joinGlow) : opts.color,
    };
    if (nearW < 0.98) sharp.push({ ...seg, o: o * (1 - nearW) });
    if (nearW > 0.02) near.push({ ...seg, w: w * 1.3, o: o * nearW * 0.7 });
  }
  if (g > 0 && g < 1) {
    const k = Math.min(n - 1, Math.floor(reach));
    const f = reach - k;
    const tip = { x: mix(pts[k].x, pts[k + 1].x, f), z: mix(pts[k].z, pts[k + 1].z, f) };
    if (tip.z - cam.z > 70) return project(tip, cam);
  }
  return null;
};

type LabelSpec = { trib: number; u: number; text: string; appear: number };
const LABELS: LabelSpec[] = [
  { trib: 2, u: 0.6, text: "Сайты", appear: 44 },
  { trib: 1, u: 0.75, text: "Интернет-магазины", appear: 53 },
  { trib: 3, u: 0.6, text: "Автоматизация", appear: 62 },
  { trib: 6, u: 0.3, text: "Разработка ПО", appear: 73 },
  { trib: 7, u: 0.45, text: "Интеграции", appear: 84 },
  { trib: 8, u: 0.45, text: "Поддержка", appear: 96 },
];
const LABEL_PTS = LABELS.map((l) => {
  const pts = TRIBS[l.trib].pts;
  return { p: pts[Math.round(l.u * (pts.length - 1))] };
});

const labelStyle: React.CSSProperties = {
  fontFamily: "Manrope, sans-serif",
  fontSize: 25,
  fontWeight: 700,
  color: "#F1F2F4",
  whiteSpace: "nowrap",
};

const Label: React.FC<{ spec: LabelSpec; at: P3; frame: number; cam: Camera }> = ({ spec, at, frame, cam }) => {
  const pr = project(at, cam);
  if (pr.zr < 200) return null;
  const k = Math.min(1.7, Math.max(0.7, 1500 / pr.zr));
  const fog = 1 - smooth01(3600, 8000, pr.zr);
  const pin = ramp(frame, spec.appear, 10, EASE.overshoot);
  const pinOp = ramp(frame, spec.appear, 4, EASE.out);
  const stem = ramp(frame, spec.appear + 2, 12, EASE.snappy);
  const tag = ramp(frame, spec.appear + 6, 14, EASE.snappy);
  const stemH = 44 * k;
  const fs = 25 * k;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: fog }}>
      <div
        style={{
          position: "absolute",
          left: pr.sx - 6 * k,
          top: pr.sy - 6 * k,
          width: 12 * k,
          height: 12 * k,
          borderRadius: 2.5 * k,
          background: L.accent,
          opacity: pinOp,
          transform: `scale(${pin})`,
          boxShadow: `0 0 0 ${3 * k}px ${alpha(L.bg[2], 0.9)}, 0 0 ${18 * k}px ${alpha(L.accent, 0.7)}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: pr.sx - 0.75,
          top: pr.sy - 8 * k - stemH * stem,
          width: 1.5,
          height: stemH * stem,
          background: `linear-gradient(0deg, ${alpha(L.accent, 0.7)}, ${alpha(L.ink, 0.25)})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: pr.sx - 2 * k,
          top: pr.sy - 8 * k - stemH - 46 * k + (1 - tag) * 14 * k,
          height: 46 * k,
          padding: `0 ${14 * k}px 0 ${12 * k}px`,
          borderRadius: 10 * k,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          background: alpha(COLORS.graphite, 0.9),
          border: `1px solid ${alpha(L.ink, 0.18)}`,
          boxShadow: `inset 0 1px 0 ${alpha("#ffffff", 0.06)}, 0 ${10 * k}px ${28 * k}px ${alpha("#000000", 0.5)}`,
          opacity: tag,
          filter: tag < 0.98 ? `blur(${((1 - tag) * 6).toFixed(2)}px)` : undefined,
        }}
      >
        <span style={{ ...labelStyle, fontSize: fs }}>{spec.text}</span>
      </div>
    </div>
  );
};

const HEADLINE_STYLE: React.CSSProperties = {
  fontFamily: "Manrope, sans-serif",
  fontSize: 86,
  fontWeight: 800,
  lineHeight: 1.05,
  letterSpacing: -2.5,
  color: "#F1F2F4",
};

const SUBTITLE_STYLE: React.CSSProperties = {
  fontFamily: "Manrope, sans-serif",
  fontSize: 27,
  fontWeight: 500,
  lineHeight: 1.35,
  color: "#B6BEC8",
  maxWidth: 1150,
};

export const DataLandscape: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = camAt(frame);
  const fadeUp = ramp(frame, 0, 12, EASE.out);

  const sharp: Seg[] = [];
  const near: Seg[] = [];
  const tips: { sx: number; sy: number; zr: number; trunk: boolean }[] = [];

  const flowIn = (end: number) => ramp(frame, end, 24, EASE.smooth);
  const pulseFn = (end: number, n: number, speed: number, seed: number) => {
    const on = flowIn(end);
    return (u: number) => {
      const ph = u * n - frame * speed + seed;
      const c = Math.cos(ph * Math.PI * 2);
      return 0.7 + on * 0.55 * Math.pow(Math.max(0, c), 4);
    };
  };

  const trunkG = ramp(frame, 0, 36, EASE.out);
  TRIBS.forEach((t, i) => {
    const g = ramp(frame, t.grow, 34, EASE.out);
    const tip = emitLine(
      t.pts,
      g,
      cam,
      { w: t.w, color: COLORS.silver, base: 0.62, ramp: true, pulse: pulseFn(t.grow + 34, 2.2, 0.018, i * 0.37) },
      sharp,
      near,
    );
    if (tip) tips.push({ ...tip, trunk: false });
  });
  const tTip = emitLine(
    TRUNK,
    trunkG,
    cam,
    { w: 11, color: COLORS.gold, base: 0.95, pulse: pulseFn(36, 4, 0.022, 0) },
    sharp,
    near,
  );
  if (tTip) tips.push({ ...tTip, trunk: true });
  const trunkSegs = sharp.filter((s) => s.c === COLORS.gold);

  const dots: { x: number; y: number; r: number; o: number }[] = [];
  const STEP = 420;
  const zStart = Math.ceil((cam.z + 300) / STEP) * STEP;
  for (let z = zStart; z < cam.z + 9000; z += STEP) {
    for (let x = Math.floor((cam.x - 5200) / STEP) * STEP; x < cam.x + 5200; x += STEP) {
      const pr = project({ x, z }, cam);
      if (pr.sx < -20 || pr.sx > 1940 || pr.sy > 1100) continue;
      const o = 0.28 * (1 - smooth01(2000, 9000, pr.zr)) * smooth01(300, 900, pr.zr);
      if (o < 0.01) continue;
      dots.push({ x: pr.sx, y: pr.sy, r: Math.max(0.8, Math.min(3.2, 2400 / pr.zr)), o });
    }
  }

  const handoff = ramp(frame, 118, 50, EASE.swift);
  const brandIn = ramp(frame, 100, 16, EASE.out);
  const headline1In = ramp(frame, 110, 20, EASE.out);
  const headline2In = ramp(frame, 121, 20, EASE.out);
  const subtitleIn = ramp(frame, 140, 18, EASE.out);
  const lineRender = (s: Seg, i: number) => (
    <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.c} strokeWidth={s.w} strokeOpacity={s.o} strokeLinecap="butt" />
  );

  return (
    <AbsoluteFill style={{ background: L.bg[2], overflow: "hidden" }}>
      <ManropeFontFaces />
      <AbsoluteFill style={{ opacity: 0.35 + 0.65 * fadeUp }}>
        <Stage look={L} keyLight={{ x: VPX / 1920, y: HY / 1080 }} fill={{ x: 0.12, y: 0.95 }} horizon={HY / 1080} intensity={0.55} grain={0.1} vignette={0.6}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: HY, overflow: "hidden" }}>
            <Dust look={L} count={26} seed={7} drift={0.12} opacity={0.35} color={L.ink2} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: HY,
              bottom: 0,
              background: `linear-gradient(180deg, ${alpha("#252A30", 0.55)} 0%, ${alpha("#12161B", 0.3)} 30%, ${alpha("#050604", 0)} 100%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: HY - 0.5,
              height: 1,
              background: `linear-gradient(90deg, ${alpha(L.ink, 0)} 0%, ${alpha(L.ink, 0.16)} 40%, ${alpha(L.accent, 0.35)} 66%, ${alpha(L.ink, 0.12)} 85%, ${alpha(L.ink, 0)} 100%)`,
            }}
          />
        </Stage>

        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <filter id="bp-landscape-near" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="11" /></filter>
            <filter id="bp-landscape-glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7" /></filter>
            <radialGradient id="bp-landscape-tip">
              <stop offset="0" stopColor="#ffffff" stopOpacity={0.9} />
              <stop offset="0.3" stopColor={L.accent} stopOpacity={0.35} />
              <stop offset="1" stopColor={L.accent} stopOpacity={0} />
            </radialGradient>
          </defs>
          {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={L.ink2} fillOpacity={d.o} />)}
          <g filter="url(#bp-landscape-glow)" opacity={0.75}>
            {trunkSegs.map((s, i) => <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={L.accent} strokeWidth={s.w * 3} strokeOpacity={s.o * 0.45} strokeLinecap="butt" />)}
          </g>
          {sharp.map(lineRender)}
          {tips.map((t, i) => {
            const r = Math.max(3, Math.min(18, (t.trunk ? 7000 : 4200) / t.zr));
            return (
              <g key={i}>
                <circle cx={t.sx} cy={t.sy} r={r * 5} fill="url(#bp-landscape-tip)" />
                <circle cx={t.sx} cy={t.sy} r={r * 0.6} fill="#ffffff" />
              </g>
            );
          })}
        </svg>

        <div
          style={{
            position: "absolute",
            left: VPX - 520,
            top: HY - 260,
            width: 1040,
            height: 520,
            pointerEvents: "none",
            background: `radial-gradient(50% 50% at 50% 50%, ${alpha("#F2E2C6", 0.55)} 0%, ${alpha(L.accent, 0.22)} 22%, ${alpha(L.accent, 0)} 70%)`,
            opacity: 0.25 + 0.75 * handoff,
            mixBlendMode: "screen",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: VPX - 4,
            top: HY - 4,
            width: 8,
            height: 8,
            borderRadius: 4,
            background: "#F6EAD5",
            boxShadow: `0 0 18px 6px ${alpha(L.accent, 0.6)}`,
            opacity: 0.4 + 0.6 * handoff,
          }}
        />

        {LABELS.map((l, i) => ({ l, p: LABEL_PTS[i].p }))
          .sort((a, b) => b.p.z - a.p.z)
          .map(({ l, p }) => (frame >= l.appear ? <Label key={l.text} spec={l} at={p} frame={frame} cam={cam} /> : null))}

        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <g filter="url(#bp-landscape-near)">{near.map(lineRender)}</g>
        </svg>
      </AbsoluteFill>

      <div style={{ position: "absolute", left: 120, top: 83 }}>
        <div
          style={{
            fontFamily: "Manrope, sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: COLORS.gold,
            letterSpacing: "0.12em",
            opacity: brandIn,
            transform: `translateY(${(1 - brandIn) * 12}px)`,
          }}
        >
          {DATA_LANDSCAPE.brand}
        </div>
        <div style={{ ...HEADLINE_STYLE, marginTop: 26, opacity: headline1In }}>
          <TextReveal text={DATA_LANDSCAPE.headline[0]} by="word" variant="rise" start={110} each={20} gap={5} ease={EASE.out} style={HEADLINE_STYLE} />
        </div>
        <div style={{ ...HEADLINE_STYLE, marginTop: 4, opacity: headline2In }}>
          <TextReveal text={DATA_LANDSCAPE.headline[1]} by="word" variant="rise" start={121} each={20} gap={5} ease={EASE.out} style={HEADLINE_STYLE} />
        </div>
        <div
          style={{
            ...SUBTITLE_STYLE,
            marginTop: 26,
            opacity: subtitleIn,
            transform: `translateY(${(1 - subtitleIn) * 10}px)`,
          }}
        >
          {DATA_LANDSCAPE.subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
