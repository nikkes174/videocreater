// Adapted from Video Shotcraft's DocumentTypewriterReveal.
// Copyright 2026 Wei Yihao; licensed under Apache-2.0.
// The camera spline, perspective window, paired left-to-right wipes, and single moving caret
// preserve the reference mechanics; the document, palette, and copy are UnlimitSub-specific.
import React, { useEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { LOOKS, Stage, Dust, alpha, type Look } from "../vendor/videoShotcraft/demos/_fixtures/Look";

export const UNLIMITSUB_SUPPORT_TYPEWRITER_DURATION = 180;

const FONT_FAMILY = "UnlimitSubManrope";
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

const UNLIMITSUB_LOOK: Look = {
  ...LOOKS.midnight,
  bg: ["#03080D", "#071116", "#03080D"],
  light: "#39D5C7",
  surface: "#11181B",
  surface2: "#172126",
  line: "rgba(114,222,219,0.14)",
  ink: "#EAF6F5",
  ink2: "#9EB5BA",
  ink3: "#627A7E",
  accent: "#39D5C7",
  accent2: "#72DEDB",
  onAccent: "#03080D",
  shadow: "#00040A",
};

const PAGE_W = 1920;
const PAGE_H = 1080;
const WINDOW = { left: 90, top: 50, width: 1740, height: 980 };
const CARET_COLOR = "#72DEDB";
const WIPE_EASE = Easing.bezier(0.4, 0, 0.6, 1);
const CAMERA_PERSPECTIVE = 2200;

type Camera = { cx: number; cy: number; zoom: number; rotX: number; rotY: number; sx: number; sy: number };
type CameraKey = Camera & { frame: number };

// The source uses a monotone cubic Hermite spline, preserving its calm continuous pullback.
const CAMERA_KEYS: CameraKey[] = [
  { frame: 0, cx: 610, cy: 260, zoom: 1.34, rotX: 7.5, rotY: -16, sx: 0, sy: 0 },
  { frame: 28, cx: 770, cy: 370, zoom: 1.17, rotX: 6, rotY: -12, sx: 0, sy: 0 },
  { frame: 50, cx: 960, cy: 540, zoom: 0.98, rotX: 5, rotY: -7, sx: 0, sy: 0 },
  { frame: 78, cx: 960, cy: 540, zoom: 0.9, rotX: 4.5, rotY: -6, sx: 0, sy: 0 },
  { frame: 132, cx: 960, cy: 540, zoom: 0.8, rotX: 8, rotY: -3, sx: 0, sy: 0 },
  { frame: 180, cx: 960, cy: 574, zoom: 0.808, rotX: 8, rotY: -3, sx: 0, sy: 0 },
];
const CAMERA_PARAMS: (keyof Camera)[] = ["cx", "cy", "zoom", "rotX", "rotY", "sx", "sy"];

const hermite = (xs: number[], ys: number[]) => {
  const n = xs.length;
  const slopes = xs.slice(0, -1).map((x, i) => (ys[i + 1] - ys[i]) / (xs[i + 1] - x));
  const tangents = xs.map((_, i) =>
    i === 0 || i === n - 1 || slopes[i - 1] * slopes[i] <= 0
      ? 0
      : (slopes[i - 1] + slopes[i]) / 2,
  );

  for (let i = 0; i < n - 1; i++) {
    if (slopes[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const a = tangents[i] / slopes[i];
    const b = tangents[i + 1] / slopes[i];
    const magnitude = a * a + b * b;
    if (magnitude > 9) {
      const scale = 3 / Math.sqrt(magnitude);
      tangents[i] = scale * a * slopes[i];
      tangents[i + 1] = scale * b * slopes[i];
    }
  }

  return (value: number) => {
    if (value <= xs[0]) return ys[0];
    if (value >= xs[n - 1]) return ys[n - 1];
    let index = 0;
    while (index < n - 2 && value > xs[index + 1]) index++;
    const span = xs[index + 1] - xs[index];
    const t = (value - xs[index]) / span;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[index] +
      (t3 - 2 * t2 + t) * span * tangents[index] +
      (-2 * t3 + 3 * t2) * ys[index + 1] +
      (t3 - t2) * span * tangents[index + 1]
    );
  };
};

const CAMERA_CURVES = Object.fromEntries(
  CAMERA_PARAMS.map((parameter) => [
    parameter,
    hermite(
      CAMERA_KEYS.map((key) => key.frame),
      CAMERA_KEYS.map((key) => key[parameter]),
    ),
  ]),
) as Record<keyof Camera, (frame: number) => number>;

const cameraAt = (frame: number): Camera =>
  Object.fromEntries(CAMERA_PARAMS.map((parameter) => [parameter, CAMERA_CURVES[parameter](frame)])) as Camera;

const TYPEWRITER_BLOCKS = [
  { id: "headline", start: 2, duration: 10 },
  { id: "subtitle", start: 15, duration: 10 },
  { id: "question-1", start: 44, duration: 12 },
  { id: "answer-1", start: 58, duration: 13 },
  { id: "question-2", start: 73, duration: 12 },
  { id: "answer-2", start: 87, duration: 13 },
  { id: "question-3", start: 102, duration: 11 },
  { id: "answer-3", start: 115, duration: 19 },
] as const;

const revealProgress = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: WIPE_EASE,
  });

const TypewriterText: React.FC<{
  id: (typeof TYPEWRITER_BLOCKS)[number]["id"];
  frame: number;
  activeId: string | null;
  text: string;
  start: number;
  duration: number;
  coverColor: string;
  color: string;
  fontSize: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: string;
}> = ({
  id,
  frame,
  activeId,
  text,
  start,
  duration,
  coverColor,
  color,
  fontSize,
  fontWeight = 500,
  lineHeight = 1.24,
  letterSpacing,
}) => {
  const progress = revealProgress(frame, start, duration);
  const caretOpacity =
    frame <= start + duration
      ? 1
      : interpolate(frame, [start + duration, start + duration + 2], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <div
      aria-label={text.replace(/\n/g, " ")}
      style={{
        position: "relative",
        display: "inline-block",
        width: "max-content",
        maxWidth: "none",
        color,
        fontFamily: FONT_FAMILY,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing,
        whiteSpace: "pre",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span style={{ display: "block" }}>{text}</span>
      {progress < 1 ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: `${((1 - progress) * 100).toFixed(3)}%`,
            background: coverColor,
            pointerEvents: "none",
          }}
        />
      ) : null}
      {activeId === id ? (
        <div
          style={{
            position: "absolute",
            top: `${Math.max(3, fontSize * (lineHeight - 1) * 0.35)}px`,
            left: `${(progress * 100).toFixed(3)}%`,
            width: Math.max(2, fontSize * 0.045),
            height: fontSize * 0.84,
            borderRadius: 2,
            background: CARET_COLOR,
            boxShadow: `0 0 9px ${alpha(CARET_COLOR, 0.72)}, 0 0 22px ${alpha(CARET_COLOR, 0.4)}`,
            opacity: caretOpacity,
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  );
};

const EXCHANGES = [
  {
    id: 1,
    top: 350,
    height: 140,
    groupStart: 40,
    question: "Подскажите, что выбрать для Apple Gift Card?",
    questionStart: 44,
    questionDuration: 12,
    answer: "Помогу. Сначала выберите нужный регион и номинал карты.",
    answerStart: 58,
    answerDuration: 13,
  },
  {
    id: 2,
    top: 508,
    height: 140,
    groupStart: 69,
    question: "А если нужна карта для России на 1000 RUB?",
    questionStart: 73,
    questionDuration: 12,
    answer: "Тогда подойдёт Apple Gift Card Россия 1000 RUB.",
    answerStart: 87,
    answerDuration: 13,
  },
  {
    id: 3,
    top: 666,
    height: 170,
    groupStart: 98,
    question: "И как быстро приходит?",
    questionStart: 102,
    questionDuration: 11,
    answer:
      "Обычно после оплаты товар отправляется максимально быстро.\nЕсли потребуется уточнение, я сразу подскажу статус.",
    answerStart: 115,
    answerDuration: 19,
  },
] as const;

export const UnlimitSubSupportTypewriter: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = cameraAt(frame);
  const [fontReady, setFontReady] = useState(false);
  const [renderHandle] = useState(() => delayRender("Loading local Manrope subsets for UnlimitSub support scene"));
  const releasedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const faces = ([500, 800] as const).flatMap((weight) =>
      FONT_SUBSETS.map(
        ({ name, range }) =>
          new FontFace(
            FONT_FAMILY,
            `url("${staticFontUrl(name, weight)}") format("woff2")`,
            { weight: String(weight), style: "normal", unicodeRange: range, display: "block" },
          ),
      ),
    );

    Promise.all(faces.map((face) => face.load()))
      .then(async (loadedFaces) => {
        if (cancelled) return;
        const fontSet = document.fonts as FontFaceSet & { add: (face: FontFace) => FontFaceSet };
        loadedFaces.forEach((face) => fontSet.add(face));
        await Promise.all([
          document.fonts.load(`500 32px "${FONT_FAMILY}"`, "Поддержка ИИ-ассистент Apple Gift Card"),
          document.fonts.load(`800 84px "${FONT_FAMILY}"`, "Поддержка 24/7"),
        ]);
        if (cancelled) return;
        setFontReady(true);
        if (!releasedRef.current) {
          releasedRef.current = true;
          continueRender(renderHandle);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) cancelRender(error instanceof Error ? error : new Error(String(error)));
      });

    return () => {
      cancelled = true;
    };
  }, [renderHandle]);

  if (!fontReady) return <AbsoluteFill style={{ background: "#03080D" }} />;

  let activeId: string | null = null;
  for (const block of TYPEWRITER_BLOCKS) {
    if (frame >= block.start && frame <= block.start + block.duration + 2) activeId = block.id;
  }

  const cameraEnter = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const windowReveal = interpolate(frame, [0, 21], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  return (
    <AbsoluteFill style={{ background: "#03080D", overflow: "hidden" }}>
      <Stage
        look={UNLIMITSUB_LOOK}
        keyLight={{ x: 0.49, y: 0.05 }}
        fill={{ x: 0.86, y: 0.88 }}
        horizon={0.91}
        intensity={0.5}
        breathe={0.42}
        grain={0.045}
        vignette={0.62}
      >
        <Dust look={UNLIMITSUB_LOOK} count={24} seed={29} drift={0.13} opacity={0.2} color="#72DEDB" />
      </Stage>

      {/* Reference 3D document camera: same page-space zoom and anchor-to-screen transform. */}
      <AbsoluteFill style={{ transform: `translate(${camera.sx.toFixed(2)}px, ${camera.sy.toFixed(2)}px)` }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            perspective: `${(CAMERA_PERSPECTIVE * camera.zoom).toFixed(2)}px`,
            perspectiveOrigin: "960px 540px",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: PAGE_W,
              height: PAGE_H,
              zoom: camera.zoom,
              transform: `translate(${(960 / camera.zoom - camera.cx).toFixed(3)}px, ${(540 / camera.zoom - camera.cy).toFixed(3)}px) rotateY(${camera.rotY.toFixed(3)}deg) rotateX(${camera.rotX.toFixed(3)}deg)`,
              transformOrigin: `${camera.cx.toFixed(2)}px ${camera.cy.toFixed(2)}px`,
              transformStyle: "preserve-3d",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: WINDOW.left - 210,
                top: WINDOW.top - 170,
                width: WINDOW.width + 420,
                height: WINDOW.height + 360,
                pointerEvents: "none",
                opacity: windowReveal,
                background: `radial-gradient(ellipse 50% 48% at 50% 48%, ${alpha(UNLIMITSUB_LOOK.accent, 0.24)} 0%, ${alpha(UNLIMITSUB_LOOK.accent2, 0.085)} 46%, transparent 74%)`,
                transform: "translateZ(-48px)",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: WINDOW.left,
                top: WINDOW.top,
                width: WINDOW.width,
                height: WINDOW.height,
                overflow: "hidden",
                borderRadius: 30,
                boxSizing: "border-box",
                color: UNLIMITSUB_LOOK.ink,
                fontFamily: FONT_FAMILY,
                opacity: windowReveal,
                transform: `translateY(${((1 - cameraEnter) * 18).toFixed(2)}px) scale(${(0.975 + cameraEnter * 0.025).toFixed(4)})`,
                transformOrigin: "50% 50%",
                background: "#10191D",
                border: "1px solid rgba(234,246,245,0.2)",
                boxShadow:
                  "0 0 0 1px rgba(57,213,199,0.09), 0 56px 140px rgba(0,4,9,0.76), 0 14px 38px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
              }}
            >
              {/* Floating application header */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 66px",
                  boxSizing: "border-box",
                  background: "linear-gradient(180deg, #0B1216 0%, #0D1519 100%)",
                  borderBottom: "1px solid rgba(158,181,186,0.12)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#03080D",
                      background: "linear-gradient(145deg, #72DEDB, #39D5C7)",
                      fontSize: 23,
                      fontWeight: 800,
                      letterSpacing: "-0.08em",
                      boxShadow: "0 0 20px rgba(57,213,199,0.18)",
                    }}
                  >
                    U
                  </div>
                  <div style={{ fontSize: 25, lineHeight: 1, fontWeight: 800, letterSpacing: "-0.035em" }}>
                    UnlimitSub
                  </div>
                  <div style={{ width: 1, height: 28, margin: "0 6px", background: "rgba(158,181,186,0.2)" }} />
                  <div style={{ fontSize: 18, color: "#9EB5BA", letterSpacing: "0.09em", fontWeight: 500 }}>
                    ЦЕНТР ПОДДЕРЖКИ
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderRadius: 24,
                    padding: "12px 20px",
                    background: "rgba(57,213,199,0.08)",
                    border: "1px solid rgba(57,213,199,0.19)",
                    color: "#B8E9E6",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}
                >
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: "#39D5C7",
                      boxShadow: "0 0 12px rgba(57,213,199,0.7)",
                    }}
                  />
                  НА СВЯЗИ 24/7
                </div>
              </div>

              {/* Headline and promise */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 100,
                  height: 244,
                  padding: "48px 72px 0",
                  boxSizing: "border-box",
                  background: "#10191D",
                }}
              >
                <div style={{ position: "absolute", left: 72, top: 48 }}>
                  <TypewriterText
                    id="headline"
                    frame={frame}
                    activeId={activeId}
                    text="Поддержка 24/7"
                    start={2}
                    duration={10}
                    coverColor="#10191D"
                    color="#EAF6F5"
                    fontSize={84}
                    fontWeight={800}
                    lineHeight={1.04}
                    letterSpacing="-0.045em"
                  />
                </div>
                <div style={{ position: "absolute", left: 74, top: 160 }}>
                  <TypewriterText
                    id="subtitle"
                    frame={frame}
                    activeId={activeId}
                    text="По всем интересующим вопросам — ИИ-ассистент"
                    start={15}
                    duration={10}
                    coverColor="#10191D"
                    color="#9EB5BA"
                    fontSize={34}
                    fontWeight={500}
                    lineHeight={1.25}
                    letterSpacing="-0.014em"
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 74,
                    bottom: 0,
                    width: 154,
                    height: 2,
                    background: "linear-gradient(90deg, #39D5C7, rgba(57,213,199,0))",
                    opacity: interpolate(frame, [15, 32], [0, 0.72], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  }}
                />
              </div>

              {/* Three paired question/answer entries, matching the source's two-at-a-time reveal rhythm. */}
              {EXCHANGES.map((exchange) => {
                const groupOpacity = interpolate(frame, [exchange.groupStart, exchange.groupStart + 8], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.3, 0, 0.2, 1),
                });
                const y = exchange.top;
                return (
                  <div
                    key={exchange.id}
                    style={{
                      position: "absolute",
                      left: 120,
                      right: 120,
                      top: y,
                      height: exchange.height,
                      opacity: groupOpacity,
                      transform: `translateY(${((1 - groupOpacity) * 9).toFixed(2)}px)`,
                      boxSizing: "border-box",
                      borderRadius: 22,
                      background: "#0B1418",
                      border: "1px solid rgba(114,222,219,0.105)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.025)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: 34,
                        top: 12,
                        color: "#72878B",
                        fontSize: 16,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                      }}
                    >
                      КЛИЕНТ
                    </div>
                    <div style={{ position: "absolute", right: 34, top: 39, textAlign: "right" }}>
                      <TypewriterText
                        id={`question-${exchange.id}` as (typeof TYPEWRITER_BLOCKS)[number]["id"]}
                        frame={frame}
                        activeId={activeId}
                        text={exchange.question}
                        start={exchange.questionStart}
                        duration={exchange.questionDuration}
                        coverColor="#0B1418"
                        color="#EAF6F5"
                        fontSize={30}
                        fontWeight={500}
                        lineHeight={1.25}
                        letterSpacing="-0.02em"
                      />
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        left: 32,
                        top: 79,
                        width: 3,
                        height: 42,
                        borderRadius: 2,
                        background: "linear-gradient(180deg, #72DEDB, rgba(57,213,199,0.2))",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 52,
                        top: 72,
                        color: "#72DEDB",
                        fontSize: 15,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                      }}
                    >
                      ИИ-АССИСТЕНТ
                    </div>
                    <div style={{ position: "absolute", left: 52, top: 94 }}>
                      <TypewriterText
                        id={`answer-${exchange.id}` as (typeof TYPEWRITER_BLOCKS)[number]["id"]}
                        frame={frame}
                        activeId={activeId}
                        text={exchange.answer}
                        start={exchange.answerStart}
                        duration={exchange.answerDuration}
                        coverColor="#0B1418"
                        color="#D7EBE9"
                        fontSize={29}
                        fontWeight={500}
                        lineHeight={1.28}
                        letterSpacing="-0.018em"
                      />
                    </div>
                  </div>
                );
              })}

              {/* The quiet status line takes the place of the source demo's closing slogan. */}
              <div
                style={{
                  position: "absolute",
                  left: 120,
                  right: 120,
                  bottom: 35,
                  height: 1,
                  background: "linear-gradient(90deg, rgba(114,222,219,0.16), rgba(158,181,186,0.05), transparent)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 122,
                  bottom: 12,
                  color: "#627A7E",
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                }}
              >
                UNLIMITSUB · AI SUPPORT
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 2,
                  background: "linear-gradient(90deg, transparent, rgba(234,246,245,0.4), rgba(57,213,199,0.24), transparent)",
                }}
              />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

function staticFontUrl(subset: (typeof FONT_SUBSETS)[number]["name"], weight: 500 | 800): string {
  return staticFile(`assets/fonts/manrope-${weight}-${subset}.woff2`);
}
