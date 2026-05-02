/**
 * Shared types for the Stage 2 extraction pipeline.
 * These types define the structured intelligence output (Section 11 of master reference)
 * produced by the layered extraction architecture (Section 10).
 */

export type ExtractionMethod = 'firecrawl' | 'playwright' | 'builtin-fetch' | 'firecrawl+ai' | 'playwright+ai';
export type LinkType = 'overview' | 'direct-form';

/** Raw content fetched by Layer 1 (Firecrawl) or Layer 2 (Playwright). */
export interface RawPageContent {
  url: string;
  markdown?: string | null;
  html?: string | null;
  title?: string | null;
  description?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  /** Follow-up application URL discovered from a CTA link */
  discoveredApplicationUrl?: string | null;
  fetchMethod: 'firecrawl' | 'playwright' | 'builtin-fetch';
  /** Content quality signal, 0–1 */
  contentQuality: number;
}

/** Per-field confidence evidence stored in ExtractionResult.evidence */
export interface FieldEvidence {
  confidence: number;
  source: string;
}

export interface ExtractionEvidence {
  fields: Record<string, FieldEvidence>;
  fetchMethod: ExtractionMethod;
  contentQuality: number;
  modelUsed?: string;
  tokensUsed?: number;
}

/**
 * The full structured intelligence payload persisted in ExtractionResult.payload
 * and returned to the frontend on the Application Details page.
 * Mirrors Section 11 of the master reference.
 */
export interface IntelligencePayload {
  coreIdentity: {
    title: string | null;
    organizationName: string | null;
    category: string | null;
    applicationUrl: string | null;
    sourceUrl: string;
    canonicalUrl: string;
    linkType: LinkType;
  };
  overview: {
    summary: string | null;
    description: string | null;
    amount: string | null;
    location: string | null;
  };
  eligibilityAndRequirements: {
    eligibilityCriteria: string[];
    requiredDocuments: string[];
    formFields: string[];
    confidence: number;
  };
  timelines: {
    openDate: string | null;
    deadline: string | null;
    responseDate: string | null;
    currentStatus: string | null;
  };
  aiGuidance: {
    whatMakesAGoodApplication: string[];
    caveats: string[];
    keyHighlights: string[];
  };
  metadata: {
    confidenceScore: number;
    extractedAt: string;
    extractionMethod: ExtractionMethod;
    needsUserReview: boolean;
    linkType: LinkType;
  };
}

export interface ExtractionResult {
  payload: IntelligencePayload;
  evidence: ExtractionEvidence;
  confidenceScore: number;
  needsUserReview: boolean;
  extractionMethod: ExtractionMethod;
}

/** Options passed into the orchestrator per job */
export interface ExtractionOptions {
  jobId: string;
  opportunityId: string;
  sourceUrl: string;
  canonicalUrl: string;
  onProgress?: (stage: 'extracting' | 'normalizing') => Promise<void> | void;
}
