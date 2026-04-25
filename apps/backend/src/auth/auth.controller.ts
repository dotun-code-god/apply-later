import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from '@/auth/dto/verify-email.dto';
import { ForgotPasswordDto } from '@/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '@/auth/dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser, type AuthUser } from '@/common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GoogleIdentityDto } from './dto/google-identity.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private cookieConfig() {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
    };
  }

  private requestMeta(req: Request) {
    const uaHeader = req.headers['user-agent'];
    return {
      userAgent: Array.isArray(uaHeader) ? uaHeader[0] : uaHeader,
      ipAddress: req.ip,
    };
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const base = this.cookieConfig();
    res.cookie('access_token', accessToken, {
      ...base,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      ...base,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response) {
    const base = this.cookieConfig();
    res.clearCookie('access_token', base);
    res.clearCookie('refresh_token', base);
  }

  @Public()
  @Get('csrf-token')
  csrfToken(@Res({ passthrough: true }) res: Response) {
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    res.cookie('csrf_token', token, {
      ...this.cookieConfig(),
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return { csrfToken: token };
  }

  @Public()
  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async signup(
    @Body() dto: SignupDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signup(dto, this.requestMeta(req));
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, this.requestMeta(req));
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('logout')
  @UseGuards(JwtRefreshGuard)
  async logout(
    @CurrentUser() user: AuthUser,
    @Body() body: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request & { cookies?: Record<string, string> },
  ) {
    const refreshToken = body.refreshToken ?? req.cookies?.refresh_token;
    await this.authService.logout(user.sub, refreshToken);
    this.clearAuthCookies(res);
    return { ok: true };
  }

  @Public()
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async refresh(
    @CurrentUser() user: AuthUser & { refreshToken?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!user.refreshToken || !user.jti) {
      throw new UnauthorizedException('Missing refresh token context');
    }

    const result = await this.authService.refreshTokens(
      {
        sub: user.sub,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion,
        jti: user.jti,
        type: 'refresh',
      },
      user.refreshToken,
      this.requestMeta(req),
    );
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthUser) {
    const profile = await this.authService.me(user.sub);
    return { user: profile };
  }

  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  async resendVerification(@CurrentUser() user: AuthUser) {
    await this.authService.resendVerification(user.sub);
    return { ok: true };
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    return undefined;
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req() req: Request & { user?: { email?: string; googleId: string; name?: string } },
    @Res() res: Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Google authentication failed');
    }

    const result = await this.authService.loginWithGoogleOAuth(req.user, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    const frontend =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    return res.redirect(`${frontend}/dashboard`);
  }

  @Public()
  @Post('google/identity')
  async googleIdentity(
    @Body() dto: GoogleIdentityDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginWithGoogleIdentity(dto, this.requestMeta(req));
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }
}
