export const VIDEO_CONFIG = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationSeconds: 20,
  codec: "h264",
  pixelFormat: "yuv420p",
  safeArea: {
    top: 250,
    bottom: 350,
    horizontal: 90,
  },
} as const;
