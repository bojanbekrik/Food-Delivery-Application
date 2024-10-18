import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, CircularProgress, Card, CardContent, CardActions, Button, Typography, Alert } from '@mui/material';
import Header from '../components/Header';
import { Item } from '../types/item';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const ItemsPage = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null); // User will be managed through Firebase
    const [cart, setCart] = useState<any>(null);
    const [restaurantName, setRestaurantName] = useState<string | null>(null);
    const router = useRouter();

    // Use Firebase to track the current user's authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser); // Set Firebase user
            } else {
                router.push('/login'); // Redirect to login if not authenticated
            }
        });

        // Clean up the listener on component unmount
        return () => unsubscribe();
    }, [router]);

    // Fetch items and restaurant details
    useEffect(() => {
        const fetchItems = async () => {
            const { restaurantId } = router.query;
            if (!restaurantId) {
                setError('Restaurant ID is required');
                return;
            }
            try {
                const itemsResponse = await axios.get(`http://localhost:4000/items/restaurant/${restaurantId}`);
                setItems(itemsResponse.data);

                const restaurantResponse = await axios.get(`http://localhost:4000/restaurants/${restaurantId}`);
                setRestaurantName(restaurantResponse.data.name);
            } catch (err) {
                console.error('Error fetching items or restaurant details:', err);
                setError('Failed to fetch items or restaurant details');
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, [router.query.restaurantId]);

    // Fetch user's shopping cart
    useEffect(() => {
        if (user && user.uid) {
            const fetchCart = async () => {
                try {
                    const response = await axios.get(`http://localhost:4000/shopping-carts/user/${user.uid}`);
                    setCart(response.data);
                } catch (err) {
                    console.error('Error fetching cart:', err);
                    setError('Failed to fetch cart');
                }
            };
            fetchCart();
        }
    }, [user]);

    // Add item to cart
    const addToCart = async (itemId: string) => {
        if (user && user.uid) {
            const { restaurantId } = router.query;
            if (!restaurantId) {
                setError('Restaurant ID is required');
                return;
            }

            try {
                const response = await axios.post(`http://localhost:4000/shopping-carts/user/${user.uid}/items`, { itemId });
                setCart(response.data);
                router.push('/shoppingcarts');
            } catch (err) {
                setError('Failed to add item to cart');
            }
        } else {
            setError('Please log in to add items to the cart.');
        }
    };

    return (
        <div>
            {/* Pass the user's email to the Header component */}
            <Header username={user ? user.email : ''} />
            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}

            {/* Display restaurant name */}
            {!loading && !error && restaurantName && (
                <Typography variant="h4" gutterBottom>
                    Menu for {restaurantName}
                </Typography>
            )}

            {/* Display items if available */}
            {!loading && !error && items.length > 0 && (
                <Grid container spacing={3}>
                    {items.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5">{item.itemName}</Typography>
                                    <Typography variant="body2">${item.price}</Typography>
                                </CardContent>
                                <CardActions>
                                    <Button variant="contained" color="primary" onClick={() => addToCart(item.id)}>
                                        Add to Cart
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default ItemsPage;
