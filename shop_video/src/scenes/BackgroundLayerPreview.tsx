import { AbsoluteFill } from "remotion";
import { FarBackgroundLayer } from "../components/background/FarBackgroundLayer";
import { VolumetricLightLayer } from "../components/background/VolumetricLightLayer";
import { HazeLayer } from "../components/background/HazeLayer";
import { ParticleLayer } from "../components/background/ParticleLayer";
import { BokehLayer } from "../components/background/BokehLayer";
import { ReflectiveFloorLayer } from "../components/background/ReflectiveFloorLayer";

export type BackgroundLayerName = "far" | "lights" | "haze" | "particles" | "bokeh" | "floor";

export const BackgroundLayerPreview: React.FC<{ layer: BackgroundLayerName }> = ({ layer }) => (
  <AbsoluteFill style={{ backgroundColor: "#020508", overflow: "hidden" }}>
    {layer === "far" ? <FarBackgroundLayer /> : null}
    {layer === "lights" ? <VolumetricLightLayer /> : null}
    {layer === "haze" ? <HazeLayer /> : null}
    {layer === "particles" ? <ParticleLayer depth="all" /> : null}
    {layer === "bokeh" ? <BokehLayer /> : null}
    {layer === "floor" ? <ReflectiveFloorLayer /> : null}
  </AbsoluteFill>
);
