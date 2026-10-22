import { staticFile } from "remotion";

declare const __REMOTION_HAS_BG_FAR__: boolean;
declare const __REMOTION_HAS_BG_LIGHTS__: boolean;
declare const __REMOTION_HAS_BG_HAZE__: boolean;
declare const __REMOTION_HAS_BG_PARTICLES__: boolean;
declare const __REMOTION_HAS_BG_BOKEH__: boolean;
declare const __REMOTION_HAS_BG_FLOOR__: boolean;

const assetAvailability: Record<string, boolean> = {
  "bg-far.png": __REMOTION_HAS_BG_FAR__,
  "bg-lights.png": __REMOTION_HAS_BG_LIGHTS__,
  "bg-haze.png": __REMOTION_HAS_BG_HAZE__,
  "bg-particles.png": __REMOTION_HAS_BG_PARTICLES__,
  "bg-bokeh.png": __REMOTION_HAS_BG_BOKEH__,
  "bg-floor.png": __REMOTION_HAS_BG_FLOOR__,
};

export const useOptionalLayerAsset = (fileName: string) =>
  assetAvailability[fileName] ? staticFile(`assets/${fileName}`) : null;
