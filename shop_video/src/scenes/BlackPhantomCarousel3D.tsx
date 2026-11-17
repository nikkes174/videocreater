import React from "react";
import { Carousel3D } from "../components/blackphantom/Carousel3D";

export const BlackPhantomCarousel3D: React.FC<{ threeByTwo?: boolean }> = ({ threeByTwo = false }) => (
  <Carousel3D stageHeight={threeByTwo ? 1280 : 1080} />
);
