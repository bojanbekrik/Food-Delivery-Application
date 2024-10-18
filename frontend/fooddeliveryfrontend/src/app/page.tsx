'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { Container, Typography, Box, Button, CircularProgress } from '@mui/material';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const Page = () => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, you can access user information
                setUser(user);
                setLoading(false);
            } else {
                // User is signed out, redirect to login page
                router.push('/login');
            }
        });

        // Clean up the listener on component unmount
        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
            <Header username={user.email} /> {/* Use user.email from Firebase auth */}
            <Container maxWidth="md">
                <Box
                    textAlign="center"
                    py={5}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    bgcolor="#f7f9fc"
                    borderRadius={2}
                    boxShadow={2}
                    mt={4}
                >
                    <Typography variant="h4" component="h1" gutterBottom>
                        Welcome, {user.email} {/* Display the email or username */}
                    </Typography>
                    <Typography variant="h6" component="h4" color="textSecondary" paragraph>
                        Here you can check available restaurants, manage your shopping cart, and log out!
                    </Typography>
                </Box>
            </Container>
        </div>
    );
};

export default Page;
