import { Module } from '@nestjs/common';
import { ShoppingCartService } from './shoppingcart.service';
import { ShoppingCartController } from './shoppingcart.controller';
import {ItemModule} from "../item/item.module";

@Module({
    imports: [ItemModule],
    controllers: [ShoppingCartController],
    providers: [ShoppingCartService],
})
export class ShoppingCartModule {}
