export const PLANS = {
  FREE: { name: 'FREE', price: 0, credits: 3, features: ['3 créditos', 'Análisis IA', 'Soporte básico'] },
  BASIC: { name: 'BASIC', price: 4.99, credits: 50, features: ['50 créditos/mes', 'Todo FREE', 'Procesado imagen'] },
  PRO: { name: 'PRO', price: 9.99, credits: 150, features: ['150 créditos/mes', 'Todo BASIC', 'Prioridad IA'] },
  BUSINESS: { name: 'BUSINESS', price: 19.99, credits: 500, features: ['500 créditos/mes', 'Todo PRO', 'Soporte premium'] },
} as const;

export const CREDIT_COSTS = {
  ANALYZE: 1,
  DESCRIPTION: 1,
  HASHTAGS: 1,
  IMAGE_PROCESS: 2,
  IMAGE_GENERATE: 3,
} as const;

export type PlanName = keyof typeof PLANS;