export const BLACKPHANTOM_SERVICES = [
  { id: "web", number: "01", title: "Веб-разработка", description: "Создаём сайты и цифровые платформы, которые привлекают клиентов, автоматизируют процессы и усиливают бренд." },
  { id: "automation", number: "02", title: "Мессенджеры и автоматизация", description: "Разрабатываем мессенджер-платформы и AI-ассистентов, которые выстраивают воронки, обрабатывают заявки и усиливают клиентский сервис." },
  { id: "commerce", number: "03", title: "Интернет-магазины", description: "eCommerce-решения под ключ — от каталога и оплаты до автоматизации заказов и масштабирования продаж." },
  { id: "software", number: "04", title: "Разработка ПО", description: "Создаём кастомные IT-решения и SaaS-платформы для автоматизации, масштабирования и цифровой трансформации бизнеса." },
] as const;

export type BlackPhantomService = (typeof BLACKPHANTOM_SERVICES)[number];
