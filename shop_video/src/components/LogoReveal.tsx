import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CSSProperties } from "react";

export type LogoRevealProps = {
  logoSrc?: string;
  revealStart?: number;
  revealDuration?: number;
  glowIntensity?: number;
  sweepWidth?: number;
  zoomAmount?: number;
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const LogoReveal: React.FC<LogoRevealProps> = ({
  logoSrc = staticFile("assets/unlimitsub-logo.png"),
  revealStart = 12,
  revealDuration = 24,
  glowIntensity = 1,
  sweepWidth = 50,
  zoomAmount = 0.08,
}) => {
  const frame = useCurrentFrame();
  const { width, durationInFrames } = useVideoConfig();
  const logoMaxWidth = 850;
  const logoWidth = logoMaxWidth / (1 + zoomAmount);
  const logoHeight = logoWidth / 3;
  const logoLeft = (width - logoWidth) / 2;
  const softEdge = Math.max(5, sweepWidth * 0.18);

  const sweepX = interpolate(
    frame,
    [revealStart, revealStart + revealDuration],
    [-200, 1100],
    {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const revealBoundary = sweepX - logoLeft;

  let revealMask: string;
  if (revealBoundary <= -softEdge) {
    revealMask = "linear-gradient(90deg, transparent 0%, transparent 100%)";
  } else if (revealBoundary >= logoWidth + softEdge) {
    revealMask = "none";
  } else {
    const hardEdge = Math.max(0, revealBoundary - softEdge);
    const featherEdge = Math.max(0, Math.min(logoWidth, revealBoundary + softEdge));
    revealMask = `linear-gradient(90deg, #000 0px, #000 ${hardEdge}px, transparent ${featherEdge}px, transparent 100%)`;
  }

  const cameraScale = interpolate(
    frame,
    [72, durationInFrames - 1],
    [1, 1 + zoomAmount],
    { ...clamp, easing: Easing.inOut(Easing.cubic) },
  );
  const animatedGlow = interpolate(
    frame,
    [72, durationInFrames - 1],
    [glowIntensity, glowIntensity * 1.12],
    { ...clamp, easing: Easing.inOut(Easing.sin) },
  );
  const introGlow = interpolate(frame, [0, 4, 12, 36], [0.035, 0.075, 0.24, 0.62], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const parallaxX = interpolate(frame, [72, durationInFrames - 1], [-14, 14], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const parallaxY = interpolate(frame, [72, durationInFrames - 1], [8, -8], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 9, durationInFrames - 1],
    [0, 1],
    { ...clamp, easing: Easing.in(Easing.cubic) },
  );

  const sweepOpacity = interpolate(
    frame,
    [revealStart, revealStart + 3, revealStart + revealDuration - 3, revealStart + revealDuration],
    [0, 0.92, 0.82, 0],
    { ...clamp, easing: Easing.inOut(Easing.sin) },
  );
  const sweepStops = [
    `transparent ${Math.max(0, sweepX - sweepWidth * 1.2)}px`,
    `rgba(57, 213, 199, 0.06) ${Math.max(0, sweepX - sweepWidth * 0.76)}px`,
    `rgba(57, 213, 199, 0.28) ${Math.max(0, sweepX - sweepWidth * 0.52)}px`,
    `rgba(234, 246, 245, 0.78) ${Math.max(0, sweepX - sweepWidth * 0.2)}px`,
    `rgba(234, 246, 245, 0.9) ${Math.max(0, sweepX + sweepWidth * 0.2)}px`,
    `rgba(57, 213, 199, 0.35) ${Math.max(0, sweepX + sweepWidth * 0.52)}px`,
    `rgba(57, 213, 199, 0.08) ${Math.max(0, sweepX + sweepWidth * 0.76)}px`,
    `transparent ${Math.max(0, sweepX + sweepWidth * 1.2)}px`,
  ].join(", ");
  const alphaMask = `url("${logoSrc}")`;
  const sweepMaskStyle: CSSProperties = {
    maskImage: alphaMask,
    WebkitMaskImage: alphaMask,
    maskMode: "alpha",
    maskSize: `${logoWidth}px auto`,
    WebkitMaskSize: `${logoWidth}px auto`,
    maskPosition: "50% 50%",
    WebkitMaskPosition: "50% 50%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  };

  const reflectionOneX = interpolate(frame, [36, 68], [-150, logoWidth + 150], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const reflectionTwoX = interpolate(frame, [44, 72], [logoWidth + 160, -130], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const reflectionOneOpacity = interpolate(frame, [36, 42, 54, 66, 72], [0, 0.52, 0.38, 0.42, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const reflectionTwoOpacity = interpolate(frame, [44, 50, 58, 68, 72], [0, 0.32, 0.24, 0.32, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const reflectionBandWidth = sweepWidth * 0.92;
  const reflectionSlant = logoHeight * 0.72;
  const toLogoPercent = (position: number) => `${(position / logoWidth) * 100}%`;
  const reflectionOneClip = `polygon(${toLogoPercent(reflectionOneX - reflectionBandWidth / 2 + reflectionSlant)} 0%, ${toLogoPercent(reflectionOneX + reflectionBandWidth / 2 + reflectionSlant)} 0%, ${toLogoPercent(reflectionOneX + reflectionBandWidth / 2)} 100%, ${toLogoPercent(reflectionOneX - reflectionBandWidth / 2)} 100%)`;
  const reflectionTwoClip = `polygon(${toLogoPercent(reflectionTwoX - reflectionBandWidth / 2 - reflectionSlant * 0.58)} 0%, ${toLogoPercent(reflectionTwoX + reflectionBandWidth / 2 - reflectionSlant * 0.58)} 0%, ${toLogoPercent(reflectionTwoX + reflectionBandWidth / 2)} 100%, ${toLogoPercent(reflectionTwoX - reflectionBandWidth / 2)} 100%)`;

  const logoBaseStyle: CSSProperties = {
    position: "absolute",
    width: logoWidth,
    height: "auto",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    filter: `drop-shadow(0 0 ${30 * animatedGlow}px rgba(41, 220, 216, 0.38)) drop-shadow(0 0 ${78 * animatedGlow}px rgba(15, 158, 170, 0.16))`,
  };

  const sweepGlowStyle: CSSProperties = {
    ...sweepMaskStyle,
    position: "absolute",
    inset: 0,
    background: `linear-gradient(90deg, ${sweepStops})`,
    opacity: sweepOpacity * 0.62,
    filter: "blur(10px)",
    pointerEvents: "none",
  };
  const sweepCoreStyle: CSSProperties = {
    ...sweepGlowStyle,
    opacity: sweepOpacity,
    filter: "none",
  };
  const reflectionStyle: CSSProperties = {
    ...logoBaseStyle,
    clipPath: reflectionOneClip,
    opacity: reflectionOneOpacity,
    filter: "brightness(1.58) saturate(0.82) blur(0.7px) drop-shadow(0 0 7px rgba(97, 224, 219, 0.34))",
  };
  const reflectionTwoStyle: CSSProperties = {
    ...logoBaseStyle,
    clipPath: reflectionTwoClip,
    opacity: reflectionTwoOpacity,
    filter: "brightness(1.42) saturate(0.76) blur(1px) drop-shadow(0 0 5px rgba(97, 224, 219, 0.26))",
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#020304", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${cameraScale})`,
          transformOrigin: "50% 50%",
          background:
            "radial-gradient(ellipse 74% 43% at 50% 49%, rgba(14, 37, 39, 0.24) 0%, rgba(7, 14, 16, 0.11) 47%, rgba(2, 3, 4, 0) 78%), linear-gradient(155deg, #080b0d 0%, #030506 48%, #07090a 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${interpolate(frame, [0, 12, 36], [35, 43, 50], { ...clamp, easing: Easing.inOut(Easing.sin) })}%`,
            top: "50%",
            width: 790,
            height: 420,
            transform: `translate(calc(-50% + ${parallaxX}px), calc(-50% + ${parallaxY}px))`,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(50, 222, 215, 0.16) 0%, rgba(28, 143, 147, 0.07) 43%, rgba(0, 0, 0, 0) 74%)",
            filter: "blur(48px)",
            opacity: introGlow,
          }}
        />

        <Img
          src={logoSrc}
          style={{
            ...logoBaseStyle,
            maskImage: revealMask,
            WebkitMaskImage: revealMask,
          }}
        />
        {frame >= revealStart && frame <= revealStart + revealDuration ? (
          <>
            <div style={sweepGlowStyle} />
            <div style={sweepCoreStyle} />
          </>
        ) : null}
        {frame >= 36 && frame <= 72 ? (
          <>
            <Img src={logoSrc} style={reflectionStyle} />
            <Img src={logoSrc} style={reflectionTwoStyle} />
          </>
        ) : null}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: fadeOut,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
