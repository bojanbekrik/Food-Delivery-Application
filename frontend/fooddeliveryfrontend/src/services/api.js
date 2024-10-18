import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000', // URL of my NestJS backend
    timeout: 1000, // Optional: request timeout
});

export default api;
