import { Debug } from '@/common/utils/debug';
import { ConfigService } from '@nestjs/config';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
// import * as Sentry from '@sentry/nestjs';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not configured');
    }

    super({
      adapter: new PrismaPg({ connectionString: databaseUrl }),
    });
  }

  async onModuleInit() {
    try {
      this.$on('error' as never, (error) => {
        Debug.error('Database connection error', error);
        // Sentry.captureException(error);
      });
      await this.$connect();
      Debug.info('Database connected successfully');
    } catch (error) {
      Debug.error('Error connecting to database');
      // Sentry.captureException(error);
      return null;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    Debug.warn('Database disconnected successfully');
  }
}
