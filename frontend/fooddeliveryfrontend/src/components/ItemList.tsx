import React from 'react';
import { Item } from '../types/item';

interface ItemListProps {
    items: Item[]; // The array of items
}

const ItemList: React.FC<ItemListProps> = ({ items }) => {
    return (
        <div>
            <h2>Items</h2>
            <ul>
                {items.map(item => (
                    <li key={item.id}>
                        <h3>{item.itemName}</h3>
                        <p>Price: ${item.price}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ItemList;
