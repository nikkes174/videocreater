import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
} from "remotion";
import siteTourManifest from "../config/siteTourAssets.json";
import {
  clamp01,
  createCameraStops,
  getFocusAtFrame,
  getSegmentMotion,
  type CameraStop,
} from "../config/siteTourTimeline.mjs";
import { bezier, Grain, SpeedBlur, Vignette } from "../vendor/videoShotcraft/demos/_fixtures/Polish";

const WIDTH = 1920;
const HEIGHT = 1080;
const CROSSFADE_FRAMES = 7;
const EASE_LAND = bezier(0.5, 0.05, 0.6, 1);

type ScreenDefinition = {
  fileName: string;
  src: string;
  width: number;
  height: number;
  camera: CameraStop;
};

const cameraStops = createCameraStops(siteTourManifest.assets, WIDTH, HEIGHT);
const SCREENS: ScreenDefinition[] = siteTourManifest.assets.map((asset, index) => ({
  fileName: asset.fileName,
  src: staticFile(asset.src),
  width: asset.width,
  height: asset.height,
  camera: cameraStops[index],
}));

export const UNLIMITSUB_SITE_TOUR_FPS = siteTourManifest.fps;
export const UNLIMITSUB_SITE_TOUR_DURATION = siteTourManifest.durationInFrames;

// A subtle lift and soft landing echo GrazeFaceTour's independently raised
// interface elements while keeping each supplied screenshot intact.
const liftOf = (progress: number) => {
  const settle = clamp01((progress - 0.08) / 0.4);
  return (1 - EASE_LAND(settle)) * 24;
};

const SiteScreen: React.FC<{
  definition: ScreenDefinition;
  progress: number;
}> = ({ definition, progress }) => {
  const lift = liftOf(progress);
  return (
    <div
      style={{
        width: definition.width,
        height: definition.height,
        position: "relative",
        boxSizing: "border-box",
        border: "1px solid rgba(57,213,199,0.18)",
        boxShadow: "0 46px 96px rgba(0,0,0,0.48), 0 0 54px rgba(57,213,199,0.055)",
        background: "#000",
        transformStyle: "preserve-3d",
      }}
    >
      {/* The blurred copy stays on the interface plane as a soft contact shadow. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate3d(${lift * 0.18}px, ${lift * 0.4}px, 0) scale(${1 + lift * 0.0005})`,
          transformOrigin: "top left",
          filter: `brightness(0) blur(${3 + lift * 0.22}px)`,
          opacity: Math.min(0.17, 0.045 + lift * 0.005),
          pointerEvents: "none",
        }}
      >
        <Img src={definition.src} style={{ display: "block", width: "100%", height: "100%" }} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          transform: `translate3d(${-lift * 0.11}px, ${-lift * 0.56}px, ${lift}px)`,
          boxShadow: `0 ${Math.max(4, lift * 0.22)}px ${16 + lift * 0.55}px rgba(0,0,0,${0.16 + lift * 0.004})`,
        }}
      >
        <Img
          src={definition.src}
          style={{ display: "block", width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
};

const Plane: React.FC<{
  definition: ScreenDefinition;
  progress: number;
  position: number;
}> = ({ definition, progress, position }) => {
  const cam = definition.camera;
  const x = cam.x[0] + (cam.x[1] - cam.x[0]) * position;
  const y = cam.y[0] + (cam.y[1] - cam.y[0]) * position;
  const roll = cam.rz + (position - 0.5) * 2;
  return (
    <AbsoluteFill style={{ perspective: 1050, perspectiveOrigin: "50% 46%" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 0,
          height: 0,
          transformStyle: "preserve-3d",
          transform: `scale(${cam.scale}) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg) rotateZ(${roll}deg)`,
        }}
      >
        <div style={{ position: "absolute", transform: `translate3d(${x}px, ${y}px, 0)` }}>
          <div style={{ position: "relative", transform: "translate(-50%, -50%)" }}>
            <SiteScreen definition={definition} progress={progress} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(ellipse 68% 72% at 51% 47%, rgba(17,46,48,0.28), transparent 76%), linear-gradient(155deg, #11181B 0%, #071014 48%, #03080D 100%)",
      }}
    >
      {SCREENS.map((definition, index) => {
        const motion = getSegmentMotion(
          frame,
          index,
          cameraStops,
          UNLIMITSUB_SITE_TOUR_DURATION,
          CROSSFADE_FRAMES,
        );
        if (!motion || motion.opacity <= 0) return null;

        return (
          <AbsoluteFill key={definition.fileName} style={{ opacity: motion.opacity }}>
            <SpeedBlur vx={motion.vx} vy={motion.vy} amount={0.34} max={8}>
              <Plane
                definition={definition}
                progress={motion.progress}
                position={motion.position}
              />
            </SpeedBlur>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

export const UnlimitSubSiteTour: React.FC = () => {
  const frame = useCurrentFrame();
  const [focusX, focusY] = getFocusAtFrame(
    frame,
    cameraStops,
    UNLIMITSUB_SITE_TOUR_DURATION,
  );

  return (
    <AbsoluteFill style={{ background: "#03080D" }}>
      <Stage />
      {/* GrazeFaceTour's screen-space depth-of-field pass. */}
      <AbsoluteFill
        style={{
          filter: "blur(8px)",
          WebkitMaskImage: `radial-gradient(ellipse 72% 66% at ${focusX}% ${focusY}%, transparent 45%, rgba(0,0,0,0.68) 80%, black 96%)`,
          maskImage: `radial-gradient(ellipse 72% 66% at ${focusX}% ${focusY}%, transparent 45%, rgba(0,0,0,0.68) 80%, black 96%)`,
        }}
      >
        <Stage />
      </AbsoluteFill>
      <Vignette strength={0.2} inner={0.57} color="#03080D" cx={focusX / 100} cy={focusY / 100} />
      <Grain opacity={0.025} blend="soft-light" />
    </AbsoluteFill>
  );
};
