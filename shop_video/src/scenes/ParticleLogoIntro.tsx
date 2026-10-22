import { AbsoluteFill } from "remotion";
import { CinematicBackground, CinematicForeground } from "../components/CinematicBackground";
import { ParticleLogoReveal, type ParticleLogoRevealProps } from "../components/ParticleLogoReveal";

export const ParticleLogoIntro: React.FC<ParticleLogoRevealProps> = (props) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#03080D", overflow: "hidden" }}>
      <CinematicBackground />
      <ParticleLogoReveal {...props} />
      <CinematicForeground />
    </AbsoluteFill>
  );
};
