import { AbsoluteFill } from "remotion";
import { FlyingServices } from "../components/FlyingServices";

export const FlyingServicesScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#03080D", overflow: "hidden" }}>
      <FlyingServices />
    </AbsoluteFill>
  );
};