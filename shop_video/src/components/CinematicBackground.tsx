import { FarBackgroundLayer } from "./background/FarBackgroundLayer";
import { VolumetricLightLayer } from "./background/VolumetricLightLayer";
import { HazeLayer } from "./background/HazeLayer";
import { ParticleLayer } from "./background/ParticleLayer";
import { BokehLayer } from "./background/BokehLayer";
import { ReflectiveFloorLayer } from "./background/ReflectiveFloorLayer";

export const CinematicBackground: React.FC = () => (
  <>
    <FarBackgroundLayer />
    <VolumetricLightLayer />
    <HazeLayer />
    <ParticleLayer depth="back" />
    <ParticleLayer depth="mid" />
  </>
);

export const CinematicForeground: React.FC = () => (
  <>
    <ParticleLayer depth="front" />
    <BokehLayer />
    <ReflectiveFloorLayer />
  </>
);
