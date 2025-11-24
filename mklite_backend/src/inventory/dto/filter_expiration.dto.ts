import { IsOptional, IsEnum } from 'class-validator';

export class FilterExpirationDto {
  @IsOptional()
  @IsEnum(['normal', 'expiring_soon', 'expired'])
  status?: 'normal' | 'expiring_soon' | 'expired';
}