import { IsOptional, IsEnum } from 'class-validator';

export class FilterExpirationDto {
  @IsOptional()
  @IsEnum({ normal: 'normal', expiring_soon: 'expiring_soon', expired: 'expired' })
  status?: 'normal' | 'expiring_soon' | 'expired';
}