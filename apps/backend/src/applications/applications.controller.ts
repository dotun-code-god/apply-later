import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, type AuthUser } from '@/common/decorators/current-user.decorator';
import { ApplicationsService } from './applications.service';
import { IntakeLinkDto } from './dto/intake-link.dto';
import { ListApplicationsQueryDto } from './dto/list-applications-query.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('intake-link')
  intakeLink(@CurrentUser() user: AuthUser, @Body() dto: IntakeLinkDto) {
    return this.applicationsService.intakeLink(user.sub, dto);
  }

  @Get()
  listApplications(
    @CurrentUser() user: AuthUser,
    @Query() query: ListApplicationsQueryDto,
  ) {
    return this.applicationsService.listApplications(user.sub, query);
  }

  @Get('reminders/upcoming')
  listUpcomingReminders(
    @CurrentUser() user: AuthUser,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = Number(limit);
    return this.applicationsService.listUpcomingReminders(
      user.sub,
      Number.isFinite(parsedLimit) ? parsedLimit : 3,
    );
  }

  @Get(':id')
  getApplication(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.applicationsService.getApplicationById(user.sub, id);
  }

  @Post(':id/refresh')
  refreshApplication(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.applicationsService.refreshApplication(user.sub, id);
  }

  @Patch(':id')
  updateApplication(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationsService.updateApplication(user.sub, id, dto);
  }
}
