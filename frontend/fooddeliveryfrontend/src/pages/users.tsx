//This is register page
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import Header from '../components/Header';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async () => {
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const token = await user.getIdToken();
            localStorage.setItem('userToken', token);
            router.push('/');
        } catch (error) {
            setError('Registration failed. Please try again.');
        }
    };

    const handleLoginRedirect = () => {
        router.push('/login');
    };

    return (
        <div>
            <Header username="" />
            <Container maxWidth="sm">
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
                    <Typography variant="h4" component="h1" gutterBottom>
                        Register
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
                        onClick={handleRegister}
                        style={{ width: '100%', marginBottom: '20px' }}
                    >
                        Register
                    </Button>

                    <Button variant="outlined" color="secondary" size="large" onClick={handleLoginRedirect} style={{ width: '100%' }}>
                        Login
                    </Button>
                </Box>
            </Container>
        </div>
    );
};

export default RegisterPage;
