import { Composition } from "remotion";
import { staticFile } from "remotion";
import { VIDEO_CONFIG } from "./config/video";
import { BackgroundComparison } from "./scenes/BackgroundComparison";
import { BackgroundOnly } from "./scenes/BackgroundOnly";
import { BackgroundLayerPreview, type BackgroundLayerName } from "./scenes/BackgroundLayerPreview";
import { ParticleLogoIntro } from "./scenes/ParticleLogoIntro";
import { UnlimitSubTest } from "./scenes/UnlimitSubTest";
import { FlyingServicesScene } from "./scenes/FlyingServicesScene";

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
        id="FlyingServicesScene"
        component={FlyingServicesScene}
        durationInFrames={150}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
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
