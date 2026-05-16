import { Injectable, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  async canActivate(context: any) {
    const isAuth = await super.canActivate(context);
    if (!isAuth) return false;
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return user && user.role === 'ADMIN';
  }
}
