import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export class CreateProductDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() category?: string;
}

export class UpdateProductDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsNumber() price?: number;
}