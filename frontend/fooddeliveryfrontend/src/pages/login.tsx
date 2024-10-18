// pages/login.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase'; // Import Firebase Auth instance
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import Header from '../components/Header';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        setError('');
        try {
            // Sign in using Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store the token or user information as needed
            const token = await user.getIdToken();
            localStorage.setItem('userToken', token);

            // Redirect after successful login
            router.push('/');
        } catch (error) {
            setError('Login failed. Please try again.');
        }
    };

    const handleRegisterRedirect = () => {
        router.push('/register'); // Redirect to Register page
    };

    return (
        <div>
            <Header username="" />
            <Container maxWidth="sm">
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
                    <Typography variant="h4" component="h1" gutterBottom>
                        Login
                    </Typography>

                    {error && (
                        <Alert severity="error" style={{ marginBottom: '20px' }}>
                            {error}
                        </Alert>
                    )}

                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ marginBottom: '20px' }}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ marginBottom: '20px' }}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleLogin}
                        style={{ width: '100%', marginBottom: '20px' }}
                    >
                        Login
                    </Button>

                    <Button variant="outlined" color="secondary" size="large" onClick={handleRegisterRedirect} style={{ width: '100%' }}>
                        Register
                    </Button>
                </Box>
            </Container>
        </div>
    );
};

export default LoginPage;
