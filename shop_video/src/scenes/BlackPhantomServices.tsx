import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BLACKPHANTOM_SERVICES } from "../config/blackphantomServices";
import { ServiceCard } from "../components/blackphantom/ServiceCard";

const FRAMES_PER_SERVICE = 150;
export const BlackPhantomServices: React.FC = () => <AbsoluteFill style={{ backgroundColor: "#07090C" }}>
  {BLACKPHANTOM_SERVICES.map((service, index) => <Sequence key={service.id} from={index * FRAMES_PER_SERVICE} durationInFrames={FRAMES_PER_SERVICE}>
    <ServiceCard service={service} index={index} />
  </Sequence>)}
</AbsoluteFill>;
