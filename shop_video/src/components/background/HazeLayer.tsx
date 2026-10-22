import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useOptionalLayerAsset } from "./useOptionalLayerAsset";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const HazeLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const asset = useOptionalLayerAsset("bg-haze.png");
  const lastFrame = Math.max(1, durationInFrames - 1);
  const progress = frame / lastFrame;
  const opacity = interpolate(
    frame,
    [0, Math.round(0.4 * fps), Math.round(1.2 * fps), Math.round(2.4 * fps), lastFrame],
    [0.015, 0.065, 0.2, 0.26, 0.23],
    { ...clamp, easing: Easing.inOut(Easing.sin) },
  );
  const driftX = Math.sin(progress * Math.PI * 0.8) * 12;
  const driftY = Math.cos(progress * Math.PI * 0.7) * 10;
  const scale = interpolate(progress, [0, 1], [1, 1.02]);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        opacity,
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
        <svg
          aria-hidden="true"
          viewBox="0 0 1080 1920"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <defs>
            <filter id="cinematic-haze-texture" x="-12%" y="-12%" width="124%" height="124%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.004 0.012"
                numOctaves="2"
                seed="17"
                stitchTiles="stitch"
                result="noise"
              />
              <feColorMatrix
                in="noise"
                type="matrix"
                values="0.16 0.16 0.16 0 0.01
                        0.38 0.38 0.38 0 0.04
                        0.42 0.42 0.42 0 0.07
                        0.3 0.3 0.3 0 0"
                result="tealClouds"
              />
              <feGaussianBlur in="tealClouds" stdDeviation="28" />
            </filter>
            <radialGradient id="haze-source-main" gradientUnits="userSpaceOnUse" cx="540" cy="900" r="680">
              <stop offset="0%" stopColor="white" stopOpacity="0.92" />
              <stop offset="52%" stopColor="white" stopOpacity="0.62" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="haze-source-right" gradientUnits="userSpaceOnUse" cx="820" cy="900" r="390">
              <stop offset="0%" stopColor="white" stopOpacity="0.72" />
              <stop offset="58%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="haze-light-zones">
              <rect width="1080" height="1920" fill="black" />
              <rect width="1080" height="1920" fill="url(#haze-source-main)" />
              <rect width="1080" height="1920" fill="url(#haze-source-right)" />
            </mask>
          </defs>
          <rect
            width="1080"
            height="1920"
            fill="#72c9cc"
            filter="url(#cinematic-haze-texture)"
            mask="url(#haze-light-zones)"
          />
        </svg>
      )}
    </AbsoluteFill>
  );
};
