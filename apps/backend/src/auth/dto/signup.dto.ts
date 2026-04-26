import { IsEmail, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username may only contain letters, numbers, and underscores' })
  username?: string;
}
