import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirecrawlService } from './firecrawl.service';
import { PlaywrightService } from './playwright.service';
import { AiNormalizerService } from './ai-normalizer.service';
import { ExtractionOrchestratorService } from './extraction-orchestrator.service';

@Module({
  imports: [ConfigModule],
  providers: [
    FirecrawlService,
    PlaywrightService,
    AiNormalizerService,
    ExtractionOrchestratorService,
  ],
  exports: [ExtractionOrchestratorService],
})
export class ExtractionModule {}
