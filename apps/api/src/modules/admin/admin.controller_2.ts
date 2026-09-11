import { Controller, Get, Post, UseGuards, Req, Query, Param, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminService } from './admin.service';

function AdminGuard(req: any) {
  if (req.user?.role !== 'ADMIN') throw new Error('Forbidden: ADMIN only');
}

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('stats')
  stats(@Req() req: any) { AdminGuard(req); return this.admin.stats(); }

  @Get('users')
  users(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string) {
    AdminGuard(req); return this.admin.getUsers(parseInt(page||'1'), parseInt(limit||'20'), search);
  }

  @Post('users/:id/block')
  block(@Req() req: any, @Param('id') id: string) { AdminGuard(req); return this.admin.blockUser(id); }

  @Post('users/:id/unblock')
  unblock(@Req() req: any, @Param('id') id: string) { AdminGuard(req); return this.admin.unblockUser(id); }

  @Post('users/:id/credits/add')
  addCredits(@Req() req: any, @Param('id') id: string, @Body() body: { amount: number }) { AdminGuard(req); return this.admin.addCredits(id, body.amount); }

  @Post('users/:id/credits/remove')
  removeCredits(@Req() req: any, @Param('id') id: string, @Body() body: { amount: number }) { AdminGuard(req); return this.admin.removeCredits(id, body.amount); }

  @Get('payments')
  payments(@Req() req: any, @Query('page') page?: string) { AdminGuard(req); return this.admin.getPayments(parseInt(page||'1')); }

  @Get('subscriptions')
  subs(@Req() req: any, @Query('page') page?: string) { AdminGuard(req); return this.admin.getSubscriptions(parseInt(page||'1')); }

  @Get('products')
  products(@Req() req: any, @Query('page') page?: string) { AdminGuard(req); return this.admin.getProducts(parseInt(page||'1')); }

  @Get('generations')
  gens(@Req() req: any, @Query('page') page?: string, @Query('status') status?: string) { AdminGuard(req); return this.admin.getGenerations(parseInt(page||'1'), 20, status); }

  @Get('wallets')
  wallets(@Req() req: any, @Query('page') page?: string) { AdminGuard(req); return this.admin.getCreditWallets(parseInt(page||'1')); }
}