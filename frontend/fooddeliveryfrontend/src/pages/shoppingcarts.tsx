import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    CircularProgress,
    Alert,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Modal,
    Box
} from '@mui/material';
import { Item } from '../types/item';
import Header from '../components/Header';
import { ShoppingCart } from '@/types/shoppingcart';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const ShoppingCartPage = () => {
    const [user, setUser] = useState<{ id: string | null; username: string | null } | null>(null);
    const [cart, setCart] = useState<ShoppingCart | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    // Fetch authenticated user from Firebase Authentication
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    id: firebaseUser.uid,
                    username: firebaseUser.email || firebaseUser.displayName || null,
                });
            } else {
                setError('User not logged in');
                setLoading(false);
            }
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    // Fetch the user's shopping cart if the user is logged in
    useEffect(() => {
        if (user && user.id) {
            const fetchCart = async () => {
                try {
                    const response = await axios.get(
                        `http://localhost:4000/shopping-carts/user/${user.id}` // Adjust your API URL if necessary
                    );
                    setCart(response.data);
                } catch (err) {
                    setError('Failed to fetch shopping cart');
                } finally {
                    setLoading(false);
                }
            };

            fetchCart();
        }
    }, [user]);

    // Calculate total price for the cart
    const calculateTotalPrice = (items: Item[]) => {
        return items.reduce((total, item) => {
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            return total + itemTotal;
        }, 0);
    };

    // Handle item removal (decrease quantity)
    const handleRemoveItem = async (itemId: string) => {
        try {
            if (cart) {
                // Decrease quantity in the backend
                await axios.delete(`http://localhost:4000/shopping-carts/${cart.id}/items/${itemId}`);

                // Fetch the updated cart data from the backend
                const updatedCartResponse = await axios.get(`http://localhost:4000/shopping-carts/user/${user?.id}`);
                setCart(updatedCartResponse.data);
            }
        } catch (err) {
            setError('Failed to remove item from cart');
        }
    };

    // Handle increase item quantity
    const handleIncreaseItem = async (itemId: string) => {
        try {
            if (cart) {
                // Increase the quantity in the backend by adding the same item again
                await axios.post(`http://localhost:4000/shopping-carts/${cart.id}/items`, { id: itemId });

                // Fetch the updated cart data from the backend
                const updatedCartResponse = await axios.get(`http://localhost:4000/shopping-carts/user/${user?.id}`);
                setCart(updatedCartResponse.data);
            }
        } catch (err) {
            setError('Failed to increase item quantity');
        }
    };

    // Handle checkout and open modal
    const handleCheckout = () => {
        setModalOpen(true);
    };

    // Handle clearing the cart
    const handleClearCart = async () => {
        try {
            if (cart) {
                await axios.delete(`http://localhost:4000/shopping-carts/${cart.id}/items`); // Clear the cart
                setCart({ ...cart, shoppingCartItems: [] }); // Clear items in local state
                handleCloseModal(); // Close the modal after clearing the cart
            }
        } catch (err) {
            setError('Failed to clear shopping cart');
        }
    };

    // Close modal
    const handleCloseModal = () => {
        setModalOpen(false);
    };

    return (
        <div>
            <Header username={user && user.username ? user.username : ""} />

            <Typography variant="h4" gutterBottom>
                Shopping Cart
            </Typography>

            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            {!user && !loading && (
                <Typography variant="h6" sx={{ marginTop: 2 }}>
                    Please log in to view your shopping cart.
                </Typography>
            )}
            {cart === null && !loading && user && (
                <Typography variant="h6" sx={{ marginTop: 2 }}>
                    User {user.username} does not have a shopping cart yet.
                </Typography>
            )}
            {cart && cart.shoppingCartItems?.length === 0 && (
                <Typography variant="h6" sx={{ marginTop: 2 }}>
                    User {user.username} has an empty shopping cart.
                </Typography>
            )}

            {cart && cart.shoppingCartItems?.length > 0 && (
                <>
                    <Grid container spacing={3}>
                        {cart.shoppingCartItems.map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h5">
                                            {item.itemName} (x{item.quantity}) {/* Displaying the quantity directly from the item */}
                                        </Typography>
                                        <Typography variant="body2">
                                            ${item.price ? item.price.toFixed(2) : 'N/A'} each
                                        </Typography>
                                        <Typography variant="body2">
                                            Total: ${(item.price * item.quantity).toFixed(2)} {/* Calculate total for this item */}
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => handleRemoveItem(item.id)}
                                            sx={{ marginTop: 1 }}
                                        >
                                            -
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => handleIncreaseItem(item.id)}
                                            sx={{ marginTop: 1, marginLeft: 1 }}
                                        >
                                            +
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Total Price and Checkout */}
                    <Typography variant="h6" sx={{ marginTop: 2 }}>
                        Total Price: ${calculateTotalPrice(cart.shoppingCartItems).toFixed(2)} {/* Overall total price */}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ marginTop: 2 }}
                        onClick={handleCheckout}
                    >
                        Proceed to Checkout
                    </Button>
                </>
            )}

            <Modal
                open={modalOpen}
                onClose={handleCloseModal}
                aria-labelledby="checkout-modal-title"
                aria-describedby="checkout-modal-description"
            >
                <Box sx={{
                    width: 300,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                    margin: 'auto',
                    top: '30%',
                    position: 'relative'
                }}>
                    <Typography id="checkout-modal-title" variant="h6" component="h2">
                        Checkout
                    </Typography>
                    <Typography id="checkout-modal-description" sx={{ mt: 2 }}>
                        Your shopping cart items:
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        {cart && cart.shoppingCartItems.map((item) => (
                            <Typography key={item.id}>
                                {item.itemName} (x{item.quantity}) - ${(item.price * item.quantity).toFixed(2)}
                            </Typography>
                        ))}
                    </Box>
                    <Button onClick={handleClearCart} color="primary" variant="contained" sx={{ mt: 2, mr: 1 }}>
                        OK
                    </Button>
                    <Button onClick={handleCloseModal} color="secondary" variant="outlined" sx={{ mt: 2 }}>
                        Close
                    </Button>
                </Box>
            </Modal>
        </div>
    );
};

export default ShoppingCartPage;
