import { IsInt, IsNotEmpty } from 'class-validator';

export class DeliverDto {
  @IsNotEmpty()
  @IsInt()
  driverId: number;
}
