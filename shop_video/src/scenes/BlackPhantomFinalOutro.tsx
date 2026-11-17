import React from "react";
import { FinalSmokeOutro } from "../components/blackphantom/FinalSmokeOutro";

export const BlackPhantomFinalOutro: React.FC<{ threeByTwo?: boolean }> = ({ threeByTwo = false }) => {
  return <FinalSmokeOutro designHeight={threeByTwo ? 1280 : 1080} />;
};
