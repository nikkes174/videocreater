import { Config } from "@remotion/cli/config";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { VIDEO_CONFIG } from "./src/config/video";

Config.setCodec(VIDEO_CONFIG.codec);
Config.setPixelFormat(VIDEO_CONFIG.pixelFormat);
Config.setVideoImageFormat("png");
Config.setColorSpace("bt709");

const optionalBackgroundAssets = [
  "bg-far.png",
  "bg-lights.png",
  "bg-haze.png",
  "bg-particles.png",
  "bg-bokeh.png",
  "bg-floor.png",
];
const backgroundAssetManifest = Object.fromEntries(
  optionalBackgroundAssets.map((fileName) => [
    fileName,
    existsSync(resolve(process.cwd(), "public", "assets", fileName)),
  ]),
);
const projectRequire = createRequire(resolve(process.cwd(), "remotion.config.ts"));
const bundlerRequire = createRequire(projectRequire.resolve("@remotion/bundler"));
const DefinePlugin = bundlerRequire("webpack").DefinePlugin;

Config.overrideWebpackConfig((configuration) => ({
  ...configuration,
  plugins: [
    ...(configuration.plugins ?? []),
    new DefinePlugin({
      __REMOTION_HAS_BG_FAR__: JSON.stringify(backgroundAssetManifest["bg-far.png"]),
      __REMOTION_HAS_BG_LIGHTS__: JSON.stringify(backgroundAssetManifest["bg-lights.png"]),
      __REMOTION_HAS_BG_HAZE__: JSON.stringify(backgroundAssetManifest["bg-haze.png"]),
      __REMOTION_HAS_BG_PARTICLES__: JSON.stringify(backgroundAssetManifest["bg-particles.png"]),
      __REMOTION_HAS_BG_BOKEH__: JSON.stringify(backgroundAssetManifest["bg-bokeh.png"]),
      __REMOTION_HAS_BG_FLOOR__: JSON.stringify(backgroundAssetManifest["bg-floor.png"]),
    }),
  ],
}));
