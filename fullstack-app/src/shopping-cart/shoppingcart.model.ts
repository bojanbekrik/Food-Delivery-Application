import { Item } from '../item/item.model';

export interface ShoppingCart {
    id: string;
    userId: string; // Reference to the user who owns the shopping cart
    restaurantId: string; // Reference to the restaurant
    shoppingCartItems?: Item[]; // List of items in the shopping cart (optional)
    totalPrice: number; // Total price of the items in the cart
}
