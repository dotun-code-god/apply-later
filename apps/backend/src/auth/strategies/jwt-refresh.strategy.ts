import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request & { cookies?: Record<string, string>; body?: { refreshToken?: string } }) =>
          request?.cookies?.refresh_token ?? request?.body?.refreshToken,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
      passReqToCallback: true,
    });
  }

  validate(
    request: Request & { cookies?: Record<string, string>; body?: { refreshToken?: string } },
    payload: {
      sub: number;
      email: string;
      role: string;
      tokenVersion: number;
      jti: string;
      type: 'refresh';
    },
  ) {
    const refreshToken =
      request?.cookies?.refresh_token ??
      request?.body?.refreshToken ??
      ExtractJwt.fromAuthHeaderAsBearerToken()(request as never);

    return {
      ...payload,
      refreshToken,
    };
  }
}
