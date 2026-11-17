export const BLACKPHANTOM_STORIES = {
  width: 1080,
  height: 1920,
  fps: 30,
  aspectRatio: "9:16",
  background: "#07090C",
} as const;

export const STORIES_ORDER = [
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

export const STORIES_TRANSITION_FRAMES = 6;
export const STORIES_QR_CROSSFADE_FRAMES = 12;
export const STORIES_QR_STILL_FRAMES = 120;
