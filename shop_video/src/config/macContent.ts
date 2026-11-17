export const MAC_STATEMENTS = ["Сильная команда", "Сложные задачи", "Надёжный результат"] as const;

export const MAC_SERVICES = [
  { id: "ventilated-facade", title: "Устройство вентилируемого фасада", icon: "facade" },
  { id: "facade-glazing", title: "Фасадное остекление", icon: "glazing" },
  { id: "stained-glass", title: "Тёплые витражи", description: "Внутренние (тамбурные) витражи", icon: "stained" },
  { id: "demolition", title: "Демонтажные работы старого фасада", icon: "demolition" },
] as const;

export const MAC_ADVANTAGES = [
  { id: "quality", text: "Высокое качество выполнения работ", accent: "качество", frames: 120 },
  { id: "complexity", text: "Сложные объекты и нестандартные решения", accent: "нестандартные", frames: 120 },
  { id: "warranty", text: "Гарантийное и постгарантийное обслуживание", accent: "Гарантийное", frames: 135 },
  { id: "cooperation", text: "Приглашаем вашу компанию к взаимовыгодному сотрудничеству", accent: "сотрудничеству", frames: 165 },
] as const;
