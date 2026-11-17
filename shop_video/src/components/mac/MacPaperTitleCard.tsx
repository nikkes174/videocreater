import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { MAC_COLORS as C } from "../../config/macTheme";
import { MacFontFaces } from "./MacFontFaces";

export const MacPaperTitleCard: React.FC<{ text: string; accent: string; duration: number; emphasis?: boolean; holdAtEnd?: boolean }> = ({ text, accent, duration, emphasis = false, holdAtEnd = false }) => {
  const f = useCurrentFrame();
  const fade = holdAtEnd ? 1 : interpolate(f, [duration-13,duration], [1,0], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
  const underline = interpolate(f,[24,54],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp",easing:Easing.bezier(.3,0,.2,1)});
  const words=text.split(" ");
  return <AbsoluteFill style={{opacity:fade,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",backgroundColor:"#f2eff5",backgroundImage:"radial-gradient(1100px 750px at 50% 42%, rgba(255,255,255,.93), transparent 67%), linear-gradient(120deg, #f0edf4, #f8f6f8 48%, #ece8f2)"}}>
    <MacFontFaces />
    <div style={{position:"absolute",width:1300,height:600,borderRadius:"50%",background:`radial-gradient(closest-side, ${C.gold}12, transparent)`,filter:"blur(24px)"}}/>
    <div style={{position:"relative",textAlign:"center",width:"100%",maxWidth:1560,padding:"0 100px",transform:`scale(${emphasis?1.035:1})`}}>
      <div style={{fontFamily:"Manrope, sans-serif",fontSize:emphasis?78:84,fontWeight:600,lineHeight:1.34,color:C.deepPurple,letterSpacing:"-.035em",display:"flex",flexWrap:"wrap",justifyContent:"center",columnGap:".27em",rowGap:".02em"}}>
        {words.map((word,i)=>{const delay=7+i*4;const t=interpolate(f,[delay,delay+11],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp",easing:Easing.bezier(.2,.75,.3,1)});const isAccent=word.toLocaleLowerCase("ru-RU")===accent.toLocaleLowerCase("ru-RU");return <span key={`${word}-${i}`} style={{opacity:t,transform:`scale(${1.28-.28*t})`,filter:t<.995?`blur(${(1-t)*7}px)`:"none",display:"inline-block",fontStyle:isAccent?"italic":"normal",fontWeight:isAccent?700:600,color:isAccent?C.darkGold:C.deepPurple,textShadow:isAccent?`0 1px 0 ${C.gold}66`:"none"}}>{word}</span>;})}
      </div>
      <div style={{height:4,width:260,margin:"36px auto 0",borderRadius:2,background:`linear-gradient(90deg,${C.darkGold},${C.brightGold},${C.darkGold})`,transform:`scaleX(${underline})`,boxShadow:`0 0 16px ${C.gold}55`}}/>
    </div>
    <div style={{position:"absolute",inset:18,border:"1px solid rgba(88,42,133,.1)",pointerEvents:"none"}}/>
  </AbsoluteFill>;
};
