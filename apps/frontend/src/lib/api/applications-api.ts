import { apiClient } from './client';

// ─── Enums (mirrors backend ApplicationStage) ────────────────────────────────
export type ApplicationStage =
  | 'ADDED'
  | 'REVIEWING'
  | 'PREPARING_DOCS'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'CLOSED'
  | 'PARKED';

export type IngestionJobStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'PARTIALLY_COMPLETED'
  | 'FAILED';

export type ReminderChannel = 'IN_APP' | 'EMAIL';
export type ReminderStatus = 'PENDING' | 'SENT' | 'CANCELLED' | 'FAILED';

// ─── List / Summary types ─────────────────────────────────────────────────────
export interface ApplicationListItem {
  id: string;
  sourceUrl: string;
  canonicalUrl: string;
  title: string;
  organizationName: string | null;
  category: string | null;
  currentStage: ApplicationStage;
  currentStatus: string | null;
  deadline: string | null;
  openDate: string | null;
  responseDate: string | null;
  isClosingSoon: boolean;
  daysToDeadline: number | null;
  applicantCount: number;
  needsUserReview: boolean;
  createdAt: string;
  updatedAt: string;
  lastViewedAt: string | null;
  archivedAt: string | null;
  customReminderMuted: boolean;
}

export interface ApplicationListResponse {
  items: ApplicationListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type ApplicationFilter =
  | 'all'
  | 'open'
  | 'closing-soon'
  | 'upcoming'
  | 'not-open-yet'
  | 'in-progress'
  | 'completed'
  | 'parked';

export interface ListApplicationsQuery {
  filter?: ApplicationFilter;
  page?: number;
  pageSize?: number;
}

// ─── Detail types ─────────────────────────────────────────────────────────────
export interface StageEvent {
  id: number;
  stage: ApplicationStage;
  note: string | null;
  createdAt: string;
}

export interface ApplicationDetail extends ApplicationListItem {
  titleOverride: string | null;
  notes: string | null;
  customReminderMuted: boolean;
  archivedAt: string | null;
  lastViewedAt: string | null;
  stageHistory: StageEvent[];
  reminderRules: unknown[];
  reminders: unknown[];
  submissionArtifacts: unknown[];
  latestExtraction: {
    id: string;
    confidenceScore: number | null;
    needsUserReview: boolean;
    extractionMethod: string | null;
    payload: unknown;
    evidence: unknown;
    createdAt: string;
  } | null;
  opportunity: {
    id: string;
    sourceUrl: string;
    applicationUrl: string | null;
    title: string | null;
    organizationName: string | null;
    category: string | null;
    location: string | null;
    amount: string | null;
    summary: string | null;
    description: string | null;
    deadline: string | null;
    openDate: string | null;
    responseDate: string | null;
    currentStatus: string | null;
    confidenceScore: number | null;
    needsUserReview: boolean;
    applicantCount: number;
  };
}

// ─── Intake-link types ────────────────────────────────────────────────────────
export interface IntakeLinkResponse {
  jobId: string;
  status: IngestionJobStatus;
  applicationId: string;
  opportunityId: string;
  canonicalUrl: string;
  duplicateOpportunity: boolean;
}

export interface IngestionJobResponse {
  id: string;
  status: IngestionJobStatus;
  opportunityId: string | null;
  applicationId: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  opportunity: {
    id: string;
    title: string | null;
    organizationName: string | null;
    canonicalUrl: string;
  };
}

export interface UpcomingReminder {
  id: string;
  applicationId: string | null;
  title: string;
  scheduledFor: string;
  channel: ReminderChannel;
  status: ReminderStatus;
  content: string | null;
}

// ─── Update types ─────────────────────────────────────────────────────────────
export interface UpdateApplicationPayload {
  stage?: ApplicationStage;
  titleOverride?: string;
  notesMarkdown?: string;
  isPinned?: boolean;
  customReminderMuted?: boolean;
}

// ─── API ───────────────────────────────────────────────────────────────────────
export const applicationsApi = {
  async intakeLink(url: string): Promise<IntakeLinkResponse> {
    const { data } = await apiClient.post<IntakeLinkResponse>('/applications/intake-link', { url });
    return data;
  },

  async list(query: ListApplicationsQuery = {}): Promise<ApplicationListResponse> {
    const { data } = await apiClient.get<ApplicationListResponse>('/applications', { params: query });
    return data;
  },

  async getById(id: string): Promise<ApplicationDetail> {
    const { data } = await apiClient.get<ApplicationDetail>(`/applications/${id}`);
    return data;
  },

  async update(id: string, payload: UpdateApplicationPayload): Promise<ApplicationDetail> {
    const { data } = await apiClient.patch<ApplicationDetail>(`/applications/${id}`, payload);
    return data;
  },

  async getUpcomingReminders(limit = 3): Promise<UpcomingReminder[]> {
    const { data } = await apiClient.get<UpcomingReminder[]>('/applications/reminders/upcoming', {
      params: { limit },
    });
    return data;
  },
};

export const ingestionJobsApi = {
  async getById(jobId: string): Promise<IngestionJobResponse> {
    const { data } = await apiClient.get<IngestionJobResponse>(`/ingestion-jobs/${jobId}`);
    return data;
  },
};
