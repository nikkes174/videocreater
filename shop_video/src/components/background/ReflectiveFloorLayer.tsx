import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useOptionalLayerAsset } from "./useOptionalLayerAsset";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const ReflectiveFloorLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const asset = useOptionalLayerAsset("bg-floor.png");
  const lastFrame = Math.max(1, durationInFrames - 1);
  const progress = frame / lastFrame;
  const reveal = interpolate(
    frame,
    [0, Math.round(0.4 * fps), Math.round(1.2 * fps), Math.round(2.1 * fps), lastFrame],
    [0, 0, 0.64, 0.92, 1],
    { ...clamp, easing: Easing.inOut(Easing.sin) },
  );
  const shimmer = Math.sin(progress * Math.PI * 1.45);
  const travellingX = Math.sin(progress * Math.PI * 0.9) * 18;
  const glowPulse = 0.92 + Math.sin(progress * Math.PI * 1.25 + 0.4) * 0.08;

  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: reveal, pointerEvents: "none" }}>
      {asset ? (
        <Img
          src={asset}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `translateX(${travellingX}px) scale(1.02)`,
          }}
        />
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "66.5%",
              bottom: 0,
              background:
                "linear-gradient(180deg, rgba(3, 8, 13, 0) 0%, rgba(4, 12, 17, 0.3) 12%, rgba(3, 9, 14, 0.78) 54%, rgba(1, 3, 6, 0.98) 100%), linear-gradient(90deg, rgba(1, 4, 8, 0.6), rgba(12, 30, 36, 0.1) 50%, rgba(1, 4, 8, 0.64))",
              borderTop: "1px solid rgba(103, 188, 190, 0.12)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "8%",
              top: "65.5%",
              width: "84%",
              height: "24%",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse 55% 18% at 50% 71%, rgba(39, 201, 204, 0.24) 0%, rgba(13, 85, 103, 0.10) 45%, transparent 80%)",
              filter: "blur(28px)",
              opacity: glowPulse,
              transform: `translateX(${travellingX}px) scaleY(0.62)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "18%",
              top: "68%",
              width: "64%",
              height: "23%",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(63, 215, 212, 0.2) 0%, rgba(28, 127, 142, 0.09) 39%, rgba(7, 34, 44, 0.025) 72%, transparent 86%)",
              filter: "blur(42px)",
              transform: `translateX(${-travellingX * 0.6}px) scaleY(0.48)`,
            }}
          />
          {[0, 1, 2, 3].map((index) => {
            const width = 48 + index * 12;
            const shift = Math.sin(progress * Math.PI * 1.1 + index * 0.8) * (10 + index * 2);
            const y = 68 + index * 4.5;

            return (
              <div
                key={`floor-glint-${index}`}
                style={{
                  position: "absolute",
                  left: `${(100 - width) / 2 + shift * 0.08}%`,
                  top: `${y}%`,
                  width: `${width}%`,
                  height: 30 + index * 11,
                  borderRadius: "50%",
                  background: `radial-gradient(ellipse 75% 32% at 50% 50%, rgba(91, 223, 218, ${0.14 - index * 0.025}) 0%, rgba(36, 130, 143, ${0.08 - index * 0.014}) 47%, rgba(7, 33, 42, 0.02) 74%, transparent 88%)`,
                  filter: `blur(${9 + index * 3}px)`,
                  transform: `scaleY(${0.5 - index * 0.06}) translateY(${shimmer * 2}px)`,
                }}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              left: "12%",
              right: "12%",
              top: "67.4%",
              height: 2,
              background:
                "linear-gradient(90deg, transparent, rgba(122, 221, 220, 0.13) 25%, rgba(158, 241, 235, 0.2) 50%, rgba(122, 221, 220, 0.13) 75%, transparent)",
              filter: "blur(3px)",
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};
