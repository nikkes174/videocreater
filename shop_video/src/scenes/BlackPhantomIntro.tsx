import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { LogoShrinkLockup } from "../components/blackphantom/LogoShrinkLockup";

export const BlackPhantomIntro: React.FC<{ threeByTwo?: boolean }> = ({ threeByTwo = false }) => (
  <AbsoluteFill>
    <LogoShrinkLockup
      logoSrc={staticFile("assets/blackphantom/logo.png")}
      designWidth={threeByTwo ? 1920 : undefined}
      designHeight={threeByTwo ? 1280 : undefined}
    />
  </AbsoluteFill>
);
