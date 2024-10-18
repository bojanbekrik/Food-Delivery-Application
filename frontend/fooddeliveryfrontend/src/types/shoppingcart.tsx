import { Item } from './item';

export interface ShoppingCart {
    id: string;
    userId: string;
    restaurantId: string;
    shoppingCartItems: Item[];
    totalPrice: number;
}