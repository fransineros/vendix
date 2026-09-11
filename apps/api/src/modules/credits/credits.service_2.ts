import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class CreditsService {
  constructor(private prisma: PrismaService) {}

  // Obtener wallet
  async getWallet(userId: string) {
    let wallet = await this.prisma.creditWallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await this.prisma.creditWallet.create({ data: { userId, balance: 0 } });
    }
    return wallet;
  }

  // Historial
  async getHistory(userId: string, limit = 50) {
    return this.prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * FLUJO DE CRÉDITOS ANTI-RACE CONDITION
   * 1. comprobar autenticación (se hace en guard)
   * 2. comprobar saldo
   * 3. reservar créditos (transacción con FOR UPDATE)
   * 4. ejecutar operación (fuera, lo hace el caller)
   * 5. confirmar consumo (ya descontado)
   * 6. si falla, devolver créditos
   */

  // Reserva créditos dentro de transacción con bloqueo pesimista
  async reserveCredits(userId: string, amount: number, reference: string, type: TransactionType = 'SPEND'): Promise<{ wallet: any, transaction: any }> {
    if (amount <= 0) throw new BadRequestException('Amount must be >0');

    return this.prisma.$transaction(async (tx) => {
      // Bloqueo pesimista - SELECT FOR UPDATE
      const wallet = await tx.$queryRaw<any[]>`
        SELECT * FROM credit_wallets WHERE user_id = ${userId} FOR UPDATE
      `;

      let currentWallet = wallet[0];
      if (!currentWallet) {
        currentWallet = await tx.creditWallet.create({ data: { userId, balance: 0 } });
      }

      if (currentWallet.balance < amount) {
        throw new BadRequestException(`Saldo insuficiente. Necesitas ${amount}, tienes ${currentWallet.balance}`);
      }

      // Verificar idempotencia por reference
      const existing = await tx.creditTransaction.findFirst({ where: { reference } });
      if (existing) {
        throw new BadRequestException('Operación ya procesada (idempotencia)');
      }

      // Descontar inmediatamente (reserva)
      const updatedWallet = await tx.creditWallet.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      });

      if (updatedWallet.balance < 0) {
        throw new BadRequestException('Saldo negativo no permitido');
      }

      const transaction = await tx.creditTransaction.create({
        data: { userId, amount: -amount, type, reference },
      });

      return { wallet: updatedWallet, transaction };
    }, { isolationLevel: 'Serializable' });
  }

  async confirmConsumption(userId: string, reference: string) {
    // Ya está consumido en reserva, solo log
    return this.prisma.creditTransaction.findFirst({ where: { userId, reference } });
  }

  async refundCredits(userId: string, amount: number, reference: string, reason = 'AI_FAILED') {
    return this.prisma.$transaction(async (tx) => {
      const existingRefund = await tx.creditTransaction.findFirst({ where: { reference: `REFUND_${reference}` } });
      if (existingRefund) return existingRefund; // idempotencia refund

      const wallet = await tx.creditWallet.update({
        where: { userId },
        data: { balance: { increment: amount } },
      });

      const transaction = await tx.creditTransaction.create({
        data: { userId, amount, type: 'REFUND', reference: `REFUND_${reference}` },
      });

      return { wallet, transaction };
    });
  }

  async addCredits(userId: string, amount: number, reference: string, type: TransactionType = 'EARN') {
    if (amount <= 0) throw new BadRequestException('Amount >0');
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.creditTransaction.findFirst({ where: { reference } });
      if (existing) return existing; // idempotencia - pago duplicado no duplica créditos

      const wallet = await tx.creditWallet.upsert({
        where: { userId },
        create: { userId, balance: amount },
        update: { balance: { increment: amount } },
      });

      const transaction = await tx.creditTransaction.create({
        data: { userId, amount, type, reference },
      });

      return { wallet, transaction };
    });
  }

  async adminAddCredits(userId: string, amount: number) {
    return this.addCredits(userId, amount, `ADMIN_ADD_${Date.now()}_${userId}`, 'ADMIN_ADD');
  }

  async adminRemoveCredits(userId: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const walletArr = await tx.$queryRaw<any[]>`SELECT * FROM credit_wallets WHERE user_id = ${userId} FOR UPDATE`;
      const w = walletArr[0];
      if (!w || w.balance < amount) throw new BadRequestException('No se puede dejar saldo negativo');
      const wallet = await tx.creditWallet.update({ where: { userId }, data: { balance: { decrement: amount } } });
      const transaction = await tx.creditTransaction.create({ data: { userId, amount: -amount, type: 'ADMIN_REMOVE', reference: `ADMIN_REMOVE_${Date.now()}` } });
      return { wallet, transaction };
    });
  }
}