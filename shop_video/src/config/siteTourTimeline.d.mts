export type TourAssetDimensions = {
  src: string;
  width: number;
  height: number;
};

export type CameraStop = {
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  x: [number, number];
  y: [number, number];
  focus: [number, number];
};

export type SegmentMotion = {
  local: number;
  segmentLength: number;
  progress: number;
  position: number;
  opacity: number;
  vx: number;
  vy: number;
};

export const SITE_TOUR_FPS: 30;
export function clamp01(value: number): number;
export function getSiteTourDurationSeconds(imageCount: number, overrideSeconds?: number): number;
export function getSiteTourDurationFrames(imageCount: number, overrideSeconds?: number): number;
export function getSegmentTiming(index: number, imageCount: number, durationInFrames: number): { segmentLength: number; start: number };
export function cruise(u: number, first: boolean, last: boolean): number;
export function createCameraStops(assets: TourAssetDimensions[], stageWidth?: number, stageHeight?: number): CameraStop[];
export function getSegmentMotion(frame: number, index: number, stops: CameraStop[], durationInFrames: number, crossfadeFrames?: number): SegmentMotion | null;
export function getFocusAtFrame(frame: number, stops: CameraStop[], durationInFrames: number): [number, number];
