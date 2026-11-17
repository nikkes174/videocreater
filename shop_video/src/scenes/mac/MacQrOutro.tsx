import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing } from "remotion";
import { MAC_COLORS as C } from "../../config/macTheme";
import { MacFontFaces } from "../../components/mac/MacFontFaces";

const fade=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp",easing:Easing.out(Easing.cubic)});
export const MacQrOutro: React.FC = () => {
  const f=useCurrentFrame(); const bg=fade(f,0,45); const title=fade(f,30,85); const qr=fade(f,65,120); const cta=fade(f,100,150);
  return <AbsoluteFill style={{background:`linear-gradient(135deg, ${C.background}, ${C.deepPurple} 55%, #21123c)`,fontFamily:"Manrope, sans-serif",overflow:"hidden",color:C.platinum}}>
    <MacFontFaces />
    <div style={{position:"absolute",inset:0,opacity:bg,background:`radial-gradient(ellipse 48% 64% at 50% 54%, ${C.violet}35, transparent 74%)`}}/>
    <div style={{position:"absolute",top:82,left:0,right:0,textAlign:"center",opacity:title,transform:`translateY(${(1-title)*14}px)`}}><div style={{fontSize:56,fontWeight:800,letterSpacing:".14em",color:C.platinum}}>М.А.С</div><div style={{marginTop:14,fontSize:34,fontWeight:500,color:C.brightGold,letterSpacing:".03em"}}>Приглашаем к сотрудничеству</div></div>
    <div style={{position:"absolute",left:"50%",top:540,width:430,height:430,transform:`translate(-50%, -50%) scale(${.9+qr*.1})`,opacity:qr,background:"#ffffff",borderRadius:18,padding:28,boxShadow:`0 24px 80px rgba(0,0,0,.32), 0 0 52px ${C.gold}35`,display:"flex",alignItems:"center",justifyContent:"center"}}><Img src={staticFile("assets/mac/qr-code.png")} style={{width:"100%",height:"100%",objectFit:"contain",imageRendering:"pixelated"}} /></div>
    <div style={{position:"absolute",left:0,right:0,bottom:86,textAlign:"center",opacity:cta,transform:`translateY(${(1-cta)*12}px)`,fontSize:27,color:C.silver,letterSpacing:".015em"}}>Сканируйте QR-код для связи с нами</div>
    <div style={{position:"absolute",inset:20,border:`1px solid ${C.gold}26`,pointerEvents:"none"}}/>
  </AbsoluteFill>;
};
