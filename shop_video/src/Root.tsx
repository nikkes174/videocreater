import { Composition } from "remotion";
import { staticFile } from "remotion";
import { VIDEO_CONFIG } from "./config/video";
import { UnlimitSubTest } from "./scenes/UnlimitSubTest";

const TEST_DURATION_SECONDS = 3.5;

export const RemotionRoot: React.FC = () => {
  return (
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
  );
};
