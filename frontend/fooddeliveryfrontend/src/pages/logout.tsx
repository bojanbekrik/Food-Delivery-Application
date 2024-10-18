import { useEffect } from 'react';
import { useRouter } from 'next/router';

const LogoutPage = () => {
    const router = useRouter();

    useEffect(() => {
        // Clear local storage or any authentication tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('loggedInUsername');

        // Redirect to login page
        router.push('/login');
    }, [router]);

    return null; // No UI is needed, just redirect
};

export default LogoutPage;
