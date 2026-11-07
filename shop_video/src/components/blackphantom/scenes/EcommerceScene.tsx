import React from "react";
import { EASE, ramp } from "../../../vendor/videoShotcraft/demos/_fixtures/Polish";
import { COLORS } from "../PaparazziCamera";
import { ManropeFontFaces } from "./ManropeFontFaces";

export const EcommerceScene: React.FC<{ f: number; live: boolean }> = ({ f, live }) => {
  const productIn = ramp(f, 8, 16, EASE.out);
  const assortmentIn = ramp(f, 24, 16, EASE.out);
  const orderIn = ramp(f, 64, 6, EASE.out);
  const light = live ? 0.2 + 0.03 * ramp(f, 0, 30, EASE.smooth) : 0.23;

  return <div style={{ position: "absolute", inset: 0, overflow: "hidden", color: COLORS.platinum, fontFamily: "Manrope, sans-serif", background: "radial-gradient(ellipse 66% 75% at 48% 28%,#202831 0%,#11161c 58%,#07090c 100%)" }}>
    <ManropeFontFaces />
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 30% 42% at 50% 42%,rgba(200,166,106,${light}),transparent 75%)` }} />
    <div style={{ position: "absolute", left: 590, top: 176, width: 740, height: 780, borderRadius: 28, overflow: "hidden", background: "linear-gradient(155deg,#202831 0%,#151b22 58%,#10151a 100%)", boxShadow: "inset 0 0 0 1.5px rgba(241,242,244,.16),0 60px 120px -40px rgba(0,0,0,.92)" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 45% at 20% 0%,rgba(241,242,244,.08),transparent 72%)" }} />
      <div style={{ position: "absolute", inset: "0 0 auto", height: 64, display: "flex", alignItems: "center", gap: 10, padding: "0 28px", background: "rgba(241,242,244,.055)", borderBottom: "1px solid rgba(241,242,244,.09)" }}>
        {[0,1,2].map((i) => <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: i === 0 ? COLORS.gold : "rgba(182,190,200,.42)" }} />)}
        <div style={{ marginLeft: 18, fontSize: 17, fontWeight: 800, letterSpacing: 1.4 }}>ВИТРИНА</div>
        <div style={{ marginLeft: "auto", padding: "8px 15px", borderRadius: 18, background: "rgba(200,166,106,.15)", color: COLORS.platinum, fontSize: 16 }}>Корзина <b style={{ color: COLORS.gold }}>1</b></div>
      </div>

      <div style={{ position: "absolute", left: 42, right: 42, top: 86, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(182,190,200,.14)" }}>
        <strong style={{ fontSize: 22, letterSpacing: 1.3 }}>ДОМ И ФОРМА</strong>
        <div style={{ color: COLORS.silver, fontSize: 16, letterSpacing: 0.3 }}>Свет　　Предметы　　Коллекции</div>
      </div>

      <div style={{ position: "absolute", left: 44, top: 170, width: 286, height: 340, borderRadius: 16, overflow: "hidden", background: "linear-gradient(145deg,#28313a,#11171d)", border: "1px solid rgba(241,242,244,.12)", opacity: productIn, transform: `translateY(${(1-productIn)*14}px)` }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 65% 58% at 50% 45%,rgba(200,166,106,.22),transparent 72%)" }} />
        <div style={{ position: "absolute", left: 55, top: 44, width: 176, height: 220, borderRadius: "50% 50% 42% 42%", background: "linear-gradient(145deg,rgba(241,242,244,.11),rgba(7,9,12,.12))", border: "1px solid rgba(241,242,244,.1)" }} />
        <div style={{ position: "absolute", left: 83, top: 74, width: 120, height: 76, clipPath: "polygon(20% 0,80% 0,100% 100%,0 100%)", background: "linear-gradient(120deg,#f0dfb6,#c8a66a 55%,#745a34)", filter: "drop-shadow(0 14px 18px rgba(0,0,0,.45))" }} />
        <div style={{ position: "absolute", left: 139, top: 148, width: 9, height: 82, borderRadius: 6, background: "linear-gradient(90deg,#80663f,#e5d1a5,#9c7c49)" }} />
        <div style={{ position: "absolute", left: 101, top: 224, width: 84, height: 12, borderRadius: "50%", background: "linear-gradient(90deg,#6c5434,#d9c08d,#755c39)" }} />
        <div style={{ position: "absolute", left: 30, bottom: 24, width: 60, height: 4, borderRadius: 3, background: COLORS.gold, opacity: 0.8 }} />
      </div>

      <div style={{ position: "absolute", left: 366, top: 188, width: 320, opacity: productIn, transform: `translateY(${(1-productIn)*10}px)` }}>
        <div style={{ color: COLORS.gold, fontSize: 15, fontWeight: 800, letterSpacing: 1.6 }}>ИЗБРАННОЕ</div>
        <div style={{ marginTop: 14, fontSize: 31, lineHeight: 1.12, fontWeight: 800 }}>Настольный<br/>светильник</div>
        <div style={{ marginTop: 13, maxWidth: 300, color: COLORS.silver, fontSize: 17, lineHeight: 1.45 }}>Мягкий свет и лаконичная форма для спокойного вечера.</div>
        <div style={{ marginTop: 21, width: 192, height: 48, borderRadius: 6, display: "grid", placeItems: "center", background: COLORS.gold, color: "#11151B", fontSize: 18, fontWeight: 800 }}>В корзину</div>
        <div style={{ marginTop: 15, color: COLORS.silver, fontSize: 15 }}>Доставка и оплата при оформлении</div>
      </div>

      <div style={{ position: "absolute", left: 42, right: 42, top: 536, height: 1, background: "rgba(241,242,244,.14)" }} />
      <div style={{ position: "absolute", left: 42, top: 558, fontSize: 19, fontWeight: 800 }}>Дополните интерьер</div>
      <div style={{ position: "absolute", left: 42, top: 598, display: "flex", gap: 14 }}>
        {["Ваза", "Часы", "Поднос"].map((label, i) => <div key={label} style={{ width: 202, height: 142, padding: 12, borderRadius: 12, border: "1px solid rgba(182,190,200,.13)", background: "rgba(241,242,244,.045)", display: "flex", alignItems: "center", gap: 12, opacity: assortmentIn, transform: `translateY(${(1-assortmentIn)*12}px)` }}>
          <div style={{ width: 78, height: 94, flex: "0 0 auto", borderRadius: 8, background: i === 1 ? "linear-gradient(145deg,rgba(200,166,106,.38),rgba(200,166,106,.06))" : "linear-gradient(145deg,rgba(182,190,200,.22),rgba(182,190,200,.04))", position: "relative" }}>
            <div style={{ position: "absolute", left: 18, right: 18, top: 18, bottom: 18, border: `1px solid ${i === 1 ? "rgba(200,166,106,.52)" : "rgba(182,190,200,.25)"}`, borderRadius: i === 0 ? "45% 45% 35% 35%" : 8 }} />
          </div>
          <div style={{ fontSize: 17, lineHeight: 1.2, fontWeight: 700 }}>{label}</div>
        </div>)}
      </div>

      {orderIn > 0.01 && <>
        <div style={{ position: "absolute", inset: 0, background: "rgba(4,6,8,.72)", opacity: orderIn }} />
        <div style={{ position: "absolute", left: 100, top: 174, width: 430, height: 376, padding: "34px 34px 30px", boxSizing: "border-box", borderRadius: 22, textAlign: "center", background: "linear-gradient(155deg,#202831,#11171d)", border: "1px solid rgba(200,166,106,.52)", boxShadow: "0 36px 90px rgba(0,0,0,.6)", opacity: orderIn, transform: `translateY(${(1-orderIn)*16}px)` }}>
          <div style={{ width: 72, height: 72, margin: "0 auto", borderRadius: "50%", display: "grid", placeItems: "center", color: "#11151B", background: "linear-gradient(145deg,#e8d6ad,#c8a66a)", fontSize: 37, fontWeight: 900 }}>✓</div>
          <div style={{ marginTop: 21, fontSize: 27, lineHeight: 1.15, fontWeight: 800 }}>Заказ оформлен</div>
          <div style={{ marginTop: 11, color: COLORS.silver, fontSize: 18, lineHeight: 1.4 }}>Мы получили ваш заказ.</div>
          <div style={{ marginTop: 24, height: 46, borderRadius: 6, display: "grid", placeItems: "center", background: COLORS.gold, color: "#11151B", fontSize: 17, fontWeight: 800 }}>Вернуться в магазин</div>
        </div>
      </>}
    </div>
  </div>;
};
