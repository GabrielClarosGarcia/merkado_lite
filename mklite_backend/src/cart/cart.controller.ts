import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { CartService } from './cart.service';  // Asegúrate de que la importación esté correcta
import { AddToCartDto } from './dto/add_to_cart.dto';
import { UpdateCartItemDto } from './dto/update_cart_item.dto';

@Controller('/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':customerId')
  async getCartItems(@Param('customerId') customerId: number) {
    return this.cartService.getCartItems(customerId);  // Llama al método getCartItems
  }

  @Post('add/:customerId')
  async addToCart(
    @Param('customerId') customerId: number,
    @Body() addToCartDto: AddToCartDto
  ) {
    return this.cartService.addToCart(customerId, addToCartDto);
  }

  @Put('update/:customerId/:itemId')  
  async updateCartItem(
    @Param('customerId') customerId: number, 
    @Param('itemId') itemId: number, 
    @Body() updateCartItemDto: UpdateCartItemDto
  ) {
    return this.cartService.updateCartItem(customerId, itemId, updateCartItemDto);
  }
}
