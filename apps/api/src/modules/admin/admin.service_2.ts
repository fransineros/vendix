import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService, private credits: CreditsService) {}

  async getUsers(page=1, limit=20, search?: string) {
    const where: any = {};
    if (search) where.OR = [{ email: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }];
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({ where, include: { creditWallet: true, subscriptions: { where: { status: 'ACTIVE' } } }, skip: (page-1)*limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count({ where })
    ]);
    return { items, total, page, limit };
  }

  async blockUser(userId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { status: 'BLOCKED' } });
  }

  async unblockUser(userId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { status: 'ACTIVE' } });
  }

  async getPayments(page=1, limit=20) {
    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({ include: { user: { select: { email: true, name: true } } }, orderBy: { createdAt: 'desc' }, skip: (page-1)*limit, take: limit }),
      this.prisma.payment.count()
    ]);
    return { items, total, page, limit };
  }

  async getSubscriptions(page=1, limit=20) {
    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({ include: { user: { select: { email: true } } }, orderBy: { createdAt: 'desc' }, skip: (page-1)*limit, take: limit }),
      this.prisma.subscription.count()
    ]);
    return { items, total, page, limit };
  }

  async getProducts(page=1, limit=20) {
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({ include: { user: { select: { email: true } }, images: true }, orderBy: { createdAt: 'desc' }, skip: (page-1)*limit, take: limit }),
      this.prisma.product.count()
    ]);
    return { items, total, page, limit };
  }

  async getGenerations(page=1, limit=20, status?: string) {
    const where: any = {};
    if (status) where.status = status;
    const [items, total] = await Promise.all([
      this.prisma.aiGeneration.findMany({ where, include: { user: { select: { email: true } }, product: { select: { title: true } } }, orderBy: { createdAt: 'desc' }, skip: (page-1)*limit, take: limit }),
      this.prisma.aiGeneration.count({ where })
    ]);
    return { items, total, page, limit };
  }

  async getCreditWallets(page=1, limit=20) {
    const [items, total] = await Promise.all([
      this.prisma.creditWallet.findMany({ include: { user: { select: { email: true, name: true } } }, orderBy: { balance: 'desc' }, skip: (page-1)*limit, take: limit }),
      this.prisma.creditWallet.count()
    ]);
    return { items, total, page, limit };
  }

  async addCredits(userId: string, amount: number) {
    return this.credits.adminAddCredits(userId, amount);
  }

  async removeCredits(userId: string, amount: number) {
    return this.credits.adminRemoveCredits(userId, amount);
  }

  async stats() {
    const [users, products, payments, revenue, generationsFailed] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      this.prisma.aiGeneration.count({ where: { status: 'FAILED' } }),
    ]);
    return { users, products, payments, revenue: revenue._sum.amount || 0, generationsFailed };
  }
}