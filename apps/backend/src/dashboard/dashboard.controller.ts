import { Controller, Get } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '@/common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary(@CurrentUser() user: AuthUser) {
    return this.dashboardService.getSummary(user.sub);
  }
}
