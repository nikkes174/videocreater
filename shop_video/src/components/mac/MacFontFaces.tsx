import React from "react";
import { staticFile } from "remotion";

export const MacFontFaces: React.FC = () => <style>{`
  @font-face { font-family: Manrope; src: url("${staticFile("assets/fonts/manrope-500-cyrillic.woff2")}") format("woff2"); font-style: normal; font-weight: 400 600; unicode-range: U+0400-052F, U+2000-206F; }
  @font-face { font-family: Manrope; src: url("${staticFile("assets/fonts/manrope-500-latin.woff2")}") format("woff2"); font-style: normal; font-weight: 400 600; unicode-range: U+0000-00FF; }
  @font-face { font-family: Manrope; src: url("${staticFile("assets/fonts/manrope-800-cyrillic.woff2")}") format("woff2"); font-style: normal; font-weight: 700 900; unicode-range: U+0400-052F, U+2000-206F; }
  @font-face { font-family: Manrope; src: url("${staticFile("assets/fonts/manrope-800-latin.woff2")}") format("woff2"); font-style: normal; font-weight: 700 900; unicode-range: U+0000-00FF; }
`}</style>;
