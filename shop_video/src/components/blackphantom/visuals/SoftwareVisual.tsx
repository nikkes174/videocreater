import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BLACKPHANTOM_COLORS as C } from "../../../config/blackphantom";
const cl={extrapolateLeft:"clamp" as const,extrapolateRight:"clamp" as const};
const p=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{...cl,easing:(x)=>1-Math.pow(1-x,3)});
const modules=[
 {id:"platform",label:"Ваша платформа",x:34,y:55,w:326,h:265},
 {id:"integration",label:"Интеграции",x:447,y:46,w:315,h:196},
 {id:"database",label:"Данные",x:480,y:310,w:280,h:180},
 {id:"dashboard",label:"Управление",x:114,y:418,w:330,h:200},
];
export const SoftwareVisual:React.FC=()=>{const f=useCurrentFrame();
 return <div style={{position:"absolute",right:70,top:135,width:850,height:770,perspective:1500}}>
  <div style={{position:"absolute",inset:70,background:"radial-gradient(ellipse,rgba(200,166,106,.14),transparent 65%)",filter:"blur(42px)"}}/>
  <svg viewBox="0 0 800 690" style={{position:"absolute",inset:10,width:"96%",height:"96%"}}>{[[360,180,447,140,22],[260,320,290,418,30],[610,242,610,310,36],[444,520,480,400,42],[360,180,480,400,48]].map(([x1,y1,x2,y2,start],i)=>{const q=p(f,start,start+16);const dx=x2-x1,dy=y2-y1;const travel=p(f,start+8,start+30);return <g key={i} opacity={q}><path d={`M${x1} ${y1} L${x2} ${y2}`} stroke="rgba(200,166,106,.55)" strokeWidth="1.5" strokeDasharray="5 8" strokeDashoffset={-f*1.2}/><circle cx={x1+dx*travel} cy={y1+dy*travel} r="5" fill={C.gold} style={{filter:"drop-shadow(0 0 7px rgba(200,166,106,.8))"}}/></g>})}</svg>
  {modules.map((m,i)=>{const q=p(f,8+i*5,28+i*5);return <div key={m.id} style={{position:"absolute",left:m.x,top:m.y,width:m.w,height:m.h,background:"linear-gradient(145deg,rgba(28,33,40,.97),rgba(12,15,19,.97))",border:"1px solid rgba(182,190,200,.25)",boxShadow:"0 30px 65px rgba(0,0,0,.48),inset 0 1px rgba(255,255,255,.07)",transform:`translate3d(${(1-q)*(i%2?100:-80)}px,${(1-q)*36}px,${(1-q)*-100}px) rotateY(${i%2?5:-5}deg)`,opacity:q}}>
   <div style={{height:42,padding:"0 16px",display:"flex",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,.08)",color:C.gold,fontSize:17,letterSpacing:1.4}}>{m.label}</div>
   {i===0&&<div style={{padding:18,color:C.silver,fontFamily:"Manrope",fontSize:18,lineHeight:1.7}}>Рабочие процессы<br/><span style={{color:C.platinum}}>Клиенты · Задачи</span><br/>Единая логика бизнеса</div>}
   {i===1&&<div style={{padding:18,display:"flex",gap:12,alignItems:"center",color:C.platinum,fontSize:16}}>{["Оплата","Склад","Связь"].map(t=><span key={t} style={{padding:"10px 12px",border:"1px solid rgba(200,166,106,.3)"}}>{t}</span>)}</div>}
   {i===2&&<div style={{padding:20,display:"flex",alignItems:"center",gap:14}}><div style={{width:54,height:66,border:"1px solid rgba(200,166,106,.5)",borderRadius:"50% / 12%",background:"linear-gradient(90deg,rgba(200,166,106,.12),transparent)"}}/><div style={{color:C.silver,fontSize:17,lineHeight:1.7}}>Клиенты　18 тыс.<br/>Заказы　 204 тыс.</div></div>}
   {i===3&&<div style={{padding:"18px 16px",display:"flex",alignItems:"end",gap:9,height:140}}>{[42,63,54,86,72,112,95,124].map((v,n)=><div key={n} style={{flex:1,height:v*(.35+.65*p(f,38+n,74+n)),background:`linear-gradient(180deg,rgba(200,166,106,${.75-n*.035}),rgba(200,166,106,.08))`}}/>)}</div>}
  </div>})}
  <div style={{position:"absolute",left:390,top:326,width:70,height:70,borderRadius:"50%",display:"grid",placeItems:"center",background:"radial-gradient(circle,rgba(200,166,106,.3),rgba(17,21,27,.95) 70%)",border:"1px solid rgba(200,166,106,.48)",color:C.platinum,fontSize:16,letterSpacing:1,opacity:p(f,22,42)}}>ПО</div>
 </div>;
};
