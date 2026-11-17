import React from "react";
import { BLACKPHANTOM_MONTAGE } from "../../../config/blackphantomMontage";

const VERTICAL_GUTTER = (BLACKPHANTOM_MONTAGE.designHeight - BLACKPHANTOM_MONTAGE.originalHeight) / 2;

export const BlackPhantomSceneAdapter: React.FC<{
  children: React.ReactNode;
  background?: string;
}> = ({ children, background = BLACKPHANTOM_MONTAGE.background }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", background }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: VERTICAL_GUTTER,
        width: BLACKPHANTOM_MONTAGE.originalWidth,
        height: BLACKPHANTOM_MONTAGE.originalHeight,
        overflow: "hidden",
        background,
      }}
    >
      {children}
    </div>
  </div>
);
