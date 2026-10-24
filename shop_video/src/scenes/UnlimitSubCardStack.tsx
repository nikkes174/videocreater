import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
} from "remotion";
import cardStackAssets from "../config/cardStackAssets.json";
import { ParticleTextReveal } from "../components/ParticleTextReveal";
import { EASE, mix, ramp, softShadow } from "../vendor/videoShotcraft/demos/_fixtures/Polish";
import { alpha, springAt, stagger } from "../vendor/videoShotcraft/demos/_fixtures/Look";

// Adapted from Video Shotcraft's card-stack shot: spring cards rise from below,
// settle as one layered stack, then open together around a shared wrist pivot.
// Only the card artwork, palette, copy, count, and timing are UnlimitSub-specific.
export const UNLIMITSUB_CARD_STACK_DURATION = 165;

const WIDTH = 1920;
const COUNT = cardStackAssets.length;
const CX = WIDTH / 2;
const CY = 650;
const CARD_WIDTH = 420;
const ROTATION_PER_CARD = 5.2;
const TRANSLATION_PER_CARD = 132;
const DROP = 850;
const FAN_START = 96;
const CAMERA_PULL_START = 91;
const CAMERA_PULL_DURATION = 42;
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const COLORS = {
  background: "#03080D",
  graphite: "#11181B",
  teal: "#39D5C7",
  lightTeal: "#72DEDB",
  silver: "#EAF6F5",
  secondary: "#9EB5BA",
  shadow: "#02070A",
};

const SUBTITLE = "Подписки, пополнения и gift cards — в одном месте";
const SUBTITLE_WORDS = SUBTITLE.split(" ");

const deterministic = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const START = Array.from({ length: COUNT }, (_, index) =>
  18 + stagger(index, COUNT, 56, (progress) => mix(progress, EASE.out(progress), 0.5)),
);

const entranceProgress = (frame: number, index: number) =>
  frame < START[index]
    ? 0
    : springAt(frame, START[index], { damping: 13, stiffness: 150 });

export const UnlimitSubCardStack: React.FC = () => {
  const frame = useCurrentFrame();

  // These timing curves mirror the original shot's individual spring entrances,
  // settling weight, short pre-open squeeze, and single shared fan spring.
  const dip = START.reduce(
    (sum, start) => sum + Math.sin(Math.max(0, Math.min(1, (frame - start - 6) / 9)) * Math.PI) * 5,
    0,
  );
  const squeeze = 1 - 0.02 * Math.sin(Math.max(0, Math.min(1, (frame - 88) / 9)) * Math.PI);
  const fan = frame < FAN_START ? 0 : springAt(frame, FAN_START, { damping: 20, stiffness: 95 });

  const cameraPush = mix(1, 1.055, ramp(frame, 0, 91, EASE.smooth));
  const camera = mix(cameraPush, 0.9, ramp(frame, CAMERA_PULL_START, CAMERA_PULL_DURATION, EASE.smooth));
  const finalBreath = mix(1, 1.008, ramp(frame, 134, 31, EASE.smooth));
  const secondaryMotion = ramp(frame, 118, 8, EASE.out) * (1 - ramp(frame, 145, 19, EASE.smooth));
  const cameraMicroDrift = 1 + Math.sin((frame - 118) / 25) * 0.012 * secondaryMotion;
  const cameraScale = camera * finalBreath * cameraMicroDrift;

  const floorWidth = mix(280, 940, Math.min(1, fan));
  const floorOpacity = ramp(frame, 14, 24, EASE.out);
  const glow = 0.72 + 0.08 * Math.sin(frame / 35);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, overflow: "hidden" }}>
      {/* Quiet graphite stage and low teal fill keep the real artwork dominant. */}
      <AbsoluteFill
        style={{
          background:
            `radial-gradient(ellipse 70% 52% at 50% 58%, rgba(15,66,72,${(0.34 * glow).toFixed(3)}) 0%, rgba(10,34,41,0.22) 42%, transparent 78%), ` +
            `radial-gradient(ellipse 86% 55% at 50% 100%, rgba(17,24,27,0.72) 0%, rgba(3,8,13,0) 77%), ` +
            `linear-gradient(180deg, ${COLORS.background} 0%, ${COLORS.graphite} 58%, ${COLORS.background} 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "8%",
          right: "8%",
          top: 844,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${alpha(COLORS.teal, 0.16)}, ${alpha(COLORS.lightTeal, 0.23)}, ${alpha(COLORS.teal, 0.16)}, transparent)`,
          filter: "blur(5px)",
          opacity: floorOpacity * (0.55 + fan * 0.45),
          pointerEvents: "none",
        }}
      />

      {/* Pixel mask particles gather into the real title glyphs, then crossfade to crisp Manrope. */}
      <ParticleTextReveal
        text="Широкий выбор цифровых сервисов"
        fontSize={62}
        y={154}
        startFrame={0}
        travelStartFrame={8}
        gatherEndFrame={40}
        settleStartFrame={48}
        settleDuration={6}
        maxParticles={2400}
      />
      <div
        style={{
          position: "absolute",
          left: 190,
          right: 190,
          top: 202,
          textAlign: "center",
          fontFamily: '"UnlimitSubManrope", sans-serif',
          fontSize: 27,
          fontWeight: 500,
          lineHeight: 1.3,
          letterSpacing: "0em",
          color: COLORS.secondary,
        }}
      >
        {SUBTITLE_WORDS.map((word, index) => {
          const reveal = ramp(frame, 54 + index * 1.25, 8, EASE.out);
          return (
            <span
              key={`${word}-${index}`}
              style={{
                display: "inline-block",
                opacity: reveal,
                transform: `translateY(${((1 - reveal) * 9).toFixed(2)}px)`,
                marginRight: index < SUBTITLE_WORDS.length - 1 ? "0.28em" : 0,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      <AbsoluteFill
        style={{
          transform: `scale(${cameraScale.toFixed(4)})`,
          transformOrigin: `${CX}px ${CY + 110}px`,
        }}
      >
        {/* Original shot's grounded contact shadow widens as the stack fans out. */}
        <div
          style={{
            position: "absolute",
            left: CX - floorWidth / 2,
            top: CY + 178 + dip,
            width: floorWidth,
            height: 104,
            borderRadius: "50%",
            background: `radial-gradient(ellipse at center, ${alpha(COLORS.shadow, 0.84)} 0%, ${alpha(COLORS.shadow, 0.4)} 38%, ${alpha(COLORS.teal, 0.075)} 56%, transparent 76%)`,
            filter: "blur(12px)",
            opacity: floorOpacity,
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "absolute", inset: 0, perspective: "1800px" }}>
          {cardStackAssets.map((card, index) => {
            const progress = entranceProgress(frame, index);
            if (frame < START[index]) return null;

            const cardHeight = CARD_WIDTH * (card.height / card.width);
            const verticalOffset = (1 - progress) * DROP;
            const nextProgress = entranceProgress(frame + 0.5, index);
            const previousProgress = entranceProgress(frame - 0.5, index);
            const verticalVelocity = (previousProgress - nextProgress) * DROP;
            const blurY = Math.min(8, Math.abs(verticalVelocity) * 0.16);
            const offsetFromCenter = index - (COUNT - 1) / 2;
            const stackRotation = (deterministic(index * 3 + 1) - 0.5) * 6.4;
            const stackOffsetX = (deterministic(index * 5 + 2) - 0.5) * 22;
            const flightTilt = (index % 2 ? 1 : -1) * 9 * (verticalOffset / DROP);
            const parallaxPhase = (frame - 118) / 17 + index * 0.62;
            const parallaxX = Math.sin(parallaxPhase) * (4.5 + (index % 3) * 1.25) * secondaryMotion;
            const parallaxY = Math.cos(parallaxPhase * 0.82) * 2.2 * secondaryMotion;
            const microRotation = Math.sin(parallaxPhase + 0.4) * 0.62 * secondaryMotion;
            const rotation = mix(stackRotation + flightTilt, offsetFromCenter * ROTATION_PER_CARD, fan) + microRotation;
            const offsetX = mix(stackOffsetX, offsetFromCenter * TRANSLATION_PER_CARD, fan) + parallaxX;
            const depth = index * 2 + Math.sin(parallaxPhase + 0.8) * 0.65 * secondaryMotion;
            const elevation = 6 + (verticalOffset / DROP) * 48 + (0.7 + (index % 2) * 0.8) * secondaryMotion;

            return (
              <div
                key={card.index}
                style={{
                  position: "absolute",
                  left: CX - CARD_WIDTH / 2,
                  top: CY - cardHeight / 2,
                  width: CARD_WIDTH,
                  height: cardHeight,
                  transformOrigin: "50% 130%",
                  transform: `translate3d(${offsetX.toFixed(2)}px, ${(verticalOffset + dip + parallaxY).toFixed(2)}px, ${depth}px) rotate(${rotation.toFixed(3)}deg) scale(${squeeze.toFixed(4)})`,
                  zIndex: index,
                }}
              >
                {blurY > 0.4 ? (
                  <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
                    <filter id={`unlimitsub-card-stack-blur-${index}`} x="-10%" y="-30%" width="120%" height="160%">
                      <feGaussianBlur stdDeviation={`0 ${blurY.toFixed(2)}`} />
                    </filter>
                  </svg>
                ) : null}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 20,
                    overflow: "hidden",
                    boxSizing: "border-box",
                    backgroundColor: COLORS.graphite,
                    border: `1px solid ${alpha(COLORS.silver, 0.28)}`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), ${softShadow(elevation, { color: COLORS.shadow, strength: 1.25 })}`,
                    filter: blurY > 0.4 ? `url(#unlimitsub-card-stack-blur-${index})` : undefined,
                  }}
                >
                  <Img
                    src={staticFile(card.src)}
                    style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* A gentle edge vignette anchors the composition without tinting assets. */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 82% 86% at 50% 53%, transparent 48%, rgba(1,4,7,0.38) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
