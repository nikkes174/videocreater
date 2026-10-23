# Third-party notices

## video-shotcraft — FlyingWords demonstration

The local reproduction in `src/scenes/FlyingWordsOriginal.tsx` and the minimal fixture subset in `src/vendor/videoShotcraft/FlyingWordsFixture.tsx` are derived from Vincentwei1021/video-shotcraft, Copyright 2026 Wei Yihao.

- Original demo: <https://github.com/Vincentwei1021/video-shotcraft/blob/main/demos/typography/flying-words/FlyingWords.tsx>
- Original visual reference: <https://github.com/Vincentwei1021/video-shotcraft/blob/main/references/shots/typography/flying-words.md>
- License: Apache License 2.0, included at `src/vendor/videoShotcraft/LICENSE`.

The local port changes only fixture import paths and the exported component name. Its motion equations, word arrangement, timing, and visual treatment are retained for the original comparison composition. Any subsequent vertical and brand adaptation is marked in its source file.

## video-shotcraft — Basic3DScene demonstration

`src/vendor/videoShotcraft/demos/camera/basic-3d-scene/Basic3DScene.tsx` and the complete fixture dependencies in `src/vendor/videoShotcraft/demos/_fixtures/` are copied from Vincentwei1021/video-shotcraft, Copyright 2026 Wei Yihao. The scene's math, timings, style values, typography, and layout are retained; only its location in this repository and the composition registration differ.

- Original scene: <https://github.com/Vincentwei1021/video-shotcraft/blob/main/demos/camera/basic-3d-scene/Basic3DScene.tsx>
- Original fixtures: `demos/_fixtures/Polish.tsx`, `Look.tsx`, and `Brand.tsx`.
- License: Apache License 2.0, included at `src/vendor/videoShotcraft/LICENSE`.

## video-shotcraft — GrazeFaceTour camera-motion reference

`src/vendor/videoShotcraft/demos/camera/graze-face-tour/GrazeFaceTour.tsx` is an unchanged copy of the original camera tour, Copyright 2026 Wei Yihao. The planned `src/scenes/UnlimitSubSiteTour.tsx` composition will adapt the camera path and lift/landing treatment for real UnlimitSub page captures; the vendor scene and existing shared fixtures remain unchanged.

- Original scene: <https://github.com/Vincentwei1021/video-shotcraft/blob/main/demos/camera/graze-face-tour/GrazeFaceTour.tsx>
- Fixtures: `demos/_fixtures/Polish.tsx` and `demos/_fixtures/Brand.tsx`.
- License: Apache License 2.0, included at `src/vendor/videoShotcraft/LICENSE`.
