import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Firecrawl from '@mendable/firecrawl-js';
import { RawPageContent } from './types';

@Injectable()
export class FirecrawlService {
  private readonly logger = new Logger(FirecrawlService.name);
  private readonly client: Firecrawl | null = null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('FIRECRAWL_API_KEY');
    if (apiKey) {
      this.client = new Firecrawl({ apiKey });
    } else {
      this.logger.warn('FIRECRAWL_API_KEY not set — Firecrawl Layer 1 disabled, will fall back to builtin fetch');
    }
  }

  get isAvailable(): boolean {
    return this.client !== null;
  }

  async scrape(url: string): Promise<RawPageContent> {
    if (!this.client) {
      throw new Error('Firecrawl not configured');
    }

    // Firecrawl v2: scrape() throws on error, returns Document directly
    const doc = await this.client.scrape(url, {
      formats: ['markdown', 'html'],
      onlyMainContent: true,
      timeout: 30_000,
    });

    const markdown = doc.markdown ?? null;
    const html = doc.html ?? null;
    const metadata = doc.metadata ?? {};

    const contentQuality = this.assessContentQuality(markdown, html);

    return {
      url,
      markdown,
      html,
      title: metadata.title ?? metadata.ogTitle ?? null,
      description: metadata.description ?? metadata.ogDescription ?? null,
      ogTitle: metadata.ogTitle ?? null,
      ogDescription: metadata.ogDescription ?? null,
      fetchMethod: 'firecrawl',
      contentQuality,
    };
  }

  /**
   * Assess content quality on a 0–1 scale based on content richness signals.
   * Used to determine whether to escalate to Playwright (Layer 2).
   */
  private assessContentQuality(markdown: string | null, html: string | null): number {
    if (!markdown && !html) return 0;

    const text = markdown ?? html ?? '';
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (wordCount < 50) return 0.1;
    if (wordCount < 150) return 0.35;
    if (wordCount < 400) return 0.6;
    if (wordCount < 800) return 0.75;
    return 0.9;
  }
}
