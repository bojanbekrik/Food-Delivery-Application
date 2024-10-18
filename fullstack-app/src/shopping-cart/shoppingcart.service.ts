import { Injectable, NotFoundException } from '@nestjs/common';
import { firestore } from 'firebase-admin';
import { ShoppingCart } from './shoppingcart.model';
import { Item } from '../item/item.model';
import { ItemService } from '../item/item.service'; // Assuming you have an ItemService to fetch items

@Injectable()
export class ShoppingCartService {
    private db = firestore().collection('shoppingCarts');

    constructor(private readonly itemService: ItemService) {}

    // Create a new shopping cart
    async create(shoppingCart: Partial<ShoppingCart>): Promise<ShoppingCart> {
        const newCartRef = this.db.doc(); // Auto-generate Firestore document ID
        const shoppingCartItems = await this.populateCartItems(shoppingCart.shoppingCartItems);

        const newCartData: ShoppingCart = {
            id: newCartRef.id,
            userId: shoppingCart.userId ?? '',
            restaurantId: shoppingCart.restaurantId ?? '',
            shoppingCartItems,
            totalPrice: this.calculateTotalPrice(shoppingCartItems), // Automatically calculate total price
        };

        await newCartRef.set(newCartData as firestore.DocumentData);
        return newCartData;
    }

    // Get all shopping carts
    async getAll(): Promise<ShoppingCart[]> {
        const snapshot = await this.db.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ShoppingCart[];
    }

    // Find a shopping cart by ID
    async findById(id: string): Promise<ShoppingCart | undefined> {
        const cartDoc = await this.db.doc(id).get();
        return cartDoc.exists ? { id, ...cartDoc.data() } as ShoppingCart : undefined;
    }

    // Update an existing shopping cart
    async update(id: string, updatedCartFields: Partial<ShoppingCart>): Promise<ShoppingCart | undefined> {
        const cartDoc = this.db.doc(id);
        const currentCart = await cartDoc.get();

        if (!currentCart.exists) return undefined;

        const updatedShoppingCartItems = await this.populateCartItems(updatedCartFields.shoppingCartItems);
        const updatedShoppingCart: Partial<ShoppingCart> = {
            userId: updatedCartFields.userId ?? currentCart.data()?.userId,
            restaurantId: updatedCartFields.restaurantId ?? currentCart.data()?.restaurantId,
            shoppingCartItems: updatedShoppingCartItems ?? currentCart.data()?.shoppingCartItems,
            totalPrice: this.calculateTotalPrice(updatedShoppingCartItems),
        };

        await cartDoc.update(updatedShoppingCart as firestore.DocumentData);
        return { id, ...updatedShoppingCart } as ShoppingCart;
    }

    // Delete a shopping cart by ID
    async delete(id: string): Promise<void> {
        await this.db.doc(id).delete();
    }

    // Add an item to the shopping cart
    async addItem(shoppingCartId: string, itemId: string): Promise<ShoppingCart | undefined> {
        const cartDoc = this.db.doc(shoppingCartId);
        const cartSnapshot = await cartDoc.get();

        if (!cartSnapshot.exists) {
            throw new NotFoundException(`Shopping cart with ID ${shoppingCartId} does not exist.`);
        }

        const currentCart = cartSnapshot.data() as ShoppingCart;

        // Fetch the item details from the Item service
        const item = await this.itemService.getItemById(itemId);
        if (!item) {
            throw new NotFoundException(`Item with ID ${itemId} does not exist.`);
        }

        // Check if the item already exists in the cart
        const existingItemIndex = currentCart.shoppingCartItems.findIndex(cartItem => cartItem.id === itemId);
        if (existingItemIndex > -1) {
            // If the item exists, just increase its quantity
            currentCart.shoppingCartItems[existingItemIndex].quantity++;
        } else {
            // If it doesn't exist, add it to the cart with a quantity of 1
            currentCart.shoppingCartItems.push({ ...item, quantity: 1 });
        }

        currentCart.totalPrice = this.calculateTotalPrice(currentCart.shoppingCartItems); // Update total price

        await cartDoc.update(currentCart as firestore.DocumentData);
        return { id: shoppingCartId, ...currentCart };
    }

    // Remove one item from the shopping cart
    async removeItem(shoppingCartId: string, itemId: string): Promise<ShoppingCart | undefined> {
        const cartDoc = this.db.doc(shoppingCartId);
        const cartSnapshot = await cartDoc.get();

        if (!cartSnapshot.exists) {
            throw new NotFoundException(`Shopping cart with ID ${shoppingCartId} does not exist.`);
        }

        const currentCart = cartSnapshot.data() as ShoppingCart;

        // Find the item in the cart
        const itemIndex = currentCart.shoppingCartItems.findIndex(item => item.id === itemId);
        if (itemIndex === -1) {
            throw new NotFoundException(`Item with ID ${itemId} is not in the shopping cart.`);
        }

        // Reduce the item's quantity
        if (currentCart.shoppingCartItems[itemIndex].quantity > 1) {
            currentCart.shoppingCartItems[itemIndex].quantity--;
        } else {
            // If the quantity is 1, remove the item from the cart
            currentCart.shoppingCartItems.splice(itemIndex, 1);
        }

        currentCart.totalPrice = this.calculateTotalPrice(currentCart.shoppingCartItems); // Update total price

        await cartDoc.update(currentCart as firestore.DocumentData);
        return { id: shoppingCartId, ...currentCart };
    }

    // Remove all items from the shopping cart
    async clearCart(shoppingCartId: string): Promise<ShoppingCart | undefined> {
        const cartDoc = this.db.doc(shoppingCartId);
        const cartSnapshot = await cartDoc.get();

        if (!cartSnapshot.exists) {
            throw new NotFoundException(`Shopping cart with ID ${shoppingCartId} does not exist.`);
        }

        const currentCart = cartSnapshot.data() as ShoppingCart;

        currentCart.shoppingCartItems = []; // Clear all items from the cart
        currentCart.totalPrice = 0; // Reset the total price

        await cartDoc.update(currentCart as firestore.DocumentData);
        return { id: shoppingCartId, ...currentCart };
    }

    // Check if a cart exists for a user. If not, create a new cart for the user.
    async ensureCartExists(userId: string, restaurantId: string): Promise<ShoppingCart> {
        const existingCart = await this.findByUserId(userId);
        if (existingCart) {
            return existingCart; // Return the existing cart if found
        }

        // If no cart found, create a new one
        const newCartData: Partial<ShoppingCart> = {
            userId,
            restaurantId,
            shoppingCartItems: [],
            totalPrice: 0,
        };
        return this.create(newCartData);
    }

    // Helper: Fetch item details and populate the cart items
    private async populateCartItems(cartItems: Partial<Item[]>): Promise<Item[]> {
        const populatedItems: Item[] = [];

        for (const cartItem of cartItems ?? []) {
            const item = await this.itemService.getItemById(cartItem.id);
            if (!item) {
                throw new NotFoundException(`Item with ID ${cartItem.id} does not exist.`);
            }
            populatedItems.push(item); // Add the fully populated item
        }

        return populatedItems;
    }

    // Helper: Calculate the total price of all items in the cart
    private calculateTotalPrice(items: Item[]): number {
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
    }

    async findByUserId(userId: string): Promise<ShoppingCart | null> {
        const cartSnapshot = await this.db.where('userId', '==', userId).get();

        if (cartSnapshot.empty) {
            console.log('No shopping cart found for userId:', userId);  // Log this
            return null; // No shopping cart found for the given userId
        }

        const cartData = cartSnapshot.docs[0].data() as ShoppingCart;
        console.log('Found shopping cart:', cartData);  // Log the result
        return { id: cartSnapshot.docs[0].id, ...cartData };
    }
}
