import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(resolve(scriptDirectory, "../src/config/siteTourAssets.json"), "utf8"));
const verifier = resolve(scriptDirectory, "verify-output.mjs");
const output = process.argv[2] ?? "output/unlimitsub_site_tour_v2.mp4";
const result = spawnSync(
  process.execPath,
  [verifier, output, String(manifest.durationInFrames), String(manifest.durationSeconds), "1920", "1080"],
  { stdio: "inherit" },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
