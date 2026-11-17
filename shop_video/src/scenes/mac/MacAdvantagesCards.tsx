import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { MAC_ADVANTAGES } from "../../config/macContent";
import { MacPaperTitleCard } from "../../components/mac/MacPaperTitleCard";

export const MacAdvantagesCards: React.FC = () => {
  const f=useCurrentFrame();
  let cursor=0;
  return <AbsoluteFill style={{background:"#f2eff5"}}>{MAC_ADVANTAGES.map((card,index)=>{const start=cursor-Math.min(index,3)*12;cursor+=card.frames;const last=index===MAC_ADVANTAGES.length-1;const duration=card.frames+(last?36:0);const local=f-start;const inside=interpolate(local,[0,10],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});const next=last?1:interpolate(local,[duration-12,duration],[1,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});return <Sequence key={card.id} from={start} durationInFrames={duration}><AbsoluteFill style={{opacity:Math.min(inside,next)}}><MacPaperTitleCard text={card.text} accent={card.accent} duration={duration} emphasis={last} holdAtEnd={last}/></AbsoluteFill></Sequence>;})}</AbsoluteFill>;
};
