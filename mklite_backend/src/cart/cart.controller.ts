import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add_to_cart.dto';
import { UpdateCartItemDto } from './dto/update_cart_item.dto';

@Controller('cart')
export class CartController {

  constructor(private readonly cartService: CartService) {}

  @Get(':customerId')
  getCartItems(@Param('customerId') customerId: number) {
    return this.cartService.getCartItems(customerId);
  }

  @Post('add/:customerId')
  addToCart(
    @Param('customerId') customerId: number,
    @Body() dto: AddToCartDto
  ) {
    return this.cartService.addToCart(customerId, dto);
  }

  @Put('update/:customerId/:itemId')
  updateCartItem(
    @Param('customerId') customerId: number,
    @Param('itemId') itemId: number,
    @Body() dto: UpdateCartItemDto
  ) {
    return this.cartService.updateCartItem(customerId, itemId, dto);
  }

  @Delete('remove/:customerId/:itemId')
  removeCartItem(
    @Param('customerId') customerId: number,
    @Param('itemId') itemId: number
  ) {
    return this.cartService.removeCartItem(customerId, itemId);
  }
}
