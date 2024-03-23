import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminGuard implements CanActivate {
  @Inject(Reflector)
  private reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requireAdmin = this.reflector.get(
      'requireAdmin',
      context.getHandler(),
    );

    if (!requireAdmin) {
      return true;
    }

    const request = context.switchToHttp().getRequest<
      Request & {
        user: { isAdmin: boolean };
      }
    >();

    const { isAdmin } = request.user;

    if (isAdmin) {
      return true;
    }

    throw new UnauthorizedException('无权限');
  }
}
