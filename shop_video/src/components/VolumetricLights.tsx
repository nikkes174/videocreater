import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const VolumetricLights: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const lastFrame = Math.max(1, durationInFrames - 1);
  const progress = frame / lastFrame;
  const lightOpacity = interpolate(
    frame,
    [0, Math.round(0.4 * fps), Math.round(1.2 * fps), Math.round(2.4 * fps), lastFrame],
    [0, 0.025, 0.74, 0.84, 0.9],
    { ...clamp, easing: Easing.inOut(Easing.sin) },
  );
  const leftMove = Math.sin(progress * Math.PI * 0.82) * width * 0.045;
  const rightMove = Math.sin(progress * Math.PI * 0.76 + 0.75) * width * 0.04;

  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: lightOpacity, mixBlendMode: "screen", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: "0%",
          top: "-4%",
          width: 260,
          height: height * 0.64,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(68, 213, 216, 0.06) 20%, rgba(68, 213, 216, 0.22) 48%, rgba(38, 130, 145, 0.07) 76%, transparent 100%), linear-gradient(180deg, rgba(68, 213, 216, 0.2), rgba(38, 130, 145, 0.07) 56%, transparent 100%)",
          filter: "blur(55px)",
          transform: `translateX(${leftMove}px) rotate(23deg)`,
          transformOrigin: "top center",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "0%",
          top: "-4%",
          width: 260,
          height: height * 0.64,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(68, 213, 216, 0.05) 20%, rgba(68, 213, 216, 0.2) 50%, rgba(38, 130, 145, 0.065) 78%, transparent 100%), linear-gradient(180deg, rgba(68, 213, 216, 0.18), rgba(38, 130, 145, 0.065) 55%, transparent 100%)",
          filter: "blur(55px)",
          transform: `translateX(${-rightMove}px) rotate(-23deg)`,
          transformOrigin: "top center",
        }}
      />
    </AbsoluteFill>
  );
};
