import { Controller, Post, Get, Body, UseGuards, Req, Headers } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('payments/paypal/create')
  create(@Req() req: any, @Body() body: { plan: string; amount?: number }) {
    const plans: any = { FREE: 0, BASIC: 4.99, PRO: 9.99, BUSINESS: 19.99 };
    const amount = body.amount || plans[body.plan] || 4.99;
    return this.payments.createPayment(req.user.id, body.plan, amount);
  }

  @UseGuards(JwtAuthGuard)
  @Post('payments/paypal/capture')
  capture(@Req() req: any, @Body() body: { orderId: string }) {
    return this.payments.capturePayment(req.user.id, body.orderId);
  }

  @Post('payments/paypal/webhook')
  async webhook(@Headers() headers: any, @Body() body: any) {
    // Webhook NO lleva JWT, se verifica por firma PayPal
    return this.payments.handleWebhook(headers, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  getSub(@Req() req: any) {
    return this.payments.getSubscription(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscription/cancel')
  cancel(@Req() req: any) {
    return this.payments.cancelSubscription(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('plans')
  getPlans() {
    return {
      FREE: { price: 0, credits: 3 },
      BASIC: { price: 4.99, credits: 50 },
      PRO: { price: 9.99, credits: 150 },
      BUSINESS: { price: 19.99, credits: 500 },
    };
  }
}