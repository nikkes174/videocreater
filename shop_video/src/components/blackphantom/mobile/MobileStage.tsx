import React from "react";
import { AbsoluteFill } from "remotion";
import { BLACKPHANTOM_STORIES } from "../../../config/blackphantomStories";

export const MobileStage: React.FC<React.PropsWithChildren> = ({ children }) => (
  <AbsoluteFill
    style={{
      width: BLACKPHANTOM_STORIES.width,
      height: BLACKPHANTOM_STORIES.height,
      overflow: "hidden",
      background: BLACKPHANTOM_STORIES.background,
    }}
  >
    {children}
  </AbsoluteFill>
);
