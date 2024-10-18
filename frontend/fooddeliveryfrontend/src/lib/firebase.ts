import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAOzG6JT6yE37Xp0S8nYegeQ_8vyabGSfI",
    authDomain: "fooddeliveryapp-8becf.firebaseapp.com",
    projectId: "fooddeliveryapp-8becf",
    storageBucket: "fooddeliveryapp-8becf.appspot.com",
    messagingSenderId: "234890529634",
    appId: "1:234890529634:web:a6b48e136caca4f8147a3b",
    measurementId: "G-3STEKYJMHT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
