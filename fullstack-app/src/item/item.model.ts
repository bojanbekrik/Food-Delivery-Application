import { Restaurant } from '../restaurant/restaurant.model';

export interface Item {
    id: string;
    restaurantId: string; // Foreign key reference to Restaurant
    itemName: string;
    price: number;
    restaurant?: Restaurant; // Optional navigation property
    quantity?: number;
}
