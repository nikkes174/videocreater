import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { VIDEO_CONFIG } from "../config/video";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const UnlimitSubTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const reveal = interpolate(frame, [0, 20], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const fadeOut = interpolate(frame, [durationInFrames - 13, durationInFrames - 1], [1, 0], clamp);
  const cameraScale = interpolate(frame, [0, durationInFrames - 1], [1.035, 1.005], clamp);
  const cameraX = interpolate(frame, [0, durationInFrames - 1], [-10, 10], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const cameraY = interpolate(frame, [0, durationInFrames - 1], [7, -7], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });

  const safeAreaPadding = `${VIDEO_CONFIG.safeArea.top}px ${VIDEO_CONFIG.safeArea.horizontal}px ${VIDEO_CONFIG.safeArea.bottom}px`;

  return (
    <AbsoluteFill style={{ backgroundColor: "#050708", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          opacity: fadeOut,
          transform: `translate3d(${cameraX}px, ${cameraY}px, 0) scale(${cameraScale})`,
          transformOrigin: "50% 50%",
        }}
      >
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 58% 42% at 50% 48%, rgba(19, 48, 48, 0.34) 0%, rgba(9, 18, 19, 0.16) 48%, rgba(5, 7, 8, 0) 76%), linear-gradient(155deg, #090c0e 0%, #050708 47%, #080b0c 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 760,
            height: 440,
            left: "50%",
            top: "46%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(50, 218, 205, 0.12) 0%, rgba(32, 132, 131, 0.06) 38%, rgba(0, 0, 0, 0) 72%)",
            filter: "blur(56px)",
            opacity: 0.62 + reveal * 0.38,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "47%",
            width: 690,
            height: 690,
            borderRadius: "50%",
            border: "1px solid rgba(137, 205, 197, 0.075)",
            transform: `translate(-50%, -50%) scale(${1 + reveal * 0.018})`,
            opacity: reveal * 0.68,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "47%",
            width: 590,
            height: 590,
            borderRadius: "50%",
            border: "1px solid rgba(137, 205, 197, 0.045)",
            transform: `translate(-50%, -50%) scale(${1 + reveal * 0.012})`,
            opacity: reveal * 0.78,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: safeAreaPadding,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              opacity: reveal,
              transform: `translateY(${(1 - reveal) * 16}px) scale(${0.985 + reveal * 0.015})`,
              textAlign: "center",
              color: "#f1f5f4",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 90,
              fontWeight: 500,
              letterSpacing: "0.075em",
              lineHeight: 1,
              whiteSpace: "nowrap",
              textShadow: "0 0 40px rgba(77, 215, 203, 0.14)",
            }}
          >
            UnlimitSub
          </div>

          <div
            style={{
              marginTop: 34,
              width: 74,
              height: 1,
              background: "linear-gradient(90deg, rgba(66, 211, 198, 0), rgba(96, 226, 211, 0.74), rgba(66, 211, 198, 0))",
              opacity: reveal * 0.8,
              transform: `scaleX(${0.6 + reveal * 0.4})`,
            }}
          />
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          backgroundColor: "#020304",
          opacity: interpolate(frame, [durationInFrames - 12, durationInFrames - 1], [0, 1], clamp),
        }}
      />
    </AbsoluteFill>
  );
};
