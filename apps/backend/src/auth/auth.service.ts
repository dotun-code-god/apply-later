import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { SignupDto } from '@/auth/dto/signup.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { ForgotPasswordDto } from '@/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '@/auth/dto/reset-password.dto';
import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { EmailService } from '@/email/email.service';
import { GoogleIdentityDto } from '@/auth/dto/google-identity.dto';
import { OAuth2Client } from 'google-auth-library';

interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

interface JwtRefreshPayload {
  sub: number;
  email: string;
  role: string;
  tokenVersion: number;
  jti: string;
  type: 'refresh';
}

type UserTokenPayload = {
  id: number;
  email: string;
  role: string;
  tokenVersion: number;
};

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID') ?? '',
    );
  }

  private accessTtl(): string {
    return this.configService.get<string>('JWT_EXPIRATION') ?? '15m';
  }

  private refreshTtl(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRATION') ?? '7d';
  }

  private parseTtlSeconds(ttl: string): number {
    const trimmed = ttl.trim();
    const value = Number.parseInt(trimmed, 10);
    if (trimmed.endsWith('d')) return value * 24 * 60 * 60;
    if (trimmed.endsWith('h')) return value * 60 * 60;
    if (trimmed.endsWith('m')) return value * 60;
    if (trimmed.endsWith('s')) return value;
    return Number.isFinite(value) ? value : 60 * 60 * 24 * 7;
  }

  private async hashToken(rawToken: string): Promise<string> {
    return argon2.hash(rawToken);
  }

  private async generateOpaqueToken(): Promise<string> {
    return randomBytes(48).toString('hex');
  }

  private verificationUrl(token: string): string {
    const frontend =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    return `${frontend}/verify-email?token=${encodeURIComponent(token)}`;
  }

  private resetUrl(token: string): string {
    const frontend =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    return `${frontend}/reset-password?token=${encodeURIComponent(token)}`;
  }

  private async createRefreshSession(
    user: UserTokenPayload,
    meta?: RequestMeta,
  ) {
    const jti = randomBytes(16).toString('hex');
    const expiresInSeconds = this.parseTtlSeconds(this.refreshTtl());
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion,
        jti,
        type: 'refresh',
      },
      {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ??
          'dev-refresh-secret',
        expiresIn: expiresInSeconds,
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        jti,
        tokenHash: await this.hashToken(refreshToken),
        expiresAt: new Date(
          Date.now() + expiresInSeconds * 1000,
        ),
        userId: user.id,
        userAgent: meta?.userAgent,
        ipAddress: meta?.ipAddress,
      },
    });

    return refreshToken;
  }

  private async createAccessToken(user: UserTokenPayload) {
    const expiresInSeconds = this.parseTtlSeconds(this.accessTtl());
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET') ?? 'dev-access-secret',
        expiresIn: expiresInSeconds,
      },
    );
  }

  private sanitizeUser(user: {
    id: number;
    email: string;
    name: string | null;
    role: string;
    emailVerifiedAt: Date | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: !!user.emailVerifiedAt,
    };
  }

  async issueAuthTokens(
    user: {
      id: number;
      email: string;
      role: string;
      tokenVersion: number;
      name: string | null;
      emailVerifiedAt: Date | null;
    },
    meta?: RequestMeta,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user),
      this.createRefreshSession(user, meta),
    ]);

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async signup(dto: SignupDto, meta?: RequestMeta) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });

    if (existing && existing.passwordHash) {
      throw new BadRequestException('Email is already registered');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user =
      existing == null
        ? await this.prisma.user.create({
            data: {
              email,
              name: dto.name?.trim() || null,
              passwordHash,
            },
          })
        : await this.prisma.user.update({
            where: { id: existing.id },
            data: {
              name: dto.name?.trim() || existing.name,
              passwordHash,
            },
          });

    await this.createEmailVerificationToken(user.id, user.email);
    await this.emailService.sendWelcomeEmail(user.email, user.name ?? undefined);

    return this.issueAuthTokens(user, meta);
  }

  async login(dto: LoginDto, meta?: RequestMeta) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const requireEmailVerification =
      (this.configService.get<string>('AUTH_REQUIRE_EMAIL_VERIFIED') ?? 'true') ===
      'true';
    if (requireEmailVerification && !user.emailVerifiedAt) {
      throw new ForbiddenException('Please verify your email before logging in');
    }

    return this.issueAuthTokens(user, meta);
  }

  async refreshTokens(payload: JwtRefreshPayload, rawRefreshToken: string, meta?: RequestMeta) {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Session is no longer valid');
    }

    const storedSession = await this.prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
    });

    if (!storedSession) {
      throw new UnauthorizedException('Refresh token session not found');
    }

    if (storedSession.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token replay detected');
    }

    if (storedSession.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const tokenMatches = await argon2.verify(storedSession.tokenHash, rawRefreshToken);
    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newTokenBundle = await this.issueAuthTokens(user, meta);
    const newPayload = this.jwtService.decode(newTokenBundle.refreshToken) as {
      jti: string;
    };

    await this.prisma.refreshToken.update({
      where: { id: storedSession.id },
      data: {
        revokedAt: new Date(),
        replacedByJti: newPayload?.jti,
      },
    });

    return newTokenBundle;
  }

  async logout(userId: number, refreshToken?: string) {
    if (!refreshToken) {
      return;
    }

    const decoded = this.jwtService.decode(refreshToken) as { jti?: string } | null;
    if (!decoded?.jti) {
      return;
    }

    await this.prisma.refreshToken.updateMany({
      where: { userId, jti: decoded.jti, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.sanitizeUser(user);
  }

  async createEmailVerificationToken(userId: number, email: string): Promise<void> {
    const rawToken = await this.generateOpaqueToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: await this.hashToken(rawToken),
        expiresAt,
      },
    });

    await this.emailService.sendVerificationEmail(email, this.verificationUrl(rawToken));
  }

  async resendVerification(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.emailVerifiedAt) {
      return;
    }
    await this.createEmailVerificationToken(user.id, user.email);
  }

  async verifyEmail(token: string): Promise<{ verified: boolean }> {
    const activeTokens = await this.prisma.emailVerificationToken.findMany({
      where: {
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    for (const candidate of activeTokens) {
      const valid = await argon2.verify(candidate.tokenHash, token);
      if (!valid) continue;

      await this.prisma.$transaction([
        this.prisma.emailVerificationToken.update({
          where: { id: candidate.id },
          data: { consumedAt: new Date() },
        }),
        this.prisma.user.update({
          where: { id: candidate.userId },
          data: { emailVerifiedAt: new Date() },
        }),
      ]);

      return { verified: true };
    }

    throw new BadRequestException('Invalid or expired verification token');
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ ok: true }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      return { ok: true };
    }

    const rawToken = await this.generateOpaqueToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: await this.hashToken(rawToken),
        expiresAt,
      },
    });

    await this.emailService.sendPasswordResetEmail(user.email, this.resetUrl(rawToken));
    return { ok: true };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ ok: true }> {
    const activeTokens = await this.prisma.passwordResetToken.findMany({
      where: {
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    for (const candidate of activeTokens) {
      const valid = await argon2.verify(candidate.tokenHash, dto.token);
      if (!valid) continue;

      await this.prisma.$transaction([
        this.prisma.passwordResetToken.update({
          where: { id: candidate.id },
          data: { consumedAt: new Date() },
        }),
        this.prisma.user.update({
          where: { id: candidate.userId },
          data: {
            passwordHash: await argon2.hash(dto.newPassword),
            tokenVersion: { increment: 1 },
          },
        }),
        this.prisma.refreshToken.updateMany({
          where: { userId: candidate.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        }),
      ]);

      return { ok: true };
    }

    throw new BadRequestException('Invalid or expired reset token');
  }

  async loginWithGoogleOAuth(profile: {
    email?: string;
    googleId: string;
    name?: string;
  }, meta?: RequestMeta) {
    if (!profile.email) {
      throw new UnauthorizedException('Google account does not provide an email');
    }

    const email = profile.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });

    const user =
      existing == null
        ? await this.prisma.user.create({
            data: {
              email,
              name: profile.name ?? null,
              googleId: profile.googleId,
              emailVerifiedAt: new Date(),
            },
          })
        : await this.prisma.user.update({
            where: { id: existing.id },
            data: {
              googleId: profile.googleId,
              name: existing.name ?? profile.name ?? null,
              emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
            },
          });

    return this.issueAuthTokens(user, meta);
  }

  async loginWithGoogleIdentity(dto: GoogleIdentityDto, meta?: RequestMeta) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException('Google client ID is not configured');
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken: dto.credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.sub) {
      throw new UnauthorizedException('Invalid Google identity token');
    }

    return this.loginWithGoogleOAuth(
      {
        email: payload.email,
        googleId: payload.sub,
        name: payload.name,
      },
      meta,
    );
  }
}
