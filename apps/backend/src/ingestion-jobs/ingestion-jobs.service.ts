import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class IngestionJobsService {
  constructor(private readonly prisma: PrismaService) {}

  async getJobById(userId: number, jobId: string) {
    const job = await this.prisma.ingestionJob.findFirst({
      where: {
        id: jobId,
        userId,
      },
      include: {
        opportunity: true,
        extractionResults: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Ingestion job not found');
    }

    return {
      id: job.id,
      status: job.status,
      sourceUrl: job.sourceUrl,
      normalizedSourceUrl: job.normalizedSourceUrl,
      canonicalUrl: job.canonicalUrl,
      errorMessage: job.errorMessage,
      mode: job.mode,
      metadata: job.metadata,
      completedAt: job.completedAt,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      opportunity: job.opportunity,
      extractionResults: job.extractionResults,
    };
  }
}
