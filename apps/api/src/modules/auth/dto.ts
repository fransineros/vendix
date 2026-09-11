import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
export class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(2) name: string;
  @IsString() @MinLength(8) password: string;
}
export class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}
export class RefreshDto {
  @IsString() refreshToken: string;
}
export class ForgotDto {
  @IsEmail() email: string;
}
export class ResetDto {
  @IsString() token: string;
  @IsString() @MinLength(8) newPassword: string;
}