import React from "react";
import { AbsoluteFill } from "remotion";

import { DataLandscape } from "../components/blackphantom/DataLandscape";

export const BlackPhantomDataLandscape: React.FC<{ threeByTwo?: boolean }> = ({ threeByTwo = false }) => (
  <AbsoluteFill>
    <DataLandscape verticalOffset={threeByTwo ? 100 : 0} />
  </AbsoluteFill>
);
