import { AbsoluteFill } from "remotion";
import { CinematicBackground } from "../components/CinematicBackground";
import { LegacyCinematicBackground } from "../components/LegacyCinematicBackground";

const HalfFrame: React.FC<{ side: "left" | "right"; children: React.ReactNode }> = ({ side, children }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      bottom: 0,
      left: side === "left" ? 0 : "50%",
      width: "50%",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "200%",
        height: "100%",
        transform: "scaleX(0.5)",
        transformOrigin: "top left",
      }}
    >
      {children}
    </div>
  </div>
);

export const BackgroundComparison: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#03080D", overflow: "hidden" }}>
    <HalfFrame side="left">
      <LegacyCinematicBackground />
    </HalfFrame>
    <HalfFrame side="right">
      <CinematicBackground />
    </HalfFrame>
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "50%",
        width: 2,
        transform: "translateX(-1px)",
        backgroundColor: "rgba(174, 220, 220, 0.24)",
      }}
    />
  </AbsoluteFill>
);
