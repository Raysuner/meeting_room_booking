import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(Reflector)
  private reflector: Reflector;

  @Inject(JwtService)
  private jwtService: JwtService;
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requireLogin = this.reflector.get(
      'requireLogin',
      context.getHandler(),
    );
    if (!requireLogin) {
      return true;
    }

    const request = context.switchToHttp().getRequest<
      Request & {
        user: any;
      }
    >();
    const { authorization = '' } = request.headers;
    if (!authorization) {
      throw new UnauthorizedException('未登录');
    }

    try {
      const token = authorization.split(' ')[1];
      const user = this.jwtService.verify(token);
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('无效token');
    }
  }
}
