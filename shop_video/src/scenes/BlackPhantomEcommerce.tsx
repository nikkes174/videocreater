import React from "react";
import { PaparazziCamera, type CameraView, type FocusRect } from "../components/blackphantom/PaparazziCamera";
import { EcommerceScene } from "../components/blackphantom/scenes/EcommerceScene";

const VIEWS: readonly [CameraView, CameraView, CameraView] = [
  { scale: 1, cx: 960, cy: 540 },
  { scale: 1.6, cx: 970, cy: 560 },
  { scale: 2.8, cx: 980, cy: 535 },
];

const FOCUS_RECT: FocusRect = { x: 590, y: 176, w: 740, h: 780 };

export const BlackPhantomEcommerce: React.FC = () => (
  <PaparazziCamera
    title="Интернет-магазины"
    description="eCommerce-решения под ключ — от каталога и оплаты до автоматизации заказов и масштабирования продаж."
    brand="BLACKPHANTOM"
    effectsBeforeCopy
    views={VIEWS}
    focusRect={FOCUS_RECT}
    Scene={EcommerceScene}
  />
);
