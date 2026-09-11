import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreditsService } from './credits.service';

@Controller('credits')
@UseGuards(JwtAuthGuard)
export class CreditsController {
  constructor(private credits: CreditsService) {}

  @Get()
  async getWallet(@Req() req: any) {
    const wallet = await this.credits.getWallet(req.user.id);
    return { balance: wallet.balance, userId: req.user.id };
  }

  @Get('history')
  async getHistory(@Req() req: any, @Query('limit') limit?: string) {
    const l = limit ? parseInt(limit) : 50;
    return this.credits.getHistory(req.user.id, l);
  }
}