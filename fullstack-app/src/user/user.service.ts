// user.service.ts
import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { firestore } from 'firebase-admin';
import { auth } from 'firebase-admin';

@Injectable()
export class UserService {
    private db = firestore().collection('users');

    // Get all users
    async getAllUsers(): Promise<User[]> {
        const snapshot = await this.db.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    }

    // Find user by ID (Firebase UID)
    async findById(userId: string): Promise<User | undefined> {
        const userDoc = await this.db.doc(userId).get();
        return userDoc.exists ? { id: userDoc.id, ...userDoc.data() } as User : undefined;
    }

    // Create a new user with Firebase Authentication
    async createUserAndStoreInFirestore(username: string): Promise<User> {
        // Create a user with Firebase Authentication
        const userRecord = await auth().createUser({
            email: username,
            password: '123456' // Set a temporary password
        });

        const newUserRef = this.db.doc(userRecord.uid);
        const newUserData = { username };

        // Save the user data in Firestore
        await newUserRef.set(newUserData as firestore.DocumentData);

        // Return the user with the Firestore-generated ID
        return {
            id: userRecord.uid,
            ...newUserData,
        } as User;
    }

    // Update an existing user
    async update(userId: string, updatedUserFields: Partial<User>): Promise<User | undefined> {
        const userDoc = this.db.doc(userId);
        const currentUser = await userDoc.get();

        if (!currentUser.exists) return undefined;

        const updatedUser: Partial<User> = {
            username: updatedUserFields.username ?? currentUser.data()?.username,
        };

        await userDoc.update(updatedUser as firestore.DocumentData);
        return {
            id: userId,
            ...updatedUser,
        } as User;
    }

    // Delete a user by ID
    async delete(userId: string): Promise<void> {
        await this.db.doc(userId).delete();
        // Optionally delete from Firebase Authentication
        await auth().deleteUser(userId);
    }

    async findByUsername(username: string): Promise<User | undefined> {
        const snapshot = await this.db.where('username', '==', username).get();
        const userDoc = snapshot.docs[0];

        if (!userDoc) return undefined;

        return { id: userDoc.id, ...userDoc.data() } as User;
    }
}
