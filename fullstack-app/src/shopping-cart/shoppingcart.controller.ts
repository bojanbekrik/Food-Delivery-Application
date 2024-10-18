import { Controller, Post, Get, Param, Body, Delete, Put, NotFoundException } from '@nestjs/common';
import { ShoppingCartService } from './shoppingcart.service';
import { ShoppingCart } from './shoppingcart.model';

@Controller('shopping-carts')
export class ShoppingCartController {
    constructor(private readonly shoppingCartService: ShoppingCartService) {}

    @Post()
    async create(@Body() shoppingCart: Partial<ShoppingCart>): Promise<ShoppingCart> {
        return this.shoppingCartService.create(shoppingCart);
    }

    @Get()
    async getAll(): Promise<ShoppingCart[]> {
        return this.shoppingCartService.getAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<ShoppingCart> {
        const cart = await this.shoppingCartService.findById(id);
        if (!cart) {
            throw new NotFoundException(`Shopping cart with ID ${id} not found.`);
        }
        return cart;
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updatedCart: Partial<ShoppingCart>): Promise<ShoppingCart> {
        return this.shoppingCartService.update(id, updatedCart);
    }

    @Post(':id/items')
    async addItem(@Param('id') id: string, @Body('id') itemId: string): Promise<ShoppingCart> {
        return this.shoppingCartService.addItem(id, itemId);
    }

    @Get('user/:userId')
    async findByUserId(@Param('userId') userId: string): Promise<ShoppingCart | null> {
        return this.shoppingCartService.findByUserId(userId);
    }

    // Add an item to the user's cart; create if it doesn't exist
    @Post('user/:userId/items')
    async addItemToUserCart(@Param('userId') userId: string, @Body('itemId') itemId: string): Promise<ShoppingCart> {
        let cart = await this.shoppingCartService.findByUserId(userId);

        if (!cart) {
            // If no cart exists, create a new one
            cart = await this.shoppingCartService.create({ userId });
        }

        // Add the item to the cart (either newly created or existing)
        return this.shoppingCartService.addItem(cart.id, itemId);
    }

    // Remove an item from the shopping cart
    @Delete(':id/items/:itemId')
    async removeItem(@Param('id') shoppingCartId: string, @Param('itemId') itemId: string): Promise<ShoppingCart> {
        return this.shoppingCartService.removeItem(shoppingCartId, itemId);
    }

    // Clear the shopping cart
    @Delete(':id/items')
    async clearCart(@Param('id') shoppingCartId: string): Promise<ShoppingCart> {
        return this.shoppingCartService.clearCart(shoppingCartId);
    }
}
