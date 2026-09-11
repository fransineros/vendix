export const getCreditCosts = async (prisma: any) => {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { key: 'CREDIT_COSTS' } });
    return config?.value || { ANALYZE: 1, DESCRIPTION: 1, HASHTAGS: 1, IMAGE_PROCESS: 2, IMAGE_GENERATE: 3, COMMERCIAL_CONTENT: 1 };
  } catch {
    return { ANALYZE: 1, DESCRIPTION: 1, HASHTAGS: 1, IMAGE_PROCESS: 2, IMAGE_GENERATE: 3, COMMERCIAL_CONTENT: 1 };
  }
};

export const getPlans = async (prisma: any) => {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { key: 'PLANS' } });
    return config?.value;
  } catch {
    return null;
  }
};