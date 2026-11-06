import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  FINAL_MONTAGE_CLIPS,
  FINAL_MONTAGE_CLIP_STARTS,
  FINAL_MONTAGE_TRANSITION_STARTS,
  FINAL_MONTAGE_TRANSITIONS,
  getTransitionPreviewDuration,
  type FinalMontageTransition,
} from "../config/finalMontage";

const ease = (frame: number, duration: number) => {
  if (duration <= 1) return 1;
  return interpolate(frame, [0, duration - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
};

const getEntryStyle = (transition: FinalMontageTransition, frame: number): React.CSSProperties => {
  const progress = ease(frame, transition.frames);
  const remaining = 1 - progress;
  const scale = 1 + 0.025 * remaining;
  const blur = `${1.35 * remaining}px`;

  switch (transition.style) {
    case "light-sweep-left":
      return { clipPath: `inset(0 ${remaining * 100}% 0 0)`, transform: `scale(${scale})` };
    case "depth-iris":
      return {
        clipPath: `circle(${progress * 150}% at 50% 50%)`,
        transform: `scale(${1 + 0.07 * remaining})`,
        filter: `blur(${1.7 * remaining}px)`,
      };
    case "spotlight-lift":
      return { clipPath: `inset(0 0 ${remaining * 100}% 0)`, transform: `scale(${scale})` };
    case "angled-sweep": {
      const top = 100 - progress * 150;
      const bottom = 100 - progress * 110;
      return {
        clipPath: `polygon(${top}% 0%, 100% 0%, 100% 100%, ${bottom}% 100%)`,
        transform: `scale(${scale})`,
      };
    }
    case "soft-dissolve":
      return {
        opacity: progress,
        transform: `scale(${1 + 0.025 * remaining})`,
        filter: `blur(${1.1 * remaining}px)`,
      };
    case "silver-radial":
      return { clipPath: `circle(${progress * 150}% at 50% 50%)`, transform: `scale(${scale})` };
  }
};

type ClipLayerProps = {
  clipIndex: number;
  sourceStart: number;
  duration: number;
};

const ClipLayer: React.FC<ClipLayerProps> = ({ clipIndex, sourceStart, duration }) => {
  const clip = FINAL_MONTAGE_CLIPS[clipIndex];

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#03080D" }}>
      <OffthreadVideo
        src={staticFile(`assets/final-montage/${clip.file}`)}
        trimBefore={sourceStart}
        durationInFrames={duration}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
      />
    </AbsoluteFill>
  );
};

const MontageTransitionFx: React.FC<{ transition: FinalMontageTransition }> = ({ transition }) => {
  const frame = useCurrentFrame();
  const progress = ease(frame, transition.frames);
  const pulse = Math.sin(Math.PI * progress);
  const common: React.CSSProperties = {
    position: "absolute",
    pointerEvents: "none",
    mixBlendMode: "screen",
  };

  if (transition.style === "light-sweep-left") {
    return (
      <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
        <div
          style={{
            ...common,
            top: 0,
            bottom: 0,
            width: "54%",
            left: `${-58 + progress * 145}%`,
            opacity: 0.82,
            background: "linear-gradient(90deg, transparent, rgba(57,213,199,0.10) 36%, rgba(234,246,245,0.22) 50%, rgba(57,213,199,0.12) 64%, transparent)",
            filter: "blur(34px)",
          }}
        />
      </AbsoluteFill>
    );
  }

  if (transition.style === "depth-iris") {
    return (
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "radial-gradient(ellipse 46% 30% at 50% 51%, rgba(57,213,199,0.20), rgba(17,24,27,0.07) 54%, transparent 78%)",
          opacity: pulse * 0.75,
          transform: `scale(${1.06 - progress * 0.06})`,
          mixBlendMode: "screen",
        }}
      />
    );
  }

  if (transition.style === "spotlight-lift") {
    return (
      <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
        <div
          style={{
            ...common,
            left: 0,
            right: 0,
            height: "28%",
            top: `${82 - progress * 110}%`,
            opacity: pulse * 0.72,
            background: "linear-gradient(180deg, transparent, rgba(57,213,199,0.10) 38%, rgba(234,246,245,0.17) 50%, rgba(57,213,199,0.08) 62%, transparent)",
            filter: "blur(42px)",
          }}
        />
      </AbsoluteFill>
    );
  }

  if (transition.style === "angled-sweep") {
    return (
      <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
        <div
          style={{
            ...common,
            top: "-15%",
            bottom: "-15%",
            width: "44%",
            left: `${112 - progress * 150}%`,
            transform: "skewX(-17deg)",
            opacity: pulse * 0.8,
            background: "linear-gradient(90deg, transparent, rgba(57,213,199,0.08) 38%, rgba(234,246,245,0.20) 50%, rgba(57,213,199,0.08) 62%, transparent)",
            filter: "blur(32px)",
          }}
        />
      </AbsoluteFill>
    );
  }

  if (transition.style === "soft-dissolve") {
    return (
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: "radial-gradient(ellipse 52% 25% at 50% 55%, rgba(57,213,199,0.13), rgba(17,24,27,0.03) 58%, transparent 82%)",
          opacity: pulse * 0.65,
          mixBlendMode: "screen",
        }}
      />
    );
  }

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: "radial-gradient(ellipse 42% 28% at 50% 49%, rgba(234,246,245,0.13), rgba(57,213,199,0.10) 36%, transparent 75%)",
        opacity: pulse * 0.85,
        mixBlendMode: "screen",
      }}
    />
  );
};

const getPosterPath = (clipIndex: number, edge: "first" | "last") =>
  staticFile(`assets/final-montage/stills/scene-${String(clipIndex + 1).padStart(2, "0")}-${edge}.png`);

const TransitionBridge: React.FC<{ transitionIndex: number }> = ({ transitionIndex }) => {
  const frame = useCurrentFrame();
  const transition = FINAL_MONTAGE_TRANSITIONS[transitionIndex];
  const entryStyle = getEntryStyle(transition, frame);

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#03080D" }}>
      <Img src={getPosterPath(transitionIndex, "last")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <AbsoluteFill style={entryStyle}>
        <Img src={getPosterPath(transitionIndex + 1, "first")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <MontageTransitionFx transition={transition} />
    </AbsoluteFill>
  );
};

export const UnlimitSubFinalMontage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#03080D", overflow: "hidden" }}>
    {FINAL_MONTAGE_CLIPS.map((clip, clipIndex) => {
      const start = FINAL_MONTAGE_CLIP_STARTS[clipIndex];
      const transition = FINAL_MONTAGE_TRANSITIONS[clipIndex];
      return (
        <React.Fragment key={clip.file}>
          <Sequence from={start} durationInFrames={clip.frames} name={`Scene ${clipIndex + 1}`}>
            <ClipLayer clipIndex={clipIndex} sourceStart={0} duration={clip.frames} />
          </Sequence>
          {transition ? (
            <Sequence
              from={FINAL_MONTAGE_TRANSITION_STARTS[clipIndex]}
              durationInFrames={transition.frames}
              name={`Transition ${clipIndex + 1}`}
            >
              <TransitionBridge transitionIndex={clipIndex} />
            </Sequence>
          ) : null}
        </React.Fragment>
      );
    })}
  </AbsoluteFill>
);

export const UnlimitSubTransitionPreview: React.FC<{ transitionIndex: number }> = ({ transitionIndex }) => {
  const transition = FINAL_MONTAGE_TRANSITIONS[transitionIndex];
  const previousIndex = transitionIndex;
  const nextIndex = transitionIndex + 1;
  const previous = FINAL_MONTAGE_CLIPS[previousIndex];
  const outgoingDuration = 30;
  const previewDuration = getTransitionPreviewDuration(transitionIndex);

  return (
    <AbsoluteFill style={{ backgroundColor: "#03080D", overflow: "hidden" }}>
      <Sequence from={0} durationInFrames={outgoingDuration} name="Previous scene tail">
        <ClipLayer
          clipIndex={previousIndex}
          sourceStart={previous.frames - outgoingDuration}
          duration={outgoingDuration}
        />
      </Sequence>
      <Sequence from={30} durationInFrames={transition.frames} name="Transition bridge">
        <TransitionBridge transitionIndex={transitionIndex} />
      </Sequence>
      <Sequence from={30 + transition.frames} durationInFrames={30} name="Next scene beginning">
        <ClipLayer
          clipIndex={nextIndex}
          sourceStart={0}
          duration={30}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
