import assert from "node:assert/strict";
import { compareScreenshotNames } from "./generate-site-tour-assets.mjs";
import {
  createCameraStops,
  getSegmentMotion,
  getSiteTourDurationFrames,
  getSiteTourDurationSeconds,
} from "../src/config/siteTourTimeline.mjs";

const ordered = ["img_10.png", "img_2.png", "img_1.png", "img.png", "img_3.png"].sort(compareScreenshotNames);
assert.deepEqual(ordered, ["img.png", "img_1.png", "img_2.png", "img_3.png", "img_10.png"]);

const expectedDurations = new Map([[3, 6], [4, 7], [5, 9], [6, 10]]);
const dimensions = [
  { src: "screen-a.png", width: 1874, height: 779 },
  { src: "screen-b.png", width: 1749, height: 845 },
  { src: "screen-c.png", width: 1722, height: 762 },
  { src: "screen-d.png", width: 1728, height: 743 },
  { src: "screen-e.png", width: 1080, height: 1920 },
  { src: "screen-f.png", width: 2560, height: 1440 },
];

for (const count of [3, 4, 5, 6]) {
  const durationSeconds = getSiteTourDurationSeconds(count);
  const durationInFrames = getSiteTourDurationFrames(count);
  assert.equal(durationSeconds, expectedDurations.get(count));
  assert.equal(durationInFrames, durationSeconds * 30);
  const stops = createCameraStops(dimensions.slice(0, count));
  assert.equal(stops.length, count);
  for (const stop of stops) {
    assert.ok(Number.isFinite(stop.scale) && stop.scale > 0);
    assert.ok([...stop.x, ...stop.y, stop.rx, stop.ry, stop.rz].every(Number.isFinite));
  }

  for (let frame = 0; frame < durationInFrames; frame++) {
    const active = stops
      .map((_, index) => getSegmentMotion(frame, index, stops, durationInFrames))
      .filter((motion) => motion && motion.opacity > 0);
    assert.ok(active.length > 0, `No camera section active at frame ${frame}/${count} screens`);
    for (const motion of active) {
      assert.ok(Number.isFinite(motion.position));
      assert.ok(Number.isFinite(motion.vx) && Number.isFinite(motion.vy));
      assert.ok(motion.progress >= 0 && motion.progress <= 1);
    }
  }
}

assert.equal(getSiteTourDurationSeconds(7), 12);
console.log("Site tour checks passed: numeric ordering, durations and non-empty camera routes for 3–6 images.");
