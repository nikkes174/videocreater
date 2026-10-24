export const SITE_TOUR_FPS = 30;

const DURATION_PRESETS = new Map([
  [3, 6],
  [4, 7],
  [5, 9],
  [6, 10],
]);

const CAMERA_ROUTES = [
  { rx: 13, ry: -9, rz: -3, zoom: 1.12, fromX: 0.36, toX: 0.6, fromY: 0.5, toY: 0.46, focus: [48, 43] },
  { rx: 17, ry: 8, rz: 2, zoom: 1.2, fromX: 0.18, toX: 0.42, fromY: 0.18, toY: 0.36, focus: [46, 47] },
  { rx: 16, ry: -10, rz: -2, zoom: 1.24, fromX: 0.28, toX: 0.62, fromY: 0.24, toY: 0.68, focus: [51, 46] },
  { rx: 14, ry: 8, rz: 2, zoom: 1.21, fromX: 0.31, toX: 0.65, fromY: 0.28, toY: 0.62, focus: [49, 45] },
  { rx: 18, ry: -8, rz: -2, zoom: 1.2, fromX: 0.2, toX: 0.54, fromY: 0.22, toY: 0.58, focus: [47, 47] },
  { rx: 12, ry: 10, rz: 2, zoom: 1.18, fromX: 0.42, toX: 0.68, fromY: 0.34, toY: 0.62, focus: [52, 45] },
];

export const clamp01 = (value) => Math.min(1, Math.max(0, value));

export const getSiteTourDurationSeconds = (imageCount, overrideSeconds) => {
  if (!Number.isInteger(imageCount) || imageCount < 1) {
    throw new Error(`UnlimitSubSiteTour needs at least one PNG (found ${imageCount}).`);
  }

  if (overrideSeconds !== undefined) {
    if (!Number.isFinite(overrideSeconds) || overrideSeconds <= 0) {
      throw new Error("SITE_TOUR_DURATION_SECONDS must be a positive number.");
    }
    return Math.max(1, Math.round(overrideSeconds * SITE_TOUR_FPS) / SITE_TOUR_FPS);
  }

  if (DURATION_PRESETS.has(imageCount)) return DURATION_PRESETS.get(imageCount);
  if (imageCount < 3) return Math.max(2, imageCount * 2);
  return Math.ceil((imageCount * 10) / 6);
};

export const getSiteTourDurationFrames = (imageCount, overrideSeconds) =>
  Math.round(getSiteTourDurationSeconds(imageCount, overrideSeconds) * SITE_TOUR_FPS);

export const getSegmentTiming = (index, imageCount, durationInFrames) => {
  if (!Number.isInteger(index) || index < 0 || index >= imageCount) {
    throw new Error(`Invalid camera stop ${index} for ${imageCount} images.`);
  }
  const segmentLength = durationInFrames / imageCount;
  return { segmentLength, start: index * segmentLength };
};

// Same continuous accelerate / cruise / ease-out curve used by GrazeFaceTour.
export const cruise = (u, first, last) => {
  const A = 0.3;
  const k = 1 / (1 - (first ? A / 2 : 0) - (last ? A / 2 : 0));
  const inPart = (x) => (x < A ? (x * x) / (2 * A) : x - A / 2);
  if (first && u <= A) return k * inPart(Math.max(0, u));
  if (last && u >= 1 - A) return 1 - k * inPart(Math.max(0, 1 - u));
  return first ? k * inPart(u) : k * u;
};

export const createCameraStops = (assets, stageWidth = 1920, stageHeight = 1080) => {
  if (!assets.length) throw new Error("Cannot create a camera route without images.");
  return assets.map((asset, index) => {
    if (!(asset.width > 0) || !(asset.height > 0)) {
      throw new Error(`Invalid PNG dimensions for ${asset.src}: ${asset.width}x${asset.height}`);
    }
    const route = CAMERA_ROUTES[index % CAMERA_ROUTES.length];
    // Cover the frame using the screenshot's native aspect ratio. The image is
    // never stretched; focal paths keep the cropped portion intentional.
    const coverScale = Math.max(stageWidth / asset.width, stageHeight / asset.height);
    const scale = coverScale * route.zoom;
    return {
      rx: route.rx,
      ry: route.ry,
      rz: route.rz,
      scale,
      x: [asset.width / 2 - asset.width * route.fromX, asset.width / 2 - asset.width * route.toX],
      y: [asset.height / 2 - asset.height * route.fromY, asset.height / 2 - asset.height * route.toY],
      focus: route.focus,
    };
  });
};

export const getSegmentMotion = (
  frame,
  index,
  stops,
  durationInFrames,
  crossfadeFrames = 7,
) => {
  const imageCount = stops.length;
  const { segmentLength, start } = getSegmentTiming(index, imageCount, durationInFrames);
  const local = frame - start;
  if (local < -crossfadeFrames || local > segmentLength + crossfadeFrames) return null;

  const first = index === 0;
  const last = index === imageCount - 1;
  const u = local / segmentLength;
  const position = cruise(u, first, last);
  const fadeIn = first ? 1 : clamp01((local + crossfadeFrames) / crossfadeFrames);
  const fadeOut = last ? 1 : clamp01((segmentLength - local) / crossfadeFrames);
  const previous = cruise((local - 0.5) / segmentLength, first, last);
  const next = cruise((local + 0.5) / segmentLength, first, last);
  const stop = stops[index];
  return {
    local,
    segmentLength,
    progress: clamp01(u),
    position,
    opacity: Math.min(fadeIn, fadeOut),
    vx: (stop.x[1] - stop.x[0]) * (next - previous),
    vy: (stop.y[1] - stop.y[0]) * (next - previous),
  };
};

export const getFocusAtFrame = (frame, stops, durationInFrames) => {
  if (stops.length === 1) return stops[0].focus;
  const segmentLength = durationInFrames / stops.length;
  let focus = stops[0].focus;
  for (let index = 0; index < stops.length - 1; index++) {
    const boundary = (index + 1) * segmentLength;
    if (frame < boundary - 5) break;
    const t = clamp01((frame - (boundary - 5)) / 10);
    const next = stops[index + 1].focus;
    focus = [focus[0] + (next[0] - focus[0]) * t, focus[1] + (next[1] - focus[1]) * t];
    if (t < 1) break;
  }
  return focus;
};
