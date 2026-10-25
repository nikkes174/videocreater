import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { CinematicBackground, CinematicForeground } from "../components/CinematicBackground";
import { ParticleLogoIntro } from "./ParticleLogoIntro";
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

type PortraitCameraKey = { frame: number; position: number; scale: number };

const PORTRAIT_CAMERA: Record<string, PortraitCameraKey[]> = {
  "first_v2_cadr.mp4": [
    { frame: 0, position: 43, scale: 1.0 },
    { frame: 84, position: 50, scale: 1.03 },
    { frame: 209, position: 56, scale: 1.05 },
  ],
  "three_cadr.mp4": [
    { frame: 0, position: 50, scale: 1.0 },
    { frame: 82, position: 50, scale: 1.02 },
    { frame: 164, position: 52, scale: 1.03 },
  ],
  "two_cadr.mp4": [
    { frame: 0, position: 68, scale: 1.0 },
    { frame: 86, position: 70, scale: 1.01 },
    { frame: 171, position: 68, scale: 1.02 },
  ],
  "five_cadr.mp4": [
    { frame: 0, position: 48, scale: 1.0 },
    { frame: 112, position: 66, scale: 1.02 },
    { frame: 180, position: 82, scale: 1.03 },
    { frame: 224, position: 84, scale: 1.03 },
  ],
  "four_cadr.mp4": [
    { frame: 0, position: 30, scale: 1.0 },
    { frame: 60, position: 48, scale: 1.01 },
    { frame: 100, position: 78, scale: 1.02 },
    { frame: 150, position: 84, scale: 1.04 },
    { frame: 179, position: 80, scale: 1.03 },
  ],
};

const PortraitBrandIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [8, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const copyOpacity = interpolate(frame, [34, 58], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const logo = staticFile("assets/unlimitsub-logo.png");

  return (
    <AbsoluteFill style={{ backgroundColor: "#03080D", overflow: "hidden" }}>
      <CinematicBackground />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 72% 30% at 50% 44%, rgba(25,120,128,0.24), transparent 78%), linear-gradient(180deg, rgba(3,8,13,0.06), rgba(3,8,13,0.44))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "38%",
          width: "92%",
          maxWidth: 980,
          height: 320,
          transform: `translateX(-50%) scale(${(0.96 + reveal * 0.04).toFixed(4)})`,
          opacity: reveal,
          filter: "drop-shadow(0 0 25px rgba(57,213,199,0.26))",
        }}
      >
        <Img
          src={logo}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 48,
          right: 48,
          top: "58%",
          textAlign: "center",
          opacity: copyOpacity,
          transform: `translateY(${((1 - copyOpacity) * 18).toFixed(2)}px)`,
          fontFamily: "Arial, sans-serif",
          fontSize: 36,
          fontWeight: 500,
          letterSpacing: "0.025em",
          lineHeight: 1.35,
          color: "#EAF6F5",
          textShadow: "0 2px 18px rgba(57,213,199,0.18)",
        }}
      >
        Цифровые возможности <span style={{ color: "#72DEDB" }}>без границ.</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 72,
          right: 72,
          top: "65%",
          textAlign: "center",
          opacity: copyOpacity * 0.82,
          fontFamily: "Arial, sans-serif",
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: "0.2em",
          color: "#AFC5C8",
        }}
      >
        ОТ ПОДПИСОК ДО ИГРОВЫХ МИРОВ.
      </div>
      <CinematicForeground />
    </AbsoluteFill>
  );
};

const SpotlightPortraitScene: React.FC<{ scene: SceneAsset }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cardReveal = interpolate(frame, [5, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 1, 0.3, 1),
  });
  const cardScale = interpolate(frame, [0, 30, 52, 70, 118, 142, 171], [0.84, 0.92, 1.045, 1.06, 1.04, 1, 1.025], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const cardY = interpolate(frame, [0, 38, 70, 142, 171], [72, 24, 0, 0, -8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const spotOpacity = interpolate(frame, [0, 18, 48, 130, 171], [0, 0.65, 0.86, 0.86, 0.72], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#03080D", overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(scene.asset)}
        volume={0}
        style={{
          position: "absolute",
          inset: "-8%",
          width: "116%",
          height: "116%",
          objectFit: "cover",
          objectPosition: "62% 50%",
          transform: "scale(1.12)",
          filter: "blur(36px) brightness(0.2) saturate(0.72)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 62% 38% at 50% 54%, rgba(28,124,140,0.48), rgba(10,49,62,0.22) 56%, transparent 86%), linear-gradient(180deg, rgba(3,8,13,0.16), rgba(3,8,13,0.32) 72%, #03080D 100%)",
          opacity: spotOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 54,
          right: 54,
          top: 250,
          textAlign: "center",
          opacity: cardReveal,
          fontFamily: "Arial, sans-serif",
          fontSize: 49,
          fontWeight: 600,
          lineHeight: 1.2,
          color: "#EAF6F5",
          textShadow: "0 3px 24px rgba(0,0,0,0.82)",
        }}
      >
        <div>Твой выбор.</div>
        <div style={{ color: "#72DEDB", fontSize: 45 }}>По адекватной цене</div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 450,
          left: "50%",
          width: "82%",
          maxWidth: 820,
          transform: `translateX(-50%) translateY(${cardY.toFixed(2)}px) scale(${cardScale.toFixed(4)})`,
          opacity: cardReveal,
          filter: "drop-shadow(0 34px 54px rgba(0,0,0,0.62)) drop-shadow(0 0 40px rgba(57,213,199,0.18))",
        }}
      >
        <Img
          src={staticFile("assets/site-tour/apple-1000.png")}
          style={{ display: "block", width: "100%", height: "auto", borderRadius: 22 }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 250,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: cardReveal * 0.72,
          fontFamily: "Arial, sans-serif",
          fontSize: 18,
          letterSpacing: "0.28em",
          color: "#AFC5C8",
        }}
      >
        UNLIMITSUB
      </div>
    </AbsoluteFill>
  );
};

const SupportPortraitScene: React.FC<{ scene: SceneAsset }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const messages = [
    { start: 18, top: 690, side: "right", label: "Клиент", text: "Подскажите, что выбрать\nдля Apple Gift Card?" },
    { start: 34, top: 820, side: "left", label: "ИИ-АССИСТЕНТ", text: "Помогу. Сначала выберите нужный регион и номинал карты." },
    { start: 58, top: 965, side: "right", label: "Клиент", text: "А если нужна карта для России\nна 1000 RUB?" },
    { start: 77, top: 1100, side: "left", label: "ИИ-АССИСТЕНТ", text: "Тогда подойдёт Apple Gift Card\nРоссия 1000 RUB." },
    { start: 103, top: 1230, side: "right", label: "Клиент", text: "И как быстро приходит?" },
    { start: 119, top: 1340, side: "left", label: "ИИ-АССИСТЕНТ", text: "Обычно после оплаты товар отправляется максимально быстро. Если потребуется уточнение, я сразу подскажу статус." },
  ] as const;

  return (
    <AbsoluteFill style={{ backgroundColor: "#03080D", overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(scene.asset)}
        volume={0}
        style={{
          position: "absolute",
          inset: "-8%",
          width: "116%",
          height: "116%",
          objectFit: "cover",
          objectPosition: "50% 50%",
          transform: "scale(1.12)",
          filter: "blur(38px) brightness(0.22) saturate(0.7)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 75% 58% at 50% 48%, rgba(23,91,99,0.28), transparent 80%), linear-gradient(180deg, rgba(3,8,13,0.12), rgba(3,8,13,0.64))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 242,
          left: 56,
          right: 56,
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          textShadow: "0 3px 20px rgba(0,0,0,0.7)",
        }}
      >
        <div style={{ color: "#EAF6F5", fontSize: 54, fontWeight: 700 }}>Поддержка <span style={{ color: "#72DEDB" }}>24/7</span></div>
        <div style={{ marginTop: 14, color: "#C5D8D9", fontSize: 25 }}>Ответы на вопросы. Когда они нужны.</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 52,
          right: 52,
          top: 510,
          bottom: 250,
          border: "1px solid rgba(114,222,219,0.24)",
          borderRadius: 28,
          background: "linear-gradient(145deg, rgba(13,24,28,0.96), rgba(6,13,17,0.94))",
          boxShadow: "0 30px 100px rgba(0,0,0,0.48), 0 0 44px rgba(57,213,199,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 86,
            display: "flex",
            alignItems: "center",
            padding: "0 28px",
            borderBottom: "1px solid rgba(114,222,219,0.15)",
            color: "#EAF6F5",
            fontFamily: "Arial, sans-serif",
            fontSize: 23,
            fontWeight: 700,
          }}
        >
          <span style={{ display: "inline-block", width: 14, height: 14, marginRight: 14, borderRadius: "50%", background: "#39D5C7", boxShadow: "0 0 14px rgba(57,213,199,0.65)" }} />
          UnlimitSub <span style={{ marginLeft: 14, color: "#72DEDB", fontSize: 17, fontWeight: 500 }}>ИИ-АССИСТЕНТ · НА СВЯЗИ</span>
        </div>
        {messages.map((message, index) => {
          const alpha = interpolate(frame, [message.start, message.start + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          const isClient = message.side === "right";
          return (
            <div
              key={`${message.start}-${message.label}`}
              style={{
                position: "absolute",
                top: message.top - 510,
                left: isClient ? "auto" : 24,
                right: isClient ? 24 : "auto",
                width: isClient ? 580 : 760,
                maxWidth: "calc(100% - 48px)",
                padding: "14px 18px 17px",
                boxSizing: "border-box",
                borderRadius: 18,
                border: `1px solid ${isClient ? "rgba(225,242,242,0.11)" : "rgba(57,213,199,0.2)"}`,
                background: isClient ? "rgba(37,48,52,0.9)" : "rgba(12,30,33,0.92)",
                opacity: alpha,
                transform: `translateY(${((1 - alpha) * 14).toFixed(2)}px)`,
                color: "#EAF6F5",
                fontFamily: "Arial, sans-serif",
              }}
            >
              <div style={{ marginBottom: 7, color: isClient ? "#9EB5BA" : "#72DEDB", fontSize: 15, letterSpacing: "0.08em" }}>{message.label}</div>
              <div style={{ fontSize: 23, lineHeight: 1.34, whiteSpace: "pre-line" }}>{message.text}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
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
  const cameraKeys = PORTRAIT_CAMERA[scene.file];
  const cameraFrames = cameraKeys?.map((key) => key.frame) ?? [0, scene.durationInFrames - 1];
  const cameraPosition = cameraKeys
    ? interpolate(localFrame, cameraFrames, cameraKeys.map((key) => key.position), {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    })
    : 50;
  const cameraScale = cameraKeys
    ? interpolate(localFrame, cameraFrames, cameraKeys.map((key) => key.scale), {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    })
    : 1.12;
  const caption = scene.file === "three_cadr.mp4"
    ? { first: "ШИРОКИЙ ВЫБОР", second: "ЦИФРОВЫХ СЕРВИСОВ", detail: "ПОДПИСКИ · ПОПОЛНЕНИЯ · ПОДАРОЧНЫЕ КАРТЫ", placement: "top" as const }
    : scene.file === "five_cadr.mp4"
      ? { first: "Свобода цифровых", second: "возможностей", detail: "UNLIMITSUB", placement: "bottom" as const }
      : scene.file === "four_cadr.mp4"
        ? { first: "Поддержка 24/7", second: "Ответы на вопросы.", detail: "Когда они нужны.", placement: "top" as const }
        : null;

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
        {index === 0 ? (
          <PortraitBrandIntro />
        ) : index === 3 ? (
          <SpotlightPortraitScene scene={scene} />
        ) : index === 5 ? (
          <SupportPortraitScene scene={scene} />
        ) : index === manifest.scenes.length - 1 ? (
          <div style={{ position: "absolute", inset: 0, transform: "scale(1.1)", transformOrigin: "50% 50%" }}>
            <ParticleLogoIntro
              logoSrc={staticFile("assets/unlimitsub-logo.png")}
              particleCount={2200}
              vortexStrength={1}
              glowIntensity={1}
              gatherDuration={43}
              settleDuration={20}
            />
          </div>
        ) : (
          <>
            <OffthreadVideo
              src={staticFile(scene.asset)}
              volume={0}
              style={{
                position: "absolute",
                inset: "-4%",
                width: "108%",
                height: "108%",
                objectFit: "cover",
                objectPosition: `${cameraPosition}% 50%`,
                transform: `scale(${(cameraScale * 1.08).toFixed(4)})`,
                filter: "blur(28px) brightness(0.32) saturate(0.78)",
                opacity: 0.48,
              }}
            />
            <OffthreadVideo
              src={staticFile(scene.asset)}
              volume={0}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: `${cameraPosition}% 50%`,
                transform: `scale(${cameraScale.toFixed(4)})`,
                filter: scene.file === "five_cadr.mp4"
                  ? "brightness(1.14) saturate(1.04) contrast(1.06)"
                  : "saturate(1.02) contrast(1.04)",
              }}
            />
            {scene.file === "five_cadr.mp4" && (
              <div
                style={{
                  position: "absolute",
                  top: 760,
                  left: 0,
                  right: 0,
                  height: 620,
                  background: "linear-gradient(180deg, transparent 0%, rgba(3,8,13,0.84) 48%, #03080D 78%, #03080D 100%)",
                  pointerEvents: "none",
                }}
              />
            )}
            {caption && (
              <div
                style={{
                  position: "absolute",
                  inset: caption.placement === "bottom" ? "auto 0 280px" : "0 0 auto",
                  height: caption.placement === "bottom" ? 300 : 680,
                  paddingTop: caption.placement === "bottom" ? 48 : 245,
                  boxSizing: "border-box",
                  textAlign: "center",
                  background: caption.placement === "bottom"
                    ? "linear-gradient(180deg, rgba(3,8,13,0.94) 0%, rgba(3,8,13,0.97) 35%, #03080D 100%)"
                    : "linear-gradient(180deg, #03080D 0%, #03080D 94%, rgba(3,8,13,0.84) 98%, rgba(3,8,13,0) 100%)",
                }}
              >
                <div
                  style={{
                    padding: "0 50px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: scene.file === "three_cadr.mp4" ? 39 : 45,
                    lineHeight: 1.18,
                    fontWeight: 700,
                    letterSpacing: "0.015em",
                    color: "#EAF6F5",
                    textShadow: "0 3px 24px rgba(0,0,0,0.72)",
                  }}
                >
                  <div>{caption.first}</div>
                  <div style={{ color: "#72DEDB" }}>{caption.second}</div>
                </div>
                <div
                  style={{
                    marginTop: 14,
                    padding: "0 70px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: scene.file === "three_cadr.mp4" ? 17 : 19,
                    letterSpacing: "0.11em",
                    color: "#B8CBCE",
                  }}
                >
                  {caption.detail}
                </div>
              </div>
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(3,8,13,0.25) 0%, rgba(3,8,13,0.02) 28%, rgba(3,8,13,0.04) 65%, rgba(3,8,13,0.38) 100%), linear-gradient(90deg, rgba(3,8,13,0.12), transparent 24%, transparent 76%, rgba(3,8,13,0.18))",
                pointerEvents: "none",
              }}
            />
          </>
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
