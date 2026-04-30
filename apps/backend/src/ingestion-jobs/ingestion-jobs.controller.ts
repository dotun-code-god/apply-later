import { Controller, Get, Param } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '@/common/decorators/current-user.decorator';
import { IngestionJobsService } from './ingestion-jobs.service';

@Controller('ingestion-jobs')
export class IngestionJobsController {
  constructor(private readonly ingestionJobsService: IngestionJobsService) {}

  @Get(':id')
  getJob(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ingestionJobsService.getJobById(user.sub, id);
  }
}
