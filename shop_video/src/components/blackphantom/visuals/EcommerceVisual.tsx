import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BLACKPHANTOM_COLORS as C } from "../../../config/blackphantom";
const cl={extrapolateLeft:"clamp" as const,extrapolateRight:"clamp" as const};
const p=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{...cl,easing:(x)=>1-Math.pow(1-x,3)});
export const EcommerceVisual:React.FC=()=>{
 const f=useCurrentFrame(); const travel=interpolate(f,[42,65],[0,1],cl); const selected=p(f,22,40);
 return <div style={{position:"absolute",right:44,top:135,width:900,height:790,perspective:1300}}>
  <div style={{position:"absolute",inset:65,background:"radial-gradient(ellipse,rgba(200,166,106,.16),transparent 63%)",filter:"blur(42px)"}}/>
  <div style={{position:"absolute",left:75,top:46,width:470,height:570,padding:22,background:"linear-gradient(145deg,rgba(30,35,42,.96),rgba(11,14,18,.98))",border:"1px solid rgba(182,190,200,.25)",boxShadow:"0 50px 100px rgba(0,0,0,.6)",transform:`rotateY(-12deg) translate(${(1-p(f,8,35))*90}px,${(1-p(f,8,35))*36}px)`,opacity:p(f,8,35)}}>
   <div style={{height:36,borderBottom:"1px solid rgba(255,255,255,.1)",display:"flex",justifyContent:"space-between",color:C.silver,fontSize:17,letterSpacing:2}}>КАТАЛОГ <span style={{color:C.gold}}>КОРЗИНА · {travel > 0.3 ? "1" : "0"}</span></div>
   <div style={{height:310,marginTop:18,position:"relative",background:"linear-gradient(140deg,#252a30,#11151a)",overflow:"hidden"}}>
    <div style={{position:"absolute",left:110,top:54,width:205,height:220,background:"linear-gradient(145deg,#c9c4b8,#69645b 55%,#28282a)",clipPath:"polygon(22% 0,78% 0,100% 19%,90% 100%,10% 100%,0 19%)",filter:"drop-shadow(0 24px 28px rgba(0,0,0,.5))",transform:`translate(${travel*220}px,${Math.sin(f/12)*4}px) scale(${1-selected*.12})`}}/>
    <div style={{position:"absolute",left:176,top:46,width:70,height:140,border:"2px solid rgba(241,242,244,.48)",borderRadius:"0 0 34px 34px",borderTop:0,transform:`translateX(${travel*220}px) scale(${1-selected*.12})`}}/>
    <div style={{position:"absolute",left:0,right:0,bottom:0,height:120,background:"linear-gradient(0deg,rgba(200,166,106,.12),transparent)"}}/>
   </div>
   <div style={{display:"flex",justifyContent:"space-between",marginTop:18,color:C.platinum,fontSize:22,fontWeight:700}}>Товар <span style={{color:C.gold}}>Подробнее</span></div>
   <div style={{height:46,marginTop:16,display:"grid",placeItems:"center",background:C.gold,color:"#11151B",fontWeight:800,letterSpacing:2}}>В КОРЗИНУ　↗</div>
  </div>
  {[0,1].map((i)=><div key={i} style={{position:"absolute",left:i===0?570:592,top:i===0?104:320,width:i===0?208:170,height:i===0?174:182,background:"rgba(20,24,29,.96)",border:"1px solid rgba(182,190,200,.18)",padding:14,transform:`translate(${(1-p(f,18+i*5,42+i*4))*(i===0?72:-66)}px,${(1-p(f,18+i*5,42+i*4))*30}px)`,opacity:p(f,18+i*5,42+i*4)}}>
    <div style={{height:i===0?106:112,background:"linear-gradient(145deg,rgba(200,166,106,.22),rgba(182,190,200,.04))",display:"grid",placeItems:"center"}}><div style={{width:58,height:64,border:i===0?"1px solid rgba(241,242,244,.55)":"1px solid rgba(200,166,106,.7)",borderRadius:i===0?0:"50%",transform:"rotate(24deg)"}}/></div>
    <div style={{marginTop:13,color:C.silver,fontSize:18}}>{i===0?"Витрина":"Подборка"}</div>
   </div>)}
  <svg viewBox="0 0 900 790" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}><path d="M500 410 C640 410 580 610 720 610" fill="none" stroke="rgba(200,166,106,.65)" strokeWidth="2" strokeDasharray="5 9"/><circle cx={500+travel*220} cy={410+travel*200} r="7" fill={C.gold} style={{filter:"drop-shadow(0 0 8px rgba(200,166,106,.8))"}}/></svg>
  <div style={{position:"absolute",right:12,bottom:80,width:254,height:178,padding:20,background:"linear-gradient(145deg,rgba(30,35,42,.98),rgba(11,14,18,.98))",border:"1px solid rgba(200,166,106,.36)",boxShadow:"0 32px 72px rgba(0,0,0,.6)",transform:`translateY(${(1-p(f,32,48))*38}px)`,opacity:p(f,32,48)}}>
    <div style={{color:C.gold,fontSize:17,letterSpacing:2}}>ОФОРМЛЕНИЕ</div><div style={{height:1,background:"rgba(241,242,244,.12)",margin:"15px 0"}}/><div style={{color:C.platinum,fontSize:19,fontWeight:700}}>{travel > 0.75 ? "Оплата прошла" : "Заказ принят"}</div><div style={{color:C.silver,fontSize:16,marginTop:10}}>Платёж подтверждён　<span style={{color:C.gold}}>✓</span></div><div style={{marginTop:16,height:4,background:`linear-gradient(90deg,${C.gold} ${Math.round(travel*100)}%,rgba(241,242,244,.12) ${Math.round(travel*100)}%)`}}/>
  </div>
 </div>;
};
