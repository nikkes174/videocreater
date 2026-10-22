import { AbsoluteFill } from "remotion";
import { CinematicBackground, CinematicForeground } from "../components/CinematicBackground";

export const BackgroundOnly: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#020508", overflow: "hidden" }}>
    <CinematicBackground />
    <CinematicForeground />
  </AbsoluteFill>
);
