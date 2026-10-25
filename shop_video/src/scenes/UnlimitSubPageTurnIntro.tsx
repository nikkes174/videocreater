// UnlimitSub-branded adaptation of Video Shotcraft's BarnDoorSplit transition.
// The source timing, gap/slide equations, easing, door split, edge lighting, SpeedBlur,
// and incoming-page scale are retained; only the two page designs and palette are replaced.
// Copyright 2026 Wei Yihao; source licensed under Apache License 2.0.
import React, { useEffect, useRef, useState } from "react";
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
import { TextReveal, alpha, glow } from "../vendor/videoShotcraft/demos/_fixtures/Look";

export const UNLIMITSUB_PAGE_TURN_DURATION = 150;

const WIDTH = 1920;
const HEIGHT = 1080;
const FONT_FAMILY = "UnlimitSubManrope";
const LOGO_SRC = staticFile("assets/unlimitsub-logo.png");
const LOGO_WIDTH = 1160;
const LOGO_CENTER_Y = 420;
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

type Side = "left" | "right";

const ClosedMetalPage: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      background:
        "radial-gradient(ellipse 78% 70% at 50% 26%, #243139 0%, #18242A 36%, #11181B 72%, #060C11 100%)",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(112deg, rgba(234,246,245,0.12) 0%, rgba(234,246,245,0.025) 19%, transparent 38%, transparent 63%, rgba(114,222,219,0.035) 82%, rgba(234,246,245,0.09) 100%), repeating-linear-gradient(180deg, rgba(234,246,245,0.026) 0px, rgba(234,246,245,0.026) 1px, transparent 1px, transparent 5px)",
        opacity: 0.56,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: "0 0 auto",
        height: 410,
        background: "linear-gradient(180deg, rgba(234,246,245,0.055), transparent)",
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
      <div
        style={{
          color: "#D5E0E3",
          fontFamily: FONT_FAMILY,
          fontSize: 36,
          fontWeight: 500,
          letterSpacing: "0.14em",
          textShadow: "0 1px 0 rgba(255,255,255,0.16), 0 8px 30px rgba(0,0,0,0.42)",
        }}
      >
        Привычные рамки?
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
          <stop offset="0" stopColor="#EAF6F5" stopOpacity="0.045" />
          <stop offset="0.54" stopColor="#39D5C7" stopOpacity="0.012" />
          <stop offset="1" stopColor="#03080D" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="page-turn-glass-right" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EAF6F5" stopOpacity="0.052" />
          <stop offset="0.5" stopColor="#39D5C7" stopOpacity="0.014" />
          <stop offset="1" stopColor="#03080D" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 120 L434 0 L610 1080 L0 1080 Z" fill="url(#page-turn-glass-left)" stroke="rgba(234,246,245,0.09)" strokeWidth="1.2" />
      <path d="M1920 72 L1512 0 L1342 1080 L1920 1080 Z" fill="url(#page-turn-glass-right)" stroke="rgba(114,222,219,0.075)" strokeWidth="1.2" />
      <path d="M0 817 C460 769 1380 772 1920 818" fill="none" stroke="rgba(234,246,245,0.055)" strokeWidth="1" />
    </svg>
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
  const sweepOpacity = interpolate(frame, [78, 84, 104, 112], [0, 0.64, 0.56, 0], {
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
            "linear-gradient(180deg, #0A151B 0%, #050B10 45%, #03080D 73%, #020507 100%), radial-gradient(ellipse 74% 62% at 50% 22%, rgba(57,213,199,0.12), transparent 72%)",
          backgroundBlendMode: "screen, normal",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -120,
          right: -120,
          top: -130,
          height: 750,
          opacity: 0.18 + ambient * 0.18 + flash * 0.12,
          background: `radial-gradient(ellipse 54% 61% at ${beamCenter}% 22%, rgba(127,232,226,0.62) 0%, rgba(39,145,153,0.24) 34%, rgba(9,37,47,0.08) 61%, transparent 78%)`,
          filter: "blur(40px)",
          transform: `translateY(${(Math.sin(frame / 102) * 12).toFixed(2)}px)`,
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "13%",
          right: "13%",
          top: 242,
          height: 390,
          opacity: 0.08 + ambient * 0.055,
          background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(35,111,124,0.54) 0%, rgba(9,29,39,0.17) 52%, transparent 78%)",
          filter: "blur(36px)",
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
            "linear-gradient(180deg, rgba(3,8,13,0) 0%, rgba(5,18,23,0.44) 18%, rgba(2,6,10,0.94) 100%), radial-gradient(ellipse 54% 22% at 50% 3%, rgba(57,213,199,0.27) 0%, rgba(13,81,91,0.12) 44%, transparent 82%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "16%",
          right: "16%",
          top: "75%",
          height: 2,
          opacity: 0.15 + ambient * 0.12,
          background: "linear-gradient(90deg, transparent, rgba(114,222,219,0.32), rgba(234,246,245,0.22), rgba(57,213,199,0.28), transparent)",
          filter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 92% 96% at 50% 44%, transparent 43%, rgba(0,3,7,0.18) 77%, rgba(0,2,5,0.46) 100%)",
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
          filter: "drop-shadow(0 22px 50px rgba(0,0,0,0.42))",
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
            filter: "drop-shadow(0 0 18px rgba(57,213,199,0.19)) drop-shadow(0 0 44px rgba(18,118,130,0.16))",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(112deg, transparent 43%, rgba(57,213,199,0.12) 47%, rgba(234,246,245,0.82) 50%, rgba(223,255,253,0.66) 52%, rgba(57,213,199,0.1) 56%, transparent 61%)",
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

      <div style={{ position: "absolute", left: 70, right: 70, top: 654, textAlign: "center", whiteSpace: "nowrap" }}>
        <TextReveal
          text="Цифровые возможности без границ."
          start={65}
          by="word"
          variant="blur"
          each={15}
          gap={3}
          ease={EASE.snappy}
          style={{ fontFamily: FONT_FAMILY, fontSize: 46, fontWeight: 800, lineHeight: 1.25, letterSpacing: "-0.035em", color: "#EAF6F5", textShadow: "0 5px 24px rgba(0,0,0,0.34)" }}
          unitStyle={(wordIndex) => wordIndex >= 2 ? { color: "#72DEDB", textShadow: "0 0 22px rgba(57,213,199,0.2)" } : { color: "#EAF6F5" }}
        />
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 752, textAlign: "center", whiteSpace: "nowrap" }}>
        <TextReveal
          text="ИГРЫ · ПОДПИСКИ · ПОДАРОЧНЫЕ КАРТЫ"
          start={85}
          by="word"
          variant="track"
          each={12}
          gap={2.3}
          ease={EASE.out}
          style={{ fontFamily: FONT_FAMILY, fontSize: 17, fontWeight: 500, lineHeight: 1.4, letterSpacing: "0.17em", color: "#9EB5BA" }}
          unitStyle={(wordIndex) => wordIndex % 2 === 0 ? { color: wordIndex === 0 || wordIndex === 2 ? "#72DEDB" : "#B8C7CA" } : { color: "#667E83" }}
        />
      </div>
    </div>
  );
};

const MetalDoor: React.FC<{ side: Side; offset: number; light: number; edge: number }> = ({ side, offset, light, edge }) => {
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
        <ClosedMetalPage />
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
            background: "linear-gradient(to left, #EAF6F5 0%, #72DEDB 35%, #10252C 100%)",
          }}
        />
      )}
    </div>
  );
};

export type UnlimitSubPageTurnIntroProps = { logoSrc?: string };

export const UnlimitSubPageTurnIntro: React.FC<UnlimitSubPageTurnIntroProps> = ({ logoSrc = LOGO_SRC }) => {
  const frame = useCurrentFrame();
  const door = doorAt(frame);
  const vx = velocity(doorAt, frame);
  const crack = ramp(frame, CRACK, 10, EASE.snappy);
  const seamLight = ramp(frame, CRACK, 12, EASE.out);
  const edge = frame >= GAP ? 1 : 0;
  const flash = ramp(frame, GAP, 12, EASE.exit) * (1 - ramp(frame, SLIDE + 6, 30, EASE.out));
  const pageProgress = ramp(frame, SLIDE + 2, 36, EASE.snappy);
  const pageScale = mix(1.08, 1, pageProgress) * mix(1, 1.018, ramp(frame, 78, 72, EASE.smooth));
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
          document.fonts.load(`800 46px "${FONT_FAMILY}"`, "Цифровые возможности без границ"),
          document.fonts.load(`500 36px "${FONT_FAMILY}"`, "Привычные рамки"),
          document.fonts.load(`500 17px "${FONT_FAMILY}"`, "ИГРЫ ПОДПИСКИ ПОДАРОЧНЫЕ КАРТЫ"),
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
            <MetalDoor side="left" offset={door} light={doorLight} edge={edge} />
          </SpeedBlur>
          <SpeedBlur vx={vx} amount={0.09} max={22}>
            <MetalDoor side="right" offset={door} light={doorLight} edge={edge} />
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
