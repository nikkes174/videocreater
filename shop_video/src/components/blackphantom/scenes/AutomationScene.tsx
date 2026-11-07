import React from "react";
import { EASE, ramp } from "../../../vendor/videoShotcraft/demos/_fixtures/Polish";
import { COLORS } from "../PaparazziCamera";
import { ManropeFontFaces } from "./ManropeFontFaces";

export const AutomationScene: React.FC<{ f: number; live: boolean }> = ({ f, live }) => {
  const clientIn = ramp(f, 10, 12, EASE.out);
  const assistantIn = ramp(f, 23, 12, EASE.out);
  const resultIn = ramp(f, 40, 10, EASE.out);
  const glow = live ? 0.18 + 0.04 * ramp(f, 0, 30, EASE.smooth) : 0.22;

  return <div style={{ position: "absolute", inset: 0, overflow: "hidden", color: COLORS.platinum, fontFamily: "Manrope, sans-serif", background: "radial-gradient(ellipse 65% 72% at 52% 32%,#202831 0%,#10151a 58%,#07090c 100%)" }}>
    <ManropeFontFaces />
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 32% 45% at 49% 44%,rgba(200,166,106,${glow}),transparent 76%)` }} />
    <div style={{ position: "absolute", left: 590, top: 176, width: 740, height: 780, borderRadius: 28, overflow: "hidden", background: "linear-gradient(155deg,#202831 0%,#151b22 58%,#10151a 100%)", boxShadow: "inset 0 0 0 1.5px rgba(241,242,244,.16),0 60px 120px -40px rgba(0,0,0,.92)" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 45% at 20% 0%,rgba(241,242,244,.08),transparent 72%)" }} />
      <div style={{ position: "absolute", inset: "0 0 auto", height: 64, display: "flex", alignItems: "center", gap: 10, padding: "0 28px", background: "rgba(241,242,244,.055)", borderBottom: "1px solid rgba(241,242,244,.09)" }}>
        {[0,1,2].map((i) => <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: i === 0 ? COLORS.gold : "rgba(182,190,200,.42)" }} />)}
        <strong style={{ marginLeft: 18, fontSize: 18, letterSpacing: 1.2 }}>МЕССЕНДЖЕРЫ</strong>
        <div style={{ marginLeft: "auto", padding: "8px 14px", borderRadius: 20, color: COLORS.silver, background: "rgba(7,9,12,.38)", fontSize: 15 }}>Поддержка клиентов</div>
      </div>

      <div style={{ position: "absolute", left: 0, top: 64, bottom: 0, width: 220, borderRight: "1px solid rgba(182,190,200,.14)", background: "rgba(7,9,12,.2)" }}>
        <div style={{ padding: "24px 22px 18px", fontSize: 20, fontWeight: 800 }}>Диалоги</div>
        <div style={{ margin: "0 10px", padding: "16px 12px", borderRadius: 12, background: "rgba(200,166,106,.13)", boxShadow: "inset 2px 0 0 #C8A66A" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800 }}>Клиент <span style={{ color: COLORS.gold }}>●</span></div>
          <div style={{ marginTop: 7, color: COLORS.silver, fontSize: 14, lineHeight: 1.35 }}>Нужна консультация</div>
        </div>
        <div style={{ margin: "10px 10px 0", padding: "15px 12px", borderRadius: 12, border: "1px solid rgba(182,190,200,.1)" }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Новый заказ</div>
          <div style={{ marginTop: 7, color: COLORS.silver, fontSize: 14 }}>Спасибо, получил</div>
        </div>
        <div style={{ margin: "10px 10px 0", padding: "15px 12px", borderRadius: 12, border: "1px solid rgba(182,190,200,.1)" }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Вопрос по услуге</div>
          <div style={{ marginTop: 7, color: COLORS.silver, fontSize: 14 }}>Можно подробнее?</div>
        </div>
      </div>

      <div style={{ position: "absolute", left: 220, right: 0, top: 64, height: 72, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(182,190,200,.13)" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Клиент</div>
          <div style={{ marginTop: 4, color: COLORS.silver, fontSize: 15 }}>Новая заявка</div>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center", color: COLORS.gold, background: "rgba(200,166,106,.14)", fontSize: 18, fontWeight: 800 }}>К</div>
      </div>

      <div style={{ position: "absolute", left: 250, top: 252, width: 440, padding: "15px 18px 17px", borderRadius: "5px 18px 18px 18px", background: "rgba(241,242,244,.085)", opacity: clientIn, transform: `translateY(${(1-clientIn)*12}px)` }}>
        <div style={{ marginBottom: 7, color: COLORS.silver, fontSize: 15, fontWeight: 700 }}>Клиент</div>
        <div style={{ fontSize: 20, lineHeight: 1.42 }}>Здравствуйте! Хочу узнать стоимость.</div>
      </div>

      <div style={{ position: "absolute", left: 284, top: 350, width: 420, padding: "16px 18px 18px", borderRadius: "18px 5px 18px 18px", background: "linear-gradient(135deg,rgba(200,166,106,.2),rgba(200,166,106,.09))", border: "1px solid rgba(200,166,106,.42)", opacity: assistantIn, transform: `translateY(${(1-assistantIn)*12}px)` }}>
        <div style={{ marginBottom: 7, color: COLORS.gold, fontSize: 15, fontWeight: 800 }}>Ассистент</div>
        <div style={{ fontSize: 20, lineHeight: 1.42 }}>Здравствуйте! Подберём решение под вашу задачу.</div>
      </div>

      <div style={{ position: "absolute", left: 258, top: 476, width: 416, minHeight: 98, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, borderRadius: 14, background: "linear-gradient(120deg,rgba(200,166,106,.16),rgba(241,242,244,.045))", border: "1px solid rgba(200,166,106,.3)", opacity: resultIn, transform: `translateY(${(1-resultIn)*10}px)` }}>
        <div style={{ width: 42, height: 42, flex: "0 0 auto", borderRadius: "50%", display: "grid", placeItems: "center", color: "#11151B", background: COLORS.gold, fontSize: 22, fontWeight: 900 }}>✓</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Заявка обработана</div>
          <div style={{ marginTop: 5, color: COLORS.silver, fontSize: 15 }}>Передана специалисту</div>
        </div>
      </div>

      <div style={{ position: "absolute", left: 244, right: 24, bottom: 24, height: 58, padding: "0 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 14, border: "1px solid rgba(182,190,200,.15)", background: "rgba(7,9,12,.32)", color: COLORS.silver, fontSize: 16 }}>
        <span>Напишите сообщение</span><span style={{ color: COLORS.gold, fontSize: 21 }}>➤</span>
      </div>
    </div>
  </div>;
};
