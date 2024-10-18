import { Injectable } from '@nestjs/common';
import { Restaurant } from './restaurant.model';
import { firestore } from 'firebase-admin';
import { Item } from '../item/item.model'; // Import Item model

@Injectable()
export class RestaurantService {
    private db = firestore().collection('restaurants');

    // Get all restaurants
    async getAllRestaurants(): Promise<Restaurant[]> {
        const snapshot = await this.db.get();
        // Include the Firestore doc ID in the restaurant data
        return snapshot.docs.map(doc => {
            const restaurantData = doc.data() as Restaurant;
            return {
                id: doc.id, // Add the Firestore document ID
                ...restaurantData, // Spread the existing restaurant data
            };
        });
    }

    // Find restaurant by ID
    async findById(restaurantId: string): Promise<Restaurant | undefined> {
        const restaurantDoc = await this.db.doc(restaurantId).get();
        if (restaurantDoc.exists) {
            const restaurantData = restaurantDoc.data() as Restaurant;
            return {
                id: restaurantDoc.id, // Add the Firestore document ID
                ...restaurantData, // Spread the restaurant data
            };
        } else {
            return undefined;
        }
    }

    // Create a new restaurant
    async create(restaurant: Partial<Restaurant>): Promise<Restaurant> {
        const newRestaurantRef = this.db.doc();

        // Ensure the menuItems array consists of valid Item objects
        const menuItems: Item[] = restaurant.menuItems?.map(item => ({
            id: item.id ?? '', // Ensure each item has an id
            restaurantId: newRestaurantRef.id, // Set restaurantId
            itemName: item.itemName ?? '',
            price: item.price ?? 0,
        })) ?? [];

        // Prepare the restaurant data excluding the id
        const newRestaurantData = {
            name: restaurant.name ?? '',
            address: restaurant.address ?? '',
            phone: restaurant.phone ?? '',
            menuItems, // Include menuItems
        };

        // Save the restaurant data in Firestore
        await newRestaurantRef.set(newRestaurantData as firestore.DocumentData);

        // Return the restaurant with the Firestore-generated ID
        return {
            id: newRestaurantRef.id,
            ...newRestaurantData,
        } as Restaurant;
    }

    // Update an existing restaurant
    async update(restaurantId: string, updatedRestaurantFields: Partial<Restaurant>): Promise<Restaurant | undefined> {
        const restaurantDoc = this.db.doc(restaurantId);
        const currentRestaurant = await restaurantDoc.get();

        if (!currentRestaurant.exists) return undefined;

        const updatedMenuItems: Item[] = updatedRestaurantFields.menuItems?.map(item => ({
            id: item.id, // Keep the existing ID for association
            restaurantId: restaurantId, // Ensure it stays associated with the restaurant
            itemName: item.itemName ?? currentRestaurant.data()?.menuItems.find(m => m.id === item.id)?.itemName,
            price: item.price ?? currentRestaurant.data()?.menuItems.find(m => m.id === item.id)?.price,
        })) ?? currentRestaurant.data()?.menuItems;

        // Prepare updated restaurant data
        const updatedRestaurant: Partial<Restaurant> = {
            name: updatedRestaurantFields.name ?? currentRestaurant.data()?.name,
            address: updatedRestaurantFields.address ?? currentRestaurant.data()?.address,
            phone: updatedRestaurantFields.phone ?? currentRestaurant.data()?.phone,
            menuItems: updatedMenuItems,
        };

        await restaurantDoc.update(updatedRestaurant as firestore.DocumentData);
        return {
            id: restaurantId,
            ...updatedRestaurant,
        } as Restaurant;
    }


    // Delete a restaurant by ID
    async delete(restaurantID: string): Promise<void> {
        await this.db.doc(restaurantID).delete();
    }

    async addItemToMenu(restaurantId: string, item: { id: string; itemName: string; price: number; }): Promise<void> {
        const restaurantDoc = this.db.doc(restaurantId);
        const restaurantSnapshot = await restaurantDoc.get();

        if (!restaurantSnapshot.exists) {
            throw new Error(`Restaurant with ID ${restaurantId} does not exist.`);
        }

        const currentMenuItems = restaurantSnapshot.data()?.menuItems || [];

        // Add the new item to the current menu items
        currentMenuItems.push(item);

        // Update the restaurant with the new menu items
        await restaurantDoc.update({
            menuItems: currentMenuItems,
        } as firestore.DocumentData);
    }

    async removeItemFromMenu(restaurantId: string, itemId: string): Promise<void> {
        const restaurantDoc = this.db.doc(restaurantId);
        const restaurantSnapshot = await restaurantDoc.get();

        if (!restaurantSnapshot.exists) {
            throw new Error(`Restaurant with ID ${restaurantId} does not exist.`);
        }

        const currentMenuItems = restaurantSnapshot.data()?.menuItems || [];

        // Filter out the item to remove
        const updatedMenuItems = currentMenuItems.filter(item => item.id !== itemId);

        // Update the restaurant with the new menu items
        await restaurantDoc.update({
            menuItems: updatedMenuItems,
        } as firestore.DocumentData);
    }

    // Method to update an item in the restaurant's menu
    async updateMenuItem(restaurantId: string, itemId: string, updatedItemData: Partial<Item>): Promise<void> {
        const restaurantDoc = this.db.doc(restaurantId);
        const restaurantSnapshot = await restaurantDoc.get();

        if (!restaurantSnapshot.exists) {
            throw new Error(`Restaurant with ID ${restaurantId} does not exist.`);
        }

        const currentMenuItems = restaurantSnapshot.data()?.menuItems || [];

        // Update the item in the menu items array
        const updatedMenuItems = currentMenuItems.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    itemName: updatedItemData.itemName ?? item.itemName,
                    price: updatedItemData.price ?? item.price,
                };
            }
            return item;
        });

        // Update the restaurant with the new menu items
        await restaurantDoc.update({
            menuItems: updatedMenuItems,
        } as firestore.DocumentData);
    }

}
