import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BlackPhantomService } from "../../config/blackphantomServices";
import { BLACKPHANTOM_COLORS as C } from "../../config/blackphantom";
import { BeatCutTransition, getBeatCutMotion, getServiceCamera, SERVICE_CAMERAS } from "./BeatCutTransition";
import { ServiceTypography } from "./ServiceTypography";
import { WebDevelopmentVisual } from "./visuals/WebDevelopmentVisual";
import { AutomationVisual } from "./visuals/AutomationVisual";
import { EcommerceVisual } from "./visuals/EcommerceVisual";
import { SoftwareVisual } from "./visuals/SoftwareVisual";

export const ServiceCard: React.FC<{ service: BlackPhantomService; index: number }> = ({ service, index }) => {
  const frame = useCurrentFrame();
  const camera = getServiceCamera(frame, SERVICE_CAMERAS[service.id]);
  const entryMotion = index > 0 && frame < 4 ? getBeatCutMotion(frame) : null;
  const flash = Math.max(camera.flash, entryMotion?.flash ?? 0);
  const Visual = [WebDevelopmentVisual, AutomationVisual, EcommerceVisual, SoftwareVisual][index];
  return <AbsoluteFill style={{ overflow: "hidden", background: C.background }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 48% 74% at 76% 48%, rgba(182,190,200,.055), transparent 72%), linear-gradient(110deg,#07090C 0%,#0b0e12 62%,#07090C 100%)" }} />
    <div style={{ position: "absolute", inset: 0, opacity: 0.14, backgroundImage: "linear-gradient(rgba(182,190,200,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(182,190,200,.08) 1px,transparent 1px)", backgroundSize: "72px 72px", maskImage: "linear-gradient(90deg,transparent 32%,black 100%)" }} />
    <ServiceTypography service={service} />
    <div style={{ position: "absolute", left: 960, top: 0, width: 960, height: 1080, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: camera.transform, filter: `brightness(${1 + camera.bloom})` }}><Visual /></div>
    </div>
    <BeatCutTransition flash={flash} focus={camera.focus} focusScale={camera.shotIndex === 0 ? 1 : camera.shotIndex === 1 ? 0.78 : 0.64} />
  </AbsoluteFill>;
};
