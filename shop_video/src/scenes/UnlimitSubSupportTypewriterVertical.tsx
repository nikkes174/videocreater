// Portrait adaptation of UnlimitSubSupportTypewriter.
// Retains its Remotion-safe adaptation of Video Shotcraft's DocumentTypewriterReveal.
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
import { SupportLuxuryBackgroundVertical } from "../components/SupportLuxuryBackgroundVertical";
import { alpha } from "../vendor/videoShotcraft/demos/_fixtures/Look";

export const UNLIMITSUB_SUPPORT_TYPEWRITER_VERTICAL_DURATION = 180;

const MANROPE_FAMILY = "UnlimitSubManrope";
const UNBOUNDED_FAMILY = "UnlimitSubUnbounded";
const SILVER_TEXT = "linear-gradient(180deg, #FFFFFF 0%, #DCE9ED 48%, #89A5AF 100%)";
const TEAL_TEXT = "linear-gradient(180deg, #DFFFFD 0%, #80E8E0 48%, #39D5C7 100%)";
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
const FONT_FILES = [
  { family: MANROPE_FAMILY, prefix: "manrope", weight: 500 },
  { family: MANROPE_FAMILY, prefix: "manrope", weight: 800 },
  { family: UNBOUNDED_FAMILY, prefix: "unbounded", weight: 700 },
] as const;

const PAGE_W = 1080;
const PAGE_H = 1920;
const WINDOW = { left: 70, top: 530, width: 940, height: 1030 };
const CARET_COLOR = "#72DEDB";
const WIPE_EASE = Easing.bezier(0.4, 0, 0.6, 1);
const CAMERA_PERSPECTIVE = 2200;

type Camera = { cx: number; cy: number; zoom: number; rotX: number; rotY: number; sx: number; sy: number };
type CameraKey = Camera & { frame: number };

// The source uses a monotone cubic Hermite spline, preserving its calm continuous pullback.
const CAMERA_KEYS: CameraKey[] = [
  { frame: 0, cx: 540, cy: 960, zoom: 1.04, rotX: 4.5, rotY: -9, sx: 0, sy: 0 },
  { frame: 34, cx: 540, cy: 960, zoom: 0.97, rotX: 4, rotY: -6, sx: 0, sy: 0 },
  { frame: 78, cx: 540, cy: 960, zoom: 0.9, rotX: 4.5, rotY: -4, sx: 0, sy: 0 },
  { frame: 132, cx: 540, cy: 960, zoom: 0.86, rotX: 5.5, rotY: -2.5, sx: 0, sy: 0 },
  { frame: 180, cx: 540, cy: 960, zoom: 0.868, rotX: 5.5, rotY: -2.5, sx: 0, sy: 0 },
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
  { id: "support", start: 0, duration: 10 },
  { id: "support-hours", start: 10, duration: 6 },
  { id: "promise-one", start: 16, duration: 14 },
  { id: "promise-two", start: 30, duration: 13 },
  { id: "signature", start: 43, duration: 9 },
  { id: "question-1", start: 56, duration: 11 },
  { id: "answer-1", start: 69, duration: 12 },
  { id: "question-2", start: 83, duration: 10 },
  { id: "answer-2", start: 95, duration: 12 },
  { id: "question-3", start: 109, duration: 10 },
  { id: "answer-3", start: 121, duration: 16 },
] as const;

const revealProgress = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: WIPE_EASE,
  });

const responsePulseAt = (frame: number, start: number, duration: number) => {
  const attack = interpolate(frame, [start, start + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const release = interpolate(frame, [start + 4, start + duration + 18], [1, 0.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return attack * release;
};

const FINAL_RESPONSE_LOCK = (frame: number) =>
  interpolate(frame, [137, 142, 154], [0, 0.2, 0.38], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
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
  fontFamily?: string;
  lineHeight?: number;
  letterSpacing?: string;
  gradient?: string;
  revealMode?: "cover" | "clip";
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
  fontFamily = MANROPE_FAMILY,
  lineHeight = 1.24,
  letterSpacing,
  gradient,
  revealMode = "cover",
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
        color: gradient ? "transparent" : color,
        backgroundImage: gradient,
        backgroundClip: gradient ? "text" : undefined,
        WebkitBackgroundClip: gradient ? "text" : undefined,
        WebkitTextFillColor: gradient ? "transparent" : undefined,
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing,
        whiteSpace: "pre",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span
        style={{
          display: "block",
          clipPath: revealMode === "clip" ? `inset(0 ${((1 - progress) * 100).toFixed(3)}% 0 0)` : undefined,
        }}
      >
        {text}
      </span>
      {revealMode === "cover" && progress < 1 ? (
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
    top: 96,
    groupStart: 52,
    question: "Подскажите, что выбрать\nдля Apple Gift Card?",
    questionStart: 56,
    questionDuration: 11,
    answer: "Помогу. Сначала выберите нужный\nрегион и номинал карты.",
    answerStart: 69,
    answerDuration: 12,
  },
  {
    id: 2,
    top: 360,
    groupStart: 79,
    question: "А если нужна карта для России\nна 1000 RUB?",
    questionStart: 83,
    questionDuration: 10,
    answer: "Тогда подойдёт Apple Gift Card\nРоссия 1000 RUB.",
    answerStart: 95,
    answerDuration: 12,
  },
  {
    id: 3,
    top: 624,
    groupStart: 105,
    question: "И как быстро приходит?",
    questionStart: 109,
    questionDuration: 10,
    answer:
      "Обычно после оплаты товар отправляется\nмаксимально быстро. Если потребуется\nуточнение, я сразу подскажу статус.",
    answerStart: 121,
    answerDuration: 16,
  },
] as const;

export const UnlimitSubSupportTypewriterVertical: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = cameraAt(frame);
  const finalResponseLock = FINAL_RESPONSE_LOCK(frame);
  const responsePulse = Math.max(
    finalResponseLock,
    ...EXCHANGES.map((exchange) => responsePulseAt(frame, exchange.answerStart, exchange.answerDuration)),
  );
  const [fontReady, setFontReady] = useState(false);
  const [renderHandle] = useState(() => delayRender("Loading local Manrope and Unbounded fonts for UnlimitSub support scene"));
  const releasedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const faces = FONT_FILES.flatMap(({ family, prefix, weight }) =>
      FONT_SUBSETS.map(
        ({ name, range }) =>
          new FontFace(
            family,
            `url("${staticFontUrl(prefix, name, weight)}") format("woff2")`,
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
          document.fonts.load(`500 24px "${MANROPE_FAMILY}"`, "Поддержка ИИ-ассистент Apple Gift Card"),
          document.fonts.load(`800 38px "${MANROPE_FAMILY}"`, "Ответы на вопросы Когда они нужны"),
          document.fonts.load(`700 58px "${UNBOUNDED_FAMILY}"`, "Поддержка 24/7"),
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

  const cameraEnter = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const windowReveal = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  return (
    <AbsoluteFill style={{ background: "#03080D", overflow: "hidden" }}>
      <SupportLuxuryBackgroundVertical responsePulse={responsePulse} />

      {/* Reference 3D document camera: same page-space zoom and anchor-to-screen transform. */}
      <AbsoluteFill style={{ transform: `translate(${camera.sx.toFixed(2)}px, ${camera.sy.toFixed(2)}px)` }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            perspective: `${(CAMERA_PERSPECTIVE * camera.zoom).toFixed(2)}px`,
            perspectiveOrigin: `${PAGE_W / 2}px ${PAGE_H / 2}px`,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: PAGE_W,
              height: PAGE_H,
              zoom: camera.zoom,
              transform: `translate(${(PAGE_W / 2 / camera.zoom - camera.cx).toFixed(3)}px, ${(PAGE_H / 2 / camera.zoom - camera.cy).toFixed(3)}px) rotateY(${camera.rotY.toFixed(3)}deg) rotateX(${camera.rotX.toFixed(3)}deg)`,
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
                background: `radial-gradient(ellipse 50% 48% at 50% 48%, rgba(57,213,199,${(0.19 + responsePulse * 0.08).toFixed(3)}) 0%, rgba(114,222,219,0.075) 46%, transparent 74%)`,
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
                borderRadius: 26,
                boxSizing: "border-box",
                color: "#EAF6F5",
                fontFamily: MANROPE_FAMILY,
                opacity: windowReveal,
                transform: `translateY(${((1 - cameraEnter) * 18).toFixed(2)}px) scale(${(0.975 + cameraEnter * 0.025).toFixed(4)})`,
                transformOrigin: "50% 50%",
                background: "linear-gradient(145deg, rgba(17,24,27,0.94), rgba(8,16,20,0.93))",
                backdropFilter: "blur(16px)",
                border: `1px solid rgba(234,246,245,${(0.13 + responsePulse * 0.12).toFixed(3)})`,
                boxShadow:
                  `0 0 0 1px rgba(57,213,199,${(0.07 + responsePulse * 0.08).toFixed(3)}), 0 42px 110px rgba(0,4,9,0.74), 0 14px 38px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.07)`,
              }}
            >
              {/* Compact branded concierge header */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 86,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 28px",
                  boxSizing: "border-box",
                  background: "linear-gradient(180deg, rgba(9,17,21,0.9), rgba(9,17,21,0.58))",
                  borderBottom: "1px solid rgba(158,181,186,0.11)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <div
                    style={{
                      width: 31,
                      height: 31,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#03080D",
                      background: "linear-gradient(145deg, #DFFFFD, #39D5C7)",
                      fontSize: 19,
                      fontWeight: 800,
                      letterSpacing: "-0.08em",
                    }}
                  >
                    U
                  </div>
                  <div style={{ fontSize: 20, lineHeight: 1, fontWeight: 800, letterSpacing: "-0.035em" }}>
                    UnlimitSub
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    borderRadius: 24,
                    padding: "9px 13px",
                    background: "rgba(57,213,199,0.07)",
                    border: "1px solid rgba(57,213,199,0.18)",
                    color: "#BFE9E6",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.065em",
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#39D5C7",
                      boxShadow: `0 0 ${(7 + responsePulse * 5).toFixed(1)}px rgba(57,213,199,0.45)`,
                    }}
                  />
                  НА СВЯЗИ 24/7
                </div>
              </div>

              {/* The three exchanges are paired, but client questions and assistant replies have distinct forms. */}
              {EXCHANGES.map((exchange) => {
                const groupOpacity = interpolate(frame, [exchange.groupStart, exchange.groupStart + 8], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.3, 0, 0.2, 1),
                });
                const replyPulse = Math.max(
                  responsePulseAt(frame, exchange.answerStart, exchange.answerDuration),
                  exchange.id === 3 ? finalResponseLock : 0,
                );
                const replyEntrance = interpolate(frame, [exchange.answerStart, exchange.answerStart + 4], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.3, 0, 0.2, 1),
                });
                const answerHeight = exchange.id === 3 ? 154 : 126;
                return (
                  <div
                    key={exchange.id}
                    style={{
                      position: "absolute",
                      left: 21,
                      right: 21,
                      top: exchange.top,
                      height: answerHeight + 92,
                      opacity: groupOpacity,
                      transform: `translateY(${((1 - groupOpacity) * 8).toFixed(2)}px)`,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        width: "max-content",
                        maxWidth: 790,
                        boxSizing: "border-box",
                        padding: "12px 16px 14px",
                        borderRadius: 15,
                        background: "#141D21",
                        border: "1px solid rgba(158,181,186,0.17)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.035), 0 7px 20px rgba(0,0,0,0.14)",
                      }}
                    >
                      <div
                        style={{
                          marginBottom: 7,
                          color: "#8FA5A9",
                          fontSize: 13,
                          lineHeight: 1,
                          textAlign: "right",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Клиент
                      </div>
                      <TypewriterText
                        id={`question-${exchange.id}` as (typeof TYPEWRITER_BLOCKS)[number]["id"]}
                        frame={frame}
                        activeId={activeId}
                        text={exchange.question}
                        start={exchange.questionStart}
                        duration={exchange.questionDuration}
                        coverColor="#141D21"
                        color="#EAF6F5"
                        fontSize={22}
                        fontWeight={500}
                        lineHeight={1.28}
                        letterSpacing="-0.018em"
                      />
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 110,
                        width: 858,
                        height: answerHeight,
                        opacity: replyEntrance,
                        padding: "13px 18px 14px",
                        boxSizing: "border-box",
                        borderRadius: 17,
                        background: "#0D171A",
                        border: `1px solid rgba(57,213,199,${(0.12 + replyPulse * 0.22).toFixed(3)})`,
                        boxShadow: `0 0 ${(7 + replyPulse * 18).toFixed(1)}px rgba(57,213,199,${(0.045 + replyPulse * 0.13).toFixed(3)}), inset 0 1px 0 rgba(255,255,255,0.035)`,
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 25,
                            height: 25,
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#061014",
                            background: "linear-gradient(145deg, #DFFFFD, #39D5C7)",
                            fontSize: 15,
                            lineHeight: 1,
                            fontWeight: 800,
                            letterSpacing: "-0.08em",
                            flex: "none",
                          }}
                        >
                          U
                        </div>
                        <div
                          style={{
                            color: "#72DEDB",
                            fontSize: 12,
                            lineHeight: 1,
                            fontWeight: 800,
                            letterSpacing: "0.13em",
                          }}
                        >
                          ИИ-АССИСТЕНТ
                        </div>
                      </div>
                    <div style={{ position: "absolute", left: 56, top: 45, opacity: replyEntrance }}>
                        <TypewriterText
                          id={`answer-${exchange.id}` as (typeof TYPEWRITER_BLOCKS)[number]["id"]}
                          frame={frame}
                          activeId={activeId}
                          text={exchange.answer}
                          start={exchange.answerStart}
                          duration={exchange.answerDuration}
                          coverColor="#0D171A"
                          color="#DCEBEA"
                          fontSize={23}
                          fontWeight={500}
                          lineHeight={1.3}
                          letterSpacing="-0.015em"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 1,
                  background: "linear-gradient(90deg, transparent, rgba(234,246,245,0.32), rgba(57,213,199,0.34), transparent)",
                }}
              />
            </div>

            {/* Independent advertising copy: the title and the conversation remain separate visual planes. */}
            <div style={{ position: "absolute", left: 72, top: 274, display: "flex", alignItems: "baseline", gap: 18 }}>
              <TypewriterText
                id="support"
                frame={frame}
                activeId={activeId}
                text="Поддержка"
                start={0}
                duration={10}
                coverColor="#03080D"
                color="#FFFFFF"
                fontSize={56}
                fontWeight={700}
                fontFamily={UNBOUNDED_FAMILY}
                lineHeight={1.1}
                letterSpacing="-0.045em"
                gradient={SILVER_TEXT}
                revealMode="clip"
              />
              <TypewriterText
                id="support-hours"
                frame={frame}
                activeId={activeId}
                text="24/7"
                start={10}
                duration={6}
                coverColor="#03080D"
                color="#72DEDB"
                fontSize={58}
                fontWeight={700}
                fontFamily={UNBOUNDED_FAMILY}
                lineHeight={1.1}
                letterSpacing="-0.05em"
                gradient={TEAL_TEXT}
                revealMode="clip"
              />
            </div>
            <div style={{ position: "absolute", left: 76, top: 366 }}>
              <TypewriterText
                id="promise-one"
                frame={frame}
                activeId={activeId}
                text="Ответы на вопросы."
                start={16}
                duration={14}
                coverColor="#03080D"
                color="#EAF6F5"
                fontSize={38}
                fontWeight={800}
                lineHeight={1.18}
                letterSpacing="-0.035em"
                gradient="linear-gradient(180deg, #FFFFFF 0%, #DCE9ED 48%, #A9C0C7 100%)"
                revealMode="clip"
              />
            </div>
            <div style={{ position: "absolute", left: 76, top: 418 }}>
              <TypewriterText
                id="promise-two"
                frame={frame}
                activeId={activeId}
                text="Когда они нужны."
                start={30}
                duration={13}
                coverColor="#03080D"
                color="#72DEDB"
                fontSize={38}
                fontWeight={800}
                lineHeight={1.18}
                letterSpacing="-0.035em"
                gradient="linear-gradient(108deg, #72DEDB 0%, #DCE9ED 94%)"
                revealMode="clip"
              />
            </div>
            <div style={{ position: "absolute", left: 78, top: 480 }}>
              <TypewriterText
                id="signature"
                frame={frame}
                activeId={activeId}
                text="ВАШ ИИ-АССИСТЕНТ UNLIMITSUB"
                start={43}
                duration={9}
                coverColor="#03080D"
                color="#9EB5BA"
                fontSize={17}
                fontWeight={500}
                lineHeight={1.2}
                letterSpacing="0.19em"
                revealMode="clip"
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: 78,
                top: 520,
                width: 155,
                height: 1,
                background: "linear-gradient(90deg, rgba(114,222,219,0.68), rgba(114,222,219,0))",
                opacity: interpolate(frame, [49, 59], [0, 0.62], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

function staticFontUrl(
  prefix: "manrope" | "unbounded",
  subset: (typeof FONT_SUBSETS)[number]["name"],
  weight: 500 | 700 | 800,
): string {
  return staticFile(`assets/fonts/${prefix}-${weight}-${subset}.woff2`);
}
