// PageCam2D — original Video Shotcraft 2.5D camera for real screenshot planes.
// Source: demos/_fixtures/PageCam2D.tsx (Apache-2.0; see THIRD_PARTY_NOTICES.md).
// The optional exported resolver is shared by the spotlight's spatial annotation
// so both layers use the exact same interpolated camera state.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

export type CamKey2D = {
  frame: number;
  cx: number;
  cy: number;
  zoom: number;
  rotX?: number;
  rotY?: number;
  rotZ?: number;
  persp?: number;
};

export type CamState2D = Required<Omit<CamKey2D, "frame">>;

export const resolveCamAt2D = (
  frame: number,
  keys: CamKey2D[],
  ease: (progress: number) => number = Easing.bezier(0.33, 0, 0.15, 1),
): CamState2D => {
  let a = keys[0];
  let b = keys[keys.length - 1];
  for (let index = 0; index < keys.length - 1; index++) {
    if (frame >= keys[index].frame && frame <= keys[index + 1].frame) {
      a = keys[index];
      b = keys[index + 1];
      break;
    }
  }
  const progress =
    a.frame === b.frame
      ? 1
      : interpolate(frame, [a.frame, b.frame], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        });
  const mix = (from: number | undefined, to: number | undefined, fallback: number) => {
    const start = from ?? fallback;
    const end = to ?? fallback;
    return start + (end - start) * progress;
  };
  return {
    cx: mix(a.cx, b.cx, 0),
    cy: mix(a.cy, b.cy, 0),
    zoom: mix(a.zoom, b.zoom, 1),
    rotX: mix(a.rotX, b.rotX, 0),
    rotY: mix(a.rotY, b.rotY, 0),
    rotZ: mix(a.rotZ, b.rotZ, 0),
    persp: mix(a.persp, b.persp, 1400),
  };
};

export const PageCam2D: React.FC<{
  src: string;
  pageH: number;
  keys: CamKey2D[];
  children?: React.ReactNode;
  bg?: string;
  blur?: number;
  ease?: (progress: number) => number;
}> = ({
  src,
  pageH,
  keys,
  children,
  bg = "#faf7f2",
  blur = 0,
  ease = Easing.bezier(0.33, 0, 0.15, 1),
}) => {
  const frame = useCurrentFrame();
  const cam = resolveCamAt2D(frame, keys, ease);
  const has3D = keys.some(
    (key) => key.rotX !== undefined || key.rotY !== undefined || key.rotZ !== undefined || key.persp !== undefined,
  );

  if (!has3D) {
    return (
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: bg }}>
        <div
          style={{
            position: "absolute",
            width: 1920,
            height: pageH,
            transform: `translate(${960 - cam.cx * cam.zoom}px, ${540 - cam.cy * cam.zoom}px) scale(${cam.zoom})`,
            transformOrigin: "0 0",
            filter: blur > 0 ? `blur(${blur}px)` : undefined,
          }}
        >
          <Img src={staticFile(src)} style={{ position: "absolute", width: 1920, height: pageH }} />
          {children}
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: bg }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: `${cam.persp * cam.zoom}px`,
          perspectiveOrigin: "960px 540px",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 1920,
            height: pageH,
            zoom: cam.zoom,
            transform: `translate(${960 / cam.zoom - cam.cx}px, ${540 / cam.zoom - cam.cy}px) rotateY(${cam.rotY}deg) rotateX(${cam.rotX}deg) rotateZ(${cam.rotZ}deg)`,
            transformOrigin: `${cam.cx}px ${cam.cy}px`,
            transformStyle: "preserve-3d",
            filter: blur > 0 ? `blur(${blur}px)` : undefined,
          }}
        >
          <Img src={staticFile(src)} style={{ position: "absolute", width: 1920, height: pageH }} />
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};
