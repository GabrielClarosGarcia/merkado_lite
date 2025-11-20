import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class AddToCartDto {
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantity: number;
}
