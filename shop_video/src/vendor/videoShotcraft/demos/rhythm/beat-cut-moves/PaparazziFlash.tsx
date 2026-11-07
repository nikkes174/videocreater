import React from "react";
import {
  PaparazziCamera,
  type CameraView,
  type FocusRect,
} from "../../../../../components/blackphantom/PaparazziCamera";
import { WebDevelopmentScene } from "../../../../../components/blackphantom/scenes/WebDevelopmentScene";

export { PAPARAZZI_FLASH_DURATION } from "../../../../../components/blackphantom/PaparazziCamera";

const VIEWS: readonly [CameraView, CameraView, CameraView] = [
  { scale: 1, cx: 960, cy: 540 },
  { scale: 1.6, cx: 960, cy: 560 },
  { scale: 2.8, cx: 820, cy: 440 },
];

const FOCUS_RECT: FocusRect = {
  x: 590,
  y: 176,
  w: 740,
  h: 780,
};

export const PaparazziFlash: React.FC = () => (
  <PaparazziCamera
    title="Веб-разработка"
    description="Создаём сайты и цифровые платформы, которые привлекают клиентов, автоматизируют процессы и усиливают бренд."
    brand="BLACKPHANTOM"
    views={VIEWS}
    focusRect={FOCUS_RECT}
    Scene={WebDevelopmentScene}
  />
);
