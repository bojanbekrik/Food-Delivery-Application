import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { firebaseConfig } from "./firebase.config";
import { RestaurantModule } from "./restaurant/restaurant.module";
import {UserModule} from "./user/user.module";
import {ShoppingCartModule} from "./shopping-cart/shoppingcart.module";
import {ItemModule} from "./item/item.module";
import {AuthModule} from "./auth/auth.module";

@Module({
  imports: [RestaurantModule, UserModule, ShoppingCartModule, ItemModule, AuthModule],
  providers: [
    {
      provide: 'FIRESTORE',
      useFactory: firebaseConfig,
    },
    AppService,
  ],
  exports: ['FIRESTORE'],
  controllers: [AppController],
})
export class AppModule {}
