import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  IngestionJobStatus,
  ApplicationStage,
  Prisma,
  ReminderStatus,
} from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { normalizeOpportunityUrl } from '@/common/utils/url-normalizer';
import { IntakeLinkDto } from './dto/intake-link.dto';
import {
  ApplicationFilter,
  ListApplicationsQueryDto,
} from './dto/list-applications-query.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ExtractionOrchestratorService } from '@/extraction/extraction-orchestrator.service';

const IN_PROGRESS_STAGES: Set<ApplicationStage> = new Set([
  ApplicationStage.ADDED,
  ApplicationStage.REVIEWING,
  ApplicationStage.PREPARING_DOCS,
  ApplicationStage.IN_PROGRESS,
  ApplicationStage.UNDER_REVIEW,
  ApplicationStage.INTERVIEW,
  ApplicationStage.OFFER,
]);

const COMPLETED_STAGES: Set<ApplicationStage> = new Set([ApplicationStage.SUBMITTED]);
const PARKED_STAGES: Set<ApplicationStage> = new Set([ApplicationStage.PARKED]);
const CLOSED_STAGES: Set<ApplicationStage> = new Set([
  ApplicationStage.REJECTED,
  ApplicationStage.CLOSED,
  ApplicationStage.PARKED,
]);

type PipelineStage =
  | 'QUEUED'
  | 'EXTRACTING'
  | 'NORMALIZING'
  | 'GATHERING'
  | 'SYNCING'
  | 'COMPLETED'
  | 'FAILED';

const PIPELINE_STAGE_MESSAGE: Record<PipelineStage, string> = {
  QUEUED: 'Queued for extraction',
  EXTRACTING: 'Extracting source content',
  NORMALIZING: 'Normalizing opportunity data',
  GATHERING: 'Gathering requirements and timelines',
  SYNCING: 'Syncing opportunity to your dashboard',
  COMPLETED: 'Sync complete',
  FAILED: 'Sync failed',
};

const getApplicationListInclude = (userId: number) =>
  ({
    opportunity: {
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
        ingestionJobs: {
          where: { userId },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    },
    stageEvents: {
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    },
  }) satisfies Prisma.ApplicationInclude;

type ApplicationListInclude = ReturnType<typeof getApplicationListInclude>;

type ApplicationListRecord = Prisma.ApplicationGetPayload<{
  include: ApplicationListInclude;
}>;

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly extractionOrchestrator: ExtractionOrchestratorService,
  ) {}

  private async setPipelineProgress(
    jobId: string,
    opportunityId: string | null,
    stage: PipelineStage,
    fallbackMessage?: string,
  ) {
    try {
      const existing = await this.prisma.ingestionJob.findUnique({
        where: { id: jobId },
        select: { metadata: true, status: true },
      });

      if (!existing || existing.status !== IngestionJobStatus.PENDING) {
        return;
      }

      const metadata = (existing.metadata as Record<string, unknown> | null) ?? {};
      const pipelineMessage = fallbackMessage ?? PIPELINE_STAGE_MESSAGE[stage];

      await this.prisma.ingestionJob.update({
        where: { id: jobId },
        data: {
          metadata: {
            ...metadata,
            pipelineStage: stage,
            pipelineMessage,
          },
        },
      });

      if (opportunityId) {
        await this.prisma.opportunity.update({
          where: { id: opportunityId },
          data: {
            currentStatus: pipelineMessage,
          },
        });
      }
    } catch (error) {
      this.logger.warn(
        `Failed to persist pipeline progress for ${jobId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private getPipelineState(record: ApplicationListRecord) {
    const latestJob = record.opportunity.ingestionJobs[0];
    if (!latestJob) {
      return {
        pipelineStage: null,
        pipelineMessage: null,
        isPipelineActive: false,
      };
    }

    const metadata = (latestJob.metadata as Record<string, unknown> | null) ?? {};
    const rawStage = typeof metadata.pipelineStage === 'string' ? metadata.pipelineStage : null;
    const metadataMessage =
      typeof metadata.pipelineMessage === 'string' ? metadata.pipelineMessage : null;

    if (latestJob.status === IngestionJobStatus.PENDING) {
      const pipelineStage = (rawStage as PipelineStage | null) ?? 'QUEUED';
      return {
        pipelineStage,
        pipelineMessage: metadataMessage ?? PIPELINE_STAGE_MESSAGE[pipelineStage],
        isPipelineActive: true,
      };
    }

    if (latestJob.status === IngestionJobStatus.FAILED) {
      return {
        pipelineStage: 'FAILED' as const,
        pipelineMessage: latestJob.errorMessage ?? metadataMessage ?? PIPELINE_STAGE_MESSAGE.FAILED,
        isPipelineActive: false,
      };
    }

    return {
      pipelineStage: 'COMPLETED' as const,
      pipelineMessage: metadataMessage ?? PIPELINE_STAGE_MESSAGE.COMPLETED,
      isPipelineActive: false,
    };
  }

  private async processIngestionJob(jobId: string, userId: number) {
    try {
      const job = await this.prisma.ingestionJob.findFirst({
        where: {
          id: jobId,
          userId,
          status: IngestionJobStatus.PENDING,
        },
        include: { opportunity: true },
      });

      if (!job || !job.opportunityId) {
        this.logger.warn(`processIngestionJob: job ${jobId} not found or missing opportunityId`);
        return;
      }

      await this.setPipelineProgress(job.id, job.opportunityId, 'EXTRACTING');

      // ── Run full layered extraction pipeline ─────────────────────────
      const result = await this.extractionOrchestrator.extract({
        jobId: job.id,
        opportunityId: job.opportunityId,
        sourceUrl: job.sourceUrl,
        canonicalUrl: job.canonicalUrl,
        onProgress: async (stage) => {
          if (stage === 'extracting') {
            await this.setPipelineProgress(job.id, job.opportunityId, 'EXTRACTING');
            return;
          }

          await this.setPipelineProgress(job.id, job.opportunityId, 'NORMALIZING');
        },
      });

      await this.setPipelineProgress(job.id, job.opportunityId, 'GATHERING');

      const { payload, evidence, confidenceScore, needsUserReview, extractionMethod } = result;
      const ci = payload.coreIdentity;
      const ov = payload.overview;
      const tl = payload.timelines;

      await this.setPipelineProgress(job.id, job.opportunityId, 'SYNCING');

      // ── Persist results in a single transaction ───────────────────────
      await this.prisma.$transaction(async (tx) => {
        await tx.extractionResult.create({
          data: {
            ingestionJobId: job.id,
            opportunityId: job.opportunityId ?? undefined,
            provider: extractionMethod.includes('ai') ? 'anthropic' : 'builtin',
            extractionMethod,
            confidenceScore,
            needsUserReview,
            payload: payload as unknown as Prisma.InputJsonValue,
            evidence: evidence as unknown as Prisma.InputJsonValue,
          },
        });
        await tx.opportunity.update({
          where: { id: job.opportunityId! },
          data: {
            title: ci.title ?? job.opportunity?.title ?? null,
            organizationName: ci.organizationName ?? job.opportunity?.organizationName ?? null,
            category: ci.category ?? job.opportunity?.category ?? null,
            applicationUrl: ci.applicationUrl ?? job.opportunity?.applicationUrl ?? null,
            summary: ov.summary ?? job.opportunity?.summary ?? null,
            description: ov.description ?? job.opportunity?.description ?? null,
            amount: ov.amount ?? job.opportunity?.amount ?? null,
            location: ov.location ?? job.opportunity?.location ?? null,
            openDate: tl.openDate ? new Date(tl.openDate) : job.opportunity?.openDate ?? null,
            deadline: tl.deadline ? new Date(tl.deadline) : job.opportunity?.deadline ?? null,
            responseDate: tl.responseDate ? new Date(tl.responseDate) : job.opportunity?.responseDate ?? null,
            currentStatus: tl.currentStatus ?? job.opportunity?.currentStatus ?? null,
            confidenceScore,
            needsUserReview,
          },
        });

        await tx.ingestionJob.update({
          where: { id: job.id },
          data: {
            status: needsUserReview
              ? IngestionJobStatus.PARTIALLY_COMPLETED
              : IngestionJobStatus.COMPLETED,
            completedAt: new Date(),
            metadata: {
              ...(job.metadata as Record<string, unknown> | null),
              extractionMethod,
              linkType: ci.linkType,
              confidence: confidenceScore,
              needsUserReview,
              pipelineStage: 'COMPLETED',
              pipelineMessage: PIPELINE_STAGE_MESSAGE.COMPLETED,
            },
            errorMessage: null,
          },
        });
      });
    } catch (error) {
      this.logger.error(`processIngestionJob ${jobId} failed: ${error instanceof Error ? error.message : String(error)}`);
      await this.prisma.ingestionJob.update({
        where: { id: jobId },
        data: {
          status: IngestionJobStatus.FAILED,
          errorMessage:
            error instanceof Error ? error.message.slice(0, 300) : 'Extraction failed',
          completedAt: new Date(),
        },
      });
    }
  }

  private getCurrentStage(application: Pick<ApplicationListRecord, 'stageEvents'>) {
    return application.stageEvents[0]?.stage ?? ApplicationStage.ADDED;
  }

  private isOpenWindow(record: ApplicationListRecord, now: Date) {
    const { openDate, deadline, currentStatus } = record.opportunity;
    if (currentStatus?.toLowerCase() === 'closed') {
      return false;
    }

    if (openDate && openDate > now) {
      return false;
    }

    if (deadline && deadline < now) {
      return false;
    }

    return true;
  }

  private isClosingSoon(record: ApplicationListRecord, now: Date) {
    const deadline = record.opportunity.deadline;
    if (!deadline) {
      return false;
    }

    const diffMs = deadline.getTime() - now.getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return diffMs >= 0 && diffMs <= sevenDaysMs;
  }

  private matchesFilter(
    record: ApplicationListRecord,
    filter: ApplicationFilter,
    now: Date,
  ) {
    const stage = this.getCurrentStage(record);

    switch (filter) {
      case 'open':
        return this.isOpenWindow(record, now) && !CLOSED_STAGES.has(stage);
      case 'closing-soon':
        return this.isClosingSoon(record, now) && !CLOSED_STAGES.has(stage);
      case 'upcoming':
      case 'not-open-yet':
        return !!record.opportunity.openDate && record.opportunity.openDate > now;
      case 'in-progress':
        return IN_PROGRESS_STAGES.has(stage) && !COMPLETED_STAGES.has(stage);
      case 'completed':
        return COMPLETED_STAGES.has(stage);
      case 'parked':
        return PARKED_STAGES.has(stage);
      case 'all':
      default:
        return true;
    }
  }

  private serializeListItem(record: ApplicationListRecord) {
    const now = Date.now();
    const deadline = record.opportunity.deadline;
    const stage = this.getCurrentStage(record);
    const pipeline = this.getPipelineState(record);

    return {
      id: record.id,
      sourceUrl: record.sourceUrl,
      canonicalUrl: record.canonicalUrl,
      title: record.titleOverride ?? record.opportunity.title ?? 'Untitled opportunity',
      organizationName: record.opportunity.organizationName,
      category: record.opportunity.category,
      currentStage: stage,
      currentStatus: record.opportunity.currentStatus,
      pipelineStage: pipeline.pipelineStage,
      pipelineMessage: pipeline.pipelineMessage,
      isPipelineActive: pipeline.isPipelineActive,
      deadline,
      openDate: record.opportunity.openDate,
      responseDate: record.opportunity.responseDate,
      isClosingSoon: deadline ? this.isClosingSoon(record, new Date(now)) : false,
      daysToDeadline:
        deadline != null
          ? Math.ceil((deadline.getTime() - now) / (24 * 60 * 60 * 1000))
          : null,
      applicantCount: record.opportunity._count.applications,
      needsUserReview: record.opportunity.needsUserReview,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      lastViewedAt: record.lastViewedAt,
      archivedAt: record.archivedAt,
      customReminderMuted: record.customReminderMuted,
    };
  }

  async intakeLink(userId: number, dto: IntakeLinkDto) {
    const normalized = normalizeOpportunityUrl(dto.url);

    const result = await this.prisma.$transaction(async (tx) => {
      let opportunity = await tx.opportunity.findUnique({
        where: { canonicalUrl: normalized.canonicalUrl },
      });

      if (!opportunity) {
        opportunity = await tx.opportunity.create({
          data: {
            sourceUrl: normalized.originalUrl,
            normalizedSourceUrl: normalized.normalizedUrl,
            canonicalUrl: normalized.canonicalUrl,
            currentStatus: PIPELINE_STAGE_MESSAGE.QUEUED,
            createdByUserId: userId,
          },
        });
      } else {
        opportunity = await tx.opportunity.update({
          where: { id: opportunity.id },
          data: {
            currentStatus: PIPELINE_STAGE_MESSAGE.QUEUED,
          },
        });
      }

      const existingApplication = await tx.application.findUnique({
        where: {
          userId_opportunityId: {
            userId,
            opportunityId: opportunity.id,
          },
        },
      });

      const application =
        existingApplication ??
        (await tx.application.create({
          data: {
            userId,
            opportunityId: opportunity.id,
            sourceUrl: normalized.originalUrl,
            canonicalUrl: normalized.canonicalUrl,
            stageEvents: {
              create: {
                stage: ApplicationStage.ADDED,
                note: 'Application added from intake link',
              },
            },
          },
        }));

      const job = await tx.ingestionJob.create({
        data: {
          userId,
          opportunityId: opportunity.id,
          sourceUrl: normalized.originalUrl,
          normalizedSourceUrl: normalized.normalizedUrl,
          canonicalUrl: normalized.canonicalUrl,
          metadata: {
            mode: dto.mode ?? 'leave',
            duplicateOpportunity: !!existingApplication,
            pipelineStage: 'QUEUED',
            pipelineMessage: PIPELINE_STAGE_MESSAGE.QUEUED,
          },
        },
      });

      return {
        opportunity,
        application,
        job,
        duplicateOpportunity: !!existingApplication,
      };
    });

    // Trigger asynchronous extraction pipeline without blocking intake response.
    void this.processIngestionJob(result.job.id, userId);

    return {
      jobId: result.job.id,
      status: result.job.status,
      applicationId: result.application.id,
      opportunityId: result.opportunity.id,
      canonicalUrl: result.opportunity.canonicalUrl,
      duplicateOpportunity: result.duplicateOpportunity,
    };
  }

  async listApplications(userId: number, query: ListApplicationsQueryDto) {
    const filter = query.filter ?? 'all';
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const now = new Date();

    const applications = await this.prisma.application.findMany({
      where: {
        userId,
        archivedAt: null,
      },
      include: getApplicationListInclude(userId),
      orderBy: {
        createdAt: 'desc',
      },
    });

    const filtered = applications.filter((record) => this.matchesFilter(record, filter, now));
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize).map((record) => this.serializeListItem(record));

    return {
      items,
      page,
      pageSize,
      total: filtered.length,
      filters: {
        active: filter,
      },
    };
  }

  async listUpcomingReminders(userId: number, limit = 3) {
    const normalizedLimit = Math.min(Math.max(limit, 1), 20);

    const reminders = await this.prisma.reminder.findMany({
      where: {
        userId,
        status: ReminderStatus.PENDING,
        scheduledFor: {
          gte: new Date(),
        },
        application: {
          is: {
            archivedAt: null,
          },
        },
      },
      include: {
        application: {
          include: {
            opportunity: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
      take: normalizedLimit,
    });

    return reminders.map((reminder) => ({
      id: reminder.id,
      applicationId: reminder.applicationId,
      title:
        reminder.application?.titleOverride ??
        reminder.application?.opportunity.title ??
        reminder.content ??
        'Untitled reminder',
      scheduledFor: reminder.scheduledFor,
      channel: reminder.channel,
      status: reminder.status,
      content: reminder.content,
    }));
  }

  async getApplicationById(userId: number, applicationId: string) {
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId,
      },
      include: {
        opportunity: {
          include: {
            _count: {
              select: {
                applications: true,
              },
            },
            extractionResults: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
            ingestionJobs: {
              where: { userId },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        stageEvents: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        reminderRules: true,
        reminders: {
          orderBy: {
            scheduledFor: 'asc',
          },
          take: 10,
        },
        submissionArtifacts: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    await this.prisma.application.update({
      where: { id: application.id },
      data: { lastViewedAt: new Date() },
    });

    return {
      id: application.id,
      sourceUrl: application.sourceUrl,
      canonicalUrl: application.canonicalUrl,
      title: application.titleOverride ?? application.opportunity.title ?? 'Untitled opportunity',
      titleOverride: application.titleOverride,
      notes: application.notes,
      customReminderMuted: application.customReminderMuted,
      archivedAt: application.archivedAt,
      lastViewedAt: new Date(),
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      opportunity: {
        id: application.opportunity.id,
        sourceUrl: application.opportunity.sourceUrl,
        applicationUrl: application.opportunity.applicationUrl,
        title: application.opportunity.title,
        organizationName: application.opportunity.organizationName,
        category: application.opportunity.category,
        location: application.opportunity.location,
        amount: application.opportunity.amount,
        summary: application.opportunity.summary,
        description: application.opportunity.description,
        openDate: application.opportunity.openDate,
        deadline: application.opportunity.deadline,
        responseDate: application.opportunity.responseDate,
        currentStatus: application.opportunity.currentStatus,
        confidenceScore: application.opportunity.confidenceScore,
        needsUserReview: application.opportunity.needsUserReview,
        applicantCount: application.opportunity._count.applications,
      },
      pipeline:
        application.opportunity.ingestionJobs[0] == null
          ? {
              stage: null,
              message: null,
              isActive: false,
            }
          : {
              stage:
                application.opportunity.ingestionJobs[0].status === IngestionJobStatus.FAILED
                  ? 'FAILED'
                  : (((application.opportunity.ingestionJobs[0].metadata as Record<string, unknown> | null)
                        ?.pipelineStage as string | undefined) ??
                    (application.opportunity.ingestionJobs[0].status === IngestionJobStatus.PENDING
                      ? 'QUEUED'
                      : 'COMPLETED')),
              message:
                application.opportunity.ingestionJobs[0].status === IngestionJobStatus.FAILED
                  ? application.opportunity.ingestionJobs[0].errorMessage ?? PIPELINE_STAGE_MESSAGE.FAILED
                  : (((application.opportunity.ingestionJobs[0].metadata as Record<string, unknown> | null)
                        ?.pipelineMessage as string | undefined) ??
                    (application.opportunity.ingestionJobs[0].status === IngestionJobStatus.PENDING
                      ? PIPELINE_STAGE_MESSAGE.QUEUED
                      : PIPELINE_STAGE_MESSAGE.COMPLETED)),
              isActive:
                application.opportunity.ingestionJobs[0].status === IngestionJobStatus.PENDING,
            },
      latestExtraction: application.opportunity.extractionResults[0]
        ? {
            id: application.opportunity.extractionResults[0].id,
            confidenceScore: application.opportunity.extractionResults[0].confidenceScore,
            needsUserReview: application.opportunity.extractionResults[0].needsUserReview,
            extractionMethod: application.opportunity.extractionResults[0].extractionMethod,
            payload: application.opportunity.extractionResults[0].payload,
            evidence: application.opportunity.extractionResults[0].evidence,
            createdAt: application.opportunity.extractionResults[0].createdAt,
          }
        : null,
      currentStage:
        application.stageEvents[application.stageEvents.length - 1]?.stage ??
        ApplicationStage.ADDED,
      stageHistory: application.stageEvents,
      reminderRules: application.reminderRules,
      reminders: application.reminders,
      submissionArtifacts: application.submissionArtifacts,
    };
  }

  async updateApplication(
    userId: number,
    applicationId: string,
    dto: UpdateApplicationDto,
  ) {
    const existing = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Application not found');
    }

    if (
      dto.titleOverride == null &&
      dto.notes == null &&
      dto.customReminderMuted == null &&
      dto.isArchived == null &&
      dto.stage == null
    ) {
      throw new BadRequestException('Provide at least one field to update');
    }

    await this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.ApplicationUpdateInput = {};

      if (dto.titleOverride !== undefined) {
        updateData.titleOverride = dto.titleOverride.trim() || null;
      }

      if (dto.notes !== undefined) {
        updateData.notes = dto.notes.trim() || null;
      }

      if (dto.customReminderMuted !== undefined) {
        updateData.customReminderMuted = dto.customReminderMuted;
      }

      if (dto.isArchived !== undefined) {
        updateData.archivedAt = dto.isArchived ? new Date() : null;
      }

      if (Object.keys(updateData).length > 0) {
        await tx.application.update({
          where: { id: applicationId },
          data: updateData,
        });
      }

      if (dto.stage) {
        await tx.applicationStageEvent.create({
          data: {
            applicationId,
            stage: dto.stage,
            note: dto.stageNote?.trim() || null,
          },
        });
      }
    });

    return this.getApplicationById(userId, applicationId);
  }

  async listApplicationsForUser(userId: number) {
    return this.prisma.application.findMany({
      where: {
        userId,
        archivedAt: null,
      },
      include: getApplicationListInclude(userId),
    });
  }
}
