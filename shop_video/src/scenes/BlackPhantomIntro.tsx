import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { LogoShrinkLockup } from "../components/blackphantom/LogoShrinkLockup";

export const BlackPhantomIntro: React.FC = () => (
  <AbsoluteFill>
    <LogoShrinkLockup logoSrc={staticFile("assets/blackphantom/logo.png")} />
  </AbsoluteFill>
);
