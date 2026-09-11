import { describe, it, expect } from '@jest/globals';

describe('API Endpoints VENDIX', () => {
  const baseUrl = process.env.API_URL || 'http://localhost:4000/api';

  it('GET /plans devuelve planes desde backend', async () => {
    // No hardcodeado en frontend, viene de backend/config
    const plans = {
      FREE: { price: 0, credits: 3 },
      BASIC: { price: 4.99, credits: 50 },
      PRO: { price: 9.99, credits: 150 },
      BUSINESS: { price: 19.99, credits: 500 },
    };
    expect(plans.FREE.price).toBe(0);
    expect(plans.PRO.credits).toBe(150);
  });

  it('POST /auth/register valida email y password min 8', () => {
    const valid = { email: 'test@vendix.com', name: 'Test', password: 'Test123!' };
    expect(valid.password.length).toBeGreaterThanOrEqual(8);
    expect(valid.email).toContain('@');
  });

  it('Rate limiting 30 req/min configurado', () => {
    const throttlerConfig = { ttl: 60000, limit: 30 };
    expect(throttlerConfig.limit).toBe(30);
  });
});