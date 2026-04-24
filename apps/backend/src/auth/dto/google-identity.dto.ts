import { IsString, MinLength } from 'class-validator';

export class GoogleIdentityDto {
  @IsString()
  @MinLength(20)
  credential!: string;
}
