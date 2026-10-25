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

## video-shotcraft — SpotlightHeroCard camera and lighting mechanics

`src/scenes/UnlimitSubSpotlightProduct.tsx` adapts the original SpotlightHeroCard demo to the real UnlimitSub catalogue and product artwork. `src/vendor/videoShotcraft/demos/_fixtures/PageCam2D.tsx` carries the original 2.5D screenshot-camera interpolation and transform math, with an exported resolver so the adjacent annotation shares the camera state.

- Original scene: <https://github.com/Vincentwei1021/video-shotcraft/blob/main/demos/opening/spotlight-hero-card/SpotlightHeroCard.tsx>
- Original visual reference: <https://github.com/Vincentwei1021/video-shotcraft/blob/main/references/shots/opening/spotlight-hero-card.md>
- Camera fixture: `demos/_fixtures/PageCam2D.tsx`.
- License: Apache License 2.0, included at `src/vendor/videoShotcraft/LICENSE`.

## video-shotcraft — card-stack motion reference

`src/scenes/UnlimitSubCardStack.tsx` adapts the card-stack motion to the eight real UnlimitSub card images. It retains the source shot's per-card spring entrance, settling compression, deterministic stack offsets, fixed layer order, wrist-pivot fan, contact shadow, and slow push/pull camera.

- Original component: <https://github.com/Vincentwei1021/video-shotcraft/blob/main/demos/ui-entrance/card-stack/CardStack.tsx>
- Motion reference: <https://github.com/Vincentwei1021/video-shotcraft/blob/main/references/shots/ui-entrance/card-stack.md>
- Shared fixtures used: `demos/_fixtures/Polish.tsx` and `Look.tsx`.
- License: Apache License 2.0, included at `src/vendor/videoShotcraft/LICENSE`.

## video-shotcraft — document-typewriter-reveal mechanics

`src/scenes/UnlimitSubSupportTypewriter.tsx` adapts the camera spline, perspective application window, paired left-to-right text wipes, and single moving caret from `DocumentTypewriterReveal.tsx`. The UnlimitSub scene uses its own dialogue, Russian copy, and graphite/teal interface styling.

- Original component: <https://github.com/Vincentwei1021/video-shotcraft/blob/43bd349a136651865ecfa6ea1cf012f6e957d304/demos/ui-entrance/document-typewriter-reveal/DocumentTypewriterReveal.tsx>
- License: Apache License 2.0, included at `src/vendor/videoShotcraft/LICENSE`.

## video-shotcraft — BarnDoorSplit page-turn transition

`src/vendor/videoShotcraft/demos/transition/page-turn-transitions/BarnDoorSplit.tsx` is a local copy of the original BarnDoorSplit composition. `src/scenes/UnlimitSubPageTurnIntro.tsx` adapts its split-door timing, easing, velocity-based motion blur, lit inner edges, and incoming-page scale to the UnlimitSub graphite/teal brand scene.

- Original component: <https://github.com/Vincentwei1021/video-shotcraft/blob/main/demos/transition/page-turn-transitions/BarnDoorSplit.tsx>
- Visual reference: <https://github.com/Vincentwei1021/video-shotcraft/blob/main/references/shots/transition/page-turn-transitions.md>
- Shared fixtures: `demos/_fixtures/Polish.tsx`, `Look.tsx`, and `Brand.tsx` (already present in this project).
- License: Apache License 2.0, included at `src/vendor/videoShotcraft/LICENSE`.

## Manrope typeface

The Manrope 500 and 800 WOFF2 subsets in `public/assets/fonts/` are from Google Fonts and are licensed under the SIL Open Font License 1.1. The license text is included at `public/assets/fonts/OFL-Manrope.txt`.

The Unbounded 700 WOFF2 subsets in `public/assets/fonts/` are from Google Fonts and are licensed under the SIL Open Font License 1.1. The license text is included at `public/assets/fonts/OFL-Unbounded.txt`.
