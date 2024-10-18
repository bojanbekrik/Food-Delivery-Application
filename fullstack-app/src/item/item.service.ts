import { Injectable } from '@nestjs/common';
import { Item } from './item.model';
import { RestaurantService } from '../restaurant/restaurant.service'; // Import RestaurantService
import { firestore } from 'firebase-admin';

@Injectable()
export class ItemService {
    private db = firestore().collection('items');

    constructor(private restaurantService: RestaurantService) {} // Inject RestaurantService

    // Create a new item and associate it with a restaurant
    async addItem(item: Partial<Item>): Promise<Item> {
        // Ensure the restaurant exists
        const restaurant = await this.restaurantService.findById(item.restaurantId);
        if (!restaurant) {
            throw new Error(`Restaurant with ID ${item.restaurantId} does not exist.`);
        }

        const newItemRef = this.db.doc(); // Create a new document reference

        // Prepare the item data excluding the id
        const newItemData = {
            restaurantId: item.restaurantId,
            itemName: item.itemName ?? '',
            price: item.price ?? 0,
        };

        // Save the item data in Firestore
        await newItemRef.set(newItemData as firestore.DocumentData);

        // Add the item to the restaurant's menuItems array
        await this.restaurantService.addItemToMenu(item.restaurantId, {
            id: newItemRef.id,
            itemName: newItemData.itemName,
            price: newItemData.price,
        });

        // Return the item with the Firestore-generated ID
        return {
            id: newItemRef.id, // Firestore-generated ID
            ...newItemData,
        } as Item;
    }

    // Retrieve all items
    async getAllItems(): Promise<Item[]> {
        const snapshot = await this.db.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Item) }));
    }

    // Retrieve an item by ID
    async getItemById(id: string): Promise<Item | undefined> {
        const itemDoc = await this.db.doc(id).get();
        return itemDoc.exists ? { id: itemDoc.id, ...(itemDoc.data() as Item) } : undefined;
    }

    // Update an item by ID
    async updateItem(id: string, updatedItem: Partial<Item>): Promise<Item | undefined> {
        const itemDoc = this.db.doc(id);
        const currentItem = await itemDoc.get();

        if (!currentItem.exists) return undefined;

        // Prepare updated item data
        const updatedData: Partial<Item> = {
            restaurantId: updatedItem.restaurantId ?? currentItem.data()?.restaurantId,
            itemName: updatedItem.itemName ?? currentItem.data()?.itemName,
            price: updatedItem.price ?? currentItem.data()?.price,
        };

        // Update the item in Firestore
        await itemDoc.update(updatedData as firestore.DocumentData);

        // Get the current restaurant's menu items to update
        const restaurantId = updatedData.restaurantId; // Get the restaurantId from the item
        await this.restaurantService.updateMenuItem(restaurantId, id, updatedData); // Update the restaurant's menu item

        return {
            id: id,
            ...updatedData,
        } as Item;
    }

    // Delete an item by ID
    async deleteItem(id: string): Promise<void> {
        await this.db.doc(id).delete();
    }

    async getItemsByRestaurantId(restaurantId: string): Promise<Item[]> {
        try {
            const snapshot = await this.db.where('restaurantId', '==', restaurantId).get();  // Firestore query for items by restaurantId

            if (snapshot.empty) {
                throw new Error(`No items found for restaurant with ID ${restaurantId}.`);
            }

            // Map through the Firestore snapshot and return the data as an array of items
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Item),
            }));
        } catch (error) {
            throw new Error(`Error retrieving items for restaurant ${restaurantId}: ${error.message}`);
        }
    }
}
