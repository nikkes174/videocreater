export const FINAL_MONTAGE_CLIPS = [
  { file: "first_cadr_vertical.mp4", frames: 150 },
  { file: "first_v2_cadr_vertical.mp4", frames: 210 },
  { file: "three_cadr_vertical.mp4", frames: 165 },
  { file: "two_cadr_vertical.mp4", frames: 172 },
  { file: "five_cadr_vertical.mp4", frames: 225 },
  { file: "four_cadr_vertical.mp4", frames: 180 },
  { file: "end_cadr_vertical.mp4", frames: 105 },
] as const;

export const FINAL_MONTAGE_TRANSITIONS = [
  { frames: 12, style: "light-sweep-left", label: "Световой проход слева направо" },
  { frames: 12, style: "depth-iris", label: "Раскрытие через глубину" },
  { frames: 10, style: "spotlight-lift", label: "Подъём света к карточке" },
  { frames: 10, style: "angled-sweep", label: "Диагональный световой переход" },
  { frames: 10, style: "soft-dissolve", label: "Мягкое растворение в сцену поддержки" },
  { frames: 8, style: "silver-radial", label: "Серебристо-бирюзовое раскрытие логотипа" },
] as const;

export type FinalMontageTransition = (typeof FINAL_MONTAGE_TRANSITIONS)[number];

export const FINAL_MONTAGE_CLIP_STARTS = FINAL_MONTAGE_CLIPS.reduce<number[]>(
  (starts, clip, index) => {
    if (index === 0) {
      starts.push(0);
      return starts;
    }

    const previous = FINAL_MONTAGE_CLIPS[index - 1];
    const transition = FINAL_MONTAGE_TRANSITIONS[index - 1];
    starts.push(starts[index - 1] + previous.frames + transition.frames);
    return starts;
  },
  [],
);

export const FINAL_MONTAGE_TRANSITION_STARTS = FINAL_MONTAGE_CLIP_STARTS.slice(1).map(
  (clipStart, index) => clipStart - FINAL_MONTAGE_TRANSITIONS[index].frames,
);

export const FINAL_MONTAGE_FPS = 30;
export const FINAL_MONTAGE_WIDTH = 1080;
export const FINAL_MONTAGE_HEIGHT = 1920;
export const FINAL_MONTAGE_DURATION_IN_FRAMES =
  FINAL_MONTAGE_CLIP_STARTS.at(-1)! + FINAL_MONTAGE_CLIPS.at(-1)!.frames;

export const getTransitionPreviewDuration = (transitionIndex: number): number =>
  60 + FINAL_MONTAGE_TRANSITIONS[transitionIndex].frames;
