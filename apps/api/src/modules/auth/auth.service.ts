import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(email: string, name: string, password: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new BadRequestException('Email ya registrado');
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: {
        email, name, passwordHash,
        creditWallet: { create: { balance: parseInt(process.env.CREDITS_FREE_INITIAL || '3') } }
      }
    });
    return this.generateTokens(user.id, user.email, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    if (user.status === 'BLOCKED') throw new ForbiddenException('Usuario bloqueado');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    return this.generateTokens(user.id, user.email, user.role);
  }

  async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
    const refreshTokenRaw = crypto.randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(refreshTokenRaw);
    const expiresAt = new Date(Date.now() + 7*24*60*60*1000);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt }
    });

    return { accessToken, refreshToken: refreshTokenRaw, user: { id: userId, email, role } };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    // ROTATION: revoke old, create new
    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user || user.status === 'BLOCKED') throw new ForbiddenException('Usuario bloqueado');
    return this.generateTokens(user.id, user.email, user.role);
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });
    return { ok: true };
  }

  async forgotPassword(email: string) {
    // No revelar si existe o no (seguridad)
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { ok: true };
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(resetToken);
    await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60*60*1000) }
    });
    console.log(`[VENDIX] Reset link for ${email}: ${process.env.WEB_URL}/reset-password?token=${resetToken}`);
    // Aquí se enviaría email con Nodemailer/Resend
    return { ok: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashToken(token);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) throw new BadRequestException('Token inválido o expirado');
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: stored.userId }, data: { passwordHash } }),
      this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } }),
      this.prisma.refreshToken.deleteMany({ where: { userId: stored.userId } }) // logout all
    ]);
    return { ok: true };
  }
}