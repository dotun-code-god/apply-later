import { IsIn, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class IntakeLinkDto {
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  url!: string;

  @IsOptional()
  @IsString()
  @IsIn(['stay', 'leave'])
  mode?: 'stay' | 'leave';
}
