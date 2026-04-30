import { Injectable } from '@nestjs/common';
import { ApplicationStage } from '@prisma/client';
import { ApplicationsService } from '@/applications/applications.service';

const ACTIVE_STAGES: Set<ApplicationStage> = new Set([
  ApplicationStage.ADDED,
  ApplicationStage.REVIEWING,
  ApplicationStage.PREPARING_DOCS,
  ApplicationStage.IN_PROGRESS,
  ApplicationStage.UNDER_REVIEW,
  ApplicationStage.INTERVIEW,
  ApplicationStage.OFFER,
]);

@Injectable()
export class DashboardService {
  constructor(private readonly applicationsService: ApplicationsService) {}

  async getSummary(userId: number) {
    const applications = await this.applicationsService.listApplicationsForUser(userId);
    const now = new Date();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let totalActiveApplications = 0;
    let closingSoon = 0;
    let pendingActionsOrDocuments = 0;
    let completedThisCycle = 0;

    for (const application of applications) {
      const latestStage = application.stageEvents[0]?.stage ?? ApplicationStage.ADDED;
      const latestStageTimestamp = application.stageEvents[0]?.createdAt;
      const deadline = application.opportunity.deadline;

      if (ACTIVE_STAGES.has(latestStage)) {
        totalActiveApplications += 1;
      }

      if (
        ACTIVE_STAGES.has(latestStage) &&
        deadline &&
        deadline.getTime() >= now.getTime() &&
        deadline.getTime() - now.getTime() <= sevenDaysMs
      ) {
        closingSoon += 1;
      }

      if (
        application.opportunity.needsUserReview ||
        latestStage === ApplicationStage.REVIEWING ||
        latestStage === ApplicationStage.PREPARING_DOCS ||
        latestStage === ApplicationStage.IN_PROGRESS
      ) {
        pendingActionsOrDocuments += 1;
      }

      if (
        latestStage === ApplicationStage.SUBMITTED &&
        latestStageTimestamp &&
        latestStageTimestamp >= thirtyDaysAgo
      ) {
        completedThisCycle += 1;
      }
    }

    return {
      totalActiveApplications,
      closingSoon,
      pendingActionsOrDocuments,
      completedThisCycle,
      generatedAt: now,
    };
  }
}
