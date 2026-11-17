import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { BLACKPHANTOM_MONTAGE } from "../../../config/blackphantomMontage";

export const BlackPhantomStage3x2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <StageFrame>{children}</StageFrame>
);

const StageFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  const scale = Math.min(
    width / BLACKPHANTOM_MONTAGE.designWidth,
    height / BLACKPHANTOM_MONTAGE.designHeight,
  );

  return (
    <AbsoluteFill style={{ background: BLACKPHANTOM_MONTAGE.background, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: BLACKPHANTOM_MONTAGE.designWidth,
          height: BLACKPHANTOM_MONTAGE.designHeight,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
