import { ApplicationStage } from '@prisma/client';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  it('aggregates dashboard summary counts from application records', async () => {
    const now = new Date('2026-04-30T12:00:00.000Z');

    const applicationsService = {
      listApplicationsForUser: jest.fn().mockResolvedValue([
        {
          stageEvents: [{ stage: ApplicationStage.IN_PROGRESS, createdAt: now }],
          opportunity: {
            deadline: new Date('2026-05-03T12:00:00.000Z'),
            needsUserReview: false,
          },
        },
        {
          stageEvents: [{ stage: ApplicationStage.REVIEWING, createdAt: now }],
          opportunity: {
            deadline: null,
            needsUserReview: true,
          },
        },
        {
          stageEvents: [
            {
              stage: ApplicationStage.SUBMITTED,
              createdAt: new Date('2026-04-15T12:00:00.000Z'),
            },
          ],
          opportunity: {
            deadline: new Date('2026-06-01T12:00:00.000Z'),
            needsUserReview: false,
          },
        },
        {
          stageEvents: [{ stage: ApplicationStage.PARKED, createdAt: now }],
          opportunity: {
            deadline: null,
            needsUserReview: false,
          },
        },
      ]),
    };

    const service = new DashboardService(applicationsService as never);

    await expect(service.getSummary(42)).resolves.toMatchObject({
      totalActiveApplications: 2,
      closingSoon: 1,
      pendingActionsOrDocuments: 2,
      completedThisCycle: 1,
    });

    await expect(service.getSummary(42)).resolves.toEqual(
      expect.objectContaining({
        generatedAt: expect.any(Date),
      }),
    );
  });
});
