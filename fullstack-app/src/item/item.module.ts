import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import {RestaurantModule} from "../restaurant/restaurant.module";

@Module({
    imports: [RestaurantModule],
    controllers: [ItemController],
    providers: [ItemService],
    exports: [ItemService]
})
export class ItemModule {}
