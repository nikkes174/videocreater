export const BLACKPHANTOM_MONTAGE = {
  width: 5760,
  height: 3840,
  fps: 30,

  designWidth: 1920,
  designHeight: 1280,

  originalWidth: 1920,
  originalHeight: 1080,

  renderScale: 3,
  background: "#07090C",
} as const;

export const DESIGN = {
  width: BLACKPHANTOM_MONTAGE.designWidth,
  height: BLACKPHANTOM_MONTAGE.designHeight,
  centerX: BLACKPHANTOM_MONTAGE.designWidth / 2,
  centerY: BLACKPHANTOM_MONTAGE.designHeight / 2,
} as const;

export const MONTAGE_ORDER = [
  "BlackPhantomIntro",
  "BlackPhantomWebDevelopment",
  "BlackPhantomAutomation",
  "BlackPhantomEcommerce",
  "BlackPhantomSoftware",
  "BlackPhantomCarousel3D",
  "BlackPhantomDataLandscape",
  "BlackPhantomFinalOutro",
  "BlackPhantomQRFinal",
] as const;

export const SERVICE_READABLE_HOLD_FRAMES = 15;
export const LANDSCAPE_HOLD_FRAMES = 15;
export const FINAL_OUTRO_HOLD_FRAMES = 15;
