import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BLACKPHANTOM_COLORS as C } from "../../../config/blackphantom";

const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
export const WebDevelopmentVisual: React.FC = () => {
  const f = useCurrentFrame(); const p = (a: number,b: number) => interpolate(f,[a,b],[0,1],{...cl,easing:(x)=>1-Math.pow(1-x,3)});
  const float = Math.sin(f/22)*7;
  return <div style={{position:"absolute",right:74,top:130,width:840,height:820,perspective:1400,transform:`translateY(${float}px) rotateY(-8deg)`}}>
    <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 45%,rgba(200,166,106,.16),transparent 62%)",filter:"blur(34px)"}} />
    <div style={{position:"absolute",left:12,top:20,width:760,height:650,border:"1px solid rgba(182,190,200,.24)",background:"linear-gradient(145deg,rgba(28,33,40,.96),rgba(10,13,17,.94))",boxShadow:"0 60px 120px rgba(0,0,0,.56),inset 0 1px rgba(255,255,255,.1)",transform:`translateY(${(1-p(4,34))*50}px) scale(${.97+.03*p(4,34)})`,borderRadius:20,overflow:"hidden"}}>
      <div style={{height:48,display:"flex",alignItems:"center",gap:9,padding:"0 20px",background:"rgba(255,255,255,.035)",borderBottom:"1px solid rgba(255,255,255,.08)"}}><i/><i/><i/><div style={{marginLeft:28,width:370,height:19,borderRadius:12,background:"rgba(255,255,255,.07)"}} /></div>
      <div style={{height:54,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 34px",color:C.platinum,fontSize:14,letterSpacing:2}}><b style={{fontFamily:"Unbounded",fontSize:17}}>ФОРМА</b><span style={{color:C.silver}}>СТУДИЯ　　ПРОЕКТЫ　　О НАС</span><b style={{color:C.gold}}>↗</b></div>
      <div style={{position:"relative",height:302,padding:"34px",background:"linear-gradient(105deg,rgba(17,21,27,.5),rgba(200,166,106,.06))"}}>
        <span style={{color:C.gold,fontSize:14,letterSpacing:3}}>ЦИФРОВОЙ ДИЗАЙН</span><div style={{fontFamily:"Manrope",fontWeight:800,fontSize:43,lineHeight:1.08,letterSpacing:-1.5,marginTop:19,maxWidth:390}}>Ваша идея.<br/>Новый масштаб.</div><div style={{marginTop:18,width:210,height:5,background:`linear-gradient(90deg,${C.gold},transparent)`,opacity:p(15,40)}} />
        <div style={{position:"absolute",right:42,top:30,width:280,height:245,transform:`rotate(${(p(8,42)-1)*12}deg) scale(${p(8,42)})`,opacity:p(8,42)}}><div style={{position:"absolute",inset:18,border:"1px solid rgba(200,166,106,.48)",transform:"rotate(30deg)",boxShadow:"0 0 48px rgba(200,166,106,.12)"}}/><div style={{position:"absolute",inset:54,border:"1px solid rgba(241,242,244,.55)",transform:"rotate(30deg)"}}/><div style={{position:"absolute",left:112,top:82,width:70,height:70,background:"linear-gradient(145deg,#e0c894,#8d7043)",clipPath:"polygon(50% 0,100% 28%,80% 100%,20% 100%,0 28%)",filter:"drop-shadow(0 18px 25px rgba(200,166,106,.35))"}}/></div>
      </div>
      <div style={{display:"flex",gap:14,padding:"18px 28px"}}>{[0,1,2].map((n)=><div key={n} style={{height:166,flex:1,padding:14,border:"1px solid rgba(182,190,200,.14)",background:"rgba(255,255,255,.025)",transform:`translateY(${(1-p(42+n*5,56+n*4))*38}px)`,opacity:p(42+n*5,56+n*4)}}><div style={{height:80,background:n===1?"linear-gradient(140deg,rgba(200,166,106,.24),rgba(182,190,200,.04))":"linear-gradient(140deg,rgba(182,190,200,.12),rgba(182,190,200,.025))"}}/><div style={{height:7,width:"64%",marginTop:14,background:"rgba(241,242,244,.45)"}}/><div style={{height:5,width:"88%",marginTop:9,background:"rgba(182,190,200,.19)"}}/></div>)}</div>
      <div style={{position:"absolute",left:-10,bottom:38,color:"rgba(200,166,106,.7)",fontSize:15,letterSpacing:3}}>ВАША ЦИФРОВАЯ ПЛАТФОРМА</div>
    </div>
    <style>{`i{display:block;width:7px;height:7px;border-radius:50%;background:rgba(241,242,244,.28)}`}</style>
  </div>;
};
