import { Composition } from "remotion";
import { VIDEO_CONFIG } from "./config/video";
import { UnlimitSubTest } from "./scenes/UnlimitSubTest";

const TEST_DURATION_SECONDS = 3;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="UnlimitSubTest"
      component={UnlimitSubTest}
      durationInFrames={TEST_DURATION_SECONDS * VIDEO_CONFIG.fps}
      fps={VIDEO_CONFIG.fps}
      width={VIDEO_CONFIG.width}
      height={VIDEO_CONFIG.height}
    />
  );
};
