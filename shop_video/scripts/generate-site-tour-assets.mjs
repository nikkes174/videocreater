import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { getSiteTourDurationFrames, getSiteTourDurationSeconds, SITE_TOUR_FPS } from "../src/config/siteTourTimeline.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const assetDirectory = resolve(projectRoot, "public/assets/site-tour");
const manifestPath = resolve(projectRoot, "src/config/siteTourAssets.json");
const SCREENSHOT_NAME = /^img(?:_(\d+))?\.png$/i;

export const compareScreenshotNames = (left, right) => {
  const leftMatch = left.match(SCREENSHOT_NAME);
  const rightMatch = right.match(SCREENSHOT_NAME);
  if (!leftMatch || !rightMatch) return left.localeCompare(right, undefined, { numeric: true });
  const leftIndex = leftMatch[1] === undefined ? -1 : Number(leftMatch[1]);
  const rightIndex = rightMatch[1] === undefined ? -1 : Number(rightMatch[1]);
  return leftIndex - rightIndex || left.localeCompare(right, undefined, { numeric: true });
};

const readPngDimensions = async (path) => {
  const buffer = await readFile(path);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature) || buffer.toString("ascii", 12, 16) !== "IHDR") {
    throw new Error(`${path} is not a valid PNG with an IHDR header.`);
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width < 1 || height < 1) throw new Error(`${path} has invalid dimensions ${width}x${height}.`);
  return { width, height, sha256: createHash("sha256").update(buffer).digest("hex") };
};

export const generateSiteTourManifest = async ({ durationOverride } = {}) => {
  const fileNames = (await readdir(assetDirectory)).filter((name) => SCREENSHOT_NAME.test(name)).sort(compareScreenshotNames);
  if (fileNames.length === 0) {
    throw new Error(`No screenshots found in ${assetDirectory}; expected img.png or img_N.png.`);
  }

  const assets = [];
  for (const fileName of fileNames) {
    const metadata = await readPngDimensions(resolve(assetDirectory, fileName));
    assets.push({ fileName, src: `assets/site-tour/${fileName}`, ...metadata });
  }

  const durationInFrames = getSiteTourDurationFrames(assets.length, durationOverride);
  const durationSeconds = getSiteTourDurationSeconds(assets.length, durationOverride);
  const manifest = {
    fps: SITE_TOUR_FPS,
    durationSeconds,
    durationInFrames,
    assets,
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const override = process.env.SITE_TOUR_DURATION_SECONDS;
  const durationOverride = override === undefined ? undefined : Number(override);
  const manifest = await generateSiteTourManifest({ durationOverride });
  console.log(`Prepared ${manifest.assets.length} screenshots in numeric order (${manifest.durationSeconds}s, ${manifest.durationInFrames} frames):`);
  for (const asset of manifest.assets) {
    console.log(`- ${asset.fileName}: ${asset.width}x${asset.height}`);
  }
}
