import React from "react";
import { PaparazziCamera, type CameraView, type FocusRect } from "../components/blackphantom/PaparazziCamera";
import { AutomationScene } from "../components/blackphantom/scenes/AutomationScene";

const VIEWS: readonly [CameraView, CameraView, CameraView] = [
  { scale: 1, cx: 960, cy: 540 },
  { scale: 1.6, cx: 970, cy: 560 },
  { scale: 2.8, cx: 1160, cy: 565 },
];

const FOCUS_RECT: FocusRect = { x: 590, y: 176, w: 740, h: 780 };

export const BlackPhantomAutomation: React.FC = () => (
  <PaparazziCamera
    title="Мессенджеры и автоматизация"
    description="Разрабатываем мессенджер-платформы и AI-ассистентов, которые выстраивают воронки, обрабатывают заявки и усиливают клиентский сервис."
    brand="BLACKPHANTOM"
    views={VIEWS}
    focusRect={FOCUS_RECT}
    Scene={AutomationScene}
  />
);
