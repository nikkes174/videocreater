import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import manifest from "../config/fullPromoManifest.json";

type SceneAsset = (typeof manifest.scenes)[number];
type TransitionKind = "opening-sweep" | "depth" | "whip" | "light-reveal" | "soft-scale" | "logo-reveal";
type TransitionPlan = { kind: TransitionKind; direction: -1 | 1 };

const TRANSITIONS: readonly TransitionPlan[] = [
  { kind: "opening-sweep", direction: 1 },
  { kind: "depth", direction: -1 },
  { kind: "whip", direction: -1 },
  { kind: "light-reveal", direction: 1 },
  { kind: "soft-scale", direction: -1 },
  { kind: "logo-reveal", direction: 1 },
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth01 = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

const incomingMotion = (kind: TransitionKind, direction: -1 | 1, progress: number) => {
  const remaining = 1 - progress;
  switch (kind) {
    case "opening-sweep":
      return { x: direction * remaining * 24, y: 0, scale: 1 + remaining * 0.045, blur: remaining * 3 };
    case "depth":
      return { x: 0, y: remaining * 20, scale: 1 + remaining * 0.075, blur: remaining * 7 };
    case "whip":
      return { x: direction * remaining * 62, y: 0, scale: 1 + remaining * 0.025, blur: Math.sin(Math.PI * progress) * 7 };
    case "light-reveal":
      return { x: direction * remaining * 18, y: -remaining * 10, scale: 1 + remaining * 0.055, blur: remaining * 4 };
    case "soft-scale":
      return { x: 0, y: remaining * 8, scale: 1 + remaining * 0.065, blur: remaining * 3 };
    case "logo-reveal":
      return { x: 0, y: remaining * 18, scale: 1 + remaining * 0.04, blur: remaining * 5 };
  }
};

const outgoingMotion = (kind: TransitionKind, direction: -1 | 1, progress: number) => {
  switch (kind) {
    case "opening-sweep":
      return { x: -direction * progress * 18, y: 0, scale: 1 + progress * 0.018, blur: progress * 1.5 };
    case "depth":
      return { x: 0, y: -progress * 10, scale: 1 - progress * 0.035, blur: progress * 4 };
    case "whip":
      return { x: -direction * progress * 64, y: 0, scale: 1, blur: Math.sin(Math.PI * progress) * 7 };
    case "light-reveal":
      return { x: -direction * progress * 10, y: progress * 8, scale: 1 - progress * 0.022, blur: progress * 2 };
    case "soft-scale":
      return { x: 0, y: -progress * 8, scale: 1 - progress * 0.04, blur: progress * 2.5 };
    case "logo-reveal":
      return { x: 0, y: -progress * 12, scale: 1 - progress * 0.02, blur: progress * 4 };
  }
};

const PortraitSceneLayer: React.FC<{ scene: SceneAsset; index: number }> = ({ scene, index }) => {
  const localFrame = useCurrentFrame();
  const overlap = manifest.transitionFrames;
  const preRoll = scene.preRollFrames;
  const isPortrait = scene.height > scene.width;
  const inProgress = index === 0
    ? 1
    : smooth01((localFrame - preRoll) / Math.max(1, overlap - 1));
  const outStart = scene.durationInFrames - overlap;
  const outProgress = index === manifest.scenes.length - 1
    ? 0
    : smooth01((localFrame - outStart) / Math.max(1, overlap - 1));
  const incomingPlan = index > 0 ? TRANSITIONS[index - 1] : undefined;
  const outgoingPlan = index < TRANSITIONS.length ? TRANSITIONS[index] : undefined;
  const enter = incomingPlan
    ? incomingMotion(incomingPlan.kind, incomingPlan.direction, inProgress)
    : { x: 0, y: 0, scale: 1, blur: 0 };
  const exit = outgoingPlan
    ? outgoingMotion(outgoingPlan.kind, outgoingPlan.direction, outProgress)
    : { x: 0, y: 0, scale: 1, blur: 0 };
  const opacity = inProgress * (1 - outProgress);
  const x = enter.x + exit.x;
  const y = enter.y + exit.y;
  const scale = enter.scale * exit.scale;
  const blur = enter.blur + exit.blur;
  const bandY = [49, 50, 49, 52, 49, 50][index] ?? 50;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          backgroundColor: "#03080D",
          opacity,
          transform: `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(5)})`,
          transformOrigin: "50% 50%",
          filter: `blur(${blur.toFixed(2)}px) saturate(0.96) contrast(1.02)`,
        }}
      >
        {!isPortrait && (
          <Img
            src={staticFile(scene.backdrop)}
            style={{
              position: "absolute",
              inset: "-8%",
              width: "116%",
              height: "116%",
              objectFit: "cover",
              transform: "scale(1.04)",
              filter: "blur(34px) brightness(0.72) saturate(0.74)",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(3,8,13,0.48) 0%, rgba(3,8,13,0.12) 26%, rgba(3,8,13,0.04) 58%, rgba(3,8,13,0.48) 100%), radial-gradient(ellipse 65% 42% at 50% 50%, rgba(57,213,199,0.11) 0%, transparent 78%)",
            pointerEvents: "none",
          }}
        />
        {isPortrait ? (
          <OffthreadVideo
            src={staticFile(scene.asset)}
            volume={0}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: `${bandY}%`,
              width: "100%",
              aspectRatio: "16 / 9",
              transform: "translateY(-50%)",
              overflow: "hidden",
              boxShadow: "0 28px 82px rgba(0,0,0,0.55)",
            }}
          >
            <OffthreadVideo
              src={staticFile(scene.asset)}
              volume={0}
              style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0.97)" }}
            />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

const TransitionAtmosphere: React.FC<{ frame: number; startFrame: number; plan: TransitionPlan }> = ({
  frame,
  startFrame,
  plan,
}) => {
  const duration = manifest.transitionFrames;
  const progress = clamp01((frame - startFrame) / Math.max(1, duration - 1));
  if (progress <= 0 || progress >= 1) return null;
  const envelope = Math.sin(Math.PI * progress);
  const sweepLeft = -45 + progress * 190;

  if (plan.kind === "depth") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: envelope * 0.36,
          background: "radial-gradient(ellipse 42% 36% at 50% 50%, rgba(114,222,219,0.34), rgba(57,213,199,0.12) 48%, transparent 78%)",
          filter: "blur(26px)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    );
  }

  const horizontal = plan.kind === "whip" || plan.kind === "logo-reveal";
  const finale = plan.kind === "logo-reveal";
  const left = plan.kind === "whip"
    ? 88 - progress * 176
    : plan.direction > 0
      ? sweepLeft
      : 145 - progress * 190;
  const width = plan.kind === "whip" ? "20%" : finale ? "44%" : "36%";
  const top = horizontal ? (finale ? "68%" : "-15%") : `${-45 + progress * 190}%`;
  const height = horizontal ? (finale ? "20%" : "130%") : "44%";
  const beam = finale
    ? "linear-gradient(90deg, transparent, rgba(57,213,199,0.28) 32%, rgba(234,246,245,0.56) 50%, rgba(114,222,219,0.28) 64%, transparent)"
    : "linear-gradient(100deg, transparent, rgba(57,213,199,0.2) 35%, rgba(234,246,245,0.34) 50%, rgba(114,222,219,0.2) 64%, transparent)";

  return (
    <div
      style={{
        position: "absolute",
        left: `${left}%`,
        top,
        width,
        height,
        opacity: envelope * (plan.kind === "whip" ? 0.72 : 0.56),
        transform: horizontal ? "skewX(-12deg)" : "rotate(-12deg)",
        background: beam,
        filter: `blur(${plan.kind === "whip" ? 24 : 38}px)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};

export const UNLIMITSUB_FULL_PROMO_FPS = manifest.fps;
export const UNLIMITSUB_FULL_PROMO_DURATION = manifest.durationInFrames;

export const UnlimitSubFullPromoVertical: React.FC = () => {
  const frame = useCurrentFrame();
  let nextStart = 0;
  const starts = manifest.scenes.map((scene, index) => {
    const start = nextStart;
    if (index < manifest.scenes.length - 1) {
      nextStart += scene.durationInFrames
        - manifest.transitionFrames
        - manifest.scenes[index + 1].preRollFrames;
    }
    return start;
  });

  return (
    <AbsoluteFill style={{ background: "#03080D", overflow: "hidden" }}>
      {manifest.scenes.map((scene, index) => (
        <Sequence
          key={scene.file}
          from={starts[index]}
          durationInFrames={scene.durationInFrames}
          layout="none"
        >
          <PortraitSceneLayer scene={scene} index={index} />
        </Sequence>
      ))}
      {TRANSITIONS.map((plan, index) => (
        <TransitionAtmosphere
          key={`transition-${index + 1}`}
          frame={frame}
          startFrame={starts[index + 1] + manifest.scenes[index + 1].preRollFrames}
          plan={plan}
        />
      ))}
    </AbsoluteFill>
  );
};
