import { Composition } from "remotion";
import { staticFile } from "remotion";
import { VIDEO_CONFIG } from "./config/video";
import { BackgroundComparison } from "./scenes/BackgroundComparison";
import { BackgroundOnly } from "./scenes/BackgroundOnly";
import { BackgroundLayerPreview, type BackgroundLayerName } from "./scenes/BackgroundLayerPreview";
import { ParticleLogoIntro } from "./scenes/ParticleLogoIntro";
import { FlyingWordsOriginal } from "./scenes/FlyingWordsOriginal";
import { FlyingServicesScene, FlyingWordsVertical } from "./scenes/FlyingWordsVertical";
import { UnlimitSubTest } from "./scenes/UnlimitSubTest";
import { UnlimitSubLuxuryIntro } from "./scenes/UnlimitSubLuxuryIntro";
import { UNLIMITSUB_BASIC3D_DURATION, UnlimitSubBasic3D } from "./scenes/UnlimitSubBasic3D";
import { UNLIMITSUB_SITE_TOUR_DURATION, UNLIMITSUB_SITE_TOUR_FPS, UnlimitSubSiteTour } from "./scenes/UnlimitSubSiteTour";
import { UNLIMITSUB_SPOTLIGHT_PRODUCT_DURATION, UNLIMITSUB_SPOTLIGHT_PRODUCT_FPS, UnlimitSubSpotlightProduct } from "./scenes/UnlimitSubSpotlightProduct";
import { UNLIMITSUB_CARD_STACK_DURATION, UnlimitSubCardStack } from "./scenes/UnlimitSubCardStack";
import { UNLIMITSUB_SUPPORT_TYPEWRITER_DURATION, UnlimitSubSupportTypewriter } from "./scenes/UnlimitSubSupportTypewriter";
import { UNLIMITSUB_PAGE_TURN_DURATION, UnlimitSubPageTurnIntro } from "./scenes/UnlimitSubPageTurnIntro";
import { BASIC_3D_SCENE_DURATION, Basic3DScene } from "./vendor/videoShotcraft/demos/camera/basic-3d-scene/Basic3DScene";
import { BARN_DOOR_SPLIT_DURATION, BarnDoorSplit } from "./vendor/videoShotcraft/demos/transition/page-turn-transitions/BarnDoorSplit";

const TEST_DURATION_SECONDS = 3.5;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="UnlimitSubTest"
        component={UnlimitSubTest}
        durationInFrames={Math.round(TEST_DURATION_SECONDS * VIDEO_CONFIG.fps)}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        defaultProps={{
          logoSrc: staticFile("assets/unlimitsub-logo.png"),
          revealStart: 12,
          revealDuration: 24,
          glowIntensity: 1,
          sweepWidth: 50,
          zoomAmount: 0.08,
        }}
      />
      <Composition
        id="ParticleLogoIntro"
        component={ParticleLogoIntro}
        durationInFrames={Math.round(TEST_DURATION_SECONDS * VIDEO_CONFIG.fps)}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        defaultProps={{
          logoSrc: staticFile("assets/unlimitsub-logo.png"),
          particleCount: 2200,
          vortexStrength: 1,
          glowIntensity: 1,
          gatherDuration: 43,
          settleDuration: 20,
        }}
      />
      <Composition
        id="UnlimitSubLuxuryIntro"
        component={UnlimitSubLuxuryIntro}
        durationInFrames={105}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
      />
      <Composition
        id="BarnDoorSplitOriginal"
        component={BarnDoorSplit}
        durationInFrames={BARN_DOOR_SPLIT_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="UnlimitSubPageTurnIntro"
        component={UnlimitSubPageTurnIntro}
        durationInFrames={UNLIMITSUB_PAGE_TURN_DURATION}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ logoSrc: staticFile("assets/unlimitsub-logo.png") }}
      />
      <Composition
        id="ShotcraftBasic3DOriginal"
        component={Basic3DScene}
        durationInFrames={BASIC_3D_SCENE_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="UnlimitSubBasic3D"
        component={UnlimitSubBasic3D}
        durationInFrames={UNLIMITSUB_BASIC3D_DURATION}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ logoSrc: staticFile("assets/unlimitsub-logo.png") }}
      />
      <Composition
        id="UnlimitSubSiteTour"
        component={UnlimitSubSiteTour}
        durationInFrames={UNLIMITSUB_SITE_TOUR_DURATION}
        fps={UNLIMITSUB_SITE_TOUR_FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="UnlimitSubSpotlightProduct"
        component={UnlimitSubSpotlightProduct}
        durationInFrames={UNLIMITSUB_SPOTLIGHT_PRODUCT_DURATION}
        fps={UNLIMITSUB_SPOTLIGHT_PRODUCT_FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="UnlimitSubCardStack"
        component={UnlimitSubCardStack}
        durationInFrames={UNLIMITSUB_CARD_STACK_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="UnlimitSubSupportTypewriter"
        component={UnlimitSubSupportTypewriter}
        durationInFrames={UNLIMITSUB_SUPPORT_TYPEWRITER_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FlyingWordsOriginal"
        component={FlyingWordsOriginal}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FlyingWordsVertical"
        component={FlyingWordsVertical}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="FlyingServicesScene"
        component={FlyingServicesScene}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CinematicBackgroundOnly"
        component={BackgroundOnly}
        durationInFrames={Math.round(TEST_DURATION_SECONDS * VIDEO_CONFIG.fps)}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
      />
      <Composition
        id="BackgroundComparison"
        component={BackgroundComparison}
        durationInFrames={Math.round(TEST_DURATION_SECONDS * VIDEO_CONFIG.fps)}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
      />
      {([
        ["BackgroundFarPreview", "far"],
        ["BackgroundLightsPreview", "lights"],
        ["BackgroundHazePreview", "haze"],
        ["BackgroundParticlesPreview", "particles"],
        ["BackgroundBokehPreview", "bokeh"],
        ["BackgroundFloorPreview", "floor"],
      ] as const).map(([id, layer]) => (
        <Composition
          key={id}
          id={id}
          component={BackgroundLayerPreview}
          durationInFrames={Math.round(TEST_DURATION_SECONDS * VIDEO_CONFIG.fps)}
          fps={VIDEO_CONFIG.fps}
          width={VIDEO_CONFIG.width}
          height={VIDEO_CONFIG.height}
          defaultProps={{ layer: layer as BackgroundLayerName }}
        />
      ))}
    </>
  );
};
