import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { MAC_FINAL_MONTAGE } from "../../config/macFinalMontage";
import { MAC_VIDEO_CONFIG } from "../../config/macTheme";
import { MacAuroraIntro } from "./MacAuroraIntro";
import { MacTeamStatement } from "./MacTeamStatement";
import { MacServicesConverge } from "./MacServicesConverge";
import { MacAdvantagesCards } from "./MacAdvantagesCards";
import { MacQrOutro } from "./MacQrOutro";
import { MacTransition, type MacTransitionKind } from "../../components/mac/MacTransitions";

const durations=[150,240,390,540,240];
const starts=[0,120,330,690,1200];
const scenes=[MacAuroraIntro,MacTeamStatement,MacServicesConverge,MacAdvantagesCards,MacQrOutro];
const effects: MacTransitionKind[]=["aurora","threads","paper","violet"];
const SLOT: React.FC<{index:number;children:React.ReactNode}> = ({index,children}) => {
  const f=useCurrentFrame(); const d=durations[index];
  const inOpacity=index===0?1:interpolate(f,[0,30],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const outOpacity=index===4?1:interpolate(f,[d-30,d],[1,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  return <AbsoluteFill style={{opacity:inOpacity*outOpacity}}>{children}</AbsoluteFill>;
};

export const MacFinalMontage: React.FC = () => {
  const frame=useCurrentFrame();
  return <AbsoluteFill style={{background:"#090612",overflow:"hidden"}}>
    {scenes.map((Scene,index)=><Sequence key={index} from={starts[index]} durationInFrames={durations[index]}><SLOT index={index}><Scene/></SLOT></Sequence>)}
    {effects.map((effect,index)=>{const from=starts[index+1];const active=frame>=from&&frame<from+30;return active?<Sequence key={effect} from={from} durationInFrames={30}><MacTransition kind={effect}/></Sequence>:null;})}
  </AbsoluteFill>;
};

export const MAC_FINAL_DURATION = MAC_VIDEO_CONFIG.totalFrames;
export const MAC_FINAL_MONTAGE_METADATA = MAC_FINAL_MONTAGE;
