import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetsDirectory = resolve(projectRoot, "public", "assets", "site-tour", "cards");
const manifestPath = resolve(projectRoot, "src", "config", "cardStackAssets.json");
const supportedName = /^cards?_(\d+)\.png$/i;
const requiredIndices = Array.from({ length: 8 }, (_, index) => index + 1);

const entries = await readdir(assetsDirectory, { withFileTypes: true });
const indexedFiles = entries.flatMap((entry) => {
  if (!entry.isFile()) return [];
  const match = supportedName.exec(entry.name);
  return match ? [{ index: Number(match[1]), filename: entry.name }] : [];
});

indexedFiles.sort((a, b) => a.index - b.index || a.filename.localeCompare(b.filename));

const duplicates = indexedFiles.filter((file, position) => position > 0 && file.index === indexedFiles[position - 1].index);
if (duplicates.length > 0) {
  const duplicateNames = duplicates.map((file) => file.filename).join(", ");
  throw new Error(`Ambiguous card numbering in ${assetsDirectory}: ${duplicateNames}. Keep only one PNG for each card number.`);
}

const actualIndices = indexedFiles.map((file) => file.index);
const missingIndices = requiredIndices.filter((index) => !actualIndices.includes(index));
const unexpectedIndices = actualIndices.filter((index) => !requiredIndices.includes(index));
if (missingIndices.length > 0 || unexpectedIndices.length > 0 || indexedFiles.length !== requiredIndices.length) {
  throw new Error(
    `Expected exactly card numbers 1–8 in ${assetsDirectory}. ` +
      `Found: ${indexedFiles.map((file) => file.filename).join(", ") || "none"}. ` +
      `${missingIndices.length ? `Missing: ${missingIndices.join(", ")}. ` : ""}` +
      `${unexpectedIndices.length ? `Unexpected: ${unexpectedIndices.join(", ")}.` : ""}`,
  );
}

const assets = [];
for (const { index, filename } of indexedFiles) {
  const filePath = resolve(assetsDirectory, filename);
  const bytes = await readFile(filePath);
  if (bytes.length < 24 || bytes.toString("hex", 0, 8) !== "89504e470d0a1a0a") {
    throw new Error(`${filename} is not a valid PNG image.`);
  }

  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width === 0 || height === 0) throw new Error(`${filename} has invalid dimensions ${width}x${height}.`);

  assets.push({
    index,
    src: `assets/site-tour/cards/${filename}`,
    width,
    height,
  });
}

await mkdir(dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(assets, null, 2)}\n`, "utf8");
console.log(`Generated ${manifestPath} with ${assets.length} cards:`);
for (const asset of assets) console.log(`- ${asset.index}: ${asset.src} (${asset.width}x${asset.height})`);
