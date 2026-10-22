import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = resolve(projectRoot, process.argv[2] ?? "output/test.mp4");
const expectedFrames = Number(process.argv[3] ?? 90);
const expectedDurationSeconds = Number(process.argv[4] ?? 3);
const expectedWidth = Number(process.argv[5] ?? 1080);
const expectedHeight = Number(process.argv[6] ?? 1920);

if (!existsSync(inputPath)) {
  console.error(`Video file not found: ${inputPath}`);
  process.exit(1);
}

const remotionPackages = resolve(projectRoot, "node_modules", "@remotion");
const ffprobeName = process.platform === "win32" ? "ffprobe.exe" : "ffprobe";
const ffprobePath = readdirSync(remotionPackages)
  .filter((entry) => entry.startsWith("compositor-"))
  .map((entry) => resolve(remotionPackages, entry, ffprobeName))
  .find((candidate) => existsSync(candidate));

if (!ffprobePath) {
  console.error("Remotion's bundled ffprobe was not found. Install dependencies before verifying exports.");
  process.exit(1);
}

const probe = spawnSync(
  ffprobePath,
  [
    "-v",
    "error",
    "-count_frames",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=codec_name,width,height,pix_fmt,avg_frame_rate,nb_read_frames",
    "-show_entries",
    "format=duration,format_name",
    "-of",
    "json",
    inputPath,
  ],
  { encoding: "utf8" },
);

if (probe.error || probe.status !== 0) {
  console.error(probe.error?.message ?? probe.stderr ?? "ffprobe failed");
  process.exit(probe.status || 1);
}

const metadata = JSON.parse(probe.stdout);
const video = metadata.streams?.[0];
const durationSeconds = Number(metadata.format?.duration);
const failures = [];

if (basename(inputPath).toLowerCase().endsWith(".mp4") === false) failures.push("container extension must be .mp4");
if (video?.codec_name !== "h264") failures.push(`codec must be h264 (found ${video?.codec_name ?? "none"})`);
if (video?.width !== expectedWidth || video?.height !== expectedHeight) {
  failures.push(`dimensions must be ${expectedWidth}x${expectedHeight} (found ${video?.width}x${video?.height})`);
}
if (video?.pix_fmt !== "yuv420p") failures.push(`pixel format must be yuv420p (found ${video?.pix_fmt ?? "none"})`);
if (video?.avg_frame_rate !== "30/1") failures.push(`frame rate must be 30 FPS (found ${video?.avg_frame_rate ?? "unknown"})`);
if (video?.nb_read_frames !== String(expectedFrames)) {
  failures.push(`composition must contain ${expectedFrames} frames (found ${video?.nb_read_frames ?? "unknown"})`);
}
if (!Number.isFinite(durationSeconds) || Math.abs(durationSeconds - expectedDurationSeconds) > 0.01) {
  failures.push(`duration must be ${expectedDurationSeconds} seconds (found ${durationSeconds})`);
}

if (failures.length) {
  console.error("Export verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Export verified:");
console.log(`- Container: ${metadata.format.format_name} (.mp4)`);
console.log(`- Video: ${video.codec_name}, ${video.width}x${video.height}, ${video.avg_frame_rate} FPS, ${video.pix_fmt}`);
console.log(`- Duration: ${durationSeconds.toFixed(3)} s (${video.nb_read_frames} frames)`);
