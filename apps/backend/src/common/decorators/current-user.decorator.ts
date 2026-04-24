import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUser {
  sub: number;
  email: string;
  role: string;
  tokenVersion: number;
  jti?: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthUser | undefined;
  },
);
