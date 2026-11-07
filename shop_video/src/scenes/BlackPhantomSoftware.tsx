import React from "react";
import { PaparazziCamera, type CameraView, type FocusRect } from "../components/blackphantom/PaparazziCamera";
import { SoftwareScene } from "../components/blackphantom/scenes/SoftwareScene";

const VIEWS: readonly [CameraView, CameraView, CameraView] = [
  { scale: 1, cx: 960, cy: 540 },
  { scale: 1.6, cx: 1000, cy: 560 },
  { scale: 2.8, cx: 1125, cy: 580 },
];

const FOCUS_RECT: FocusRect = { x: 590, y: 176, w: 740, h: 780 };

export const BlackPhantomSoftware: React.FC = () => (
  <PaparazziCamera
    title="Разработка ПО"
    description="Создаём кастомные IT-решения и SaaS-платформы для автоматизации, масштабирования и цифровой трансформации бизнеса."
    brand="BLACKPHANTOM"
    effectsBeforeCopy
    views={VIEWS}
    focusRect={FOCUS_RECT}
    Scene={SoftwareScene}
  />
);
