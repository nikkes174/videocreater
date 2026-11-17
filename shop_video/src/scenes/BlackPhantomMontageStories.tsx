import React from "react";
import {
  AbsoluteFill,
  Easing,
  Freeze,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { BLACKPHANTOM_INTRO } from "../config/blackphantom";
import { BLACKPHANTOM_SERVICES } from "../config/blackphantomServices";
import {
  BLACKPHANTOM_STORIES,
  STORIES_ORDER,
  STORIES_QR_CROSSFADE_FRAMES,
  STORIES_QR_STILL_FRAMES,
  STORIES_TRANSITION_FRAMES,
} from "../config/blackphantomStories";
import { CAROUSEL_3D_DURATION } from "../components/blackphantom/Carousel3D";
import { PAPARAZZI_CAMERA_DURATION } from "../components/blackphantom/PaparazziCamera";
import { BLACKPHANTOM_FINAL_DURATION } from "../components/blackphantom/FinalSmokeOutro";
import { MobileCarousel3D } from "../components/blackphantom/mobile/MobileCarousel3D";
import { MobileDataLandscape } from "../components/blackphantom/mobile/MobileDataLandscape";
import { MobilePaparazziCamera } from "../components/blackphantom/mobile/MobilePaparazziCamera";
import { MobileQRFinal } from "../components/blackphantom/mobile/MobileQRFinal";
import { MobileSmokeOutro } from "../components/blackphantom/mobile/MobileSmokeOutro";
import { MobileStage } from "../components/blackphantom/mobile/MobileStage";
import { WebDevelopmentScene } from "../components/blackphantom/scenes/WebDevelopmentScene";
import { AutomationScene } from "../components/blackphantom/scenes/AutomationScene";
import { EcommerceScene } from "../components/blackphantom/scenes/EcommerceScene";
import { SoftwareScene } from "../components/blackphantom/scenes/SoftwareScene";
import { DATA_LANDSCAPE } from "../config/blackphantomDataLandscape";
import { BLACKPHANTOM_QR_DURATION } from "./BlackPhantomQRFinal";
import { BlackPhantomIntro } from "./BlackPhantomIntro";

type StoriesSceneId = (typeof STORIES_ORDER)[number];

type StoriesSegment = {
  id: StoriesSceneId;
  sourceDuration: number;
  duration: number;
};

const SOURCE_DURATIONS: Record<StoriesSceneId, number> = {
  BlackPhantomIntro: BLACKPHANTOM_INTRO.durationInFrames,
  BlackPhantomWebDevelopment: PAPARAZZI_CAMERA_DURATION,
  BlackPhantomAutomation: PAPARAZZI_CAMERA_DURATION,
  BlackPhantomEcommerce: PAPARAZZI_CAMERA_DURATION,
  BlackPhantomSoftware: PAPARAZZI_CAMERA_DURATION,
  BlackPhantomCarousel3D: CAROUSEL_3D_DURATION,
  BlackPhantomDataLandscape: DATA_LANDSCAPE.durationInFrames,
  BlackPhantomFinalOutro: BLACKPHANTOM_FINAL_DURATION,
  BlackPhantomQRFinal: Math.max(BLACKPHANTOM_QR_DURATION, STORIES_QR_STILL_FRAMES),
};

const HOLD_DURATIONS: Record<StoriesSceneId, number> = {
  BlackPhantomIntro: 0,
  BlackPhantomWebDevelopment: 15,
  BlackPhantomAutomation: 15,
  BlackPhantomEcommerce: 15,
  BlackPhantomSoftware: 15,
  BlackPhantomCarousel3D: 0,
  BlackPhantomDataLandscape: 15,
  BlackPhantomFinalOutro: 15,
  BlackPhantomQRFinal: STORIES_QR_CROSSFADE_FRAMES,
};

const SEGMENTS: StoriesSegment[] = STORIES_ORDER.map((id) => ({
  id,
  sourceDuration: SOURCE_DURATIONS[id],
  duration: SOURCE_DURATIONS[id] + HOLD_DURATIONS[id],
}));

const transitionAfter = (index: number) =>
  index === STORIES_ORDER.length - 2
    ? STORIES_QR_CROSSFADE_FRAMES
    : STORIES_TRANSITION_FRAMES;

export const STORIES_DURATION =
  SEGMENTS.reduce((sum, segment) => sum + segment.duration, 0) -
  STORIES_ORDER.slice(0, -1).reduce((sum, _id, index) => sum + transitionAfter(index), 0);

const HoldCompletedScene: React.FC<{
  sourceDuration: number;
  children: React.ReactNode;
}> = ({ sourceDuration, children }) => {
  const frame = useCurrentFrame();
  if (frame < sourceDuration) return <>{children}</>;
  return <Freeze frame={sourceDuration - 1}>{children}</Freeze>;
};

const TransitionOpacity: React.FC<{
  fadeInFrames: number;
  fadeOutFrames: number;
  duration: number;
  children: React.ReactNode;
}> = ({ fadeInFrames, fadeOutFrames, duration, children }) => {
  const frame = useCurrentFrame();
  const ease = Easing.inOut(Easing.quad);
  const fadeIn = fadeInFrames > 0 && frame < fadeInFrames
    ? ease((frame + 1) / fadeInFrames)
    : 1;
  const fadeOutStart = duration - fadeOutFrames;
  const fadeOut = fadeOutFrames > 0 && frame >= fadeOutStart
    ? 1 - ease((frame - fadeOutStart + 1) / fadeOutFrames)
    : 1;
  return <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>{children}</AbsoluteFill>;
};

const renderScene = (id: StoriesSceneId) => {
  switch (id) {
    case "BlackPhantomIntro":
      return <BlackPhantomIntro />;
    case "BlackPhantomWebDevelopment":
      return <MobilePaparazziCamera service={BLACKPHANTOM_SERVICES[0]} Scene={WebDevelopmentScene} />;
    case "BlackPhantomAutomation":
      return <MobilePaparazziCamera service={BLACKPHANTOM_SERVICES[1]} Scene={AutomationScene} />;
    case "BlackPhantomEcommerce":
      return <MobilePaparazziCamera service={BLACKPHANTOM_SERVICES[2]} Scene={EcommerceScene} />;
    case "BlackPhantomSoftware":
      return <MobilePaparazziCamera service={BLACKPHANTOM_SERVICES[3]} Scene={SoftwareScene} />;
    case "BlackPhantomCarousel3D":
      return <MobileCarousel3D />;
    case "BlackPhantomDataLandscape":
      return <MobileDataLandscape />;
    case "BlackPhantomFinalOutro":
      return <MobileSmokeOutro />;
    case "BlackPhantomQRFinal":
      return <MobileQRFinal />;
  }
};

export const BlackPhantomMontageStories: React.FC = () => {
  let cursor = 0;
  const sequences = SEGMENTS.map((segment, index) => {
    const start = cursor;
    const fadeInFrames = index === 0 ? 0 : transitionAfter(index - 1);
    const fadeOutFrames = index === SEGMENTS.length - 1 ? 0 : transitionAfter(index);
    cursor += segment.duration - fadeOutFrames;

    return (
      <Sequence key={segment.id} from={start} durationInFrames={segment.duration}>
        <TransitionOpacity
          fadeInFrames={fadeInFrames}
          fadeOutFrames={fadeOutFrames}
          duration={segment.duration}
        >
          <MobileStage>
            <HoldCompletedScene sourceDuration={segment.sourceDuration}>
              {renderScene(segment.id)}
            </HoldCompletedScene>
          </MobileStage>
        </TransitionOpacity>
      </Sequence>
    );
  });

  return (
    <AbsoluteFill style={{ background: BLACKPHANTOM_STORIES.background, overflow: "hidden" }}>
      {sequences}
    </AbsoluteFill>
  );
};
