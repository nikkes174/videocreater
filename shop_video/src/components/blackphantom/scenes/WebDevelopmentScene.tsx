import React from "react";
import { staticFile } from "remotion";
import { COLORS } from "../PaparazziCamera";
import { EASE, ramp } from "../../../vendor/videoShotcraft/demos/_fixtures/Polish";

export const WebDevelopmentScene: React.FC<{ f: number; live: boolean }> = ({ f, live }) => {
  const imageReveal = ramp(f, 8, 20, EASE.out);
  const contentReveal = ramp(f, 15, 22, EASE.snappy);
  return <div style={{ position: "absolute", inset: 0, overflow: "hidden", fontFamily: "Manrope, sans-serif", color: COLORS.platinum, background: `radial-gradient(ellipse 60% 72% at 50% 28%, ${COLORS.graphite} 0%, #0b0e12 58%, ${COLORS.background} 100%)` }}>
    <style>{`@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-800-cyrillic.woff2")}") format("woff2");font-weight:800;unicode-range:U+0400-052F,U+2000-206F}@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-500-cyrillic.woff2")}") format("woff2");font-weight:500;unicode-range:U+0400-052F,U+2000-206F}@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-800-latin.woff2")}") format("woff2");font-weight:800;unicode-range:U+0000-00FF}@font-face{font-family:Manrope;src:url("${staticFile("assets/fonts/manrope-500-latin.woff2")}") format("woff2");font-weight:500;unicode-range:U+0000-00FF}`}</style>

    {/* Layered graphite backdrop; the live pass has a restrained, deterministic parallax push. */}
    <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(182,190,200,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(182,190,200,.035) 1px,transparent 1px)", backgroundSize: "80px 80px", opacity: 0.38 }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 36% 58% at 50% 43%,rgba(200,166,106,.12),transparent 74%)" }} />
    <div style={{ position: "absolute", left: 245, top: 116, width: 1430, height: 850, border: "1px solid rgba(182,190,200,.08)", transform: `scale(${live ? (1.01 + 0.015 * ramp(f, 0, 30, EASE.smooth)) : 1})`, transformOrigin: "center", opacity: 0.6 }} />

    {/* Main website window: same scene at three camera crops. */}
    <div style={{ position: "absolute", left: 590, top: 176, width: 740, height: 780, borderRadius: 28, overflow: "hidden", background: "linear-gradient(160deg,#202831 0%,#151B22 54%,#10151A 100%)", boxShadow: "inset 0 0 0 1.5px rgba(241,242,244,.16), inset 0 2px 0 rgba(255,255,255,.12), 0 60px 120px -40px rgba(0,0,0,.92)" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 78% 42% at 24% 0%,rgba(241,242,244,.09),transparent 72%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 64, display: "flex", alignItems: "center", gap: 10, padding: "0 28px", background: "rgba(241,242,244,.055)", borderBottom: "1px solid rgba(241,242,244,.09)" }}>
        {[0,1,2].map((i) => <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: i === 0 ? COLORS.gold : "rgba(182,190,200,.42)" }} />)}
        <div style={{ marginLeft: 24, width: 300, height: 22, borderRadius: 12, background: "rgba(7,9,12,.42)", border: "1px solid rgba(182,190,200,.08)" }} />
      </div>
      <div style={{ position: "absolute", left: 46, right: 46, top: 94, height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(182,190,200,.14)" }}>
        <strong style={{ fontSize: 22, letterSpacing: 1.6 }}>BLACKPHANTOM</strong>
      </div>

      <div style={{ position: "absolute", left: 22, top: 164, width: 630, height: 330 }}>
        <div style={{ position: "absolute", left: 0, top: 8, width: 320, opacity: contentReveal, transform: `translateY(${(1-contentReveal)*16}px)` }}>
          <div style={{ fontSize: 52, lineHeight: 1.02, fontWeight: 800, letterSpacing: -1.8 }}>Ваш бизнес<br/>онлайн</div>
          <div style={{ marginTop: 18, width: 320, fontSize: 20, lineHeight: 1.45, color: COLORS.silver }}>Платформа, которая помогает бренду расти.</div>
          <div style={{ marginTop: 20, width: 188, height: 48, display: "grid", placeItems: "center", borderRadius: 6, background: COLORS.gold, color: "#11151B", fontSize: 18, fontWeight: 800 }}>Подробнее</div>
        </div>
        <div style={{ position: "absolute", left: 566, top: 6, width: 140, height: 286, opacity: imageReveal, transform: `translateY(${(1-imageReveal)*20}px) scale(${.96+.04*imageReveal})` }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 72% 65% at 50% 48%,rgba(200,166,106,.25),transparent 74%)" }} />
          <div style={{ position: "absolute", left: 18, top: 43, width: 104, height: 184, clipPath: "polygon(50% 0,100% 23%,84% 100%,16% 100%,0 23%)", background: "linear-gradient(145deg,#f0dfb6 0%,#c8a66a 36%,#8d6e3d 72%,#443821 100%)", filter: "drop-shadow(0 28px 32px rgba(0,0,0,.58))" }} />
          <div style={{ position: "absolute", left: 28, top: 240, width: 84, height: 2, background: "linear-gradient(90deg,transparent,rgba(200,166,106,.9),transparent)" }} />
        </div>
      </div>

      <div style={{ position: "absolute", left: 54, right: 54, top: 560, height: 1, background: "rgba(241,242,244,.14)" }} />
      <div style={{ position: "absolute", left: 54, top: 592, display: "flex", gap: 16 }}>
        {["Привлекать клиентов", "Ускорять процессы", "Усиливать бренд"].map((label, i) => <div key={label} style={{ width: 180, height: 132, padding: 16, borderRadius: 10, background: "rgba(241,242,244,.045)", border: "1px solid rgba(182,190,200,.15)", display: "flex", flexDirection: "column", justifyContent: "space-between", opacity: ramp(f, 18+i*5, 15, EASE.out), transform: `translateY(${(1-ramp(f,18+i*5,15,EASE.out))*18}px)` }}>
          <div style={{ width: 34, height: 3, borderRadius: 3, background: i === 1 ? COLORS.gold : "rgba(182,190,200,.58)" }} />
          <div style={{ color: COLORS.platinum, fontSize: 18, lineHeight: 1.2, fontWeight: 700 }}>{label}</div>
        </div>)}
      </div>
    </div>
  </div>;
};
