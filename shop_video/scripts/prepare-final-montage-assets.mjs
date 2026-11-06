import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const filenames = [
  "first_cadr_vertical.mp4",
  "first_v2_cadr_vertical.mp4",
  "three_cadr_vertical.mp4",
  "two_cadr_vertical.mp4",
  "five_cadr_vertical.mp4",
  "four_cadr_vertical.mp4",
  "end_cadr_vertical.mp4",
];
const sourceDirectory = resolve(projectRoot, "output");
const publicDirectory = resolve(projectRoot, "public", "assets", "final-montage");
const stillsDirectory = resolve(publicDirectory, "stills");
const remotionDirectory = resolve(projectRoot, "node_modules", "@remotion");
const executableSuffix = process.platform === "win32" ? ".exe" : "";
const ffmpeg = readdirSync(remotionDirectory)
  .filter((entry) => entry.startsWith("compositor-"))
  .map((entry) => resolve(remotionDirectory, entry, `ffmpeg${executableSuffix}`))
  .find((candidate) => existsSync(candidate));
if (!ffmpeg) throw new Error("Remotion's bundled ffmpeg executable was not found.");
const frameCounts = [150, 210, 165, 172, 225, 180, 105];

mkdirSync(publicDirectory, { recursive: true });
mkdirSync(stillsDirectory, { recursive: true });

for (const [index, filename] of filenames.entries()) {
  const source = resolve(sourceDirectory, filename);
  const destination = resolve(publicDirectory, filename);
  if (!existsSync(source)) throw new Error(`Required finished scene is missing: ${source}`);
  const sourceStat = statSync(source);
  if (sourceStat.size === 0) throw new Error(`Finished scene is empty: ${source}`);
  const destinationStat = existsSync(destination) ? statSync(destination) : undefined;
  if (!destinationStat || destinationStat.size !== sourceStat.size || destinationStat.mtimeMs < sourceStat.mtimeMs) {
    copyFileSync(source, destination);
  }
  console.log(`${filename}: ${sourceStat.size} bytes → public/assets/final-montage/`);

  for (const [edge, sourceFrame] of [["first", 0], ["last", frameCounts[index] - 1]]) {
    const stillPath = resolve(stillsDirectory, `scene-${String(index + 1).padStart(2, "0")}-${edge}.png`);
    const stillStat = existsSync(stillPath) ? statSync(stillPath) : undefined;
    if (!stillStat || stillStat.mtimeMs < sourceStat.mtimeMs) {
      const result = spawnSync(
        ffmpeg,
        [
          "-hide_banner", "-loglevel", "error", "-y", "-i", source,
          "-ss", (sourceFrame / 30).toFixed(6), "-frames:v", "1", stillPath,
        ],
        { stdio: "inherit" },
      );
      if (result.error || result.status !== 0) {
        throw result.error ?? new Error(`Could not extract ${edge} poster for ${filename}`);
      }
    }
  }
}
