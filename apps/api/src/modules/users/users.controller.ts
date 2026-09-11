import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}
  @UseGuards(JwtAuthGuard)
  @Get('me') me(@Req() req: any) { return this.users.me(req.user.id); }
}