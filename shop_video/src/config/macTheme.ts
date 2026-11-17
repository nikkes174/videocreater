export const MAC_COLORS = {
  background: "#090612",
  deepPurple: "#170D29",
  purple: "#582A85",
  violet: "#9462C8",
  gold: "#D5AF63",
  brightGold: "#F0D18C",
  darkGold: "#98713B",
  platinum: "#F3EFF7",
  silver: "#C8C0D2",
  muted: "#92869F",
} as const;

export const MAC_VIDEO_CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
  scenes: { intro: 150, statement: 240, services: 390, advantages: 540, qr: 240 },
  transitions: { count: 4, frames: 30 },
  totalFrames: 1440,
} as const;
