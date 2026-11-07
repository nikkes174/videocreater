import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BLACKPHANTOM_COLORS as C } from "../../../config/blackphantom";

const cl={extrapolateLeft:"clamp" as const,extrapolateRight:"clamp" as const};
const p=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{...cl,easing:(x)=>1-Math.pow(1-x,3)});
const nodes=[{x:130,y:155,label:"Обращение"},{x:420,y:345,label:"AI-ассистент"},{x:190,y:550,label:"Обработка"},{x:650,y:530,label:"Готовый ответ"}];
export const AutomationVisual:React.FC=()=>{
 const f=useCurrentFrame();
 const edges=[{a:[130,155],b:[420,345],from:12,to:27},{a:[420,345],b:[190,550],from:27,to:42},{a:[190,550],b:[650,530],from:42,to:58}];
 const signal=edges.map(e=>{const q=p(f,e.from,e.to);return {x:e.a[0]+(e.b[0]-e.a[0])*q,y:e.a[1]+(e.b[1]-e.a[1])*q,opacity:p(f,e.from,e.from+3)*(1-p(f,e.to,e.to+6))};});
 return <div style={{position:"absolute",right:60,top:130,width:850,height:800}}>
  <div style={{position:"absolute",inset:50,background:"radial-gradient(circle,rgba(200,166,106,.14),transparent 62%)",filter:"blur(40px)"}}/>
  <svg viewBox="0 0 800 700" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
   <defs><radialGradient id="core"><stop stopColor="#F1F2F4" stopOpacity=".7"/><stop offset=".3" stopColor="#C8A66A" stopOpacity=".42"/><stop offset="1" stopColor="#C8A66A" stopOpacity="0"/></radialGradient></defs>
   {edges.map((e,i)=><g key={i} opacity={p(f,e.from,e.from+6)}><path d={`M${e.a[0]} ${e.a[1]} Q${(e.a[0]+e.b[0])/2+25} ${(e.a[1]+e.b[1])/2} ${e.b[0]} ${e.b[1]}`} fill="none" stroke="rgba(182,190,200,.38)" strokeWidth="1.5" strokeDasharray="5 9"/></g>)}
   <circle cx="420" cy="345" r="140" fill="url(#core)" opacity={p(f,10,36)*.7}/>
   {nodes.map((n,i)=><g key={n.label} opacity={p(f,5+i*5,20+i*5)}><circle cx={n.x} cy={n.y} r={i===1?66:35} fill="rgba(17,21,27,.96)" stroke="rgba(200,166,106,.62)" strokeWidth="1.6"/><circle cx={n.x} cy={n.y} r={i===1?49:6} fill={i===1?"none":C.gold} stroke={i===1?"rgba(241,242,244,.28)":"none"} strokeDasharray="3 7"/><text x={n.x} y={n.y+5} textAnchor="middle" fill={i===1?"#F1F2F4":"#C8A66A"} fontSize={i===1?17:12} fontFamily="Manrope" fontWeight="700">{i===1?"AI":n.label}</text></g>)}
   {signal.map((s,i)=><circle key={i} cx={s.x} cy={s.y} r="7" fill="#F1F2F4" opacity={s.opacity} style={{filter:"drop-shadow(0 0 9px rgba(200,166,106,.9))"}}/>)}
  </svg>
  <div style={{position:"absolute",left:-6,top:296,padding:"13px 18px",background:"rgba(17,21,27,.96)",border:"1px solid rgba(200,166,106,.3)",color:C.platinum,fontSize:18,opacity:p(f,10,20),transform:`translateX(${(1-p(f,10,20))*26}px)`}}>Новое обращение　<span style={{color:C.gold}}>→</span></div>
  <div style={{position:"absolute",right:0,top:442,padding:"13px 18px",background:"rgba(17,21,27,.96)",border:"1px solid rgba(200,166,106,.3)",color:C.platinum,fontSize:18,opacity:p(f,47,58),transform:`translateX(${(1-p(f,47,58))*-26}px)`}}>Ответ готов　<span style={{color:C.gold}}>✓</span></div>
 </div>;
};
