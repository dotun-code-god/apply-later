import { Injectable, Logger } from '@nestjs/common';
import { RawPageContent } from './types';

/**
 * Layer 2 — Playwright escalation path.
 * Invoked when Firecrawl returns low-quality content (contentQuality < threshold)
 * or when the page is known to require JavaScript execution / session state.
 *
 * Playwright is used selectively to limit infrastructure cost and latency.
 * Falls back to builtin HTTP fetch with a clear warning if browser binaries
 * are not available in the current environment.
 */
@Injectable()
export class PlaywrightService {
  private readonly logger = new Logger(PlaywrightService.name);

  /** Minimum word count we expect from a meaningful page */
  private static readonly MIN_CONTENT_WORDS = 150;
  /** Page load + JS execution timeout */
  private static readonly PAGE_TIMEOUT_MS = 45_000;

  async scrape(url: string): Promise<RawPageContent> {
    try {
      // Lazy-require Playwright so the service degrades gracefully when
      // browser binaries are not installed.
      const { chromium } = await import('playwright');

      const browser = await chromium.launch({ headless: true });
      try {
        const context = await browser.newContext({
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          javaScriptEnabled: true,
        });

        const page = await context.newPage();
        page.setDefaultTimeout(PlaywrightService.PAGE_TIMEOUT_MS);

        await page.goto(url, { waitUntil: 'networkidle', timeout: PlaywrightService.PAGE_TIMEOUT_MS });

        const title = await page.title();
        const html = await page.content();

        // Extract body text as markdown-like plain text
        const bodyText = await page.evaluate(() => {
          // Remove script/style/nav/header/footer noise
          const noise = document.querySelectorAll('script,style,nav,header,footer,aside,[aria-hidden="true"]');
          noise.forEach((el) => el.remove());
          return document.body?.innerText ?? '';
        });

        // Look for an application / apply CTA link
        const applicationUrl = await page.evaluate(() => {
          const ctaPatterns = ['apply now', 'apply here', 'start application', 'begin application', 'apply online'];
          const links = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];
          for (const link of links) {
            const text = link.textContent?.toLowerCase().trim() ?? '';
            if (ctaPatterns.some((p) => text.includes(p))) {
              return link.href;
            }
          }
          return null;
        });

        const markdown = bodyText.trim();
        const wordCount = markdown.split(/\s+/).filter(Boolean).length;
        const contentQuality = wordCount < 50 ? 0.2 : wordCount < 200 ? 0.5 : wordCount < 500 ? 0.72 : 0.88;

        return {
          url,
          markdown,
          html,
          title,
          description: null,
          ogTitle: null,
          ogDescription: null,
          discoveredApplicationUrl: applicationUrl ?? null,
          fetchMethod: 'playwright',
          contentQuality,
        };
      } finally {
        await browser.close();
      }
    } catch (error) {
      this.logger.warn(
        `Playwright escalation failed for ${url}: ${error instanceof Error ? error.message : String(error)} — falling back to builtin fetch`,
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
}
