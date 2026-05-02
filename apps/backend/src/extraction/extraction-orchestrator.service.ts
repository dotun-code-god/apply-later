import { Injectable, Logger } from '@nestjs/common';
import { FirecrawlService } from './firecrawl.service';
import { PlaywrightService } from './playwright.service';
import { AiNormalizerService } from './ai-normalizer.service';
import type { ExtractionOptions, ExtractionResult, LinkType, RawPageContent } from './types';

/**
 * Extraction Orchestrator — coordinates the three-layer extraction pipeline
 * described in Section 10 of the master reference.
 *
 * Layer 1 (Firecrawl) → Layer 2 (Playwright escalation) → Layer 3 (AI normalization)
 *
 * Degrades gracefully at every layer:
 * - No Firecrawl key → falls back to builtin fetch via Playwright service
 * - Playwright install missing → logs warning, builtin fetch used
 * - No Anthropic key → heuristic extraction only
 * - Long-running jobs return partial results flagged with confidence warnings
 */
@Injectable()
export class ExtractionOrchestratorService {
  private readonly logger = new Logger(ExtractionOrchestratorService.name);

  /** Content quality below this threshold triggers Playwright escalation */
  private static readonly PLAYWRIGHT_ESCALATION_THRESHOLD = 0.5;

  constructor(
    private readonly firecrawl: FirecrawlService,
    private readonly playwright: PlaywrightService,
    private readonly aiNormalizer: AiNormalizerService,
  ) {}

  async extract(options: ExtractionOptions): Promise<ExtractionResult> {
    const { sourceUrl, canonicalUrl } = options;

    this.logger.log(`Starting extraction for ${sourceUrl}`);

    // ── Layer 1: Firecrawl ────────────────────────────────────────────────
    let rawContent: RawPageContent = await this.fetchLayer1(sourceUrl);

    // ── Layer 2: Playwright escalation ───────────────────────────────────
    if (rawContent.contentQuality < ExtractionOrchestratorService.PLAYWRIGHT_ESCALATION_THRESHOLD) {
      this.logger.log(
        `Firecrawl content quality ${rawContent.contentQuality} below threshold — escalating to Playwright for ${sourceUrl}`,
      );
      rawContent = await this.playwright.scrape(sourceUrl);
    }

    // ── Detect link type ─────────────────────────────────────────────────
    const linkType = this.detectLinkType(sourceUrl, rawContent);

    // ── Layer 3: AI normalization ─────────────────────────────────────────
    const normalized = await this.aiNormalizer.normalize(rawContent, canonicalUrl, linkType);

    this.logger.log(
      `Extraction complete for ${sourceUrl} — confidence: ${normalized.confidenceScore}, method: ${normalized.payload.metadata.extractionMethod}, model: ${normalized.modelUsed}`,
    );

    return {
      payload: normalized.payload,
      evidence: normalized.evidence,
      confidenceScore: normalized.confidenceScore,
      needsUserReview: normalized.needsUserReview,
      extractionMethod: normalized.payload.metadata.extractionMethod,
    };
  }

  /** Layer 1 — try Firecrawl, fall back to builtin fetch on any error */
  private async fetchLayer1(url: string): Promise<RawPageContent> {
    if (!this.firecrawl.isAvailable) {
      return this.builtinFetch(url);
    }

    try {
      return await this.firecrawl.scrape(url);
    } catch (error) {
      this.logger.warn(
        `Firecrawl Layer 1 failed for ${url}: ${error instanceof Error ? error.message : String(error)} — falling back to builtin fetch`,
      );
      return this.builtinFetch(url);
    }
  }

  private async builtinFetch(url: string): Promise<RawPageContent> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch(url, { signal: controller.signal, redirect: 'follow' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? null;
      const description =
        html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i)?.[1]?.trim() ?? null;
      const markdown = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const wordCount = markdown.split(/\s+/).filter(Boolean).length;
      const contentQuality = wordCount < 50 ? 0.1 : wordCount < 200 ? 0.3 : 0.5;
      return { url, markdown, html, title, description, ogTitle: null, ogDescription: null, fetchMethod: 'builtin-fetch', contentQuality };
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Classify link as 'overview' or 'direct-form'.
   * Inspects URL patterns and HTML form elements.
   * The AI agent also considers this classification during normalization.
   */
  private detectLinkType(url: string, content: RawPageContent): LinkType {
    const directByUrl = /(apply|application|form|typeform|jotform|airtable|forms\.gle|formstack|submittable)/i.test(url);
    const directByHtml = content.html ? /<form\b/i.test(content.html) : false;
    const directByMarkdown = content.markdown
      ? /\b(first name|last name|email address|submit application|upload.*resume)\b/i.test(content.markdown)
      : false;
    return directByUrl || directByHtml || directByMarkdown ? 'direct-form' : 'overview';
  }
}
