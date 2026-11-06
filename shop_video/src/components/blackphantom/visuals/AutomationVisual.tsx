import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BLACKPHANTOM_COLORS as C } from "../../../config/blackphantom";

const cl={extrapolateLeft:"clamp" as const,extrapolateRight:"clamp" as const};
const nodes=[{x:130,y:155,label:"INBOX"},{x:650,y:130,label:"CRM"},{x:190,y:550,label:"LEAD SCORE"},{x:650,y:530,label:"ROUTING"},{x:420,y:345,label:"AI CORE"}];
export const AutomationVisual:React.FC=()=>{const f=useCurrentFrame();const p=(a:number,b:number)=>interpolate(f,[a,b],[0,1],{...cl,easing:(x)=>1-Math.pow(1-x,3)});const pts=[[130,155,420,345],[650,130,420,345],[190,550,420,345],[420,345,650,530],[420,345,130,155]];
return <div style={{position:"absolute",right:60,top:130,width:850,height:800,transform:`translateY(${Math.sin(f/24)*6}px)`}}>
 <div style={{position:"absolute",inset:50,background:"radial-gradient(circle,rgba(200,166,106,.14),transparent 62%)",filter:"blur(40px)"}}/>
 <svg viewBox="0 0 800 700" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
  <defs><radialGradient id="core"><stop stopColor="#F1F2F4" stopOpacity=".85"/><stop offset=".28" stopColor="#C8A66A" stopOpacity=".48"/><stop offset="1" stopColor="#C8A66A" stopOpacity="0"/></radialGradient></defs>
  {[...pts,...pts].map(([x1,y1,x2,y2],i)=>{const q=p(7+i*4,30+i*4);return <g key={i}><path d={`M${x1} ${y1} Q${(x1+x2)/2+((i%2)*40-20)} ${(y1+y2)/2} ${x2} ${y2}`} fill="none" stroke="rgba(182,190,200,.3)" strokeWidth="1.4" strokeDasharray="5 9" strokeDashoffset={-f*1.8}/><circle cx={x1+(x2-x1)*((f%54)/54)} cy={y1+(y2-y1)*((f%54)/54)} r="4" fill={C.gold} opacity={q*(i<5?1:.55)}/></g>})}
  <circle cx="420" cy="345" r="140" fill="url(#core)" opacity={p(10,37)*.7}/><circle cx="420" cy="345" r="64" fill="rgba(15,18,22,.94)" stroke="rgba(200,166,106,.7)" strokeWidth="1.5"/><circle cx="420" cy="345" r="46" fill="none" stroke="rgba(241,242,244,.18)" strokeDasharray="2 7"/>
  <text x="420" y="340" textAnchor="middle" fill="#F1F2F4" fontSize="16" fontFamily="Manrope" fontWeight="700" letterSpacing="3">AI</text><text x="420" y="365" textAnchor="middle" fill="#C8A66A" fontSize="9" fontFamily="Manrope" letterSpacing="2">ORCHESTRATOR</text>
  {nodes.slice(0,4).map((n,i)=><g key={n.label} opacity={p(5+i*4,24+i*4)}><circle cx={n.x} cy={n.y} r="31" fill="rgba(17,21,27,.94)" stroke="rgba(182,190,200,.35)"/><circle cx={n.x} cy={n.y} r="5" fill={C.gold}/><text x={n.x} y={n.y+55} textAnchor="middle" fill="#B6BEC8" fontSize="10" fontFamily="Manrope" letterSpacing="1.5">{n.label}</text></g>)}
 </svg>
 <div style={{position:"absolute",left:0,top:300,padding:"13px 18px",background:"rgba(17,21,27,.92)",border:"1px solid rgba(200,166,106,.25)",color:C.silver,fontSize:13,letterSpacing:1.3,opacity:p(14,24),transform:`translateX(${(1-p(14,24))*30}px)`}}>Новая заявка　 <span style={{color:C.gold}}>→</span></div>
 <div style={{position:"absolute",right:8,top:440,padding:"13px 18px",background:"rgba(17,21,27,.92)",border:"1px solid rgba(200,166,106,.25)",color:C.silver,fontSize:13,letterSpacing:1.3,opacity:p(24,38),transform:`translateX(${(1-p(24,38))*-26}px)`}}>Ответ отправлен　<span style={{color:C.gold}}>✓</span></div>
 </div>};
