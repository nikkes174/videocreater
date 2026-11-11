// Adapted from video-shotcraft's Carousel3D demo by Wei Yihao.
// Copyright 2026 Wei Yihao. Licensed under Apache-2.0; see src/vendor/videoShotcraft/LICENSE.
// Modified for BLACKPHANTOM: card data, palette, 60-frame beats, 36-frame dwell, and captions.
// The original CSS 3D ring, dual faces, highlight push, depth shading, reflection, and rolling caption mechanics are retained.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE } from "../../vendor/videoShotcraft/demos/_fixtures/Polish";
import { CAROUSEL_CARDS, CAROUSEL_CONFIG, type CarouselCard } from "../../config/blackphantomCarousel";
import { ManropeFontFaces } from "./scenes/ManropeFontFaces";

const COLORS = {
  background: "#07090C",
  backgroundTop: "#11151B",
  card: "#151B22",
  cardRaised: "#202831",
  platinum: "#F1F2F4",
  silver: "#B6BEC8",
  gold: "#C8A66A",
  goldGlow: "rgba(200,166,106,.30)",
} as const;

const N = CAROUSEL_CONFIG.count;
const RADIUS = CAROUSEL_CONFIG.radius;
const CW = CAROUSEL_CONFIG.cardWidth;
const CH = CAROUSEL_CONFIG.cardHeight;
const BEAT = CAROUSEL_CONFIG.framesPerCard;
const DWELL = CAROUSEL_CONFIG.dwellFrames;
const RING_Y = 470;
const FLOOR = CH / 2 + 10;
const CAPTION = {
  top: 846,
  height: 180,
} as const;

export const CAROUSEL_3D_DURATION = N * BEAT;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// Original gallery timing: half continuous turn, half easing between 45-degree rests.
const stepPart = (f: number) => {
  const k = Math.floor(f / BEAT);
  const local = f - k * BEAT;

  return (
    k +
    EASE.smooth(
      clamp01((local - DWELL) / (BEAT - DWELL))
    )
  ) / N;
};

const turnAt = (f: number) =>
  0.5 * (f / (N * BEAT)) +
  0.5 * stepPart(f);

const highlightAt = (angle: number) =>
  EASE.smooth(clamp01(1 - Math.abs(angle) / 26));

type CardFaceProps = {
  card: CarouselCard;
  highlighted: number;
};

const CardFace: React.FC<CardFaceProps> = ({ card, highlighted }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      padding: "34px 28px 30px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      color: COLORS.platinum,
      fontFamily: "Manrope, sans-serif",
    }}
  >
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.55 + highlighted * 0.45,
      }}
    >
      <ServiceIcon name={card.icon} size={126} color={COLORS.gold} highlighted={highlighted} />
    </div>

    <div
      style={{
        width: "100%",
        height: 1,
        flexShrink: 0,
        marginBottom: 18,
        background: "rgba(200,166,106,.22)",
      }}
    />

    <div
      style={{
        fontSize: 28,
        fontWeight: 800,
        lineHeight: 1.12,
        overflowWrap: "break-word",
      }}
    >
      {card.title}
    </div>

    <div
      style={{
        marginTop: 14,
        fontSize: 19,
        lineHeight: 1.35,
        color: COLORS.silver,
      }}
    >
      {card.description}
    </div>
  </div>
);

type ServiceIconProps = {
  name: CarouselCard["icon"];
  size: number;
  color: string;
  highlighted: number;
};

const ServiceIcon: React.FC<ServiceIconProps> = ({ name, size, color, highlighted }) => {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 2.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  let drawing: React.ReactNode;
  switch (name) {
    case "globe":
      drawing = <>
        <circle cx="64" cy="64" r="43" />
        <path d="M21 64h86M64 21v86M37 29c17 19 17 51 0 70M91 29c-17 19-17 51 0 70M30 43c21 12 47 12 68 0M30 85c21-12 47-12 68 0" />
      </>;
      break;
    case "messages":
      drawing = <>
        <path d="M24 29h58a12 12 0 0 1 12 12v28a12 12 0 0 1-12 12H49L31 94V81h-7a12 12 0 0 1-12-12V41a12 12 0 0 1 12-12Z" />
        <path d="M48 49h32M34 63h42" />
        <path d="M62 81h31a12 12 0 0 1 12 12v8H88l-13 10V101h-9a12 12 0 0 1-12-12v-8" opacity=".65" />
      </>;
      break;
    case "shopping-bag":
      drawing = <>
        <path d="M27 45h74l-6 62H33l-6-62Z" />
        <path d="M43 48V38a21 21 0 0 1 42 0v10M45 68v11M83 68v11" />
      </>;
      break;
    case "layers":
      drawing = <>
        <path d="m64 20 43 24-43 24-43-24 43-24Z" />
        <path d="m21 64 43 24 43-24M21 84l43 24 43-24" />
      </>;
      break;
    case "target":
      drawing = <>
        <circle cx="64" cy="64" r="43" />
        <circle cx="64" cy="64" r="27" />
        <circle cx="64" cy="64" r="10" />
        <path d="M64 12v20M64 96v20M12 64h20M96 64h20" />
      </>;
      break;
    case "list-checks":
      drawing = <>
        <path d="m20 35 7 7 13-14M51 36h56M20 65l7 7 13-14M51 66h56M20 95l7 7 13-14M51 96h56" />
      </>;
      break;
    case "workflow":
      drawing = <>
        <circle cx="28" cy="64" r="13" />
        <circle cx="100" cy="34" r="13" />
        <circle cx="100" cy="94" r="13" />
        <path d="M41 64h20c14 0 16-30 26-30M61 64c14 0 16 30 26 30M87 34h13M87 94h13" />
      </>;
      break;
    case "headset":
      drawing = <>
        <path d="M22 68V59a42 42 0 0 1 84 0v9M22 66h17v31H31a9 9 0 0 1-9-9V66ZM106 66H89v31h8a9 9 0 0 0 9-9V66Z" />
        <path d="M89 95c-4 12-14 17-29 17h-8" />
        <rect x="42" y="105" width="13" height="9" rx="4.5" />
      </>;
      break;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      aria-hidden="true"
      style={{ filter: `drop-shadow(0 0 ${highlighted * 12}px rgba(200,166,106,.32))` }}
    >
      <g {...common}>{drawing}</g>
    </svg>
  );
};

export const Carousel3D: React.FC = () => {
  const frame = useCurrentFrame();
  const spin = turnAt(frame) * 360;
  const azimuth = (i: number) => ((((i * 360) / N - spin) % 360) + 540) % 360 - 180;
  const depthOf = (i: number) => (1 - Math.cos((azimuth(i) * Math.PI) / 180)) / 2;
  const highlightOf = (i: number) => highlightAt(azimuth(i));

  const k = Math.floor(frame / BEAT);
  const roll = EASE.smooth(
    clamp01((frame - k * BEAT - DWELL) / (BEAT - DWELL))
  );

  const renderCard = (i: number, reflected: boolean) => {
    const depth = depthOf(i);
    const highlight = reflected ? 0 : highlightOf(i);
    const borderColor = !reflected && highlight > 0.01
      ? `rgba(200,166,106,${0.26 + 0.62 * highlight})`
      : "rgba(241,242,244,.13)";
    const planeStyle: React.CSSProperties = {
      position: "absolute",
      inset: 0,
      boxSizing: "border-box",
      overflow: "hidden",
      borderRadius: 22,
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      background: `linear-gradient(155deg, ${COLORS.cardRaised} 0%, ${COLORS.card} 64%, ${COLORS.backgroundTop} 100%)`,
      border: `1.5px solid ${borderColor}`,
      boxShadow: highlight > 0.01 && !reflected
        ? `0 0 34px rgba(200,166,106,${0.05 + highlight * 0.13}), inset 0 1px 0 rgba(241,242,244,.12)`
        : "inset 0 1px 0 rgba(241,242,244,.08)",
      ...(reflected
        ? {
            opacity: 0.08,
            WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,0.85) 100%)",
            maskImage: "linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,0.85) 100%)",
          }
        : {}),
    };
    const card = CAROUSEL_CARDS[i];
    const cardContent = (
      <>
        <CardFace card={card} highlighted={highlight} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: COLORS.background,
            opacity: 0.7 * depth,
            pointerEvents: "none",
          }}
        />
      </>
    );

    return (
      <div
        key={`${reflected ? "reflection" : "card"}-${i}`}
        style={{
          position: "absolute",
          left: -CW / 2,
          top: -CH / 2,
          width: CW,
          height: CH,
          transformStyle: "preserve-3d",
          transform: `rotateY(${i * 360 / N}deg) translateZ(${(RADIUS + 44 * highlightOf(i)).toFixed(2)}px)`,
        }}
      >
        <div style={planeStyle}>{cardContent}</div>
        <div style={{ ...planeStyle, transform: "rotateY(180deg)" }}>{cardContent}</div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ background: COLORS.background, color: COLORS.platinum, overflow: "hidden" }}>
      <ManropeFontFaces />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 74% 72% at 50% 35%, ${COLORS.backgroundTop} 0%, ${COLORS.background} 74%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 960 - 520,
          top: RING_Y + 120,
          width: 1040,
          height: 420,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at 50% 40%, rgba(200,166,106,.16) 0%, rgba(200,166,106,0) 65%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: "2200px",
          perspectiveOrigin: `50% ${RING_Y - 60}px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 960,
            top: RING_Y,
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            transform: `translateZ(${-RADIUS}px) rotateX(-9deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -RADIUS * 1.35,
              top: FLOOR - RADIUS * 1.35,
              width: RADIUS * 2.7,
              height: RADIUS * 2.7,
              borderRadius: "50%",
              transform: "rotateX(90deg)",
              background: "radial-gradient(circle, rgba(200,166,106,.10) 0%, rgba(200,166,106,.025) 45%, transparent 66%)",
            }}
          />

          <svg
            width={RADIUS * 2.4}
            height={RADIUS * 2.4}
            viewBox={`${-RADIUS * 1.2} ${-RADIUS * 1.2} ${RADIUS * 2.4} ${RADIUS * 2.4}`}
            style={{
              position: "absolute",
              left: -RADIUS * 1.2,
              top: FLOOR - RADIUS * 1.2,
              transform: `rotateX(90deg) rotateZ(${spin}deg)`,
              overflow: "visible",
            }}
          >
            <circle r={RADIUS * 1.08} fill="none" stroke="rgba(241,242,244,.08)" strokeWidth={2} />
            {Array.from({ length: 96 }, (_, index) => {
              const angle = (index / 96) * Math.PI * 2;
              const r0 = RADIUS * (index % 12 === 0 ? 1.02 : 1.05);
              const major = index % 12 === 0;
              return (
                <line
                  key={index}
                  x1={r0 * Math.cos(angle)}
                  y1={r0 * Math.sin(angle)}
                  x2={RADIUS * 1.08 * Math.cos(angle)}
                  y2={RADIUS * 1.08 * Math.sin(angle)}
                  stroke={major ? "rgba(200,166,106,.38)" : "rgba(241,242,244,.09)"}
                  strokeWidth={major ? 3 : 2}
                />
              );
            })}
          </svg>

          <div
            style={{
              position: "absolute",
              transformStyle: "preserve-3d",
              transform: `translateY(${FLOOR * 2}px) scaleY(-1) rotateY(${-spin}deg)`,
            }}
          >
            {Array.from({ length: N }, (_, i) => renderCard(i, true))}
          </div>

          <div
            style={{
              position: "absolute",
              transformStyle: "preserve-3d",
              transform: `rotateY(${-turnAt(frame) * 360}deg)`,
            }}
          >
            {Array.from({ length: N }, (_, i) => renderCard(i, false))}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 42,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: "Manrope, sans-serif",
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: 2,
            color: "#F1F2F4",
            textAlign: "center",
            textShadow: "0 2px 14px rgba(0,0,0,.45)",
          }}
        >
          BLACKPHANTOM
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: CAPTION.top,
          height: CAPTION.height,
          padding: "0 140px",
          boxSizing: "border-box",
          overflow: "hidden",
          fontFamily: "Manrope, sans-serif",
          textAlign: "center",
        }}
      >
        {[0, 1].map((slot) => {
          const activeCard = CAROUSEL_CARDS[(k + slot) % N];
          const y = (slot - roll) * CAPTION.height;
          return (
            <div
              key={`${activeCard.id}-${slot}`}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transform: `translateY(${y.toFixed(2)}px)`,
                opacity: 1 - Math.abs(slot - roll) * 0.9,
              }}
            >
              <div
                style={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 62,
                  fontWeight: 800,
                  lineHeight: 1.08,
                  color: "#F1F2F4",
                }}
              >
                {activeCard.title}
              </div>
              <div
                style={{
                  maxWidth: 980,
                  marginTop: 14,
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: 1.35,
                  color: "#B6BEC8",
                }}
              >
                {activeCard.description}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
