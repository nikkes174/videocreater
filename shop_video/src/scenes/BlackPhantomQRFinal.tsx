import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ManropeFontFaces } from "../components/blackphantom/scenes/ManropeFontFaces";

export const BLACKPHANTOM_QR_DURATION = 120;

export type QRLayout = "fullhd" | "screen3x2" | "stories";

type BlackPhantomQRFinalProps = {
  layout?: QRLayout;
  fadeIn?: boolean;
};

const QR_LAYOUTS = {
  fullhd: {
    logoSize: 72,
    brandFontSize: 52,
    promptFontSize: 36,
    qrCardSize: 350,
    qrPadding: 28,
    captionFontSize: 25,
  },
  screen3x2: {
    logoSize: 88,
    brandFontSize: 58,
    promptFontSize: 42,
    qrCardSize: 500,
    qrPadding: 36,
    captionFontSize: 30,
  },
  stories: {
    logoSize: 78,
    brandFontSize: 48,
    promptFontSize: 40,
    qrCardSize: 560,
    qrPadding: 32,
    captionFontSize: 30,
  },
} as const;

export const BlackPhantomQRFinal: React.FC<BlackPhantomQRFinalProps> = ({
  layout = "fullhd",
  fadeIn = true,
}) => {
  const frame = useCurrentFrame();
  const sizes = QR_LAYOUTS[layout];
  const opacity = fadeIn
    ? interpolate(frame, [0, 12], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 50% 42%, #151B22 0%, #07090C 75%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Manrope, sans-serif",
        color: "#F1F2F4",
      }}
    >
      <ManropeFontFaces />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <Img
            src={staticFile("assets/blackphantom/logo.png")}
            style={{
              width: sizes.logoSize,
              height: sizes.logoSize,
              objectFit: "contain",
              display: "block",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              fontSize: sizes.brandFontSize,
              fontWeight: 800,
              letterSpacing: 2,
              whiteSpace: "nowrap",
            }}
          >
            BLACKPHANTOM
          </div>
        </div>

        <div
          style={{
            marginTop: 34,
            fontSize: sizes.promptFontSize,
            lineHeight: 1.2,
            fontWeight: 600,
            color: "#E8D6AD",
            textAlign: "center",
          }}
        >
          Обсудим ваш проект?
        </div>

        <div
          style={{
            marginTop: 40,
            width: sizes.qrCardSize,
            height: sizes.qrCardSize,
            padding: sizes.qrPadding,
            boxSizing: "border-box",
            borderRadius: 16,
            background: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Img
            src={staticFile("assets/blackphantom/qr-code.png")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              imageRendering: "auto",
              display: "block",
            }}
          />
        </div>

        <div
          style={{
            marginTop: 30,
            fontSize: sizes.captionFontSize,
            lineHeight: 1.25,
            fontWeight: 500,
            color: "#B6BEC8",
            textAlign: "center",
          }}
        >
          Наведите камеру телефона
        </div>
      </div>
    </AbsoluteFill>
  );
};
