import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { creditWallet: true, subscriptions: { where: { status: 'ACTIVE' } } } });
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role, credits: user.creditWallet?.balance || 0, plan: user.subscriptions[0]?.plan || 'FREE' };
  }
}