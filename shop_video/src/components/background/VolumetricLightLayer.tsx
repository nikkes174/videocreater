import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useOptionalLayerAsset } from "./useOptionalLayerAsset";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const BEAMS = [
  { side: "left", angle: 22, intensity: 0.22, width: 230, height: 1320, x: 16, y: 10 },
  { side: "right", angle: -24, intensity: 0.19, width: 290, height: 1260, x: 15, y: 12 },
  { side: "center", angle: -4, intensity: 0.1, width: 220, height: 1050, x: 12, y: 8 },
] as const;

export const VolumetricLightLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const asset = useOptionalLayerAsset("bg-lights.png");
  const endFrame = Math.max(1, durationInFrames - 1);
  const progress = frame / endFrame;
  const activation = interpolate(
    frame,
    [0, Math.round(0.4 * fps), Math.round(1.2 * fps), Math.round(2.4 * fps), endFrame],
    [0.015, 0.045, 0.76, 0.96, 1],
    { ...clamp, easing: Easing.inOut(Easing.sin) },
  );
  const breathe = 0.9 + Math.sin(progress * Math.PI * 1.25) * 0.1;
  const driftX = Math.sin(progress * Math.PI * 1.1) * 16;
  const driftY = Math.cos(progress * Math.PI * 0.9) * 10;
  const scale = interpolate(progress, [0, 1], [1, 1.04]);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        opacity: activation * breathe,
        mixBlendMode: "screen",
        transform: `translate(${driftX}px, ${driftY}px) scale(${scale})`,
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
          {BEAMS.map((beam, index) => {
            const motion = Math.sin(progress * Math.PI * 1.15 + index * 1.7);
            const rotation = beam.angle + Math.sin(progress * Math.PI + index) * 1.6;
            const left = beam.side === "left" ? "-5%" : beam.side === "right" ? "75%" : "43%";
            const top = beam.side === "center" ? "-15%" : "-12%";

            return (
              <div
                key={beam.side}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width: beam.width,
                  height: Math.min(beam.height, height * 0.74),
                  opacity: beam.intensity * (0.86 + Math.sin(progress * Math.PI * 1.4 + index) * 0.14),
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(68, 213, 216, 0.22) 17%, rgba(68, 213, 216, 0.68) 48%, rgba(38, 130, 145, 0.3) 79%, transparent 100%), linear-gradient(180deg, rgba(116, 229, 232, 0.62), rgba(52, 169, 184, 0.3) 52%, rgba(31, 104, 122, 0.07) 88%, transparent 100%)",
                  filter: "blur(48px)",
                  transform: `translate(${motion * beam.x}px, ${motion * beam.y}px) rotate(${rotation}deg)`,
                  transformOrigin: "top center",
                }}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              left: "28%",
              top: "6%",
              width: width * 0.48,
              height: height * 0.54,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(67, 195, 199, 0.12) 0%, rgba(26, 105, 119, 0.06) 42%, transparent 78%)",
              filter: "blur(68px)",
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};
