import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { bezier, Grain, SpeedBlur, Vignette } from "../vendor/videoShotcraft/demos/_fixtures/Polish";

const WIDTH = 1920;
const HEIGHT = 1080;
const SEGMENT_LENGTH = 60;
const CROSSFADE = 7;
const EASE_LAND = bezier(0.5, 0.05, 0.6, 1);

type Camera = {
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  x: [number, number];
  y: [number, number];
};

type CardLayer = {
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
  land: number;
  lift: number;
};

type ScreenDefinition = {
  src: string;
  width: number;
  height: number;
  camera: Camera;
  cards: CardLayer[];
  focus: [number, number];
};

const card = (
  name: string,
  rect: [number, number, number, number],
  land: number,
  lift: number,
): CardLayer => ({
  src: staticFile(`assets/site-tour/cards/${name}`),
  left: rect[0],
  top: rect[1],
  width: rect[2],
  height: rect[3],
  land,
  lift,
});

// Each camera path uses the source GrazeFaceTour's centered-plane coordinates.
// x/y are calculated as content-center minus the point being filmed.
const SCREENS: ScreenDefinition[] = [
  {
    src: staticFile("assets/site-tour/img.png"),
    width: 1863,
    height: 871,
    camera: {
      rx: 13,
      ry: -9,
      rz: -3,
      scale: 1.17,
      x: [1863 / 2 - 700, 1863 / 2 - 1160],
      y: [871 / 2 - 390, 871 / 2 - 340],
    },
    cards: [],
    focus: [48, 43],
  },
  {
    src: staticFile("assets/site-tour/img_1.png"),
    width: 1722,
    height: 845,
    camera: {
      rx: 17,
      ry: 8,
      rz: 2,
      scale: 1.48,
      x: [1722 / 2 - 260, 1722 / 2 - 650],
      y: [845 / 2 - 105, 845 / 2 - 250],
    },
    cards: [card("roblox-3000.png", [20, 94, 283, 361], 0.56, 136)],
    focus: [46, 47],
  },
  {
    src: staticFile("assets/site-tour/img_2.png"),
    width: 1757,
    height: 735,
    camera: {
      rx: 16,
      ry: -10,
      rz: -2,
      scale: 1.56,
      x: [1757 / 2 - 435, 1757 / 2 - 1000],
      y: [735 / 2 - 180, 735 / 2 - 540],
    },
    cards: [
      card("pubg-3850.png", [294, 7, 287, 352], 0.45, 142),
      card("telegram-premium.png", [861, 362, 286, 373], 0.78, 128),
    ],
    focus: [51, 46],
  },
];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

// Original GrazeFaceTour cruise: ease into the first move, cruise between
// landmarks, then soften the final approach without stopping at overlaps.
const cruise = (u: number, first: boolean, last: boolean) => {
  const A = 0.3;
  const k = 1 / (1 - (first ? A / 2 : 0) - (last ? A / 2 : 0));
  const inPart = (x: number) => (x < A ? (x * x) / (2 * A) : x - A / 2);
  if (first && u <= A) return k * inPart(Math.max(0, u));
  if (last && u >= 1 - A) return 1 - k * inPart(Math.max(0, 1 - u));
  return first ? k * inPart(u) : k * u;
};

// Original lift profile and accelerated soft landing from GrazeFaceTour.
const liftOf = (t: number, land: number, height: number) => {
  const fall = 0.34;
  const p = clamp01((t - (land - fall)) / fall);
  return (1 - EASE_LAND(p)) * height;
};

const LiftedCard: React.FC<{
  layer: CardLayer;
  progress: number;
}> = ({ layer, progress }) => {
  const height = liftOf(progress, layer.land, layer.lift);
  const position: React.CSSProperties = {
    position: "absolute",
    left: layer.left,
    top: layer.top,
    width: layer.width,
    height: layer.height,
  };
  return (
    <>
      {/* The source page is black behind these cards; this exact-size patch hides
          the original copy while the isolated screenshot crop floats above it. */}
      <div style={{ ...position, background: "#000", zIndex: 1 }} />
      <div style={{ ...position, zIndex: 2, pointerEvents: "none" }}>
        {height > 1.5 && (
          <div
            style={{
              ...position,
              left: 0,
              top: 0,
              transform: `translate(${height * 0.22}px, ${height * 0.42}px) scale(${1 + height * 0.0011})`,
              transformOrigin: "top left",
              filter: `brightness(0) blur(${2 + height * 0.09}px)`,
              opacity: Math.min(0.22, 0.08 + height * 0.0026),
            }}
          >
            <Img src={layer.src} style={{ width: "100%", height: "100%" }} />
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translate(${-height * 0.34}px, ${-height * 0.78}px)`,
            filter: height > 1.5 ? `drop-shadow(0 ${Math.max(2, height * 0.18)}px ${Math.max(7, height * 0.35)}px rgba(0,0,0,0.42))` : "none",
          }}
        >
          <Img src={layer.src} style={{ width: "100%", height: "100%" }} />
        </div>
      </div>
    </>
  );
};

const SiteScreen: React.FC<{
  definition: ScreenDefinition;
  progress: number;
}> = ({ definition, progress }) => (
  <div
    style={{
      width: definition.width,
      height: definition.height,
      position: "relative",
      boxSizing: "border-box",
      border: "1px solid rgba(57,213,199,0.18)",
      boxShadow: "0 46px 96px rgba(0,0,0,0.48), 0 0 54px rgba(57,213,199,0.055)",
      background: "#000",
    }}
  >
    <Img
      src={definition.src}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
    {definition.cards.map((layer) => (
      <LiftedCard key={layer.src} layer={layer} progress={progress} />
    ))}
  </div>
);

const Plane: React.FC<{
  definition: ScreenDefinition;
  progress: number;
  position: number;
}> = ({ definition, progress, position }) => {
  const cam = definition.camera;
  const x = cam.x[0] + (cam.x[1] - cam.x[0]) * position;
  const y = cam.y[0] + (cam.y[1] - cam.y[0]) * position;
  const roll = cam.rz + (position - 0.5) * 2;
  return (
    <AbsoluteFill style={{ perspective: 1050, perspectiveOrigin: "50% 46%" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 0,
          height: 0,
          transformStyle: "preserve-3d",
          transform: `scale(${cam.scale}) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg) rotateZ(${roll}deg)`,
        }}
      >
        <div style={{ position: "absolute", transform: `translate3d(${x}px, ${y}px, 0)` }}>
          <div style={{ position: "relative", transform: "translate(-50%, -50%)" }}>
            <SiteScreen definition={definition} progress={progress} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(ellipse 68% 72% at 51% 47%, rgba(17,46,48,0.28), transparent 76%), linear-gradient(155deg, #11181B 0%, #071014 48%, #03080D 100%)",
      }}
    >
      {SCREENS.map((definition, index) => {
        const local = frame - index * SEGMENT_LENGTH;
        if (local < -CROSSFADE || local > SEGMENT_LENGTH + CROSSFADE) return null;
        const u = local / SEGMENT_LENGTH;
        const progress = clamp01(u);
        const isFirst = index === 0;
        const isLast = index === SCREENS.length - 1;
        const position = cruise(u, isFirst, isLast);
        const fadeIn = isFirst ? 1 : clamp01((local + CROSSFADE) / CROSSFADE);
        const fadeOut = isLast ? 1 : clamp01((SEGMENT_LENGTH - local) / CROSSFADE);

        // SpeedBlur is the source fixture's directional, deterministic blur.
        const prev = cruise((local - 0.5) / SEGMENT_LENGTH, isFirst, isLast);
        const next = cruise((local + 0.5) / SEGMENT_LENGTH, isFirst, isLast);
        const dx = (definition.camera.x[1] - definition.camera.x[0]) * (next - prev);
        const dy = (definition.camera.y[1] - definition.camera.y[0]) * (next - prev);

        return (
          <AbsoluteFill key={definition.src} style={{ opacity: Math.min(fadeIn, fadeOut) }}>
            <SpeedBlur vx={dx} vy={dy} amount={0.34} max={8}>
              <Plane definition={definition} progress={progress} position={position} />
            </SpeedBlur>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

export const UnlimitSubSiteTour: React.FC = () => {
  const frame = useCurrentFrame();
  const focus = (axis: "x" | "y") => {
    const values = SCREENS.map((screen) => screen.focus[axis === "x" ? 0 : 1]);
    const transitionA = clamp01((frame - SEGMENT_LENGTH + 5) / 10);
    const transitionB = clamp01((frame - 2 * SEGMENT_LENGTH + 5) / 10);
    const stage = transitionA + transitionB;
    return stage <= 1
      ? values[0] + (values[1] - values[0]) * stage
      : values[1] + (values[2] - values[1]) * (stage - 1);
  };
  const focusX = focus("x");
  const focusY = focus("y");

  return (
    <AbsoluteFill style={{ background: "#03080D" }}>
      <Stage />
      {/* GrazeFaceTour's screen-space depth-of-field pass. */}
      <AbsoluteFill
        style={{
          filter: "blur(8px)",
          WebkitMaskImage: `radial-gradient(ellipse 72% 66% at ${focusX}% ${focusY}%, transparent 45%, rgba(0,0,0,0.68) 80%, black 96%)`,
          maskImage: `radial-gradient(ellipse 72% 66% at ${focusX}% ${focusY}%, transparent 45%, rgba(0,0,0,0.68) 80%, black 96%)`,
        }}
      >
        <Stage />
      </AbsoluteFill>
      <Vignette strength={0.2} inner={0.57} color="#03080D" cx={focusX / 100} cy={focusY / 100} />
      <Grain opacity={0.025} blend="soft-light" />
    </AbsoluteFill>
  );
};
