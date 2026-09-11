import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private roles: string[]) {}
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    return this.roles.includes(req.user?.role);
  }
}