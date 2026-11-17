import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { MAC_SERVICES } from "../../config/macContent";
import { MAC_COLORS as C } from "../../config/macTheme";
import { MacFontFaces } from "../../components/mac/MacFontFaces";

const ease = (f: number, a: number, b: number, easing = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
const CX = 1510; const CY = 540;
const YS = [225, 435, 645, 855];
const bezier = (y0: number, t: number) => { const u = 1-t; return { x: u*u*u*800 + 3*u*u*t*1030 + 3*u*t*t*1160 + t*t*t*CX, y: u*u*u*y0 + 3*u*u*t*y0 + 3*u*t*t*CY + t*t*t*CY }; };

const ServiceIcon: React.FC<{ kind: string }> = ({ kind }) => <svg width="74" height="74" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
  {kind === "facade" && <><path d="M12 54V18l20-9 20 9v36M18 22h28M18 32h28M18 42h28M25 22v32M39 22v32"/><path d="M8 55h48"/></>}
  {kind === "glazing" && <><rect x="10" y="11" width="44" height="42" rx="2"/><path d="M32 11v42M10 32h44M16 17l10 12M48 17 38 29M16 47l10-12M48 47 38 35"/></>}
  {kind === "stained" && <><path d="M12 54V16l20-8 20 8v38M18 22l14-8 14 8v26l-14 8-14-8zM32 14v42M18 22l28 26M46 22 18 48"/><path d="M9 55h46"/></>}
  {kind === "demolition" && <><path d="m13 48 12-12 10 9 18-22M36 23h17v17"/><path d="m11 55 42-42M18 13l8 8M12 20l8 8M36 42l8 8M42 36l8 8"/></>}
</svg>;

export const MacServicesConverge: React.FC = () => {
  const f = useCurrentFrame();
  const converge = ease(f, 210, 310, Easing.inOut(Easing.cubic));
  const erase = ease(f, 310, 345, Easing.out(Easing.quad));
  const badgeIn = ease(f, 65, 100);
  const wave = ease(f, 300, 345);
  const revealTitle = ease(f, 340, 358);
  return <AbsoluteFill style={{ overflow: "hidden", background: `radial-gradient(ellipse 70% 75% at 72% 48%, ${C.deepPurple}, ${C.background} 78%)`, color: C.platinum, fontFamily: "Manrope, sans-serif" }}>
    <MacFontFaces />
    <div style={{ position: "absolute", left: 250, top: 88, color: C.gold, fontSize: 23, letterSpacing: ".28em", textTransform: "uppercase", opacity: 1-erase }}>Фасадные решения</div>
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
      <defs><linearGradient id="mac-path" x1="0" x2="1"><stop stopColor={C.violet} stopOpacity=".18"/><stop offset=".56" stopColor={C.gold}/><stop offset="1" stopColor={C.brightGold}/></linearGradient><filter id="mac-path-glow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      {MAC_SERVICES.map((svc,i) => { const y=YS[i]; const draw=ease(f,45+i*12,150+i*12); const startT=Math.max(0,Math.min(1,(f-210-i*5)/100)); const pos=bezier(y,startT); const op=1-erase; return <g key={svc.id} opacity={op}>
        <path d={`M800 ${y} C 1030 ${y} 1160 ${CY} ${CX} ${CY}`} fill="none" stroke="url(#mac-path)" strokeWidth="2.2" strokeDasharray="1200" strokeDashoffset={1200*(1-draw)*(1-erase)} opacity=".76"/>
        {f>=100&&f<300&&[0,1].map((n)=>{const t=((f-100)/145+n*.48)%1; const q=bezier(y,t); return <g key={n} filter="url(#mac-path-glow)" opacity={t>.9?.3:.9}><circle cx={q.x} cy={q.y} r="5" fill={C.brightGold}/><circle cx={q.x-18} cy={q.y-(q.y-CY)*.025} r="2.3" fill={C.violet} opacity=".7"/></g>;})}
        <g transform={`translate(${800+(pos.x-800)*converge} ${y+(pos.y-y)*converge}) scale(${1-converge*.82})`} filter="url(#mac-path-glow)"><circle r="34" fill={C.deepPurple} stroke={C.gold} strokeWidth="2.4"/><circle r="27" fill="none" stroke={C.violet} strokeOpacity=".7"/><text y="7" textAnchor="middle" fill={C.brightGold} fontSize="21" fontWeight="700">{String(i+1).padStart(2,"0")}</text></g>
      </g>; })}
      <g transform={`translate(${CX} ${CY}) scale(${badgeIn*(1+wave*.16-wave*.16*ease(f,335,355))})`} opacity={badgeIn}>
        <circle r="97" fill={C.deepPurple} stroke={C.gold} strokeWidth="2.5"/><circle r="84" fill="none" stroke={C.violet} strokeWidth="1.2" opacity=".8"/><circle r={100+wave*90} fill="none" stroke={C.brightGold} strokeWidth="2" opacity={(1-wave)*.75}/>
        <text textAnchor="middle" y="12" fill={C.platinum} fontSize="43" fontWeight="800" letterSpacing="4">М.А.С</text>
      </g>
    </svg>
    <div style={{ position: "absolute", left: 245, top: 0, bottom: 0, width: 520, display: "flex", flexDirection: "column", justifyContent: "space-evenly", paddingTop: 60, paddingBottom: 50 }}>
      {MAC_SERVICES.map((svc,i)=>{const a=ease(f,i*12,90+i*12); const op=1-ease(f,245,290); return <div key={svc.id} style={{ height: 146, display: "flex", alignItems: "center", gap: 27, opacity: a*op, transform:`translateX(${(1-a)*-28}px)`, position:"relative" }}><div style={{ color:C.gold, width:80, height:80, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${C.gold}65`, borderRadius: "50%", background:`radial-gradient(circle, ${C.violet}22, transparent 70%)`, flexShrink:0 }}><ServiceIcon kind={svc.icon}/></div><div><div style={{fontSize:27,fontWeight:700,lineHeight:1.23,color:C.platinum}}>{svc.title}</div>{"description" in svc&&<div style={{marginTop:8,fontSize:19,color:C.silver,lineHeight:1.25}}>{svc.description}</div>}</div><div style={{position:"absolute",left:568,top:"50%",width:38,height:1,background:`linear-gradient(90deg,${C.gold},transparent)`}}/></div>;})}
    </div>
    <div style={{ position:"absolute", left:950, right:100, bottom:120, textAlign:"center", opacity:revealTitle, transform:`translateY(${(1-revealTitle)*18}px)`, textShadow:`0 0 35px ${C.violet}88` }}><div style={{fontSize:62,fontWeight:800,letterSpacing:".12em",color:C.platinum}}>М.А.С</div><div style={{marginTop:10,fontSize:30,color:C.brightGold,letterSpacing:".035em"}}>Комплексные фасадные решения</div></div>
  </AbsoluteFill>;
};
