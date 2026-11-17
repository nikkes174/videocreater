const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
process.chdir(projectRoot);

const ts = require("typescript");
const compilerOptions = {
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  jsx: ts.JsxEmit.ReactJSX,
  esModuleInterop: true,
  target: ts.ScriptTarget.ES2020,
};

const loadTypeScript = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions }).outputText;
  module._compile(compiled, filename);
};

require.extensions[".ts"] = loadTypeScript;
require.extensions[".tsx"] = loadTypeScript;

const optionalAssets = {
  FAR: "bg-far.png",
  LIGHTS: "bg-lights.png",
  HAZE: "bg-haze.png",
  PARTICLES: "bg-particles.png",
  BOKEH: "bg-bokeh.png",
  FLOOR: "bg-floor.png",
};

for (const [key, filename] of Object.entries(optionalAssets)) {
  global[`__REMOTION_HAS_BG_${key}__`] = fs.existsSync(
    path.join(projectRoot, "public", "assets", filename),
  );
}

const compositionId = process.argv[2] || "BlackPhantomMontageStories";
if (compositionId !== "BlackPhantomMontageStories") {
  throw new Error(
    `No scene timeline provider is registered for ${compositionId}. ` +
      "This script currently exports BlackPhantomMontageStories.",
  );
}

const React = require("react");
const { RemotionRoot } = require(path.join(projectRoot, "src", "Root.tsx"));
const { STORIES_SCENE_TIMELINE } = require(
  path.join(projectRoot, "src", "scenes", "BlackPhantomMontageStories.tsx"),
);

const rootElement = RemotionRoot();
const elements = React.Children.toArray(rootElement.props.children);
const compositionElement = elements.find(
  (element) => React.isValidElement(element) && element.props.id === compositionId,
);

if (!compositionElement) {
  throw new Error(`Composition ${compositionId} was not found in src/Root.tsx.`);
}

const composition = compositionElement.props;
const sceneTimeline = STORIES_SCENE_TIMELINE.map((scene) => ({
  id: scene.id,
  from: scene.from,
  startSeconds: scene.from / composition.fps,
  durationInFrames: scene.duration,
  sourceDurationInFrames: scene.sourceDuration,
  fadeInFrames: scene.fadeInFrames,
  fadeOutFrames: scene.fadeOutFrames,
}));

const timelineEnd = sceneTimeline.reduce(
  (end, scene) => Math.max(end, scene.from + scene.durationInFrames),
  0,
);

if (timelineEnd !== composition.durationInFrames) {
  throw new Error(
    `Timeline ends at frame ${timelineEnd}, but Remotion registers ` +
      `${composition.durationInFrames} frames.`,
  );
}

process.stdout.write(
  JSON.stringify({
    compositionId,
    fps: composition.fps,
    width: composition.width,
    height: composition.height,
    durationInFrames: composition.durationInFrames,
    durationSeconds: composition.durationInFrames / composition.fps,
    scenes: sceneTimeline,
    sceneCuts: sceneTimeline.slice(1).map((scene) => ({
      id: scene.id,
      frame: scene.from,
      timeSeconds: scene.startSeconds,
    })),
  }),
);
