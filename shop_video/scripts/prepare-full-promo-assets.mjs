import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = resolve(projectRoot, "output");
const publicAssetDirectory = resolve(projectRoot, "public", "assets", "full-promo");
const manifestPath = resolve(projectRoot, "src", "config", "fullPromoManifest.json");
const transitionFrames = 15;
const fps = 30;
const orderedFiles = [
  "first_cadr.mp4",
  "first_v2_cadr.mp4",
  "three_cadr.mp4",
  "two_cadr.mp4",
  "five_cadr.mp4",
  "four_cadr.mp4",
  "end_cadr.mp4",
];

const remotionDirectory = resolve(projectRoot, "node_modules", "@remotion");
const executableSuffix = process.platform === "win32" ? ".exe" : "";
const ffmpegPackages = readdirSync(remotionDirectory)
  .filter((entry) => entry.startsWith("compositor-"))
  .map((entry) => resolve(remotionDirectory, entry));
const ffprobe = ffmpegPackages
  .map((directory) => resolve(directory, `ffprobe${executableSuffix}`))
  .find(existsSync);
const ffmpeg = ffmpegPackages
  .map((directory) => resolve(directory, `ffmpeg${executableSuffix}`))
  .find(existsSync);

if (!ffprobe || !ffmpeg) {
  throw new Error("Remotion's bundled ffmpeg/ffprobe executables were not found.");
}

mkdirSync(publicAssetDirectory, { recursive: true });

const scenes = orderedFiles.map((file, index) => {
  const source = resolve(sourceDirectory, file);
  if (!existsSync(source)) {
    throw new Error(`Required source clip is missing: ${source}`);
  }

  const probeOutput = execFileSync(
    ffprobe,
    [
      "-v",
      "error",
      "-count_frames",
      "-show_entries",
      "stream=codec_type,codec_name,width,height,avg_frame_rate,pix_fmt,nb_read_frames",
      "-show_entries",
      "format=duration",
      "-of",
      "json",
      source,
    ],
    { encoding: "utf8" },
  );
  const metadata = JSON.parse(probeOutput);
  const video = metadata.streams?.find((stream) => stream.codec_type === "video");
  const audio = metadata.streams?.filter((stream) => stream.codec_type === "audio") ?? [];
  if (!video) throw new Error(`No video stream found in ${file}`);
  if (video.avg_frame_rate !== `${fps}/1`) {
    throw new Error(`${file} must be ${fps} FPS, found ${video.avg_frame_rate}`);
  }
  if (!video.nb_read_frames) throw new Error(`Could not count frames in ${file}`);

  const asset = `assets/full-promo/${file}`;
  const publicVideo = resolve(projectRoot, "public", asset);
  const sourceHash = createHash("sha256").update(readFileSync(source)).digest("hex");
  let copied = !existsSync(publicVideo);
  if (!copied) {
    const existingHash = createHash("sha256").update(readFileSync(publicVideo)).digest("hex");
    copied = existingHash !== sourceHash;
  }
  if (copied) copyFileSync(source, publicVideo);

  const backdrop = `assets/full-promo/backdrop-${index + 1}.jpg`;
  const backdropPath = resolve(projectRoot, "public", backdrop);
  const backdropChanged = copied || !existsSync(backdropPath);
  if (backdropChanged) {
    const duration = Number(metadata.format?.duration ?? 0);
    const sampleSeconds = index === 0 ? 0 : Math.min(duration / 2, duration - 1 / fps);
    execFileSync(
      ffmpeg,
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-ss",
        sampleSeconds.toFixed(6),
        "-i",
        source,
        "-frames:v",
        "1",
        "-vf",
        "scale=540:960:force_original_aspect_ratio=increase,crop=540:960",
        "-q:v",
        "3",
        backdropPath,
      ],
      { stdio: "inherit" },
    );
  }

  const fileStat = statSync(source);
  return {
    file,
    asset,
    backdrop,
    preRollFrames: 0,
    durationInFrames: Number(video.nb_read_frames),
    durationSeconds: Number(metadata.format?.duration),
    width: Number(video.width),
    height: Number(video.height),
    fps,
    codec: video.codec_name,
    pixelFormat: video.pix_fmt,
    hasAudio: audio.length > 0,
    sha256: sourceHash,
    sourceBytes: fileStat.size,
  };
});

const transitionAndPreRollFrames = scenes.slice(1).reduce(
  (total, scene) => total + transitionFrames + scene.preRollFrames,
  0,
);
const durationInFrames = scenes.reduce((total, scene) => total + scene.durationInFrames, 0)
  - transitionAndPreRollFrames;
if (durationInFrames <= 0) throw new Error("Transitions exceed the combined source duration.");

const manifest = {
  fps,
  width: 1080,
  height: 1920,
  transitionFrames,
  durationInFrames,
  durationSeconds: durationInFrames / fps,
  scenes,
};
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Prepared ${scenes.length} clips in the requested order.`);
for (const [index, scene] of scenes.entries()) {
  console.log(
    `${index + 1}. ${scene.file}: ${scene.width}x${scene.height}, ${scene.fps} fps, `
      + `${scene.durationInFrames} frames (${scene.durationSeconds}s), audio=${scene.hasAudio}`,
  );
}
console.log(`Timeline: ${durationInFrames} frames / ${manifest.durationSeconds.toFixed(3)} seconds`);
