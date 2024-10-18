import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, CircularProgress, Card, CardContent, CardActions, Button, Typography, Alert } from '@mui/material';
import Header from '../components/Header';
import { Restaurant } from '../types/restaurant';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const RestaurantsPage = () => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null); // User will be managed through Firebase
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

    // Fetch restaurants from the backend
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await axios.get('http://localhost:4000/restaurants');
                setRestaurants(response.data);
            } catch (err) {
                setError('Failed to fetch restaurants');
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    const handleViewMenu = (restaurantId: string) => {
        router.push(`/items?restaurantId=${restaurantId}`);
    };

    return (
        <div>
            {/* Pass the user's email or display name to the Header component */}
            <Header username={user ? user.email : ''} />
            <Container>
                <Typography variant="h4" gutterBottom>
                    Restaurants
                </Typography>
                {loading && <CircularProgress />}
                {error && <Alert severity="error">{error}</Alert>}
                {!loading && !error && (
                    <Grid container spacing={3}>
                        {restaurants.map((restaurant) => (
                            <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h5">{restaurant.name}</Typography>
                                        <Typography variant="body2">{restaurant.address}</Typography>
                                        <Typography variant="body2">{restaurant.phone}</Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button onClick={() => handleViewMenu(restaurant.id)}>View Menu</Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </div>
    );
};

export default RestaurantsPage;
