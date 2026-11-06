export const BLACKPHANTOM_SERVICES = [
  { id: "web", number: "01", eyebrow: "WEB DEVELOPMENT", title: "Веб-разработка", description: "Создаём сайты и цифровые платформы, которые привлекают клиентов, автоматизируют процессы и усиливают бренд." },
  { id: "automation", number: "02", eyebrow: "AI & AUTOMATION", title: "Мессенджеры и автоматизация", description: "Разрабатываем мессенджер-платформы и AI-ассистентов, которые выстраивают воронки, обрабатывают заявки и усиливают клиентский сервис." },
  { id: "commerce", number: "03", eyebrow: "E-COMMERCE", title: "Интернет-магазины", description: "eCommerce-решения под ключ — от каталога и оплаты до автоматизации заказов и масштабирования продаж." },
  { id: "software", number: "04", eyebrow: "SOFTWARE ENGINEERING", title: "Разработка ПО", description: "Создаём кастомные IT-решения и SaaS-платформы для автоматизации, масштабирования и цифровой трансформации бизнеса." },
] as const;

export type BlackPhantomService = (typeof BLACKPHANTOM_SERVICES)[number];
