import { Item } from '../item/item.model';

export interface Restaurant {
    id: string;
    name: string;
    address: string;
    phone: string;
    menuItems?: Item[]; // Reference to items (optional)
}

