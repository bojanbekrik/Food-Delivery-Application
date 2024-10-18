import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from './restaurant.model';

@Controller('restaurants')
export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService) {}

    @Get()
    async getAllRestaurants(): Promise<Restaurant[]> {
        return await this.restaurantService.getAllRestaurants();
    }

    @Get(':id')
    async getRestaurantById(@Param('id') id: string): Promise<Restaurant | undefined> {
        return await this.restaurantService.findById(id);
    }

    @Post()
    async addRestaurant(@Body() restaurant: Partial<Restaurant>): Promise<Restaurant | undefined> {
        if (!restaurant.name || !restaurant.address || !restaurant.phone || !restaurant.menuItems) {
            return undefined;
        }
        return await this.restaurantService.create(restaurant);
    }

    @Put(':id')
    async updateRestaurant(
        @Param('id') id: string,
        @Body() updatedRestaurantFields: Partial<Restaurant>,
    ): Promise<Restaurant | undefined> {
        return await this.restaurantService.update(id, updatedRestaurantFields);
    }

    @Delete(':id')
    async deleteRestaurant(@Param('id') id: string): Promise<void> {
        return await this.restaurantService.delete(id);
    }
}
