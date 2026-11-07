import React from "react";
import { EASE, ramp } from "../../../vendor/videoShotcraft/demos/_fixtures/Polish";
import { COLORS } from "../PaparazziCamera";
import { ManropeFontFaces } from "./ManropeFontFaces";

export const SoftwareScene: React.FC<{ f: number; live: boolean }> = ({ f, live }) => {
  const panelsIn = ramp(f, 8, 18, EASE.out);
  const chartProgress = ramp(f, 17, 34, EASE.out);
  const activityIn = ramp(f, 30, 18, EASE.out);

  return <div style={{ position: "absolute", inset: 0, overflow: "hidden", color: COLORS.platinum, fontFamily: "Manrope, sans-serif", background: "radial-gradient(ellipse 68% 74% at 48% 28%,#202831 0%,#11161c 58%,#07090c 100%)" }}>
    <ManropeFontFaces />
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 32% 46% at ${live ? 51 : 49}% 42%,rgba(200,166,106,.17),transparent 75%)` }} />
    <div style={{ position: "absolute", left: 590, top: 176, width: 740, height: 780, borderRadius: 28, overflow: "hidden", background: "linear-gradient(155deg,#202831 0%,#151b22 58%,#10151a 100%)", boxShadow: "inset 0 0 0 1.5px rgba(241,242,244,.16),0 60px 120px -40px rgba(0,0,0,.92)" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 45% at 20% 0%,rgba(241,242,244,.08),transparent 72%)" }} />
      <div style={{ position: "absolute", inset: "0 0 auto", height: 64, display: "flex", alignItems: "center", gap: 10, padding: "0 28px", background: "rgba(241,242,244,.055)", borderBottom: "1px solid rgba(241,242,244,.09)" }}>
        {[0,1,2].map((i) => <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: i === 0 ? COLORS.gold : "rgba(182,190,200,.42)" }} />)}
        <strong style={{ marginLeft: 18, fontSize: 18, letterSpacing: 1.1 }}>УПРАВЛЕНИЕ БИЗНЕСОМ</strong>
        <div style={{ marginLeft: "auto", color: COLORS.silver, fontSize: 15 }}>Сегодня　⌄</div>
      </div>

      <div style={{ position: "absolute", left: 0, top: 64, bottom: 0, width: 176, padding: "24px 12px", boxSizing: "border-box", borderRight: "1px solid rgba(182,190,200,.14)", background: "rgba(7,9,12,.2)" }}>
        <div style={{ margin: "0 10px 20px", color: COLORS.silver, fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>РАЗДЕЛЫ</div>
        {["Обзор", "Клиенты", "Заказы", "Автоматизация"].map((item, i) => <div key={item} style={{ height: 46, marginBottom: 5, padding: "0 12px", display: "flex", alignItems: "center", gap: 10, borderRadius: 9, color: i === 0 ? COLORS.platinum : COLORS.silver, background: i === 0 ? "rgba(200,166,106,.14)" : "transparent", boxShadow: i === 0 ? "inset 2px 0 0 #C8A66A" : undefined, fontSize: 16, fontWeight: i === 0 ? 800 : 500 }}>
          <span style={{ width: 7, height: 7, borderRadius: 2, background: i === 0 ? COLORS.gold : "rgba(182,190,200,.4)" }} />{item}
        </div>)}
      </div>

      <div style={{ position: "absolute", left: 198, top: 88, fontSize: 24, fontWeight: 800 }}>Обзор бизнеса</div>
      <div style={{ position: "absolute", left: 198, top: 150, display: "flex", gap: 12, opacity: panelsIn, transform: `translateY(${(1-panelsIn)*12}px)` }}>
        {[["248", "Клиенты"], ["36", "Заказы"], ["92%", "Выполнено"]].map(([value, label], i) => <div key={label} style={{ width: 164, height: 108, padding: "16px 17px", boxSizing: "border-box", borderRadius: 12, background: "rgba(241,242,244,.055)", border: "1px solid rgba(182,190,200,.13)" }}>
          <div style={{ color: i === 2 ? COLORS.gold : COLORS.platinum, fontSize: 27, fontWeight: 800 }}>{value}</div>
          <div style={{ marginTop: 8, color: COLORS.silver, fontSize: 15 }}>{label}</div>
        </div>)}
      </div>

      <div style={{ position: "absolute", left: 198, top: 278, width: 326, height: 258, padding: "18px 18px 14px", boxSizing: "border-box", borderRadius: 14, background: "rgba(241,242,244,.045)", border: "1px solid rgba(182,190,200,.13)", opacity: panelsIn }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Рост показателей</div>
        <div style={{ marginTop: 5, color: COLORS.silver, fontSize: 14 }}>За последние месяцы</div>
        <svg width="290" height="164" viewBox="0 0 290 164" style={{ position: "absolute", left: 18, bottom: 14, overflow: "visible" }}>
          <defs><linearGradient id="software-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.gold} stopOpacity=".3"/><stop offset="100%" stopColor={COLORS.gold} stopOpacity="0"/></linearGradient></defs>
          {[30,70,110].map((y) => <line key={y} x1="0" x2="290" y1={y} y2={y} stroke="rgba(182,190,200,.14)" strokeWidth="1" />)}
          <path d="M0 145 L0 122 C25 116 28 124 48 108 S80 104 97 91 S128 98 149 75 S179 86 199 59 S225 68 244 42 S270 48 290 20 L290 145 Z" fill="url(#software-chart-fill)" opacity={chartProgress} />
          <path d="M0 122 C25 116 28 124 48 108 S80 104 97 91 S128 98 149 75 S179 86 199 59 S225 68 244 42 S270 48 290 20" fill="none" stroke={COLORS.gold} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="480" strokeDashoffset={480 * (1-chartProgress)} />
          <circle cx="290" cy="20" r="6" fill={COLORS.platinum} stroke={COLORS.gold} strokeWidth="4" opacity={chartProgress} />
        </svg>
      </div>

      <div style={{ position: "absolute", left: 536, top: 278, width: 168, height: 258, padding: "18px 15px", boxSizing: "border-box", borderRadius: 14, background: "linear-gradient(155deg,rgba(200,166,106,.15),rgba(241,242,244,.035))", border: "1px solid rgba(200,166,106,.25)", opacity: panelsIn }}>
        <div style={{ color: COLORS.gold, fontSize: 15, fontWeight: 800, lineHeight: 1.25 }}>Автоматизация</div>
        <div style={{ marginTop: 20, width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(200,166,106,.2)", color: COLORS.gold, fontSize: 18 }}>✓</div>
        <div style={{ marginTop: 13, fontSize: 18, lineHeight: 1.2, fontWeight: 800 }}>Счёт отправлен</div>
        <div style={{ marginTop: 8, color: COLORS.silver, fontSize: 14, lineHeight: 1.3 }}>Заказ обработан без задержки</div>
        <div style={{ marginTop: 18, display: "inline-flex", padding: "6px 9px", borderRadius: 12, color: COLORS.gold, background: "rgba(200,166,106,.13)", fontSize: 13, fontWeight: 700 }}>Активна</div>
      </div>

      <div style={{ position: "absolute", left: 198, right: 36, top: 558, fontSize: 18, fontWeight: 800 }}>Последние действия</div>
      <div style={{ position: "absolute", left: 198, right: 36, top: 592, display: "grid", gap: 8, opacity: activityIn, transform: `translateY(${(1-activityIn)*10}px)` }}>
        {[["Новый заказ", "В работе"], ["Заявка клиента", "Завершена"]].map(([label, status], i) => <div key={label} style={{ height: 56, padding: "0 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 10, background: "rgba(241,242,244,.04)", border: "1px solid rgba(182,190,200,.1)" }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{label}</span><span style={{ color: i === 0 ? COLORS.gold : COLORS.silver, fontSize: 14 }}>{status}</span>
        </div>)}
      </div>
    </div>
  </div>;
};
