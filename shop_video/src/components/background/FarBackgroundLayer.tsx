import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useOptionalLayerAsset } from "./useOptionalLayerAsset";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const FarBackgroundLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const asset = useOptionalLayerAsset("bg-far.png");
  const endFrame = Math.max(1, durationInFrames - 1);
  const progress = interpolate(frame, [0, endFrame], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#020508",
        transform: `translate(${interpolate(progress, [0, 1], [-8, 8])}px, ${interpolate(progress, [0, 1], [-6, 6])}px) scale(${interpolate(progress, [0, 1], [1, 1.03])})`,
        pointerEvents: "none",
      }}
    >
      {asset ? (
        <Img
          src={asset}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 62% 42% at 49% 45%, rgba(10, 24, 29, 0.64) 0%, rgba(4, 9, 13, 0.24) 54%, transparent 82%), linear-gradient(150deg, #0A1217 0%, #04090D 40%, #020508 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 38% 45% at 0% 43%, rgba(26, 142, 149, 0.11), transparent 76%), radial-gradient(ellipse 38% 45% at 100% 50%, rgba(26, 142, 149, 0.09), transparent 76%), radial-gradient(ellipse 75% 70% at 50% 48%, transparent 42%, rgba(0, 2, 5, 0.62) 100%)",
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};
