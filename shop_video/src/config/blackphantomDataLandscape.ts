export const DATA_LANDSCAPE = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 180,

  brand: "BLACKPHANTOM",

  headline: [
    "Технологии должны",
    "работать вместе.",
  ],

  subtitle: "Объединяем сайты, продажи и автоматизацию в единую систему.",

  streams: [
    { id: "web", label: "Сайты" },
    { id: "commerce", label: "Интернет-магазины" },
    { id: "automation", label: "Автоматизация" },
    { id: "software", label: "Разработка ПО" },
    { id: "integration", label: "Интеграции" },
    { id: "support", label: "Поддержка" },
  ],
} as const;

export const DATA_LANDSCAPE_COLORS = {
  background: "#07090C",
  graphite: "#151B22",
  platinum: "#F1F2F4",
  silver: "#B6BEC8",
  gold: "#C8A66A",
  goldGlow: "rgba(200,166,106,.30)",
} as const;
