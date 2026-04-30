import { Module } from '@nestjs/common';
import { IngestionJobsController } from './ingestion-jobs.controller';
import { IngestionJobsService } from './ingestion-jobs.service';

@Module({
  controllers: [IngestionJobsController],
  providers: [IngestionJobsService],
})
export class IngestionJobsModule {}
