import { MAC_VIDEO_CONFIG } from "./macTheme";

export const MAC_FINAL_MONTAGE = {
  fps: MAC_VIDEO_CONFIG.fps,
  width: MAC_VIDEO_CONFIG.width,
  height: MAC_VIDEO_CONFIG.height,
  durationInFrames: MAC_VIDEO_CONFIG.totalFrames,
  transitionFrames: MAC_VIDEO_CONFIG.transitions.frames,
} as const;
