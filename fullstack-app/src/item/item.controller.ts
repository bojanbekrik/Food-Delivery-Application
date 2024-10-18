import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { ItemService } from './item.service';
import { Item } from './item.model';

@Controller('items')
export class ItemController {
    constructor(private readonly itemService: ItemService) {}

    @Post()
    async addItem(@Body() item: Item): Promise<Item> {
        return this.itemService.addItem(item);
    }

    @Get()
    async getAllItems(): Promise<Item[]> {
        return this.itemService.getAllItems();
    }

    @Get(':id')
    async getItemById(@Param('id') id: string): Promise<Item> {
        return this.itemService.getItemById(id);
    }

    @Put(':id')
    async updateItem(
        @Param('id') id: string,
        @Body() updatedItem: Item,
    ): Promise<Item> {
        return this.itemService.updateItem(id, updatedItem);
    }

    @Delete(':id')
    async deleteItem(@Param('id') id: string): Promise<void> {
        return this.itemService.deleteItem(id);
    }

    // ItemController
    @Get('/restaurant/:restaurantId')
    async getItemsByRestaurantId(@Param('restaurantId') restaurantId: string): Promise<Item[]> {
        return this.itemService.getItemsByRestaurantId(restaurantId);
    }

}
