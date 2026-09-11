# Tests VENDIX

## Tests críticos (8)

1. Usuario no usa créditos de otro
2. Saldo nunca negativo (FOR UPDATE + Serializable)
3. Webhook duplicado no duplica créditos (unique externalPaymentId + reference)
4. Pago fallido no concede créditos (solo COMPLETED)
5. Usuario bloqueado no puede usar API
6. Usuario no accede a productos de otro (filter userId)
7. Secretos nunca en frontend
8. Operación IA fallida devuelve créditos

## Ejecutar

```bash
cd apps/api
npm install jest ts-jest @types/jest -D
npx jest test/critical.test.ts --verbose
npx jest --coverage
```

## Cobertura esperada

- auth.service: refresh rotation, block
- credits.service: reserve, refund, idempotencia
- products.service: ownership check
- payments.service: idempotencia webhook
- ai.service: refund en catch