const API_URL = 'http://localhost:4000/users';

export interface User {
    id: string;
    username: string;
    password: string;
}

export const getAllUsers = async (): Promise<User[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }
    return await response.json();
};

export const addUser = async (user: Partial<User>): Promise<User> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    if (!response.ok) {
        throw new Error('Failed to add user');
    }
    return await response.json();
};

export const updateUser = async (id: string, user: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    if (!response.ok) {
        throw new Error('Failed to update user');
    }
    return await response.json();
};

export const deleteUser = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete user');
    }
};

export const loginUser = async (credentials: { username: string, password: string }) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        throw new Error('Invalid credentials');
    }

    return await response.json(); // User data on successful login
};

