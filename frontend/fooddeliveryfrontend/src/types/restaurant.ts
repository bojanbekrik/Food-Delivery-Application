import { Item } from './item';

export interface Restaurant {
    id: string;
    name: string;
    address: string;
    phone: string;
    menuItems?: Item[];
}
