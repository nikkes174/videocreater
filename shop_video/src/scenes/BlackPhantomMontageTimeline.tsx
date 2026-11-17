import React from "react";
import {
  AbsoluteFill,
  Easing,
  Freeze,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { BLACKPHANTOM_INTRO } from "../config/blackphantom";
import { DATA_LANDSCAPE } from "../config/blackphantomDataLandscape";
import {
  BLACKPHANTOM_MONTAGE,
  FINAL_OUTRO_HOLD_FRAMES,
  LANDSCAPE_HOLD_FRAMES,
  MONTAGE_ORDER,
  SERVICE_READABLE_HOLD_FRAMES,
} from "../config/blackphantomMontage";
import { CAROUSEL_3D_DURATION } from "../components/blackphantom/Carousel3D";
import { PAPARAZZI_CAMERA_DURATION } from "../components/blackphantom/PaparazziCamera";
import { BLACKPHANTOM_FINAL_DURATION } from "../components/blackphantom/FinalSmokeOutro";
import { BlackPhantomSceneAdapter } from "../components/blackphantom/montage/BlackPhantomSceneAdapter";
import { BlackPhantomStage3x2 } from "../components/blackphantom/montage/BlackPhantomStage3x2";
import { BlackPhantomIntro } from "./BlackPhantomIntro";
import { BlackPhantomWebDevelopment } from "./BlackPhantomWebDevelopment";
import { BlackPhantomAutomation } from "./BlackPhantomAutomation";
import { BlackPhantomEcommerce } from "./BlackPhantomEcommerce";
import { BlackPhantomSoftware } from "./BlackPhantomSoftware";
import { BlackPhantomCarousel3D } from "./BlackPhantomCarousel3D";
import { BlackPhantomDataLandscape } from "./BlackPhantomDataLandscape";
import { BlackPhantomFinalOutro } from "./BlackPhantomFinalOutro";
import { BLACKPHANTOM_QR_DURATION, BlackPhantomQRFinal } from "./BlackPhantomQRFinal";
import { PAPARAZZI_FLASH_DURATION } from "../vendor/videoShotcraft/demos/rhythm/beat-cut-moves/PaparazziFlash";

type MontageSceneId = (typeof MONTAGE_ORDER)[number];
export type BlackPhantomMontageFormat = "3x2" | "full-hd";
const QR_CROSSFADE_FRAMES = 12;

const SOURCE_DURATIONS: Record<MontageSceneId, number> = {
  BlackPhantomIntro: BLACKPHANTOM_INTRO.durationInFrames,
  BlackPhantomWebDevelopment: PAPARAZZI_FLASH_DURATION,
  BlackPhantomAutomation: PAPARAZZI_CAMERA_DURATION,
  BlackPhantomEcommerce: PAPARAZZI_CAMERA_DURATION,
  BlackPhantomSoftware: PAPARAZZI_CAMERA_DURATION,
  BlackPhantomCarousel3D: CAROUSEL_3D_DURATION,
  BlackPhantomDataLandscape: DATA_LANDSCAPE.durationInFrames,
  BlackPhantomFinalOutro: BLACKPHANTOM_FINAL_DURATION,
  BlackPhantomQRFinal: BLACKPHANTOM_QR_DURATION,
};

const HOLD_DURATIONS: Record<MontageSceneId, number> = {
  BlackPhantomIntro: 0,
  BlackPhantomWebDevelopment: SERVICE_READABLE_HOLD_FRAMES,
  BlackPhantomAutomation: SERVICE_READABLE_HOLD_FRAMES,
  BlackPhantomEcommerce: SERVICE_READABLE_HOLD_FRAMES,
  BlackPhantomSoftware: SERVICE_READABLE_HOLD_FRAMES,
  BlackPhantomCarousel3D: 0,
  BlackPhantomDataLandscape: LANDSCAPE_HOLD_FRAMES,
  BlackPhantomFinalOutro: FINAL_OUTRO_HOLD_FRAMES,
  BlackPhantomQRFinal: 0,
};

const MONTAGE_SEGMENTS = MONTAGE_ORDER.map((id) => ({
  id,
  sourceDuration: SOURCE_DURATIONS[id],
  duration: SOURCE_DURATIONS[id] + HOLD_DURATIONS[id],
}));

export const MONTAGE_DURATION =
  MONTAGE_SEGMENTS.reduce((sum, segment) => sum + segment.duration, 0) -
  QR_CROSSFADE_FRAMES;

const HoldCompletedScene: React.FC<{
  sourceDuration: number;
  children: React.ReactNode;
}> = ({ sourceDuration, children }) => {
  const frame = useCurrentFrame();
  if (frame < sourceDuration) return <>{children}</>;
  return <Freeze frame={sourceDuration - 1}>{children}</Freeze>;
};

const MontageTransitionOpacity: React.FC<{
  id: MontageSceneId;
  duration: number;
  children: React.ReactNode;
}> = ({ id, duration, children }) => {
  const frame = useCurrentFrame();
  if (id !== "BlackPhantomFinalOutro" && id !== "BlackPhantomQRFinal") {
    return <>{children}</>;
  }

  const isSmokeOutro = id === "BlackPhantomFinalOutro";
  const opacity = isSmokeOutro
    ? 1 - interpolate(
        frame,
        [duration - QR_CROSSFADE_FRAMES, duration - 1],
        [0, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.quad),
        },
      )
    : interpolate(frame, [0, QR_CROSSFADE_FRAMES - 1], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.quad),
      });

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const renderScene = (id: MontageSceneId, format: BlackPhantomMontageFormat) => {
  const threeByTwo = format === "3x2";

  switch (id) {
    case "BlackPhantomIntro":
      return <BlackPhantomIntro threeByTwo={threeByTwo} />;
    case "BlackPhantomWebDevelopment":
      return threeByTwo ? (
        <BlackPhantomSceneAdapter>
          <BlackPhantomWebDevelopment />
        </BlackPhantomSceneAdapter>
      ) : (
        <BlackPhantomWebDevelopment />
      );
    case "BlackPhantomAutomation":
      return <BlackPhantomAutomation threeByTwo={threeByTwo} />;
    case "BlackPhantomEcommerce":
      return <BlackPhantomEcommerce threeByTwo={threeByTwo} />;
    case "BlackPhantomSoftware":
      return <BlackPhantomSoftware threeByTwo={threeByTwo} />;
    case "BlackPhantomCarousel3D":
      return <BlackPhantomCarousel3D threeByTwo={threeByTwo} />;
    case "BlackPhantomDataLandscape":
      return <BlackPhantomDataLandscape threeByTwo={threeByTwo} />;
    case "BlackPhantomFinalOutro":
      return <BlackPhantomFinalOutro threeByTwo={threeByTwo} />;
    case "BlackPhantomQRFinal":
      return (
        <BlackPhantomQRFinal
          layout={threeByTwo ? "screen3x2" : "fullhd"}
          fadeIn={false}
        />
      );
  }
};

export const BlackPhantomMontageTimeline: React.FC<{
  format: BlackPhantomMontageFormat;
}> = ({ format }) => {
  let from = 0;
  const sequences = MONTAGE_SEGMENTS.map((segment) => {
    const start = from;
    from += segment.duration;
    if (segment.id === "BlackPhantomFinalOutro") {
      from -= QR_CROSSFADE_FRAMES;
    }

    const scene = (
      <MontageTransitionOpacity id={segment.id} duration={segment.duration}>
        <HoldCompletedScene sourceDuration={segment.sourceDuration}>
          {renderScene(segment.id, format)}
        </HoldCompletedScene>
      </MontageTransitionOpacity>
    );

    return (
      <Sequence key={segment.id} from={start} durationInFrames={segment.duration}>
        {format === "3x2" ? (
          <BlackPhantomStage3x2>{scene}</BlackPhantomStage3x2>
        ) : (
          scene
        )}
      </Sequence>
    );
  });

  return (
    <AbsoluteFill style={{ background: BLACKPHANTOM_MONTAGE.background, overflow: "hidden" }}>
      {sequences}
    </AbsoluteFill>
  );
};
