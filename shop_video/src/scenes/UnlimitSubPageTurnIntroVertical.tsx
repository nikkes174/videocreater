// Portrait layout adaptation of UnlimitSubPageTurnIntro.
// Door timing, easing, SpeedBlur, page reveal, typography treatment, lighting and logo sweep
// are retained from the original composition; only canvas geometry and safe-area placement change.
// Copyright 2026 Wei Yihao; source licensed under Apache License 2.0.
import React, { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  AbsoluteFill,
  Img,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { EASE, SpeedBlur, bezier, mix, ramp, velocity } from "../vendor/videoShotcraft/demos/_fixtures/Polish";
import { alpha, glow } from "../vendor/videoShotcraft/demos/_fixtures/Look";

export const UNLIMITSUB_PAGE_TURN_VERTICAL_DURATION = 150;

const WIDTH = 1080;
const HEIGHT = 1920;
const FONT_FAMILY = "UnlimitSubManrope";
const LOGO_SRC = staticFile("assets/unlimitsub-logo.png");
const LOGO_WIDTH = 930;
const LOGO_CENTER_Y = 760;
const FONT_SUBSETS = [
  {
    name: "latin",
    range:
      "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  },
  {
    name: "latin-ext",
    range:
      "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
  },
  {
    name: "cyrillic",
    range: "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F",
  },
] as const;

const CRACK = 20;
const GAP = 30;
const SLIDE = 40;
const SLIDE_D = 24;
const SLIDE_EASE = bezier(0.42, 0, 0.8, 0.25);

// These three frame functions match the original BarnDoorSplit implementation.
const gapAt = (frame: number) => 16 * ramp(frame, GAP, 10, EASE.exit);
const slideAt = (frame: number) => 1000 * ramp(frame, SLIDE, SLIDE_D, SLIDE_EASE);
const doorAt = (frame: number) => gapAt(frame) / 2 + slideAt(frame);

type MetallicRevealTextProps = {
  text: string;
  frame: number;
  startFrame: number;
  fontSize: number;
  fontWeight: 500 | 800;
  lineHeight: number;
  letterSpacing: string;
  gradient: string;
  sliceGradient: string;
  textShadow?: string;
  letterStagger?: number;
  revealDuration?: number;
  sweepStartFrame?: number;
  sweepDuration?: number;
  sweepOpacity?: number;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth01 = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

/** Remotion-safe adaptation of text.html's per-character reveal and sliced passes. */
const MetallicRevealText: React.FC<MetallicRevealTextProps> = ({
  text,
  frame,
  startFrame,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  gradient,
  sliceGradient,
  textShadow = "0 2px 14px rgba(0,0,0,0.34)",
  letterStagger = 0.32,
  revealDuration = 13,
  sweepStartFrame,
  sweepDuration = 34,
  sweepOpacity = 0.3,
}) => {
  const characters = Array.from(text);
  const sweepProgress =
    sweepStartFrame === undefined
      ? 0
      : clamp01((frame - sweepStartFrame) / Math.max(1, sweepDuration));
  const sweepAlpha = Math.sin(Math.PI * sweepProgress) * sweepOpacity;
  const sweepPosition = 100 - sweepProgress * 100;
  const textStyle: CSSProperties = {
    fontFamily: FONT_FAMILY,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    whiteSpace: "pre",
  };
  const clippedGradientStyle: CSSProperties = {
    background: gradient,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
  };

  return (
    <span
      aria-label={text}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        whiteSpace: "pre",
        ...textStyle,
      }}
    >
      {characters.map((character, index) => {
        const content = character === " " ? "\u00a0" : character;
        const local = clamp01(
          (frame - startFrame - index * letterStagger) / Math.max(1, revealDuration),
        );
        const eased = smooth01(local);
        const sliceOpacity = Math.sin(Math.PI * local) * 0.28;
        const leftToRight = (local * 2 - 1) * 1.08;
        const rightToLeft = -leftToRight;
        const sliceStyle = (clipPath: string, translate: number): CSSProperties => ({
          position: "absolute",
          inset: 0,
          display: "block",
          ...textStyle,
          ...clippedGradientStyle,
          background: sliceGradient,
          clipPath,
          opacity: sliceOpacity,
          transform: `translateX(${(translate * 100).toFixed(2)}%)`,
          pointerEvents: "none",
        });

        return (
          <span
            key={`${character}-${index}`}
            aria-hidden="true"
            style={{ position: "relative", display: "inline-block", overflow: "hidden", ...textStyle }}
          >
            <span
              style={{
                display: "inline-block",
                ...textStyle,
                ...clippedGradientStyle,
                opacity: eased,
                filter: `blur(${((1 - eased) * 7).toFixed(2)}px)`,
                textShadow,
              }}
            >
              {content}
            </span>
            <span style={sliceStyle("inset(0 0 65% 0)", leftToRight)}>{content}</span>
            <span style={sliceStyle("inset(35% 0 35% 0)", rightToLeft)}>{content}</span>
            <span style={sliceStyle("inset(65% 0 0 0)", leftToRight)}>{content}</span>
          </span>
        );
      })}
      {sweepAlpha > 0.002 && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...textStyle,
            background:
              "linear-gradient(108deg, transparent 35%, rgba(255,255,255,0.04) 42%, rgba(242,255,254,0.82) 49%, rgba(125,240,232,0.54) 53%, rgba(255,255,255,0.08) 59%, transparent 67%)",
            backgroundSize: "250% 100%",
            backgroundPosition: `${sweepPosition.toFixed(2)}% 50%`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
            opacity: sweepAlpha,
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
};

type Side = "left" | "right";

const ClosedMetalPage: React.FC<{ frame: number }> = ({ frame }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      background:
        "radial-gradient(ellipse 78% 70% at 50% 26%, #293943 0%, #18242A 34%, #10171B 68%, #04090D 100%)",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(112deg, rgba(234,246,245,0.17) 0%, rgba(234,246,245,0.035) 19%, transparent 38%, transparent 63%, rgba(114,222,219,0.055) 82%, rgba(234,246,245,0.13) 100%), linear-gradient(90deg, rgba(0,0,0,0.28), transparent 18%, transparent 82%, rgba(0,0,0,0.26)), repeating-linear-gradient(180deg, rgba(234,246,245,0.034) 0px, rgba(234,246,245,0.034) 1px, transparent 1px, transparent 5px)",
        opacity: 0.68,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: "0 0 auto",
        height: 690,
          background: "linear-gradient(180deg, rgba(234,246,245,0.075), rgba(114,222,219,0.025) 36%, transparent)",
        filter: "blur(22px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "50%",
        width: 1,
        background: "linear-gradient(180deg, transparent, rgba(234,246,245,0.18) 20%, rgba(114,222,219,0.17) 52%, rgba(234,246,245,0.1) 82%, transparent)",
        boxShadow: "0 0 20px rgba(57,213,199,0.12)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
        <MetallicRevealText
          text="Нужный сервис есть."
          frame={frame}
          startFrame={0}
          fontSize={46}
          fontWeight={800}
          lineHeight={1.23}
          letterSpacing="0.005em"
          gradient="linear-gradient(180deg, #FFFFFF 0%, #DCE9ED 45%, #8FA6AE 100%)"
          sliceGradient="linear-gradient(180deg, #FFFFFF 0%, #DCE9ED 52%, #AABFC4 100%)"
          textShadow="0 1px 0 rgba(255,255,255,0.14), 0 8px 24px rgba(0,0,0,0.52)"
          letterStagger={0.34}
          revealDuration={13}
          sweepStartFrame={12}
          sweepDuration={28}
          sweepOpacity={0.26}
        />
        <MetallicRevealText
          text="А как оплатить?"
          frame={frame}
          startFrame={2}
          fontSize={46}
          fontWeight={800}
          lineHeight={1.23}
          letterSpacing="0.005em"
          gradient="linear-gradient(180deg, #E8FFFD 0%, #72DEDB 50%, #39D5C7 100%)"
          sliceGradient="linear-gradient(180deg, #E8FFFD 0%, #72DEDB 58%, #39D5C7 100%)"
          textShadow="0 1px 0 rgba(255,255,255,0.1), 0 8px 24px rgba(0,0,0,0.52)"
          letterStagger={0.38}
          revealDuration={13}
          sweepStartFrame={18}
          sweepDuration={28}
          sweepOpacity={0.24}
        />
      </div>
    </div>
  </div>
);

const FarGlassPlanes: React.FC<{ frame: number }> = ({ frame }) => {
  const driftX = Math.sin(frame / 96) * 14;
  const driftY = Math.cos(frame / 121) * 6;
  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0, transform: `translate(${driftX.toFixed(2)}px, ${driftY.toFixed(2)}px)`, pointerEvents: "none" }}
      aria-hidden
    >
      <defs>
        <linearGradient id="page-turn-glass-left" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EAF6F5" stopOpacity="0.062" />
          <stop offset="0.54" stopColor="#39D5C7" stopOpacity="0.022" />
          <stop offset="1" stopColor="#03080D" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="page-turn-glass-right" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EAF6F5" stopOpacity="0.068" />
          <stop offset="0.5" stopColor="#39D5C7" stopOpacity="0.026" />
          <stop offset="1" stopColor="#03080D" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 190 L246 0 L386 1920 L0 1920 Z" fill="url(#page-turn-glass-left)" stroke="rgba(234,246,245,0.12)" strokeWidth="1.2" />
      <path d="M1080 124 L848 0 L704 1920 L1080 1920 Z" fill="url(#page-turn-glass-right)" stroke="rgba(114,222,219,0.1)" strokeWidth="1.2" />
      <path d="M0 1420 C258 1368 822 1368 1080 1420" fill="none" stroke="rgba(234,246,245,0.075)" strokeWidth="1" />
    </svg>
  );
};

const StableSloganReveal: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.smooth,
  });
  const blur = interpolate(frame, [70, 90, 100], [10, 2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.smooth,
  });

  return (
    <div
      aria-label="Цифровые возможности без границ."
      style={{
        position: "absolute",
        left: "50%",
        top: 1030,
        width: 1000,
        height: 78,
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 13,
        whiteSpace: "nowrap",
        opacity,
        filter: `blur(${blur.toFixed(2)}px)`,
      }}
    >
      <MetallicRevealText
        text="Цифровые возможности"
        frame={frame}
        startFrame={68}
        fontSize={48}
        fontWeight={800}
        lineHeight={1.2}
        letterSpacing="-0.035em"
        gradient="linear-gradient(180deg, #FFFFFF 0%, #DCE9ED 45%, #8FA6AE 100%)"
        sliceGradient="linear-gradient(180deg, #FFFFFF 0%, #DCE9ED 52%, #AABFC4 100%)"
        textShadow="0 3px 18px rgba(0,0,0,0.38)"
        letterStagger={0.34}
        revealDuration={14}
        sweepStartFrame={84}
        sweepDuration={36}
        sweepOpacity={0.25}
      />
      <MetallicRevealText
        text="без границ."
        frame={frame}
        startFrame={69}
        fontSize={48}
        fontWeight={800}
        lineHeight={1.2}
        letterSpacing="-0.035em"
        gradient="linear-gradient(180deg, #E8FFFD 0%, #72DEDB 48%, #39D5C7 100%)"
        sliceGradient="linear-gradient(180deg, #E8FFFD 0%, #72DEDB 56%, #39D5C7 100%)"
        textShadow="0 2px 14px rgba(0,0,0,0.32)"
        letterStagger={0.34}
        revealDuration={14}
        sweepStartFrame={88}
        sweepDuration={36}
        sweepOpacity={0.29}
      />
    </div>
  );
};

const StableSecondaryReveal: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [95, 112], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.smooth,
  });
  const blur = interpolate(frame, [95, 108, 116], [5, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.smooth,
  });

  return (
    <div
      aria-label="ОТ ПОДПИСОК ДО ИГРОВЫХ МИРОВ."
      style={{
        position: "absolute",
        left: "50%",
        top: 1190,
        width: 1000,
        height: 46,
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        whiteSpace: "nowrap",
        opacity,
        filter: `blur(${blur.toFixed(2)}px)`,
      }}
    >
      <MetallicRevealText
        text="ОТ ПОДПИСОК ДО"
        frame={frame}
        startFrame={94}
        fontSize={23}
        fontWeight={500}
        lineHeight={1.3}
        letterSpacing="0.13em"
        gradient="linear-gradient(180deg, #DDE9EB 0%, #B7CED2 48%, #8FA6AE 100%)"
        sliceGradient="linear-gradient(180deg, #EAF6F5 0%, #B7CED2 52%, #9EB5BA 100%)"
        textShadow="0 2px 10px rgba(0,0,0,0.36)"
        letterStagger={0.27}
        revealDuration={11}
        sweepStartFrame={108}
        sweepDuration={32}
        sweepOpacity={0.2}
      />
      <MetallicRevealText
        text="ИГРОВЫХ МИРОВ."
        frame={frame}
        startFrame={95}
        fontSize={23}
        fontWeight={800}
        lineHeight={1.3}
        letterSpacing="0.13em"
        gradient="linear-gradient(180deg, #E8FFFD 0%, #72DEDB 48%, #39D5C7 100%)"
        sliceGradient="linear-gradient(180deg, #E8FFFD 0%, #72DEDB 56%, #39D5C7 100%)"
        textShadow="0 2px 10px rgba(0,0,0,0.36)"
        letterStagger={0.27}
        revealDuration={11}
        sweepStartFrame={112}
        sweepDuration={32}
        sweepOpacity={0.22}
      />
    </div>
  );
};

const LuxuryBrandPage: React.FC<{ frame: number; logoSrc: string; flash: number }> = ({ frame, logoSrc, flash }) => {
  const ambient = interpolate(frame, [GAP, 56, 92, 150], [0.7, 1, 0.86, 0.92], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.smooth,
  });
  const logoOpacity = interpolate(frame, [GAP, 48, 78], [0.2, 0.78, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.snappy,
  });
  const sweepProgress = ramp(frame, 80, 32, EASE.smooth);
  const sweepOpacity = interpolate(frame, [78, 84, 104, 112], [0, 0.8, 0.7, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.smooth,
  });
  const beamCenter = 50 + Math.sin(frame / 70) * 1.8;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#03080D" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #0A151B 0%, #050B10 45%, #03080D 73%, #020507 100%), radial-gradient(ellipse 68% 56% at 50% 22%, rgba(57,213,199,0.2), transparent 72%)",
          backgroundBlendMode: "normal, screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -120,
          right: -120,
          top: -130,
          height: 920,
          opacity: 0.28 + ambient * 0.24 + flash * 0.1,
          background: `radial-gradient(ellipse 54% 61% at ${beamCenter}% 22%, rgba(163,246,241,0.68) 0%, rgba(39,145,153,0.32) 34%, rgba(9,37,47,0.1) 61%, transparent 78%)`,
          filter: "blur(34px)",
          transform: `translateY(${(Math.sin(frame / 102) * 12).toFixed(2)}px)`,
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "13%",
          right: "13%",
          top: 500,
          height: 520,
          opacity: 0.27 + ambient * 0.18,
          background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(61,164,175,0.58) 0%, rgba(9,36,47,0.24) 52%, transparent 78%)",
          filter: "blur(30px)",
          mixBlendMode: "screen",
        }}
      />
      <FarGlassPlanes frame={frame} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "72%",
          bottom: 0,
          background:
            "linear-gradient(180deg, rgba(3,8,13,0) 0%, rgba(5,18,23,0.5) 18%, rgba(2,6,10,0.97) 100%), radial-gradient(ellipse 54% 22% at 50% 3%, rgba(57,213,199,0.34) 0%, rgba(13,81,91,0.16) 44%, transparent 82%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "16%",
          right: "16%",
          top: "75%",
          height: 2,
          opacity: 0.19 + ambient * 0.14,
          background: "linear-gradient(90deg, transparent, rgba(114,222,219,0.4), rgba(234,246,245,0.32), rgba(57,213,199,0.36), transparent)",
          filter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 84% 92% at 50% 42%, transparent 40%, rgba(0,3,7,0.24) 73%, rgba(0,2,5,0.6) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: LOGO_CENTER_Y,
          width: LOGO_WIDTH,
          height: LOGO_WIDTH / 3,
          opacity: logoOpacity,
          transform: "translate(-50%, -50%)",
          transformOrigin: "50% 50%",
          filter: "drop-shadow(0 24px 56px rgba(0,0,0,0.58)) drop-shadow(0 0 18px rgba(57,213,199,0.13))",
        }}
      >
        <Img
          src={logoSrc}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 0 2px rgba(240,247,247,0.38)) drop-shadow(0 0 20px rgba(57,213,199,0.24)) drop-shadow(0 0 54px rgba(18,118,130,0.22))",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(112deg, transparent 43%, rgba(57,213,199,0.18) 47%, rgba(234,246,245,0.9) 50%, rgba(223,255,253,0.76) 52%, rgba(57,213,199,0.14) 56%, transparent 61%)",
            backgroundSize: "250% 100%",
            backgroundPosition: `${((1 - sweepProgress) * 100).toFixed(2)}% 50%`,
            opacity: sweepOpacity,
            mixBlendMode: "screen",
            maskImage: `url("${logoSrc}")`,
            WebkitMaskImage: `url("${logoSrc}")`,
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
            maskPosition: "center",
            WebkitMaskPosition: "center",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            pointerEvents: "none",
          }}
        />
      </div>

      <StableSloganReveal frame={frame} />
      <StableSecondaryReveal frame={frame} />
    </div>
  );
};

const MetalDoor: React.FC<{
  side: Side;
  offset: number;
  light: number;
  edge: number;
  frame: number;
}> = ({ side, offset, light, edge, frame }) => {
  const inner = side === "left" ? "right" : "left";
  const toward = side === "left" ? "to left" : "to right";
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: side === "left" ? 0 : WIDTH / 2,
        width: WIDTH / 2,
        height: HEIGHT,
        overflow: "hidden",
        transform: `translateX(${side === "left" ? -offset : offset}px)`,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: side === "left" ? 0 : -WIDTH / 2, width: WIDTH, height: HEIGHT }}>
        <ClosedMetalPage frame={frame} />
      </div>
      {light > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            [inner]: 0,
            width: 620,
            mixBlendMode: "screen",
            opacity: light,
            background: `linear-gradient(${toward}, ${alpha("#72DEDB", 0.46)} 0%, ${alpha("#39D5C7", 0.15)} 30%, ${alpha("#39D5C7", 0)} 100%)`,
          }}
        />
      )}
      {edge > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            [inner]: 0,
            width: 10,
            opacity: edge,
            background: `linear-gradient(${toward}, #EAF6F5 0%, #72DEDB 35%, #10252C 100%)`,
          }}
        />
      )}
    </div>
  );
};

export type UnlimitSubPageTurnIntroVerticalProps = { logoSrc?: string };

export const UnlimitSubPageTurnIntroVertical: React.FC<UnlimitSubPageTurnIntroVerticalProps> = ({ logoSrc = LOGO_SRC }) => {
  const frame = useCurrentFrame();
  const door = doorAt(frame);
  const vx = velocity(doorAt, frame);
  const crack = ramp(frame, CRACK, 10, EASE.snappy);
  const seamLight = ramp(frame, CRACK, 12, EASE.out);
  const edge = frame >= GAP ? 1 : 0;
  const flash = ramp(frame, GAP, 12, EASE.exit) * (1 - ramp(frame, SLIDE + 6, 30, EASE.out));
  const pageProgress = ramp(frame, SLIDE + 2, 28, EASE.snappy);
  const pageScale = mix(1.08, 1, pageProgress);
  const closedPagePush = mix(1, 1.015, ramp(frame, 0, SLIDE, EASE.smooth));
  const doorsGone = frame > SLIDE + SLIDE_D;
  const showNewPage = frame >= GAP;
  const doorLight = seamLight * (1 - ramp(frame, SLIDE, 14, EASE.out) * 0.6);

  const [fontReady, setFontReady] = useState(false);
  const [fontHandle] = useState(() => delayRender("Loading local Manrope fonts for Page Turn intro"));
  const releasedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const faces = FONT_SUBSETS.map(({ name, range }) =>
          ([500, 800] as const).map((weight) =>
        new FontFace(
          FONT_FAMILY,
          `url("${staticFontUrl(name, weight)}") format("woff2")`,
          { weight: String(weight), style: "normal", unicodeRange: range, display: "block" },
        ),
      ),
    ).flat();

    Promise.all(faces.map((face) => face.load()))
      .then(async (loaded) => {
        if (cancelled) return;
        const fontSet = document.fonts as FontFaceSet & { add: (face: FontFace) => FontFaceSet };
        loaded.forEach((face) => fontSet.add(face));
        await Promise.all([
          document.fonts.load(`800 48px "${FONT_FAMILY}"`, "Цифровые возможности без границ"),
          document.fonts.load(`800 46px "${FONT_FAMILY}"`, "Нужный сервис есть А как оплатить"),
          document.fonts.load(`500 23px "${FONT_FAMILY}"`, "ОТ ПОДПИСОК ДО ИГРОВЫХ МИРОВ"),
        ]);
        if (cancelled) return;
        setFontReady(true);
        if (!releasedRef.current) {
          releasedRef.current = true;
          continueRender(fontHandle);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) cancelRender(error instanceof Error ? error : new Error(String(error)));
      });
    return () => {
      cancelled = true;
    };
  }, [fontHandle]);

  if (!fontReady) return <AbsoluteFill style={{ background: "#03080D" }} />;

  return (
    <AbsoluteFill style={{ background: "#03080D", overflow: "hidden" }}>
      {showNewPage && (
        <div style={{ position: "absolute", inset: 0, transform: `scale(${pageScale.toFixed(5)})`, transformOrigin: "50% 46%" }}>
          <LuxuryBrandPage frame={frame} logoSrc={logoSrc} flash={flash} />
          {flash > 0.01 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: WIDTH / 2 - (door + 160),
                width: 2 * (door + 160),
                mixBlendMode: "screen",
                opacity: flash * 0.78,
                background: "linear-gradient(90deg, rgba(57,213,199,0) 0%, rgba(57,213,199,0.4) 40%, rgba(234,246,245,0.74) 50%, rgba(114,222,219,0.4) 60%, rgba(57,213,199,0) 100%)",
              }}
            />
          )}
        </div>
      )}

      {!doorsGone && (
        <div style={{ position: "absolute", inset: 0, transform: `scale(${closedPagePush.toFixed(5)})`, transformOrigin: "50% 50%" }}>
          <SpeedBlur vx={-vx} amount={0.09} max={22}>
            <MetalDoor side="left" offset={door} light={doorLight} edge={edge} frame={frame} />
          </SpeedBlur>
          <SpeedBlur vx={vx} amount={0.09} max={22}>
            <MetalDoor side="right" offset={door} light={doorLight} edge={edge} frame={frame} />
          </SpeedBlur>
          {crack > 0 && frame < SLIDE + 4 && (
            <div
              style={{
                position: "absolute",
                left: WIDTH / 2 - 1,
                top: 0,
                width: 2,
                height: HEIGHT,
                transform: `scaleY(${crack.toFixed(4)})`,
                background: "linear-gradient(180deg, rgba(114,222,219,0) 0%, #72DEDB 22%, #EAF6F5 50%, #72DEDB 78%, rgba(114,222,219,0) 100%)",
                boxShadow: glow("#39D5C7", 0.78),
                opacity: 1 - ramp(frame, SLIDE, 4, EASE.out),
              }}
            />
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};

function staticFontUrl(subset: (typeof FONT_SUBSETS)[number]["name"], weight: 500 | 800): string {
  return staticFile(`assets/fonts/manrope-${weight}-${subset}.woff2`);
}
