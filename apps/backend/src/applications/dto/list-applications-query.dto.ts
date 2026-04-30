import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export const applicationFilters = [
  'all',
  'open',
  'closing-soon',
  'upcoming',
  'not-open-yet',
  'in-progress',
  'completed',
  'parked',
] as const;

export type ApplicationFilter = (typeof applicationFilters)[number];

export class ListApplicationsQueryDto {
  @IsOptional()
  @IsIn(applicationFilters)
  filter?: ApplicationFilter;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 25;
}
