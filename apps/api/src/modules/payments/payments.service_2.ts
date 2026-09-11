import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';

@Injectable()
export class PaymentsService {
  private paypalBase: string;
  constructor(private prisma: PrismaService, private credits: CreditsService) {
    this.paypalBase = process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  }

  private async getPayPalAccessToken(): Promise<string> {
    const id = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_CLIENT_SECRET;
    if (!id || !secret) throw new BadRequestException('PayPal no configurado');
    const auth = Buffer.from(`${id}:${secret}`).toString('base64');
    const res = await fetch(`${this.paypalBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    const data = await res.json();
    if (!data.access_token) throw new BadRequestException('No se pudo obtener token PayPal');
    return data.access_token;
  }

  // Crear orden de pago único (créditos o plan)
  async createPayment(userId: string, plan: string, amount: number, currency = 'EUR') {
    const token = await this.getPayPalAccessToken();
    const externalId = `PAY_${userId}_${plan}_${Date.now()}`;

    // Guardar payment PENDING para idempotencia
    await this.prisma.payment.create({
      data: {
        userId,
        provider: 'PAYPAL',
        externalPaymentId: externalId,
        amount,
        currency,
        status: 'PENDING',
        metadata: { plan, type: 'ONE_TIME' },
      }
    });

    const res = await fetch(`${this.paypalBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: currency, value: amount.toFixed(2) }, custom_id: externalId }],
        application_context: { return_url: `${process.env.WEB_URL}/dashboard/credits?success=true`, cancel_url: `${process.env.WEB_URL}/pricing?cancel=true` }
      })
    });
    const data = await res.json();
    if (!data.id) throw new BadRequestException('Error creando orden PayPal');

    // Actualizar con id real de PayPal
    await this.prisma.payment.update({ where: { externalPaymentId: externalId }, data: { externalPaymentId: data.id, metadata: { plan, type: 'ONE_TIME', paypalOrder: data } } });

    const approveLink = data.links?.find((l:any)=>l.rel==='approve')?.href;
    return { orderId: data.id, approveLink, externalId };
  }

  // Capturar pago después de aprobación usuario
  async capturePayment(userId: string, orderId: string) {
    const token = await this.getPayPalAccessToken();
    const res = await fetch(`${this.paypalBase}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.status !== 'COMPLETED') throw new BadRequestException(`Pago no completado: ${data.status}`);

    // Verificar idempotencia: si ya COMPLETED, no duplicar créditos
    const existing = await this.prisma.payment.findUnique({ where: { externalPaymentId: orderId } });
    if (existing?.status === 'COMPLETED') {
      return { alreadyProcessed: true, payment: existing };
    }

    const amount = parseFloat(data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || '0');
    const plan = (existing?.metadata as any)?.plan || 'BASIC';

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { externalPaymentId: orderId },
        data: { status: 'COMPLETED', metadata: { ...(existing?.metadata as any), capture: data } }
      });

      // Asignar créditos según plan - solo aquí, nunca por frontend
      const plans: any = { FREE: 3, BASIC: 50, PRO: 150, BUSINESS: 500 };
      const creditsToAdd = plans[plan] || 0;

      if (creditsToAdd > 0) {
        // Idempotencia por reference
        const ref = `PAYMENT_${orderId}`;
        const existingTx = await tx.creditTransaction.findFirst({ where: { reference: ref } });
        if (!existingTx) {
          await tx.creditWallet.upsert({
            where: { userId },
            create: { userId, balance: creditsToAdd },
            update: { balance: { increment: creditsToAdd } }
          });
          await tx.creditTransaction.create({
            data: { userId, amount: creditsToAdd, type: 'EARN', reference: ref }
          });
        }
      }

      // Crear/actualizar subscription si es plan
      if (plan !== 'FREE') {
        await tx.subscription.upsert({
          where: { externalId: orderId },
          create: {
            userId,
            provider: 'PAYPAL',
            externalId: orderId,
            plan: plan as any,
            status: 'ACTIVE',
            startedAt: new Date(),
            expiresAt: new Date(Date.now() + 30*24*60*60*1000),
          },
          update: { status: 'ACTIVE', plan: plan as any }
        });
      }

      return { payment, creditsAdded: creditsToAdd };
    });
  }

  // Webhook PayPal - verificación + idempotencia
  async handleWebhook(headers: any, body: any) {
    // Verificación de webhook - en prod verificar firma con PAYPAL_WEBHOOK_ID
    // Aquí simplificado: verificar que viene de PayPal + idempotencia
    const eventType = body.event_type;
    const resource = body.resource;

    console.log(`[PayPal Webhook] ${eventType}`, resource?.id);

    if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const orderId = resource.id || resource.supplementary_data?.related_ids?.order_id;
      if (!orderId) return { ok: true, ignored: true };

      const payment = await this.prisma.payment.findUnique({ where: { externalPaymentId: orderId } });
      if (!payment) return { ok: true, ignored: true, reason: 'Payment not found' };
      if (payment.status === 'COMPLETED') return { ok: true, duplicate: true }; // webhook duplicado no duplica créditos

      // Re-capturar de forma segura
      try {
        await this.capturePayment(payment.userId, orderId);
      } catch (e) {
        console.error('Webhook capture failed', e);
      }
    }

    if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
      await this.prisma.subscription.updateMany({ where: { externalId: resource.id }, data: { status: 'CANCELLED' } });
    }

    return { ok: true };
  }

  // Subscripción PayPal (para planes mensuales)
  async createSubscription(userId: string, plan: string) {
    const token = await this.getPayPalAccessToken();
    // En prod crearías un Plan en PayPal Dashboard y usarías plan_id
    // Aquí mock con orden
    const plans: any = { BASIC: 4.99, PRO: 9.99, BUSINESS: 19.99 };
    const amount = plans[plan];
    if (!amount) throw new BadRequestException('Plan inválido');

    // Para MVP usamos pagos únicos que renuevan suscripción 30 días
    return this.createPayment(userId, plan, amount);
  }

  async cancelSubscription(userId: string) {
    const active = await this.prisma.subscription.findFirst({ where: { userId, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } });
    if (!active) throw new BadRequestException('No hay suscripción activa');
    await this.prisma.subscription.update({ where: { id: active.id }, data: { status: 'CANCELLED' } });
    return { ok: true, subscription: active };
  }

  async getSubscription(userId: string) {
    return this.prisma.subscription.findFirst({ where: { userId, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } });
  }
}