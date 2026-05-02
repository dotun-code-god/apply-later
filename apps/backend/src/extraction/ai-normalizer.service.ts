import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import type { RawPageContent, IntelligencePayload, ExtractionEvidence, LinkType } from './types';

/**
 * Layer 3 — AI Normalization Agent.
 *
 * Receives raw page content from Layer 1 (Firecrawl) or Layer 2 (Playwright)
 * and uses Claude via the Anthropic SDK to produce the full structured
 * intelligence output defined in Section 11 of the master reference.
 *
 * Provider abstraction: all model calls go through this service so the
 * provider can be swapped without touching domain logic (Section 19).
 *
 * Model strategy:
 *   - Default: claude-haiku-4-5 (cost-efficient, fast)
 *   - Escalation: claude-sonnet-4-5 when haiku confidence < 0.5 or content is
 *     complex (>1500 words) and eligibility/AI guidance fields are blank
 */
@Injectable()
export class AiNormalizerService {
  private readonly logger = new Logger(AiNormalizerService.name);
  private readonly client: Anthropic | null = null;

  private static readonly DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
  private static readonly ESCALATION_MODEL = 'claude-haiku-4-5-20251001' // 'claude-sonnet-4-5';
  private static readonly MAX_CONTENT_CHARS = 12_000;
  private static readonly CONFIDENCE_ESCALATION_THRESHOLD = 0.5;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    } else {
      this.logger.warn('ANTHROPIC_API_KEY not set — AI normalization disabled, will use heuristic extraction only');
    }
  }

  get isAvailable(): boolean {
    return this.client !== null;
  }

  async normalize(
    content: RawPageContent,
    canonicalUrl: string,
    linkType: LinkType,
  ): Promise<{
    payload: IntelligencePayload;
    evidence: ExtractionEvidence;
    confidenceScore: number;
    needsUserReview: boolean;
    modelUsed: string;
  }> {
    if (!this.client) {
      return this.heuristicFallback(content, canonicalUrl, linkType);
    }

    const text = (content.markdown ?? content.html ?? '').slice(0, AiNormalizerService.MAX_CONTENT_CHARS);
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    // Pick starting model based on content complexity
    const model = wordCount > 1_500 ? AiNormalizerService.ESCALATION_MODEL : AiNormalizerService.DEFAULT_MODEL;

    try {
      const result = await this.callClaudeExtraction(
        text,
        content,
        canonicalUrl,
        linkType,
        model,
      );

      // Escalate to sonnet if haiku returned low confidence and we haven't already used sonnet
      if (
        result.confidenceScore < AiNormalizerService.CONFIDENCE_ESCALATION_THRESHOLD &&
        model === AiNormalizerService.DEFAULT_MODEL
      ) {
        this.logger.log(`Haiku confidence ${result.confidenceScore} below threshold — escalating to Sonnet`);
        return this.callClaudeExtraction(
          text,
          content,
          canonicalUrl,
          linkType,
          AiNormalizerService.ESCALATION_MODEL,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`AI normalization failed: ${error instanceof Error ? error.message : String(error)} — falling back to heuristic`);
      return this.heuristicFallback(content, canonicalUrl, linkType);
    }
  }

  private buildNormalizedResult(
    extracted: Record<string, unknown>,
    content: RawPageContent,
    canonicalUrl: string,
    linkType: LinkType,
    model: string,
  ) {
    const confidences = (extracted.fieldConfidences as Record<string, number>) ?? {};

    const criticalScores = [
      confidences.title ?? (extracted.title ? 0.7 : 0.1),
      confidences.organizationName ?? (extracted.organizationName ? 0.65 : 0.1),
      confidences.deadline ?? (extracted.deadline ? 0.8 : 0.2),
      confidences.eligibilityCriteria ??
        (Array.isArray(extracted.eligibilityCriteria) &&
        (extracted.eligibilityCriteria as string[]).length > 0
          ? 0.7
          : 0.2),
    ];
    const overallConfidence = Number(
      (criticalScores.reduce((a, b) => a + b, 0) / criticalScores.length).toFixed(2),
    );
    const needsUserReview = overallConfidence < 0.55;

    const payload: IntelligencePayload = {
      coreIdentity: {
        title: (extracted.title as string) ?? null,
        organizationName: (extracted.organizationName as string) ?? null,
        category: (extracted.category as string) ?? null,
        applicationUrl:
          (extracted.applicationUrl as string) ?? content.discoveredApplicationUrl ?? null,
        sourceUrl: content.url,
        canonicalUrl,
        linkType,
      },
      overview: {
        summary: (extracted.summary as string) ?? null,
        description: (extracted.description as string) ?? null,
        amount: (extracted.amount as string) ?? null,
        location: (extracted.location as string) ?? null,
      },
      eligibilityAndRequirements: {
        eligibilityCriteria: (extracted.eligibilityCriteria as string[]) ?? [],
        requiredDocuments: (extracted.requiredDocuments as string[]) ?? [],
        formFields: (extracted.formFields as string[]) ?? [],
        confidence: confidences.eligibilityCriteria ?? 0,
      },
      timelines: {
        openDate: (extracted.openDate as string) ?? null,
        deadline: (extracted.deadline as string) ?? null,
        responseDate: (extracted.responseDate as string) ?? null,
        currentStatus: (extracted.currentStatus as string) ?? null,
      },
      aiGuidance: {
        whatMakesAGoodApplication: (extracted.whatMakesAGoodApplication as string) ?? null,
        caveats: (extracted.caveats as string) ?? null,
        keyHighlights: (extracted.keyHighlights as string[]) ?? [],
      },
      metadata: {
        confidenceScore: overallConfidence,
        extractedAt: new Date().toISOString(),
        extractionMethod:
          content.fetchMethod === 'firecrawl'
            ? 'firecrawl+ai'
            : content.fetchMethod === 'playwright'
              ? 'playwright+ai'
              : 'firecrawl+ai',
        needsUserReview,
        linkType,
      },
    };

    const evidence: ExtractionEvidence = {
      fields: Object.fromEntries(
        Object.entries(confidences).map(([field, confidence]) => [
          field,
          { confidence, source: `Extracted from ${content.fetchMethod} content via anthropic-sdk` },
        ]),
      ),
      fetchMethod: payload.metadata.extractionMethod,
      contentQuality: content.contentQuality,
      modelUsed: model,
    };

    return {
      payload,
      evidence,
      confidenceScore: overallConfidence,
      needsUserReview,
      modelUsed: model,
    };
  }

  private async callClaudeExtraction(
    text: string,
    content: RawPageContent,
    canonicalUrl: string,
    linkType: LinkType,
    model: string,
  ) {
    const systemPrompt = `You are an expert opportunity intelligence extractor for ApplyLater, a platform that helps people track scholarship, fellowship, job, grant, and other opportunities.

Your task is to extract structured information from the raw page content of an opportunity webpage and produce a comprehensive intelligence payload.

Rules:
- Be accurate. If information is not present, return null rather than guessing.
- Assign a confidence score (0.0–1.0) to each critical field based on how clearly it was stated in the source.
- For AI Guidance fields (whatMakesAGoodApplication, caveats, keyHighlights), generate original helpful insights based on the opportunity content — this content does NOT appear on the source site and is ApplyLater's primary differentiator.
- Dates must be in ISO 8601 format (YYYY-MM-DD) or null if not determinable.
- Category must be AI-assigned from signals in the content — never ask the user to categorize.
- The extraction agent is READ-ONLY. Never interact with forms, never submit anything.`;

    const userPrompt = `Please extract structured intelligence from the following opportunity page.

URL: ${content.url}
Canonical URL: ${canonicalUrl}
Link Type: ${linkType} (${linkType === 'direct-form' ? 'this is the actual application form page' : 'this is an overview/description page'})

Page Title: ${content.title ?? 'Not available'}
Meta Description: ${content.description ?? 'Not available'}

--- PAGE CONTENT START ---
${text}
--- PAGE CONTENT END ---

Extract all information using the extract_opportunity_intelligence tool. For any field you cannot determine with confidence, return null and set a low confidence score for that field.`;

    const tools: Anthropic.Tool[] = [
      {
        name: 'extract_opportunity_intelligence',
        description: 'Extract structured opportunity intelligence from the page content',
        input_schema: {
          type: 'object' as const,
          properties: {
            title: { type: 'string', description: 'Name of the opportunity' },
            organizationName: { type: 'string', description: 'Organization or institution governing the opportunity' },
            category: { type: 'string', description: 'AI-assigned category: Scholarship, Fellowship, Grant, Job, Internship, Research Position, Award, Volunteer, Training, or other best-fit label' },
            applicationUrl: { type: 'string', description: 'The direct apply/form URL if different from source URL' },
            summary: { type: 'string', description: 'Concise AI-generated summary (2-3 sentences) of what this opportunity is' },
            description: { type: 'string', description: 'Full description of the opportunity extracted from the page' },
            amount: { type: 'string', description: 'Funding, salary, stipend, or award value if stated' },
            location: { type: 'string', description: 'Physical location, or Remote/Global if applicable' },
            eligibilityCriteria: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of eligibility conditions the applicant must meet',
            },
            requiredDocuments: {
              type: 'array',
              items: { type: 'string' },
              description: 'Required file attachments (e.g. CV in PDF, Research Proposal max 5 pages)',
            },
            formFields: {
              type: 'array',
              items: { type: 'string' },
              description: 'Known form fields the user will encounter when applying',
            },
            openDate: { type: 'string', description: 'Date applications opened in YYYY-MM-DD format, or null' },
            deadline: { type: 'string', description: 'Application deadline in YYYY-MM-DD format, or null' },
            responseDate: { type: 'string', description: 'When applicants will hear back in YYYY-MM-DD format, or null' },
            currentStatus: { type: 'string', description: 'e.g. Open for Applications, Closed, Coming Soon' },
            whatMakesAGoodApplication: { type: 'string', description: 'AI insight into what the selection committee values and what a strong submission looks like. This is original ApplyLater content not found on the source site.' },
            caveats: { type: 'string', description: 'Common mistakes, disqualifiers, and things applicants should avoid. Original ApplyLater content.' },
            keyHighlights: {
              type: 'array',
              items: { type: 'string' },
              description: 'Bullet-point highlights for quick scanning',
            },
            fieldConfidences: {
              type: 'object',
              description: 'Per-field confidence scores (0.0–1.0) for critical fields',
              properties: {
                title: { type: 'number' },
                organizationName: { type: 'number' },
                deadline: { type: 'number' },
                eligibilityCriteria: { type: 'number' },
                amount: { type: 'number' },
                location: { type: 'number' },
              },
            },
          },
          required: ['fieldConfidences'],
        },
      },
    ];

    const response = await this.client!.messages.create({
      model,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      tools,
      tool_choice: { type: 'any' },
    });

    const toolUse = response.content.find((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use');
    if (!toolUse || toolUse.name !== 'extract_opportunity_intelligence') {
      throw new Error('Claude did not return extraction tool result');
    }

    const extracted = toolUse.input as Record<string, unknown>;
    const normalized = this.buildNormalizedResult(
      extracted,
      content,
      canonicalUrl,
      linkType,
      model,
    );
    normalized.evidence.tokensUsed = response.usage?.input_tokens + response.usage?.output_tokens;
    return normalized;
  }

  /**
   * Heuristic-only fallback when AI is unavailable.
   * Extracts basic signals from page metadata without Claude.
   */
  private heuristicFallback(
    content: RawPageContent,
    canonicalUrl: string,
    linkType: LinkType,
  ) {
    const title = content.title ?? content.ogTitle ?? null;
    const description = content.description ?? content.ogDescription ?? null;
    const text = (content.markdown ?? content.html ?? '').slice(0, 800);

    const titleConfidence = title ? 0.72 : 0.2;
    const descriptionConfidence = description ? 0.6 : text ? 0.35 : 0.1;
    const overallConfidence = Number(((titleConfidence + descriptionConfidence) / 2).toFixed(2));
    const needsUserReview = overallConfidence < 0.55;

    const payload: IntelligencePayload = {
      coreIdentity: {
        title,
        organizationName: null,
        category: null,
        applicationUrl: content.discoveredApplicationUrl ?? null,
        sourceUrl: content.url,
        canonicalUrl,
        linkType,
      },
      overview: {
        summary: null,
        description: (description ?? text.slice(0, 500)) || null,
        amount: null,
        location: null,
      },
      eligibilityAndRequirements: { eligibilityCriteria: [], requiredDocuments: [], formFields: [], confidence: 0 },
      timelines: { openDate: null, deadline: null, responseDate: null, currentStatus: null },
      aiGuidance: {
        whatMakesAGoodApplication: null,
        caveats: null,
        keyHighlights: needsUserReview ? ['Manual review recommended — AI extraction was unavailable'] : [],
      },
      metadata: {
        confidenceScore: overallConfidence,
        extractedAt: new Date().toISOString(),
        extractionMethod: content.fetchMethod as 'builtin-fetch',
        needsUserReview,
        linkType,
      },
    };

    const evidence: ExtractionEvidence = {
      fields: {
        title: { confidence: titleConfidence, source: 'page <title> or og:title tag' },
        description: { confidence: descriptionConfidence, source: 'meta description or body preview' },
      },
      fetchMethod: content.fetchMethod as 'builtin-fetch',
      contentQuality: content.contentQuality,
    };

    return { payload, evidence, confidenceScore: overallConfidence, needsUserReview, modelUsed: 'none' };
  }
}
