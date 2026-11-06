import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BlackPhantomService } from "../../config/blackphantomServices";
import { BLACKPHANTOM_COLORS as C } from "../../config/blackphantom";
import { BeatCutTransition, getBeatCutMotion } from "./BeatCutTransition";
import { ServiceTypography } from "./ServiceTypography";
import { WebDevelopmentVisual } from "./visuals/WebDevelopmentVisual";
import { AutomationVisual } from "./visuals/AutomationVisual";
import { EcommerceVisual } from "./visuals/EcommerceVisual";
import { SoftwareVisual } from "./visuals/SoftwareVisual";

export const ServiceCard: React.FC<{ service: BlackPhantomService; index: number }> = ({ service, index }) => {
  const frame = useCurrentFrame();
  const motion = getBeatCutMotion(frame);
  const Visual = [WebDevelopmentVisual, AutomationVisual, EcommerceVisual, SoftwareVisual][index];
  return <AbsoluteFill style={{ overflow: "hidden", background: C.background }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 48% 74% at 76% 48%, rgba(182,190,200,.055), transparent 72%), linear-gradient(110deg,#07090C 0%,#0b0e12 62%,#07090C 100%)" }} />
    <div style={{ position: "absolute", inset: 0, opacity: 0.14, backgroundImage: "linear-gradient(rgba(182,190,200,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(182,190,200,.08) 1px,transparent 1px)", backgroundSize: "72px 72px", maskImage: "linear-gradient(90deg,transparent 32%,black 100%)" }} />
    <div style={{ position: "absolute", inset: 0, transformOrigin: "center center", transform: `translate(${motion.shakeX}px,${motion.translateY + motion.shakeY}px) scale(${motion.scale})`, filter: `brightness(${1 + motion.bloom})` }}>
      <ServiceTypography service={service} />
      <Visual />
      <div style={{ position: "absolute", right: 82, top: 71, color: "rgba(182,190,200,.35)", fontFamily: "Manrope,sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 4 }}>BLACKPHANTOM　 /　 CAPABILITIES</div>
    </div>
    <BeatCutTransition />
  </AbsoluteFill>;
};
