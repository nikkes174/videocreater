import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { useOptionalLayerAsset } from "./useOptionalLayerAsset";

type BokehPoint = {
  x: number;
  y: number;
  diameter: number;
  blur: number;
  opacity: number;
  phase: number;
  speed: number;
  driftX: number;
  driftY: number;
  color: string;
};

const randomAt = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
};

const BOKEH: BokehPoint[] = Array.from({ length: 7 }, (_, index) => {
  const r1 = randomAt(index + 501);
  const r2 = randomAt(index + 601);
  const r3 = randomAt(index + 701);
  const r4 = randomAt(index + 801);
  const positions = [
    { x: 6 + r1 * 15, y: 17 + r2 * 20 },
    { x: 79 + r1 * 13, y: 13 + r2 * 22 },
    { x: 3 + r1 * 16, y: 64 + r2 * 19 },
    { x: 81 + r1 * 14, y: 65 + r2 * 18 },
    { x: 27 + r1 * 43, y: 8 + r2 * 17 },
    { x: 26 + r1 * 43, y: 80 + r2 * 12 },
    { x: 78 + r1 * 10, y: 27 + r2 * 9 },
  ];
  const colors = [
    "rgba(114, 222, 219, 0.62)",
    "rgba(156, 239, 234, 0.58)",
    "rgba(230, 250, 248, 0.52)",
  ];

  return {
    ...positions[index],
    diameter: 18 + r3 * 52,
    blur: 6 + r4 * 12,
    opacity: 0.32 + randomAt(index + 901) * 0.16,
    phase: randomAt(index + 1001) * Math.PI * 2,
    speed: 0.12 + randomAt(index + 1101) * 0.2,
    driftX: 18 + randomAt(index + 1201) * 10,
    driftY: 14 + randomAt(index + 1301) * 8,
    color: colors[index % colors.length],
  };
});

export const BokehLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const asset = useOptionalLayerAsset("bg-bokeh.png");
  const progress = frame / Math.max(1, durationInFrames - 1);

  return (
    <AbsoluteFill style={{ overflow: "hidden", mixBlendMode: "screen", pointerEvents: "none" }}>
      {asset ? (
        <Img src={asset} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        BOKEH.map((light, index) => {
          const angle = progress * Math.PI * 2 * light.speed + light.phase;
          const x = light.x + (Math.sin(angle) * light.driftX) / width * 100;
          const y = light.y + (Math.cos(angle * 0.72) * light.driftY) / height * 100;
          const breathe = 0.78 + 0.22 * Math.sin(angle * 0.6);
          const scale = 1 + 0.04 * (0.5 + Math.sin(angle * 0.5) * 0.5);

          return (
            <div
              key={`bokeh-${index}`}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: light.diameter,
                height: light.diameter,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${light.color} 0%, rgba(72, 155, 164, 0.15) 40%, rgba(41, 108, 123, 0.025) 72%, transparent 86%)`,
                opacity: light.opacity * breathe,
                filter: `blur(${light.blur}px) saturate(0.55)`,
                transform: `translate(-50%, -50%) scale(${scale})`,
              }}
            />
          );
        })
      )}
    </AbsoluteFill>
  );
};
