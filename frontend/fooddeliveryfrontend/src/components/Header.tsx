import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';

interface HeaderProps {
    username: string; // Received as a prop from the parent
}

const Header: React.FC<HeaderProps> = ({ username }) => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Box display="flex" justifyContent="space-between" width="100%">
                    {/* Left side */}
                    <Link href="/" passHref>
                        <Button color="inherit">
                            <Typography variant="h6">Food Delivery</Typography>
                        </Button>
                    </Link>

                    {/* Middle - Add links to Restaurants and Shopping Cart */}
                    <Box display="flex" alignItems="center">
                        <Link href="/restaurants" passHref>
                            <Button color="inherit" sx={{ marginRight: 2 }}>Restaurants</Button>
                        </Link>
                        <Link href="/shoppingcarts" passHref>
                            <Button color="inherit">Shopping Cart</Button>
                        </Link>
                    </Box>

                    {/* Right side */}
                    <Box display="flex" alignItems="center">
                        <Typography variant="body1" color="inherit" sx={{ marginRight: 2 }}>
                            User: {username}
                        </Typography>
                        <Link href="/logout" passHref>
                            <Button color="inherit">Logout</Button>
                        </Link>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
