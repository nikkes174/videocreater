export type CarouselCard = {
  id: string;
  number: string;
  category: "УСЛУГИ" | "НАШ ПОДХОД";
  title: string;
  description: string;
  icon:
    | "globe"
    | "messages"
    | "shopping-bag"
    | "layers"
    | "target"
    | "list-checks"
    | "workflow"
    | "headset";
};

export const CAROUSEL_CARDS: readonly CarouselCard[] = [
  {
    id: "web",
    number: "01",
    category: "УСЛУГИ",
    title: "Сайты",
    description: "От лендинга до полноценной платформы для бизнеса.",
    icon: "globe",
  },
  {
    id: "automation",
    number: "02",
    category: "УСЛУГИ",
    title: "Автоматизация",
    description: "Боты и AI-ассистенты берут на себя рутинные задачи.",
    icon: "messages",
  },
  {
    id: "commerce",
    number: "03",
    category: "УСЛУГИ",
    title: "Интернет-магазины",
    description: "Каталог, оплата и заказы в одной системе.",
    icon: "shopping-bag",
  },
  {
    id: "software",
    number: "04",
    category: "УСЛУГИ",
    title: "Разработка ПО",
    description: "Создаём программы под задачи вашего бизнеса.",
    icon: "layers",
  },
  {
    id: "custom",
    number: "05",
    category: "НАШ ПОДХОД",
    title: "Под вашу задачу",
    description: "Не подгоняем ваш бизнес под готовый шаблон.",
    icon: "target",
  },
  {
    id: "process",
    number: "06",
    category: "НАШ ПОДХОД",
    title: "Понятные этапы",
    description: "Вы знаете, что делаем и на каком этапе проект.",
    icon: "list-checks",
  },
  {
    id: "integration",
    number: "07",
    category: "НАШ ПОДХОД",
    title: "Интеграции",
    description: "Связываем сайт, оплату, учёт и сообщения.",
    icon: "workflow",
  },
  {
    id: "support",
    number: "08",
    category: "НАШ ПОДХОД",
    title: "После запуска",
    description: "Помогаем развивать и дорабатывать проект.",
    icon: "headset",
  },
];

export const CAROUSEL_CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
  count: 8,
  framesPerCard: 60,
  dwellFrames: 36,
  radius: 700,
  cardWidth: 340,
  cardHeight: 460,
} as const;

export const CAROUSEL_DURATION =
  CAROUSEL_CONFIG.count * CAROUSEL_CONFIG.framesPerCard;
