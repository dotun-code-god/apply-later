import { apiClient } from './client';

export interface DashboardSummary {
  totalActiveApplications: number;
  closingSoon: number;
  pendingActionsOrDocuments: number;
  completedThisCycle: number;
  generatedAt: string;
}

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return data;
  },
};
