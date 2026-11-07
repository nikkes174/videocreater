import { Easing, interpolate } from "remotion";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const easeOut = Easing.out(Easing.cubic);
const easeInOut = Easing.inOut(Easing.cubic);

export const getServiceCamera = (frame: number) => {
  const cutIndex = frame < 32 ? 0 : frame < 56 ? 1 : 2;
  const cutStart = cutIndex === 0 ? 0 : [32, 56][cutIndex - 1];
  const local = frame - cutStart;
  const settle = interpolate(local, [0, 6], [0, 1], { ...clamp, easing: easeOut });
  const pullback = interpolate(frame, [76, 94], [0, 1], { ...clamp, easing: easeInOut });
  const baseScale = [1, 1.12, 1.22][cutIndex];
  const cutScale = baseScale * (1.03 - 0.03 * settle);
  return {
    scale: cutScale + (1 - cutScale) * pullback,
    translateY: -12 * (1 - settle) * (1 - pullback),
    cutIndex,
    local,
  };
};

export const getServiceFlash = (frame: number, first: boolean) => {
  const starts = first ? [32, 56] : [0, 32, 56];
  return starts.reduce((maximum, start) => {
    const value = frame >= start && frame <= start + 4
      ? interpolate(frame - start, [0, 4], [0.78, 0], { ...clamp, easing: easeOut })
      : 0;
    return Math.max(maximum, value);
  }, 0);
};
