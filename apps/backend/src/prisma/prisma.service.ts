import { Debug } from '@/common/utils/debug';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
// import * as Sentry from '@sentry/nestjs';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter,
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
